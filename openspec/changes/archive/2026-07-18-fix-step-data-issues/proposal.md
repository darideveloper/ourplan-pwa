## Why

Audit of all form steps against the `form-screens` spec revealed one data-integrity bug (stale `hazard_flags` when conditional toggle changes) and two unimplemented spec fields (`email_recipients`, `custom_message` on summary). Several cosmetic mismatches also exist. None block the form but all erode data quality and spec compliance.

## What Changes

- **Fix `hazard_flags` stale data bug** — clear array when `ourlens_completed` changes to prevent semantically wrong values from the wrong option set being submitted
- **Implement missing summary fields** — add `ValidatedInput` for `email_recipients` and `ValidatedTextarea` for `custom_message` on the summary page (spec'd but never built)
- **Fix summary section title** — `"Environment, Digital & Life"` → `"Environment, Digital & Lifestyle"`
- **Fix `hobbies_social` placeholder** — extend to match spec: `"e.g., gardening, church, lunch club, watching football, family visits"`
- **Update `form-screens` spec** — mark Step 2 (already implemented) and Summary (after this change) as DONE in the implementation status table

## Capabilities

### New Capabilities
- `summary-email-message`: Email recipients input and custom message textarea on the summary page, for sharing the generated plan with the support circle

### Modified Capabilities
- `form-screens`: `hazard_flags` conditional logic must now include a data-integrity rule (reset on parent toggle). Summary page gains email + message fields per existing spec requirements.

## Impact

- `src/components/organisms/Step3Form.tsx` — add `useEffect` to clear `hazard_flags` on `ourlens_completed` change
- `src/components/organisms/SummaryReviewCard.tsx` — fix title text
- `src/pages/summary.astro` — add email and message input components
- `src/components/atoms/` — may need new `ValidatedTextarea` atom (doesn't exist yet)
- `openspec/specs/form-screens/spec.md` — update implementation status table, add data-integrity requirement to hazard_flags conditional logic
