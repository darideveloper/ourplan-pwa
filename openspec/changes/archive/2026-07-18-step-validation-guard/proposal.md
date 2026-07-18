## Why

Form steps can be navigated past without validation being satisfied. The "Continue" button never visibly disables — it silently fails and stays on the page, giving no feedback. Navigation links at the top of the screen (ProgressBar dots) don't check current-step validity. This creates a poor UX where users don't know if they can proceed, and validation can be bypassed by clicking forward via nav.

## What Changes

- **Continuous step validation**: Every value change re-validates the current step's entire schema. Step validity is tracked as derived state.
- **Disabled Continue button**: Renders `disabled` when current step is invalid, with visual styles (reduced opacity, not-allowed cursor).
- **Disabled forward navigation**: ProgressBar links to steps ahead of the current page are disabled + dimmed when the current form is invalid.
- **Visual feedback**: All disabled controls show `opacity-50` and `cursor-not-allowed` so the user can see they must complete the form first.

## Capabilities

### New Capabilities
- `step-validation`: Real-time step-level validation, disabled state plumbing for ContinueButton and ProgressBar, disabled visual styles

### Modified Capabilities

None — no existing specs are changing.

## Impact

| File | Change |
|---|---|
| `src/store/form.ts` | Add `stepValidity` derived state; refactor `setField` to single atomic `set()` with step validation |
| `src/components/atoms/ContinueButton.tsx` | Consume `stepValidity`, add `disabled` prop + disabled styles |
| `src/components/atoms/ProgressBar.tsx` | Consume `stepValidity`, disable forward links when invalid |
| `src/components/ui/button.tsx` | Verify — shadcn Button already has `disabled:opacity-50` in base variant, no change needed |
