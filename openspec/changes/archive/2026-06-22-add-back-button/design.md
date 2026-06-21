## Context

The multi-step form currently forces forward progression. If a user needs to go back to correct previous input, there is no UI mechanism to do so other than using the browser's back button. The project uses Astro pages for routing (`/`, `/step-2`, `/step-3`, etc.), with state persisted in `localStorage` via Zustand.

## Goals / Non-Goals

**Goals:**
- Provide a consistent UI component for backward navigation.
- Ensure state is preserved when navigating back (handled by existing Zustand persist middleware).
- Integrate the back button gracefully into the existing UI layout/shell.

**Non-Goals:**
- Change the routing mechanism.
- Change the state management.
- Implement complex form wizard state machines (just simple URL navigation).

## Decisions

**Decision 1: Implementation of Back Navigation**
- *Option A*: Use `window.history.back()` in a React button island.
- *Option B*: Use standard Astro `<a>` links with the URL of the previous step.
- *Rationale*: Option B is better for accessibility and SSR. We will pass a `backUrl` prop to the layout or step component, and render an anchor tag styled as a shadcn button (`<a href={backUrl} class={buttonVariants({ variant: "ghost" })}>Back</a>`). Option A is a fallback if the previous URL is strictly dynamic, but since our steps are static (`/step-2`, etc.), Option B is preferred.

**Decision 2: UI Placement**
- The back button will be placed in the header or at the top of the form content area, depending on the existing `extract-step-shell-layout`. If `Layout.astro` accepts a `backUrl`, it can render the button.

## Risks / Trade-offs

- **Risk**: Users might lose data on the current step if they navigate back without saving.
- **Mitigation**: The form state should ideally autosave on change to Zustand, or the back button can act as a standard navigation which warns them. However, since we use `localStorage` and islands, input state is tied to the islands. We will rely on the existing state persistence behaviour.
