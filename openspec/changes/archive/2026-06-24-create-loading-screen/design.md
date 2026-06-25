## Context

To make the app feel more responsive and polished, we want to provide visual feedback when transitioning between form steps and during initial hydration. Hard page reloads between Astro routes can feel jarring if the user doesn't get immediate feedback upon clicking "Continue".

## Goals / Non-Goals

**Goals:**
- Design a `LoadingOverlay` component that can cover the screen.
- Show a loading state when the user clicks "Continue" while the browser is navigating.
- Show a loading state briefly during initial client-side hydration (when restoring from `localStorage`).

**Non-Goals:**
- We are not implementing single-page application (SPA) client-side routing. We will keep Astro's multi-page architecture.

## Decisions

1. **Global Store State**: Add an `isNavigating` and `isHydrated` (or `isMounted`) state to Zustand, or manage it via a global component. Since the `LoadingOverlay` needs to be triggered from different buttons, adding `isNavigating` to the store makes sense. We can also use standard React state in `Layout` for hydration.
2. **ContinueButton Integration**: When `ContinueButton` is clicked, we set `isNavigating(true)` right before assigning `window.location.href = nextUrl`. The browser will keep executing JS while fetching the next page, allowing the spinner to show immediately.
3. **Hydration Spinner**: We can wrap our main form content in a check that ensures `mounted` is true. While `!mounted`, we can render a minimal skeleton or spinner so it doesn't flash the default unhydrated state before populated fields render.
4. **Overlay Component**: A reusable `LoadingOverlay` component will be created, featuring a spinner and dynamic text.

## Risks / Trade-offs

- **Risk:** Showing an overlay on every click could feel slow.
  - **Mitigation:** We only show it for actual cross-page navigation, not minor interactions. Because it's local development, navigation is almost instant, so it might flash quickly. We can add a small CSS fade-in to the overlay so it only fully appears if the transition takes more than 100ms.
