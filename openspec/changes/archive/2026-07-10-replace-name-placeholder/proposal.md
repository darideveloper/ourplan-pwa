## Why

The current form implementation uses `[Name]` as a static placeholder in question labels (e.g. "How would you describe [Name]'s current health?"). This should be replaced dynamically with the actual name entered by the user in Step 1 ("Who are we planning for today?" -> `parent_name`) to make the form feel personal and conversational.

## What Changes

- Update form screen components and logic to read `parent_name` from the global Zustand store.
- Replace instances of `[Name]` in UI labels, questions, and helper text across all form steps with the `parent_name` value.
- Ensure that if `parent_name` is not yet available, a fallback like "their" or "your loved one" is used, or simply handle it gracefully if navigation rules already enforce Step 1 completion.

## Capabilities

### New Capabilities
None

### Modified Capabilities
- `form-screens`: All questions and labels across screens that include the `[Name]` placeholder MUST be updated dynamically with the user-provided `parent_name`.

## Impact

- Affects all page/step components (`src/pages/step*.astro` and related interactive atoms/molecules) that render question labels containing `[Name]`.
- Reads from the Zustand store (`src/store/form.ts`).
