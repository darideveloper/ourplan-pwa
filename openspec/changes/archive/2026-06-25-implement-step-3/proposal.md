## Why

Step 3 ("Environment, Digital & Lifestyle") of the OurPlan wizard is currently a placeholder. We need to implement this step to collect crucial information about the parent's physical living space, safety risks, digital literacy, and social life. This data is essential for generating a comprehensive and personalized care plan.

## What Changes

- Implement the `thirdStepSchema` in the Zustand store using Zod for validation.
- Extend `FormState` to include `home_type`, `ourlens_completed`, `hazard_flags`, `digital_literacy`, `has_pets`, and `hobbies_social`.
- Create a `ValidatedCheckboxGroup` atom to support multi-select checkbox fields for the `hazard_flags`.
- Implement dynamic conditional logic in Step 3 so that the `hazard_flags` question and options change based on the value of `ourlens_completed`.
- Build the Step 3 page (`src/pages/step3.astro`) utilizing the new fields and `StepLayout`.

## Capabilities

### New Capabilities
None

### Modified Capabilities
- `form-screens`: Update implementation status of Step 3 from PLACEHOLDER to DONE.

## Impact

- **Store**: `src/store/form.ts` will be updated with new schema and state fields.
- **UI Components**: A new `ValidatedCheckboxGroup` component will be introduced.
- **Pages**: `src/pages/step3.astro` will be fully fleshed out with React islands for each field.
