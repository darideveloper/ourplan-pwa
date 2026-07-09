## Why

The summary page currently exists as a placeholder. We need to implement it to allow users to review all the information they have entered throughout the steps before finalizing their plan. Additionally, a legally required disclaimer must be accepted by the user before they can generate the plan, and we need to simulate the submission by printing the details to the console.

## What Changes

- Implement the `/summary` page to display a read-only review card containing all filled-in information from steps 1-4.
- Add a mandatory legal disclaimer checkbox before the submission button.
- Implement the "Generate My Plan" button to print all collected form details to the console on click.
- Disable the "Generate My Plan" button until the disclaimer checkbox is checked.

## Capabilities

### New Capabilities

### Modified Capabilities

- `form-screens`: Implement the Screen 5 (Summary) requirements, specifically rendering the filled-up information for review, the legal disclaimer checkbox, and the print-to-console behavior for submission.

## Impact

- `src/pages/summary.astro` will be implemented.
- The Zustand store (`src/store/form.ts`) will need the `summarySchema` and state to track the disclaimer checkbox.
- New components for the summary review card and the disclaimer checkbox will be created.
