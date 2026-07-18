## Context

The form wizard stores all step data in a single Zustand store with localStorage persistence (`src/store/form.ts`). Step 3 has conditional rendering of `hazard_flags` checkboxes that depend on `ourlens_completed` value — but no mechanism clears stale array values when the parent toggle changes. The summary page (step 5) has `email_recipients` and `custom_message` fields in its Zod schema and store initial state but no rendered UI to capture them (spec'd in `form-screens/spec.md` fields 18-19 but never implemented). Two cosmetic label mismatches also exist relative to the spec.

No architectural changes needed — all fixes are local to existing components or add new atoms within existing patterns.

## Goals / Non-Goals

**Goals:**
- Eliminate stale `hazard_flags` data when `ourlens_completed` changes
- Render `email_recipients` (text input) and `custom_message` (textarea) on the summary page per existing spec
- Fix summary section title to match spec: "Life" → "Lifestyle"
- Fix `hobbies_social` placeholder to match spec
- Update `form-screens` spec to reflect current implementation status and add data-integrity requirement

**Non-Goals:**
- No new capabilities beyond what the `form-screens` spec already defines for summary
- No changes to Step 1, 2, or 4 field logic
- No n8n webhook integration — `SummarySubmitButton` continues to console.log until that's implemented separately
- No migration or rollback concerns (all in-memory store data)

## Decisions

### D1: Clear `hazard_flags` via `useEffect` in `Step3Form`

The simplest fix is a `useEffect` in `Step3Form.tsx` that calls `setField("hazard_flags", [])` when `ourlens_completed` changes. No need for a new hook or wrapper — the form organism already subscribes to `ourlens_completed`.

**Alternatives considered:**
- Reset in store's `setField` on every `ourlens_completed` write via a subscribed callback — over-engineered for a single field pair
- Make `hazard_flags` nullable and only validate when `ourlens_completed` has a value — would change Zod schema and break the simple `min(1)` validation

Chosen approach is minimal, local, and matches the existing pattern of keeping component logic in components.

### D2: New `ValidatedTextarea` atom for `custom_message`

No textarea atom exists. Need one following the exact pattern of `ValidatedInput.tsx` (namespace React import, `export function`, `useField`, Tailwind classes). Could alternatively inline with a basic `<textarea>`, but every other form field goes through a validated atom — consistency matters.

**Alternatives considered:**
- Use a basic HTML `<textarea>` with manual store binding — breaks the `useField` contract and would need its own error display logic
- Reuse `ValidatedInput` with `as="textarea"` prop — adds complexity to a component that's currently focused on `<input>`. A dedicated atom is clearer.

### D3: `email_recipients` uses existing `ValidatedInput`

Field is a text input (comma-separated emails). No special validation beyond what `z.string().optional()` provides — spec marks it optional. Reuse existing `ValidatedInput` atom with appropriate label and placeholder.

### D4: Summary card cosmetic fixes are one-line string changes

`SummaryReviewCard.tsx:28` — change `"Environment, Digital & Life"` to `"Environment, Digital & Lifestyle"`.
`Step3Form.tsx:97` — change placeholder string to match spec.

## Risks / Trade-offs

- **[Low] `hazard_flags` reset on toggle is a blunt clear** — if a user accidentally fat-fingers `ourlens_completed` back and forth, they lose their selection. Acceptable because (a) it's unlikely mid-form, and (b) stale data is worse than re-selection.
- **[Low] ValidatedTextarea duplicates ValidatedInput pattern** — if the two components ever diverge meaningfully, the duplication becomes maintenance debt. For now they're structurally identical except `<textarea>` vs `<input>`, so the cost is negligible.
