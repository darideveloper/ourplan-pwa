## Context

The form uses Zustand with `persist` middleware for cross-step state. Each step has a Zod schema in `stepSchemas`. Per-field validation runs in `setField` (immediate), per-step validation runs in `advanceStep` (on Continue click). Currently there is no derived state tracking whether the current step is fully valid — `advanceStep` re-validates the entire step from scratch and returns `null` on failure, leaving the Continue button looking enabled.

## Goals / Non-Goals

**Goals:**
- Derive step validity as a reactive store property that updates on every field change
- Disable Continue button when current step is invalid with visible disabled styles
- Disable forward ProgressBar navigation when current step is invalid with visible disabled styles
- Keep the change minimal — 4 files, no new dependencies

**Non-Goals:**
- Not changing the per-field validation logic or error display
- Not changing `advanceStep` or the step guard flow
- Not adding tests or CI (none configured for this project)
- Not affecting the summary/submit flow (Summary page has no Continue button)

## Decisions

### Decision 1: Store-level derived state (`stepValidity`) vs component-level computation

**Chosen: Store-level derived state computed inside `setField`.**

Alternatives considered:
- **Component-level**: Each component recomputes validity via a Zustand selector. Duplicates validation logic, runs `.safeParse()` N times per change (once per component).
- **Zustand `subscribe`**: Subscribe to store changes and compute validity externally. Race conditions with `setField` updates; could cause infinite loops if `setState` is called from within subscribe.

Rationale: Computing inside `setField` ensures step validity is always consistent with the current field values in a single atomic update. Both ContinueButton and ProgressBar read from the same source. No extra re-render cycles.

### Decision 2: Refactor `setField` from two `set()` calls to one

**Chosen: Single `set()` call with both field update and step validity computation.**

Current `setField` uses early-return pattern with two separate `set()` calls (error branch and success branch). Refactoring to a single `set()` call allows adding step validity computation without duplicating it across branches.

### Decision 3: Disable ALL forward nav links when invalid, not just next step

**Chosen: Any step with `idx > activeIdx` is disabled when current step is invalid.**

Simpler rule, matches user expectation ("can't skip forward if I haven't finished this step"). User can still navigate backward to fix things.

### Decision 4: Initial step validity on page load

**Chosen: Compute step validity eagerly in a `useEffect` in ContinueButton on mount.**

When the user loads a step page, `stepValidity[path]` is `undefined` because no `setField` has been called yet. Two wrong defaults:

| Default | Problem |
|---|---|
| `true` (enabled) | Empty form shows Continue enabled — regression |
| `false` (disabled) | Pre-filled form (from localStorage) shows Continue disabled until the user touches a field |

Solution: After hydration, ContinueButton runs a `useEffect` that reads current form values, runs `stepSchema.safeParse`, and stores the result in `stepValidity[path]`. The component reads `stepValidity[path] ?? false` — `undefined` only exists for the first render frame before the effect runs.

### Decision 5: Persist stepValidity across navigations

**Chosen: Persist it (keep default `partialize` behavior).**

`partialize` only excludes `isNavigating`. `stepValidity` is persisted to localStorage. This means a valid step from a previous visit stays valid across navigations, avoiding unnecessary re-computation. It also means the eager mount effect catches up on page reloads with pre-filled forms.

---

### Decision 6: No extra disabled styles on ContinueButton — shadcn handles it

**Chosen: Only pass `disabled` prop; no extra Tailwind classes.**

shadcn Button already has `disabled:pointer-events-none disabled:opacity-50` in its `cva` base variant (`src/components/ui/button.tsx`). Passing `disabled` is sufficient.

## Risks / Trade-offs

- **[Performance]** Running `safeParse` on every keystroke for the full step schema. → Mitigation: Step schemas are small (2-6 fields). Zod `.safeParse()` completes in <0.1ms for schemas this size. Negligible.
- **[Edge case]** `window.location.pathname` might not match a step path during navigation transitions. → Mitigation: Guard with `if (currentPath in stepSchemas)` before computing. Default `stepValidity[unknownPath]` to `true` (don't block navigation on non-step pages).
- **[First frame flash]** On page load, `stepValidity[path]` is `undefined` until the mount effect runs. → Mitigation: The `useEffect` runs immediately after mount; the `?? false` default ensures the button starts disabled. If the form is valid, the effect corrects it within the same render cycle. No visible flash in practice.
- **[Hydration SSR]** `window.location` not available on server. → Mitigation: The store's `setField` is only called from client-side React islands (all atoms use `client:load`). Server never calls `setField`.
