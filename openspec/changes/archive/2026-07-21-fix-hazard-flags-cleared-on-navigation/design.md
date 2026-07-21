## Context

`Step3Form.tsx` conditionally renders two `ValidatedCheckboxGroup` instances for `hazard_flags` depending on the value of `ourlens_completed`. When switching between branches (e.g., `"yes"` with options `slip/trip/light/access` → `"no_but_wants"` with `stairs/bathing/clutter/entry`), stale array values from the previous option set persist and don't match any visible option — making the checkboxes appear unselected.

Commit `5b57c18` attempted to fix this with a `useEffect` that calls `setField("hazard_flags", [])` on every `ourlens_completed` change. However, `useEffect` also fires on every component mount. Since `Step3Form` mounts/unmounts as the user navigates between form steps, the array is cleared every time the user returns to Step 3 — losing their previous selection.

## Goals / Non-Goals

**Goals:**
- `hazard_flags` is cleared only when `ourlens_completed` actually changes value
- `hazard_flags` retains its value across page navigation
- All existing validation and behaviour (`min(1)` rule, conditional rendering) remains unchanged

**Non-Goals:**
- No changes to the store, schema, or other components
- No changes to the `ValidatedCheckboxGroup` atom
- No new dependencies

## Decisions

### D1: Use `useRef` to guard the effect instead of removing it

The simplest fix is keeping the `useEffect` but guarding it with a ref that tracks the previous value of `ourlens_completed`:

```
prevOurlensRef = useRef(ourlensCompleted)

useEffect:
  if prevOurlensRef.current !== ourlensCompleted:
    prevOurlensRef.current = ourlensCompleted
    setField("hazard_flags", [])
```

**Why not move the clear into the radio group's `onValueChange`?**  
The radio group atom (`ValidatedRadioGroup`) calls `setField` on the store directly — it doesn't know about the `hazard_flags` dependency. Injecting that knowledge would couple the generic atom to a specific form field, breaking the separation of concerns.

**Why not make `hazard_flags` nullable and skip validation when `ourlens_completed` has no value?**  
Would change the Zod schema and complicate the `min(1)` validation. Also doesn't solve the stale-data problem — it would just make stale values pass validation silently.

**Why not use Zustand's `subscribe` in a `useSyncExternalStore`?**  
Over-engineered for a single field pair. The ref guard is 3 lines and local to `Step3Form`.

## Risks / Trade-offs

- **[Low] Ref tracking adds one field to the component** — negligible cost. The ref persists across renders inside the same mount session but resets on unmount, which is exactly the desired behaviour.
- **[Low] If other fields in the future need similar "reset on sibling change" logic** — the ref pattern is reusable and can be extracted into a `usePrevious` hook if it appears a third time.
