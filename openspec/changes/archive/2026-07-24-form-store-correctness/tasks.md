## 1. AuthGuard — Move redirect to useEffect

- [x] 1.1 In `src/components/molecules/AuthGuard.tsx`, remove `window.location.replace("/")` from render body
- [x] 1.2 Add a second `useEffect` with `[hydrated, isValid]` deps that calls `window.location.replace("/")` when `hydrated && isValid !== true`

## 2. useField — Widen return type

- [x] 2.1 In `src/store/useField.ts`, change `value: FormValues[K]` to `value: FormValues[K] | undefined` in the typed overload return type (lines 16-21)
- [x] 2.2 Verify no TypeScript errors — all 6 callers already guard via `as` casts or `||` fallbacks

## 3. SummaryReviewCard — Stable React key

- [x] 3.1 In `src/components/organisms/SummaryReviewCard.tsx`, change `key={person.helper_name + i}` to `key={person._id ?? i}` (line 76)

## 4. Persist — Strip errors from localStorage

- [x] 4.1 In `src/store/form.ts`, destructure `errors` out of state alongside `isNavigating` in the `partialize` callback (line 392-395)

## 5. ValidatedRadioGroup — Remove dead parent_name subscription

- [x] 5.1 In `src/components/atoms/ValidatedRadioGroup.tsx`, remove `useField("parent_name")` call (line 23)
- [x] 5.2 Remove `displayLabel` memo and `replyLabel` logic (lines 31-34)
- [x] 5.3 Use `label` prop directly instead of `displayLabel` in the JSX

## 6. hazard_flags — Remove min(1) requirement

- [x] 6.1 In `src/store/form.ts`, change `hazard_flags: z.array(z.string()).min(1, ...)` to `hazard_flags: z.array(z.string())` (line 43)
