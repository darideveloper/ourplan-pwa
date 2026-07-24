## Why

Store audit revealed 6 correctness issues in the form store layer: type inaccuracies, React anti-patterns, unnecessary subscriptions, stale persisted data, unstable React keys, and a coercive UX constraint. These cause no data loss but degrade DX, type safety, and UX predictability. Fixing them now before the codebase grows further.

## What Changes

1. **AuthGuard redirect to useEffect** — Move `window.location.replace("/")` from render body to a `useEffect`, following React conventions against side effects in render
2. **useField return type widened** — Return type adds `| undefined` for value to match reality (store is `Partial<FormValues>`). All callers already guard with `||` or `as` casts
3. **SummaryReviewCard stable key** — Use `person._id ?? i` instead of `person.helper_name + i` for React list keys
4. **errors stripped from persist** — Remove `errors` from Zustand `partialize` so stale error messages don't survive page reload
5. **ValidatedRadioGroup dead code removed** — Remove `useField("parent_name")` and `[Name]`/`[Parent Name]` label replacement regex that no label uses
6. **hazard_flags made optional** — Remove `.min(1)` from `thirdStepSchema.hazard_flags` so empty array passes validation, allowing users to skip hazard selection when no flags apply

## Capabilities

### New Capabilities

None — all changes are internal refactors that don't introduce new external-facing capabilities.

### Modified Capabilities

- **step-validation**: `hazard_flags` validation rule changes from `z.array(z.string()).min(1)` to `z.array(z.string())` (removed minimum requirement)
- **nested-store-paths**: `useField` return type adjusts — top-level overload adds `| undefined` to value type

## Impact

| File | Change |
|---|---|
| `src/store/form.ts` | Strip `errors` from persist `partialize`; remove `.min(1)` from `hazard_flags` schema |
| `src/store/useField.ts` | Add `\| undefined` to typed overload return type |
| `src/components/molecules/AuthGuard.tsx` | Move redirect to `useEffect` |
| `src/components/atoms/ValidatedRadioGroup.tsx` | Remove `useField("parent_name")` subscription and label replacement logic |
| `src/components/organisms/SummaryReviewCard.tsx` | Change React key from `person.helper_name + i` to `person._id ?? i` |
