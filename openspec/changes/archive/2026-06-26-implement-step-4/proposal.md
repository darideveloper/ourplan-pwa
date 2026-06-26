## Why

We need to implement "Step 4: The Support Circle" of the form wizard. This step captures information about the user's support network (siblings, partners, etc.) using a dynamic repeater field, allowing them to add multiple people. This provides crucial context for the generated plan about who can help and in what capacity.

## What Changes

- Implement a dynamic repeater field allowing users to add multiple people to their support circle.
- Add `fourthStepSchema` to the Zustand store, validating an array of helper objects.
- Each helper object will contain: `helper_name`, `helper_relationship`, `helper_proximity`, `helper_time`, and `helper_superpower`.
- Provide dropdown menus for relationship, proximity, time availability, and superpower for each helper.
- Ensure the final "Generate My Plan" button on the summary page requires a mandatory legal disclaimer checkbox to be checked (noting that the summary page implementation might be handled fully in the next step, but we will lay the groundwork or note it here if it's considered part of Step 4's end flow).

## Capabilities

### New Capabilities

### Modified Capabilities
- `form-screens`: Update implementation status for Step 4.

## Impact

- `src/store/form.ts` will be updated with `fourthStepSchema` and initial state for `support_circle`.
- New UI components (`ValidatedSelect`, `SupportCircleRepeater`) for Step 4 will be introduced.
- `src/pages/step4.astro` will be created to house the Step 4 form.
