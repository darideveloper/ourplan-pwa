## Context

The summary page (`/summary`) is the final step of the multi-step form. It currently renders:
- `SummaryReviewCard` — displays all form data for review
- `DisclaimerCheckbox` — gates submission on terms agreement
- `SummarySubmitButton` — currently logs to console and shows `alert()`

The system prompt for the LLM AI agent (which generates the PDF report) references field names directly (e.g., `lpa_status == 'none'`) and expects human-readable labels for enum values to generate quality prose. The existing `safeFetch` API client with `FetchError` handles the n8n communication pattern (see `validateCode`).

The n8n webhook flow (already partially configured via Cloudflare Tunnel for testing) will:
1. Receive enriched form data
2. Call LLM with system prompt + data
3. Generate PDF from HTML template (existing `pdf-report-template` spec)
4. Host the PDF and return a URL

## Goals / Non-Goals

**Goals:**
- POST enriched form data (with `_value_labels`) to `${PUBLIC_N8N_BASE_URL}/report` when user clicks Generate
- Show a fake progress bar during generation (1-min default, stretches to 2-min if LLM takes longer)
- On success: snap progress to 100%, show a "Download PDF" button
- On error: show inline error message with a "Try Again" button
- Extract `_value_labels` from existing Zod enum schemas in `form.ts`

**Non-Goals:**
- No changes to the n8n webhook or LLM prompt (defined separately)
- No changes to the PDF template (already specced in `pdf-report-template`)
- No offline queue or retry persistence (ephemeral — retry is manual)
- No analytics tracking for submission events
- No changes to existing spec requirements

## Decisions

### Decision 1: Submission state in local state (not store)

State for `isSubmitting`, `progress`, `pdfUrl`, `error` lives in `SummarySubmitButton` via `useState`. Rationale: the submission lifecycle is ephemeral — it only matters while the user is on the summary page. No other component reads this state. Following the principle of least scope.

### Decision 2: GenerationProgressBar as separate molecule

Extracted from `SummarySubmitButton` to keep concerns clean. The molecule is purely presentational — it receives `progress: number` and `message: string` as props, renders a styled bar + caption. No timer logic, no API calls, no store access. Testable in isolation.

### Decision 3: _value_labels built from Zod schemas in form.ts

`buildValueLabels()` lives alongside the existing Zod schemas, maps every enum field to its human-readable UK English label. Uses a nested structure under `support_circle` for the sub-fields (`helper_relationship`, `helper_proximity`, `helper_time`, `helper_superpower`). This centralises the label map where the field definitions already live.

### Decision 4: Fake progress bar with polling

A single-phase progress bar climbs from 0% to 95% over 3 minutes (`min(elapsed / 180000, 0.95)`). The timer ticks at 100ms intervals, independent of the polling loop. When the poll confirms the PDF is ready (HEAD returns 200), progress snaps to 100% (CSS `transition: width 500ms ease-out` smooths the jump). Stage messages change at defined thresholds based on time.

The progress bar is purely cosmetic — the real readiness check is the poll. This decoupling means the UX is consistent even if the PDF takes variable time.

### Decision 6: Polling with generation counter

The poll loop runs in a background `async` function after the POST returns `{ pdfUrl }`. A `generationRef` counter guards against stale updates: each call to `handleGenerate` increments the counter, and the old loop exits when the counter no longer matches. This prevents race conditions when the user clicks "Try Again" and re-generates before the old poll expires.

### Decision 5: Inline error + retry, not toast

Inline error below the bar preserves context — the user can see their data and try again without confusion. Pattern matches the existing `ApiError` component approach.

## Architecture

```
SummarySubmitButton (state machine)
│
├─ idle ─────────── click ─────► generating
│  [Generate My Plan]              │
│                                  ├─ start progress timer (100ms)
│                                  ├─ getState() + sessionStore.code + buildValueLabels()
│                                  ├─ POST /report → get { pdfUrl } (immediate)
│                                  ├─ poll HEAD pdfUrl every 10s
│                                  │    ├─ 200 OK → complete
│                                  │    └─ timeout (3 min) → error
│                                  │
│                    ┌─────────────┤
│                    ▼             ▼
│               success         error
│                  │              │
│                  ▼              ▼
│              complete        error
│           [Download PDF]   [Try Again]
│                                  │
│                                  └── click → back to idle
│
└─ GenerationProgressBar (presentational)
   └─ props: progress, message
```

