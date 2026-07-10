## 1. Global Store Access Setup

- [x] 1.1 Ensure that step pages or the interactive React islands can read `parent_name` from the Zustand store. (e.g., `const parentName = useFormStore(state => state.parent_name) || "your loved one";`)

## 2. Update Step Pages

- [x] 2.1 Update `src/pages/step1.astro` and `src/components/molecules/ParentHealthRadioGroup.tsx` (or where the label is defined) to replace `[Name]` with the dynamic value of `parent_name`.
- [x] 2.2 Update `src/pages/step2.astro` (and relevant interactive components) to replace `[Name]` with the dynamic value of `parent_name` in questions like `lpa_status`, `psr_status`, and `documents_loc`.
- [x] 2.3 Update `src/pages/step3.astro` (and relevant interactive components) to replace `[Name]` with the dynamic value of `parent_name` in questions like `home_type`, `digital_literacy`, `has_pets`, and `hobbies_social`.

## 3. Review and Testing

- [x] 3.1 Verify that if `parent_name` is empty, all updated components fallback correctly to "your loved one" or "them".
- [x] 3.2 Verify that all form steps build successfully and the UI functions correctly with the dynamic name injected.
