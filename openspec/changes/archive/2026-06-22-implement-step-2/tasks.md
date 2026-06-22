## 1. Store Update

- [x] 1.1 Update `src/store/form.ts` to add `secondStepSchema` representing `lpa_status`, `psr_status`, and `documents_loc` as enums matching the spec options.
- [x] 1.2 Update the `FormState` interface in `src/store/form.ts` to include the fields from `secondStepSchema`.
- [x] 1.3 Add `"/step2": secondStepSchema` to the `stepSchemas` registry in `src/store/form.ts`.

## 2. UI Implementation

- [x] 2.1 Update `src/pages/step2.astro` to import `ValidatedRadioGroup` instead of rendering the placeholder.
- [x] 2.2 Add the `lpa_status` `ValidatedRadioGroup` with options `both`, `one`, `started`, `none`.
- [x] 2.3 Add the `psr_status` `ValidatedRadioGroup` with options `yes`, `no`.
- [x] 2.4 Add the `documents_loc` `ValidatedRadioGroup` with options `yes`, `partial`, `no`.
- [x] 2.5 Verify form workflow progression from Step 1 -> Step 2 -> Step 3.