## Data flow

```
User clicks "Generate My Plan"
  │
  ▼
SummarySubmitButton extracts form data + session code:
  const formState = useFormStore.getState()
  const { errors, currentStep, stepValidity, isNavigating, setIsNavigating, setField, advanceStep, reset, ...formValues } = formState
  const sessionCode = useSessionStore.getState().code
  const payload = { code: sessionCode, data: { ...formValues, _value_labels: buildValueLabels() } }
  │
  ▼
POST to n8n:
  // Body shape: { code: "ABC123", data: { user_name: "Alice", parent_health: "slowing_down", _value_labels: { ... } } }
  const { pdfUrl } = await safeFetch<GenerateReportResponse>(
    `${import.meta.env.PUBLIC_N8N_BASE_URL}/report`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
  )
  // Backend returns immediately with pdfUrl while PDF generates asynchronously
  │
  ▼
Start poll loop (every 10s, max 3 min):
  while (generationRef.current === gen && Date.now() - pollStart < 180000) {
    try {
      const res = await fetch(pdfUrl, { method: "HEAD" })
      if (res.ok) → success
    } catch { → keep polling }
    await new Promise(r => setTimeout(r, 10000))
  }
  max wait exceeded → error
  │
  ┌────────────────────────────────┐
  │                                │
  ▼                                ▼
success                         error
  │                                │
  ▼                                ▼
- Clear timer                    - Clear timer
- Snap progress to 100%          - Show "PDF generation timed out"
- 2s hold, then download link    - "Try Again" button → reset
```

## Progress bar timing

```
Single phase (0 - 180s):  progress = min(elapsed / 180000, 0.95)
Poll confirms ready:       progress = 1.0 (CSS transition handles the snap)
```

The progress bar runs independently of polling. It climbs smoothly from 0% to 95% over 3 minutes while the poll loop checks the real PDF readiness in the background. When the poll succeeds, progress snaps to 100%.

Stage messages (derived from progress range):
- 0-8%: "Analysing your responses..."
- 8-30%: "Building your personalised plan..."
- 30-60%: "Reviewing your support network..."
- 60-80%: "Checking home safety recommendations..."
- 80-95%: "Finalising your report..."
- 95%+: "Just a bit more... almost there"
- 100%: "Your plan is ready!"

## Component state machine

```typescript
type SubmitState =
  | { status: "idle" }
  | { status: "generating"; progress: number; message: string }
  | { status: "complete"; pdfUrl: string }
  | { status: "error"; message: string }
```

## _value_labels shape

```typescript
function buildValueLabels(): Record<string, unknown> {
  return {
    parent_health: "Slowing Down — needs occasional help...",
    lpa_status: "None — no Power of Attorney set up",
    // ... all other enum fields ...
    support_circle: {
      helper_relationship: {
        sibling: "Sibling (brother or sister)",
        partner: "Partner or spouse",
        // ... all options ...
      },
      helper_proximity: { ... },
      helper_time: { ... },
      helper_superpower: { ... },
    },
  }
}
```

## Risks / Trade-offs

- **Fake progress mismatch**: If poll succeeds very fast (<5s), the bar barely moves before snapping — looks janky. Mitigation: minimum 2s delay before snapping to 100% to give the bar a chance to show movement.
- **Timer not cleared on unmount**: If user navigates away during generation, progress timer and poll loop keep running. Mitigation: `useEffect` cleanup returns `clearInterval`; `generationRef` counter invalidates stale poll loops on unmount and on "Try Again".
- **Double-click during generation**: Button is replaced by the progress bar during generation, so the button itself can't be clicked. The bar has no click handler.
- **Large payload**: Form data + labels could be sizable. Mitigation: n8n receives it as a single POST body, no chunking needed at this scale.
- **Poll loop starvation**: If the PDF server hangs on HEAD requests, the poll loop might exceed the 3-min max wait. Mitigation: the 3-min timeout is measured from wall-clock time, not poll attempts — hung requests simply delay the loop, and the max wait fires when reached.
