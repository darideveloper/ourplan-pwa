## Why

To improve the perceived performance and feel of the app, we want to provide visual feedback during transitions. Specifically, when clicking "Continue" to move to the next step, or when the app is initializing (hydrating data from local storage), showing a brief loading spinner or screen makes the app feel more responsive and solid.

## What Changes

- Create a `LoadingOverlay` UI component.
- Integrate it into the step navigation flow (e.g. `ContinueButton` and other navigation events) so a loading state appears while transitioning between pages.
- Integrate it into the initial hydration phase so the page optionally shows a loading state while Zustand restores data from local storage.

## Capabilities

### New Capabilities
- `loading-screen`: A dedicated UI state/component for transitions between steps and during initial hydration.

### Modified Capabilities
- None

## Impact

- UI Components (new `LoadingOverlay` component)
- Navigation components like `ContinueButton`
- Global layout or Zustand initialization logic
