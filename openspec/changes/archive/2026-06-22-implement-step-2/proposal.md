## Why

Step 2 of the OurPlan form ("Systemic Safeguards") is currently a placeholder. We need to implement it to capture critical details about Lasting Power of Attorney (LPA), Priority Services Register (PSR), and vital documents location, which are necessary for generating the final plan.

## What Changes

- Implement `src/pages/step2.astro` to render the Systemic Safeguards form UI.
- Render 3 radio questions: `lpa_status`, `psr_status`, `documents_loc` using the existing `ValidatedRadioGroup` atom.
- Update `src/store/form.ts` to define `secondStepSchema` using Zod.
- Extend `FormState` in the Zustand store to hold the new fields.
- Register `secondStepSchema` to the `stepSchemas` map for the `/step2` path so `StepGuard` and `ContinueButton` can validate it.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None (The requirements for Step 2 are already fully documented in the existing `form-screens` main spec. This is purely an implementation change).

## Impact

- `src/pages/step2.astro` (UI updated from placeholder to actual fields)
- `src/store/form.ts` (State and validation schema expanded)
