## Context

The form wizard uses multi-page routing (each step is its own Astro route). Cross-page state is handled by a Zustand store with `persist` middleware writing to localStorage. Currently, the store only tracks form field values (`user_name`, `parent_name`, `parent_health`) — there is no awareness of which step the user is on.

Route paths are inconsistent (`/first-step`, `/step-2`) and need standardising to numeric names.

Three features require step tracking:
1. **Resume** — return to last step after refresh/close
2. **Conditional navigation** — prevent skipping incomplete steps, allow going back to completed ones
3. **Progress bar** — show current position in the 4-step flow

## Goals / Non-Goals

**Goals:**
- Standardise all step routes to `/step1`, `/step2`, `/step3`, `/step4`, `/summary`
- Track farthest completed step in Zustand store (`currentStep`), persisted to localStorage
- `currentStep` advances only on successful Zod validation of the current step
- Block access to any step beyond the earliest incomplete one
- Allow free navigation back to any completed step
- Show a step progress bar in the app shell (Layout.astro)
- Resume users to earliest incomplete step when they visit `/`
- Handle browser back/forward consistently

**Non-Goals:**
- Client-side SPA routing (staying with multi-page Astro)
- Save-on-navigate (auto-saving before leaving a step) — that's a separate concern
- Analytics tracking of step progression
- Animated step transitions between pages

## Decisions

### 1. `currentStep` = farthest completed step (not URL)

**Decision:** `currentStep` stores the farthest step whose Zod schema has passed validation. It is NOT the current URL. A page's React island reads URL only to render, but the store tracks *progress*, not position.

**Rationale:** This is the key distinction. If user finishes step 1, `currentStep = "/step1"`. If they navigate back to step 1 later, `currentStep` stays `/step1` because step 1 is still the farthest completed. This enables: (a) progress bar to show correct state, (b) resume logic to know where to send the user, (c) guarding logic to know what's accessible.

**URL override on manual navigation:** The URL always wins for what page loads. If the user types `/step3` directly, the page loads, then `useStepGuard` validates accessibility and redirects if blocked. The store never prevents a URL from loading — it only determines whether the user stays or gets redirected.

**Alternatives considered:** URL as source of truth (original design) — rejected because it conflates "where you are" with "what's finished". A user could be on step 1 editing data, but the store would incorrectly forget step 2 was completed.

### 2. `advanceStep` action

**Decision:** A dedicated `advanceStep` action in the store validates the current step's schema, and if it passes, sets `currentStep` to the *step just validated* (marking it complete). It does NOT validate prior steps (assumed already complete). On failure, it writes validation errors to `store.errors` (same pattern as `setField`).

**Rationale:** Only the form submission/continuation triggers advancement. If the user fills step 1 and clicks "Continue", `advanceStep("/step1")` validates step 1 data, and if OK, `currentStep` becomes `/step1`. The caller then navigates to `getNextStep("/step1")` = `/step2`. The guard on `/step2` allows rendering because `isAccessible("/step2", "/step1")` → `1 <= 0+1` ✅.

### 3. Step comparison via ordered list

**Decision:** Steps are compared using a numeric index derived from an ordered array, not string comparison.

```ts
const STEP_ORDER = ["/step1", "/step2", "/step3", "/step4", "/summary"] as const

function getStepIndex(path: string): number {
  return STEP_ORDER.indexOf(path)
}

function isAccessible(target: string, completed: string): boolean {
  const targetIdx = getStepIndex(target)
  const completedIdx = getStepIndex(completed)
  // Accessible if target is completed or the next one
  return targetIdx >= 0 && targetIdx <= completedIdx + 1
}
```

**Rationale:** Numeric index avoids fragile pathname string comparisons. The guard checks: if user navigates to `/step3` but `currentStep` is `/step1`, `targetIdx(2) > completedIdx(1) + 1` → block.

### 4. Guard behaviour matrix

| User navigates to | currentStep | Accessible? | Action |
|---|---|---|---|
| `/step1` | `""` | ✅ (first step always) | render |
| `/step1` | `/step2` | ✅ (back to completed) | render |
| `/step2` | `""` | ❌ | redirect to `/step1` |
| `/step2` | `/step1` | ✅ (next step) | render |
| `/step2` | `/step2` | ✅ (current step) | render |
| `/step3` | `/step1` | ❌ | redirect to `/step2` |
| `/summary` | `/step3` | ❌ | redirect to `/step4` |
| `/summary` | `/step4` | ✅ (all steps complete) | render |
| `/summary` | `/summary` | ✅ | render |

### 5. Hook-based guard, not standalone component

**Decision:** A `useStepGuard()` React hook contains the guard logic. It is called inside a minimal `StepGuard` wrapper component (which just calls the hook and renders null) mounted with `client:load` on each step page. No Astro middleware.

**Rationale:** The guard is a side-effect (read state -> check -> redirect), not UI. The hook keeps the logic reusable and testable. The thin wrapper component exists because some pages (placeholder steps 2-4, summary) have no other React island to call the hook inside. The wrapper is ~3 lines and adds no rendering overhead.

**Alternatives considered:** Standalone `<StepGuard>` component with inline logic — rejected because it couples logic to the component. Astro middleware — rejected because validation depends on client-side Zustand state.

### 6. Zod schema validation for step completion

**Decision:** Each step's Zod schema defines step completion. `advanceStep` validates step data against its schema.

**Rationale:** Reuses existing schemas. Robust validation of types, formats, and constraints.

### 7. Progress bar as a React island in Layout.astro

**Decision:** A single `<ProgressBar client:load />` in `Layout.astro` renders once on every page.

