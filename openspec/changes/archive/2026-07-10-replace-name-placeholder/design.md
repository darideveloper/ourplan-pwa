## Context

The conversational form currently uses a static `[Name]` placeholder in question texts. Since Step 1 asks "Who are we planning for today?" (`parent_name`), subsequent steps should dynamically use this name to create a personalized experience.

## Goals / Non-Goals

**Goals:**
- Dynamically inject the `parent_name` value from the Zustand store into question labels and helper text across all form screens.
- Provide a robust fallback (e.g., "them", "your loved one") in case `parent_name` is empty or not yet provided.

**Non-Goals:**
- Re-architecting how questions are structured in the components.
- Adding complex templating systems—simple string replacement or React conditional rendering is sufficient.

## Decisions

- **Approach:** We will implement a React hook `useDynamicName()` or simply read `parent_name` directly from the Zustand store (`useFormStore((state) => state.parent_name)`) within each step component.
- **Implementation in UI:** 
  - For Astro layouts or components, we'll pass the `parent_name` down to React islands where possible, or just have the React islands read it directly since they render the questions.
  - The `[Name]` placeholder will be replaced in rendering logic (e.g. `` How would you describe ${parentName || 'their'} current health? ``).
- **Fallback:** If `parent_name` is falsy, we will fall back to "them" or "your loved one" to maintain readability.

## Risks / Trade-offs

- [Risk] Astro pages might be server-rendered or statically generated without knowing the local storage state.
  - Mitigation: The interactive forms are already React islands with `client:load` and use Zustand with localStorage. The dynamic labels will be rendered on the client side inside the React components, so there's no mismatch.
