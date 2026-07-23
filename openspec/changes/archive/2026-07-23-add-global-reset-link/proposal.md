## Why

Users filling in the multi-step form have no way to start over. If they enter incorrect test data, want to redo their plan, or hand the device to someone else, they must manually clear every field or clear browser storage. A single "start over" action gives users control over their data without needing technical workarounds.

## What Changes

- Add a subtle "Start over" text link visible at the bottom of every form step page (steps 1-4 + summary)
- On click, show a browser native confirmation dialog ("Are you sure? This will clear all your form data.")
- On confirm, call `useFormStore.reset()` to wipe all form fields back to their initial state
- The invitation code / session is preserved — user does NOT need to re-verify their code
- The reset link is NOT shown on the landing page (/) since no form data exists there yet
- Styling: small, muted text link — secondary/tertiary action, not a primary button

## Capabilities

### New Capabilities
- `global-reset`: Subtle start-over link persisted across all form steps that clears form data with confirmation, without disrupting the authenticated session.

### Modified Capabilities

None.

## Impact

- **New atom component**: `ResetLink` — renders a muted "Start over" link with confirm dialog, calls `useFormStore.reset()`
- **Modified layout**: `StepLayout.astro` — add the `ResetLink` component below the navigation footer
- No API, dependency, or store changes — `useFormStore.reset()` already exists
