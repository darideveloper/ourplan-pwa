## Why

The current Terms & Conditions page at `/terms` contains placeholder legal text ("Informational purposes only", "No liability", "Changes to these terms") that was never meant to be final. The real terms are hosted externally at `https://ourlivesapp.com/our-plan-terms-and-conditions/`. Maintaining duplicate legal text is a compliance risk and unnecessary overhead.

## What Changes

- Update the terms link in `TermsCheckbox` from internal `/terms` to external URL
- Delete `src/pages/terms.astro` (placeholder page, no local terms)
- Update the `access-validation` spec to reflect the final decision (was marked `TBD`)

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `access-validation`: The "Terms link is present" scenario will finalise the link target from `(/terms or external URL TBD)` to the external URL. No other requirement changes.

## Impact

- **Removed**: `src/pages/terms.astro` — route `/terms` will 404
- **Modified**: `src/components/atoms/TermsCheckbox.tsx` — one href change
- **Updated**: `openspec/specs/access-validation/spec.md` — resolve the TBD
