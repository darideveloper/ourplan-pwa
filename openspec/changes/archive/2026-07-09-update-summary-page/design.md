## Context

The `ourplan-pwa` application features a multi-step conversational form that gathers user identities, systemic safeguards, future planning details, and a support circle. The final step is the Summary page (Screen 5), which is currently implemented as a placeholder. The Summary page must display a read-only review of all previously entered information, present a mandatory legal disclaimer, and handle form submission.

## Goals / Non-Goals

**Goals:**
- Implement the read-only summary card populated with data from the Zustand store.
- Implement the legal disclaimer checkbox.
- Enforce that the "Generate My Plan" button is disabled until the disclaimer is checked.
- On clicking "Generate My Plan", print all form state data to the console to simulate submission.

**Non-Goals:**
- Creating the actual PDF or connecting to the n8n webhook (simulated by console output).
- Adding complex inline editing (users can use a simple edit link or rely on the browser's back button).

## Decisions

- **State Management**: The Zustand store (`src/store/form.ts`) will be updated with `summarySchema` and new state properties (`disclaimer_agreed`). This fits seamlessly with the existing architecture.
- **Summary Review Card**: A new component or a section in `summary.astro` will map over the Zustand store's state to display answers. Because the layout doesn't use the `StepLayout` glassmorphism, it will be wrapped directly in the base `Layout.astro`.
- **Submission Action**: The `SubmitButton` component will read the `disclaimer_agreed` state and trigger a `console.log` containing the current Zustand store state.

## Risks / Trade-offs

- [Risk] Formatting the raw store data into a readable summary might require complex mapping. → Mitigation: We will map the keys back to user-friendly labels or use a simple JSON output/simplified view for the MVP if mapping proves too complex.
