## Context

Step 3 introduces new data types to the wizard, specifically a multi-select conditional field (`hazard_flags`). Depending on the answer to `ourlens_completed`, the user sees different hazard options (either the risks flagged by OurLens, or their general worries based on a visit). We need to support this conditional rendering and introduce a component for checkbox groups.

## Goals / Non-Goals

**Goals:**
- Create `thirdStepSchema` and integrate it into `form.ts`.
- Build a reusable `ValidatedCheckboxGroup` atom to handle array-based selections in Zustand.
- Implement conditional logic to show different options for `hazard_flags` based on `ourlens_completed` state.
- Keep all interactive logic inside React islands and structure inside Astro.

**Non-Goals:**
- We are not building a fully functional tags input with visual chips for `hobbies_social` right now. We will use a standard `ValidatedInput` since the field allows for a simple string list (e.g., "gardening, church, lunch club").

## Decisions

1. **Schema Design for `hazard_flags`**: We will define `hazard_flags` as `z.array(z.string())` in Zod rather than a strict enum union, because the options change dynamically. This avoids complex discriminated unions in the schema while still enforcing that it's an array of selections.
2. **`ValidatedCheckboxGroup` Atom**: We will create a stateful atom wrapper that connects to our Zustand store using `useFormStore`. It will take `options` (value/label pairs) and render shadcn Checkboxes. When checked/unchecked, it will read the current array from the store, append or remove the value, and call `setField`.
3. **Conditional Rendering Island**: Since the `hazard_flags` field depends on `ourlens_completed`, we will create a specific molecule `HazardFlagsSection.tsx` (or handle it inside a single Step3 island) that reads `ourlens_completed` and conditionally renders the appropriate label and options for `ValidatedCheckboxGroup`.
4. **Step 3 Island Architecture**: We will create a `Step3Form` island that handles all the interactive fields (radios, conditional checkboxes, text inputs) and wrap them inside the standard StepLayout.

## Risks / Trade-offs

- **Risk:** React islands not re-rendering correctly when `ourlens_completed` changes.
  - **Mitigation:** Subscribe explicitly to `ourlens_completed` inside the island that renders the conditional fields so it correctly updates the UI.
