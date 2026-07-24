## Context

The summary page contains a `SummarySubmitButton` component that POSTs form data to the n8n `/report` webhook, then polls the returned `pdfUrl` until the PDF is ready. The n8n webhook response includes a `valid` field that can be `false` if the invitation code has expired while the user was filling out the form. Currently the frontend only reads `pdfUrl` and ignores `valid`, so an expired code leads to polling a URL that will never become ready — the user is stuck on an indefinite progress bar.

## Goals / Non-Goals

**Goals:**
- Detect `valid: false` in the `/report` POST response
- Show a clear modal overlay with the expired-code error message
- Provide a single "Enter New Invitation Code" button that resets all state and navigates to `/`
- Reuse the exact error string from the landing page (`ApiError` component) for visual consistency

**Non-Goals:**
- No backend changes — n8n already sends the right response
- No new components or shadcn dependencies — inline CSS overlay only
- No behavioural changes to the `validate-code` flow or landing page (refactoring the hardcoded string to a shared import is acceptable)

## Decisions

### Decision 1: New `"expired"` state vs. reusing `"error"` state

Reusing the existing `"error"` state would show "Try Again" — useless here since re-POSTing the same expired code will fail again. An expired code is a terminal session error, not a transient network error. A new `"expired"` submit state is cleaner and maps to a different UI (modal + navigation).

### Decision 2: Inline div overlay vs. shadcn Dialog component

No shadcn Dialog exists in the project. Adding one (`pnpm dlx shadcn@latest add dialog`) would:
- Create `src/components/ui/dialog.tsx` which `SummarySubmitButton` (an atom) cannot import directly
- Require a molecule wrapper just to satisfy the import rule
- Add unnecessary dependencies

An inline `div` with `fixed inset-0 z-50 bg-black/50 flex items-center justify-center` does the same thing with zero new dependencies. However, `StepLayout.astro` uses `backdrop-blur-xl` on the card wrapper, which creates a CSS containing block for `position: fixed` descendants — clipping the overlay to the card instead of the viewport.

**Fix**: Render the overlay via `ReactDOM.createPortal` into `document.body` to bypass the `backdrop-filter` containing block. `react-dom` is already a dependency, so no new deps.

### Decision 3: Reset both stores on navigation

When the code is expired, the form data and session code are both invalid. Calling both `useFormStore.getState().reset()` and `useSessionStore.getState().reset()` ensures the user starts completely fresh on the landing page with no stale localStorage data.

### Decision 4: Reuse same error string from landing page

"session.ts" defines: `"That invitation code is not recognised or has expired. Please check and try again."`

Rather than duplicating the string, it should be extracted to a shared constant (e.g., in `src/lib/api/constants.ts`) so both the `VerifyButton` error and the expired overlay reference the same source. If the message changes later, it changes in one place.

## Risks / Trade-offs

- **Race condition on generation counter**: Already handled — `generationRef` + `clearTimers()` prevents stale callbacks from updating state after the user clicks "Request New Code"
- **No i18n**: The hardcoded string is fine for v1; if the app is ever localised, this string needs extracting to a locale file
- **Overlay blocks all interaction**: Intentional — the user must acknowledge the session expiry before proceeding
