## Context

The multi-step form currently lacks a "start over" mechanism. The Zustand store already exposes `useFormStore.reset()` that returns all fields to `initialState`. The session store (`useSessionStore`) is separate — its `reset()` clears the invitation code, which we deliberately do NOT call.

The `StepLayout.astro` component wraps all form steps (1-4 + summary) and already has a navigation footer with Back link and ContinueButton. The landing page (`/`) uses `Layout.astro` directly, not `StepLayout`.

## Goals / Non-Goals

**Goals:**
- Provide a "Start over" action accessible from any form page (steps 1-4 + summary)
- On confirm, clear all form data via `useFormStore.reset()` and redirect to `/step1`
- Preserve the invitation code session (no re-verification needed)
- Use native `window.confirm()` for the confirmation dialog
- Style as a subdued text link — secondary/tertiary action, not a button

**Non-Goals:**
- Custom modal/dialog component
- Resetting the invitation code or session
- Adding reset to the landing page (/)
- Partial resets (e.g., resetting a single step)

## Decisions

1. **Placement: StepLayout.astro footer, below the nav row**
   - The reset link sits in its own row below the Back/Continue navigation, separated by a thin divider or extra spacing. This is visible on all form pages but not on the landing page (which uses Layout.astro directly).
   - Alternative considered: Layout.astro header area — rejected because it would appear on the landing page where no form data exists.

2. **Confirmation: `window.confirm()`**
   - Native browser confirm dialog. No custom modal needed.
   - Alternative considered: shadcn AlertDialog — rejected as over-engineering for a single, rare destructive action. No existing AlertDialog in the component library.

3. **Post-reset redirect: `/step1`**
   - After `useFormStore.reset()`, the page redirects to `/step1`. This puts the user at the form start with all fields blank.
   - Alternative considered: stay on current page — rejected because empty fields mid-form would be confusing and `ResumeRedirect` would handle it inconsistently.

4. **Separate React component (`ResetLink.tsx`)**
   - Following the existing atom pattern: a focused React island that reads/writes to store, rendered with `client:load` in Astro.
   - Alternative considered: inline JS in StepLayout.astro — rejected because it needs access to `useFormStore` which is a React hook, and mixing client JS with Astro template logic is not the project pattern.

## Risks / Trade-offs

- **`window.confirm()` is unstyled** — Acceptable for a rarely-used destructive action. The native dialog is clear, accessible, and cannot be dismissed accidentally (it's modal).
- **Post-reset redirect may cause flash** — If the user is already on `/step1` when they reset, the redirect is a no-op. If on another page, a brief transition is expected (the `GlobalLoader` component already handles navigation loading states).
- **No undo** — Once confirmed, data is gone. This is the intended behavior; the confirm dialog makes this explicit.
