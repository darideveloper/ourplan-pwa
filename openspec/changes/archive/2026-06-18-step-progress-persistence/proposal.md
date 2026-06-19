## Why

The multi-step form wizard needs cross-page state tracking for three features: resume to last step after refresh/close, conditional navigation (no skipping incomplete steps), and a persistent progress bar. Currently, the Zustand store only holds form field data with no awareness of which step the user is on.

Route paths are also inconsistent (`/first-step`, `/step-2`) — standardise to numeric naming (`/step1`, `/step2`, etc.) for clean mapping in code and URLs.

## What Changes

- Rename route paths: `/first-step` → `/step1`, `/step-2` → `/step2`, plus new `/step3`, `/step4`, `/summary`
- Rename page files: `first-step.astro` → `step1.astro`, `step-2.astro` → `step2.astro`
- Add `currentStep` field to Zustand store (stores farthest completed step, not current URL)
- `currentStep` advances only when a step's Zod schema passes validation
- `useStepGuard()` React hook — called in each step's React island on mount, validates accessibility via index comparison, redirects if blocked
- User can navigate back to any completed step but cannot skip ahead
- `<ProgressBar>` React island — reads `currentStep`, shows 4 steps with current + completed visual states, replaces inline "Step X of 4" badges
- `<ResumeRedirect>` React island — on `/` (index), redirects to earliest incomplete step
- `Layout.astro` — mount `<ProgressBar>` in shell
- Remove inline "Step X of 4" pill badges from each step page (replaced by ProgressBar)

## Capabilities

### New Capabilities
- `step-progress-tracking`: manage current step in Zustand, linear navigation guard, progress bar display, resume from index

### Modified Capabilities
*(none — no existing specs)*

## Impact

- `src/store/form.ts` — add `currentStep` + `advanceStep` action + `getEarliestIncomplete` helper
- `src/hooks/useStepGuard.ts` — new React hook for accessibility guard
- `src/components/atoms/` — 2 new React components: `ProgressBar`, `ResumeRedirect`
- `src/layouts/Layout.astro` — add `<ProgressBar />` with `client:load`
- `src/pages/` — rename `first-step.astro` → `step1.astro`, `step-2.astro` → `step2.astro`; update all `<a href>` links; remove inline step badges
- `src/pages/index.astro` — add `<ResumeRedirect />`
- No new dependencies
