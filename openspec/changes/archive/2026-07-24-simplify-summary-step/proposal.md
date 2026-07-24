## Why

The Summary step (Final Step) has two optional fields (`email_recipients`, `custom_message`) that were placeholders for future n8n integration. They are not yet wired to any backend and add visual noise. Removing them simplifies the form, reduces localStorage payload, and focuses users on the only action that matters: agreeing to terms and generating their plan.

## What Changes

- Remove `email_recipients` field (ValidatedInput) from summary page
- Remove `custom_message` field (ValidatedTextarea) from summary page
- Remove `ValidatedInput` and `ValidatedTextarea` imports from `summary.astro`
- Remove both fields from `summarySchema` in `src/store/form.ts`
- Remove both fields from `initialState` in `src/store/form.ts`

No UI or behaviour changes to DisclaimerCheckbox or SummarySubmitButton.

## Capabilities

### New Capabilities

- `summary-step`: The final review + submit screen containing only the plan review card, disclaimer checkbox, and submit button.

### Modified Capabilities

None — no existing specs to modify.

## Impact

| Area | Impact |
|---|---|
| `src/pages/summary.astro` | Remove 2 imports, remove 2 component usages, remove wrapper div |
| `src/store/form.ts` | Remove 2 lines from schema, 2 lines from initialState |
| `src/components/atoms/ValidatedInput.tsx` | No change (generic component, still used by other steps) |
| `src/components/atoms/ValidatedTextarea.tsx` | No change (generic component, safe to keep) |
| localStorage schema | Keys `email_recipients` and `custom_message` will stop being persisted (stale data harmless, ignored) |
| `SummarySubmitButton` | No change — uses `...formValues` rest spread, missing keys simply absent |