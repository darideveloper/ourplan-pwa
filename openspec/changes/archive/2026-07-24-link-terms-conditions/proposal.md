## Why

The terms-conditions link is inconsistent across the user journey. The first screen (`TermsCheckbox`) links to an old URL (`ourlivesapp.com/our-plan-terms-and-conditions/`), and the final screen (`DisclaimerCheckbox`) has no link at all — just plain text mentioning "Terms & Disclaimer". Users on the summary screen cannot access the legal document they're agreeing to.

## What Changes

- Update `TermsCheckbox` link URL from `https://ourlivesapp.com/our-plan-terms-and-conditions/` to `https://www.ourlivesapp.com/terms-conditions/`
- Add a clickable link to `https://www.ourlivesapp.com/terms-conditions/` in `DisclaimerCheckbox`, wrapping the "Terms & Disclaimer" text with same styling pattern as `TermsCheckbox`
- No new components, no new state, no new validation

## Capabilities

### New Capabilities

None — this is a pure UI fix to existing components.

### Modified Capabilities

None — no requirement-level behavior changes.

## Impact

- `src/components/atoms/TermsCheckbox.tsx` — one href change
- `src/components/atoms/DisclaimerCheckbox.tsx` — wrap static text in `<a>` tag
