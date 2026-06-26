## 1. State and Store Updates

- [x] 1.1 In `src/store/form.ts`, define `personSchema` for individual helpers in the support circle array.
- [x] 1.2 In `src/store/form.ts`, define `fourthStepSchema` utilizing `z.array(personSchema)` for `support_circle`.
- [x] 1.3 Add `FourthStepState` type derived from `fourthStepSchema` and merge it into `FormValues`.
- [x] 1.4 Update `initialState` in `src/store/form.ts` with `support_circle: []`.
- [x] 1.5 Add `"/step4": fourthStepSchema` to the `stepSchemas` registry.

## 2. Component Creation

- [x] 2.1 Verify or add shadcn's Select components.
- [x] 2.2 Create `src/components/atoms/ControlledSelect.tsx` wrapping the shadcn `Select` to hook into our Zustand state.
- [x] 2.3 Create `src/components/molecules/SupportCircleRepeater.tsx` to handle array mapping, adding a new person, removing a person, and rendering a nested form per person.

## 3. Page Implementation

- [x] 3.1 Create `src/components/organisms/Step4Form.tsx` that holds the instruction text describing the step and renders `SupportCircleRepeater`.
- [x] 3.2 Create `src/pages/step4.astro` that wraps the `Step4Form` island inside the `StepLayout` and passes `backUrl="/step3"`.

## 4. Verification

- [x] 4.1 Run the dev server to ensure `/step4` loads without errors.
- [x] 4.2 Verify you can add, modify, and remove a person from the support circle successfully.