**Rationale:** One island avoids duplication across 5+ pages. Small component — reads `currentStep`, renders dots/links.

## Architecture

```
+------------------------------------------+
| Layout.astro                             |
| +--------------------------------------+ |
| | <ProgressBar client:load />          | |
| |  - reads currentStep from Zustand    | |
| |  - reads window.location.pathname    | |
| |  - renders 4 dots + highlight        | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | <slot /> (page content)              | |
| | +----------------------------------+ | |
| | | <StepGuard client:load />        | | |
| | |  - calls useStepGuard() on mount | | |
| | |  - renders null (no UI)          | | |
| | +----------------------------------+ | |
| | +----------------------------------+ | |
| | | Form islands (e.g. ValidatedInput| | |
| | |  + ContinueButton                | | |
| | |  - "Continue" calls advanceStep()| | |
| | |  - then navigates to next URL    | | |
| | +----------------------------------+ | |
| +--------------------------------------+ |
+------------------------------------------+
```

**Guard flow (useStepGuard on mount):**
```
User lands on any step page -> React island mounts
  |
  +-- calls useStepGuard()
  |     |
  |     +-- 1. Read currentStep from store
  |     +-- 2. Get target step index from STEP_ORDER
  |     +-- 3. Is target accessible?
  |     |     targetIdx <= completedIdx + 1 ?
  |     |       +-- NO  -> redirect to earliest incomplete
  |     |       +-- YES -> do nothing
  |     +-- (currentStep NOT changed - only advanceStep changes it)
  |
  +-- renders form fields normally
```

**Advance flow (Continue button):**
```
User fills form, clicks "Continue"
  |
  +-- 1. Call advanceStep(currentStepPath)
  |       |
  |       +-- validates current step's Zod schema
  |       +-- FAIL -> writes errors to store.errors, returns null
  |       +-- PASS -> sets currentStep = currentStepPath, returns next step URL
  |
  +-- 2. If returned null -> show validation errors, stay on page
  +-- 3. If returned URL -> window.location.href = next step URL
  |       +-- step 4 complete -> nextStep = "/summary"
  |       +-- guard on next page will allow rendering
```

**Resume flow (on `/`):**
```
User visits / -> <ResumeRedirect> mounts
  |
  +-- reads currentStep from store
  +-- if "" -> stay on / (welcome page)
  +-- if non-empty -> redirect to earliest incomplete step
       (not currentStep - currentStep is farthest COMPLETED)
```

## State Shape (addition to existing store)

```ts
type StepPath = "" | "/step1" | "/step2" | "/step3" | "/step4" | "/summary"

interface FormStore {
  // Existing
  user_name: string
  parent_name: string
  parent_health: string | undefined
  errors: Record<string, string>

  // New
  currentStep: StepPath

  // New actions
  advanceStep: (completedPath: StepPath) => string | null
    // Validates completedPath's schema against store values.
    // On PASS: sets currentStep = completedPath, clears errors for that step,
    //           returns getNextStep(completedPath) (URL to navigate to).
    // On FAIL: writes validation errors to store.errors, returns null.
}
```

## Step Order Registry

```ts
const STEP_ORDER = ["/step1", "/step2", "/step3", "/step4", "/summary"] as const

function getStepIndex(path: string): number {
  return STEP_ORDER.indexOf(path)
}

function getNextStep(current: string): string | null {
  const idx = getStepIndex(current)
  return idx >= 0 && idx < STEP_ORDER.length - 1 ? STEP_ORDER[idx + 1] : null
}

function getEarliestIncomplete(completed: string): string {
  const idx = getStepIndex(completed)
  // If no progress or completed is less than step1, start at step1
  if (idx < 0) return STEP_ORDER[0] // "/step1"
  // Earliest incomplete is the step after the farthest completed
  const nextIdx = idx + 1
  return nextIdx < STEP_ORDER.length ? STEP_ORDER[nextIdx] : STEP_ORDER[STEP_ORDER.length - 1]
}
```

## Component & Hook API

### useStepGuard
```ts
// Side-effect only. Call inside main React island on each step page.
// Guards: if target step is beyond currentStep + 1, redirect.
// MUST be called at top level (React rules of hooks).
function useStepGuard(): void
```

### ProgressBar
```tsx
// Renders 4 step dots with labels.
// Reads TWO inputs:
//   - currentStep from Zustand (farthest COMPLETED step) -> marks completed steps
//   - window.location.pathname (current URL) -> highlights the active step
// Example: user on /step2 editing, currentStep="/step1"
//          -> step 1 marked completed, step 2 highlighted active
<ProgressBar client:load />
```

### ResumeRedirect
```tsx
// Renders nothing. Redirects from / to earliest incomplete step.
<ResumeRedirect client:load />
```

## Risks / Trade-offs

- **Redirect flash** — User sees the wrong page briefly before the guard redirects. Unavoidable with client-side validation.
- **Schema duplication** — Step schemas must be registered in both the store and the advance flow. Mitigation: single `STEP_ORDER` + schema registry in one file.
- **Multiple tabs** — localStorage shared across tabs. Two tabs on different steps will overwrite. Existing limitation, not introduced here.
- **`advanceStep` coupling** — The Continue button must call `advanceStep` before navigating. If a link bypasses this, the guard blocks on next page. This is correct behaviour (can't skip validation), but means "Continue" cannot be a plain `<a>` tag anymore.
- **Hook placement** — `useStepGuard()` must be called inside a React island on each step page. If a page has no React island (pure Astro), it needs a wrapper or the guard won't run. Mitigation: every step page already has at least one React island.
