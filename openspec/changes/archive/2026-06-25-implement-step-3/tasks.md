## 1. Store Updates

- [x] 1.1 Add `thirdStepSchema` in `src/store/form.ts` using `z.object` with required validations.
- [x] 1.2 Export `ThirdStepState` type derived from `thirdStepSchema`.
- [x] 1.3 Add `FormValues` union for `ThirdStepState`.
- [x] 1.4 Update `initialState` in `src/store/form.ts` with default undefined values for the new Step 3 fields.
- [x] 1.5 Add `"/step3": thirdStepSchema` to the `stepSchemas` registry.

## 2. Component Updates

- [x] 2.1 Verify `Checkbox` primitive is exported in `src/components/ui/checkbox.tsx`.
- [x] 2.2 Create `src/components/atoms/ValidatedCheckboxGroup.tsx` that reads an array from the store and allows toggling multiple options.

## 3. Page Implementation

- [x] 3.1 Create a `Step3Form.tsx` island component in `src/components/organisms/` (or similar suitable directory) that houses the form logic and conditional rendering.
- [x] 3.2 Implement `home_type`, `ourlens_completed`, `digital_literacy`, `has_pets` radios, and `hobbies_social` input within `Step3Form.tsx`.
- [x] 3.3 Implement conditional logic for `hazard_flags`: Show either risk areas or worries depending on the value of `ourlens_completed`.
- [x] 3.4 Create `src/pages/step3.astro` that wraps the `Step3Form` island within the `Layout`.

## 4. Verification

- [x] 4.1 Run the dev server to ensure `step3` loads without errors.
- [x] 4.2 Verify conditional rendering of `hazard_flags` works smoothly when toggling `ourlens_completed`.
