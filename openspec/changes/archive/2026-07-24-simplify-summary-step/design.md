## Context

The Summary step renders a plan review card plus a "Final Step" section with 4 inputs: an email field, a message textarea, a disclaimer checkbox, and a submit button. Only the checkbox and button are functional — the email and message fields are inert placeholders with no backend wiring. Removing them is a pure deletion: no new code, no migration, no data transformation.

## Goals / Non-Goals

**Goals:**
- Remove `email_recipients` and `custom_message` from `summarySchema` and `initialState` in the Zustand store
- Remove the two UI components and their imports from `summary.astro`
- Keep localStorage backward-compatible (stale keys are simply ignored by Zod)

**Non-Goals:**
- No changes to `FormValues` type (auto-updates via Zod inference)
- No changes to `ValidatedInput`, `ValidatedTextarea`, `DisclaimerCheckbox`, or `SummarySubmitButton` component files
- No removal of the component files themselves (they are generic, used by other steps)
- No purge of stale localStorage keys on existing users (harmless)

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Schema removal strategy | Delete keys from `summarySchema` object literal | Zod infers types — removing from schema auto-removes from `SummaryStepState` and `FormValues` intersection. No manual type surgery needed. |
| Import cleanup | Delete the two import lines and the JSX blocks from `summary.astro` | Only touches the Astro file; component files stay untouched. |
| Stale localStorage data | Ignore | `initialState` no longer defines the keys, `setField` will never write them, Zod validates only what's in the schema. Orphan keys in localStorage are inert. |

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| `SummarySubmitButton` uses `...formValues` rest spread — removing fields shrinks the spread | The spread is only used for `console.log`. Missing keys simply don't appear. No functional impact. |
| Another page imports `ValidatedInput`/`ValidatedTextarea` and would lose them if we deleted the modules | We are NOT deleting the component files — only the imports in `summary.astro`. Other steps (step1-inputs, step3-textarea) still use them. |