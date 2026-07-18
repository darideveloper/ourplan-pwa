## 1. Fix `hazard_flags` stale data bug

- [x] 1.1 Add `useEffect` in `Step3Form.tsx` that calls `setField("hazard_flags", [])` when `ourlens_completed` changes value
- [x] 1.2 Verify the fix: open Step 3, select `ourlens_completed`, pick flags, toggle `ourlens_completed`, confirm flags array is cleared

## 2. Create `ValidatedTextarea` atom

- [x] 2.1 Create `src/components/atoms/ValidatedTextarea.tsx` following the exact pattern of `ValidatedInput` (namespace React import, `export function`, `useField` hook, Tailwind classes) but rendering a `<textarea>` instead of `<input>`\n- [x] 2.2 Verify the atom renders and integrates with store via `useField`

## 3. Add summary page email and message fields

- [x] 3.1 Import `ValidatedInput` into `src/pages/summary.astro` and render `email_recipients` field with label "Email this plan to your support circle (optional)" and placeholder "e.g., sibling@email.com, partner@email.com"\n- [x] 3.2 Import `ValidatedTextarea` into `src/pages/summary.astro` and render `custom_message` field with label "Add a personal message (optional)" and placeholder "Let your support circle know what this plan means..."\n- [x] 3.3 Verify both fields render on summary page, accept input, persist to store, and don't block submission when empty

## 4. Fix cosmetic label mismatches

- [x] 4.1 Change `SummaryReviewCard.tsx:28` title from `"Environment, Digital & Life"` to `"Environment, Digital & Lifestyle"`\n- [x] 4.2 Change `Step3Form.tsx:97` `hobbies_social` placeholder from `"e.g., gardening, church, lunch club"` to `"e.g., gardening, church, lunch club, watching football, family visits"`

## 5. Update `form-screens` spec

- [x] 5.1 Update implementation status table in `openspec/specs/form-screens/spec.md` — mark Step 2 as DONE, Summary as DONE (after this change)
- [x] 5.2 Update `Store Schema Cross-Reference` section to remove "not yet defined" notes for schemas that exist
- [x] 5.3 Update `Required Store Additions` section to reflect current completion state
