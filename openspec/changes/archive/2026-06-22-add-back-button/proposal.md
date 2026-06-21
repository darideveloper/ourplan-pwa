## Why

Currently, the multi-step form does not have a back button, which means users cannot easily return to a previous step to correct or review their input. Adding a back button is essential to improve user experience and form usability, allowing seamless corrections.

## What Changes

- Add a "Back" button to all form steps (except the initial step/landing page).
- The button should navigate the user to the chronologically preceding step.
- The back button will be integrated into the layout or the step shell so it appears consistently across the workflow.

## Capabilities

### New Capabilities
- `step-navigation`: Capability for backward navigation between discrete form steps.

### Modified Capabilities
- `form-screens`: Update to include a back button on steps where applicable.
- `extract-step-shell-layout`: Modify the layout/shell to optionally include a back action.

## Impact

- Astro pages (`src/pages/*.astro`) and/or `src/layouts/Layout.astro` depending on where the shell is defined.
- UI components (adding a new `BackButton` component).
