## 1. Fix Step3Form useEffect to use ref guard

- [x] 1.1 Add `useRef` import from React in Step3Form.tsx
- [x] 1.2 Create a `prevOurlensRef` ref initialised with current `ourlensCompleted`
- [x] 1.3 Guard the `setField("hazard_flags", [])` call with a `prevOurlensRef.current !== ourlensCompleted` check
- [x] 1.4 Update `prevOurlensRef.current` inside the guard

## 2. Sync delta spec to main spec

- [x] 2.1 Copy the MODIFIED requirement block from `specs/form-screens/spec.md` into `openspec/specs/form-screens/spec.md`
- [x] 2.2 Verify the main spec now contains the updated requirement

## 3. Verify the fix

- [x] 3.1 Run `pnpm dev` and navigate through steps 2 → 3 → 4 → 3, confirm hazard_flags checkboxes retain their state
- [x] 3.2 Toggle `ourlens_completed` on Step 3, confirm hazard_flags clears
- [x] 3.3 Run `pnpm build` to confirm no type or build errors
