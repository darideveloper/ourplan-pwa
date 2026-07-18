## 1. Store — Add step validity derivation

- [x] 1.1 Add `stepValidity: Record<string, boolean>` to `FormStore` interface and initialize as `{}` in the store creation
- [x] 1.2 Refactor `setField` from two early-return `set()` calls to a single `set()` with field update, error resolution, and step validity computation for the current page
- [x] 1.3 Add `stepValidity` reset to the `reset` action

## 2. ContinueButton — Wire disabled state

- [x] 2.1 Read `stepValidity[stepPath]` from store; apply `disabled={!(state.stepValidity[stepPath] ?? false)}` to Button (default `false` when `undefined`)
- [x] 2.2 Compute initial step validity in a `useEffect` on mount: read form values from store, run `stepSchema.safeParse`, write result to `stepValidity[stepPath]`
- [x] 2.3 No extra CSS needed — shadcn Button already has `disabled:opacity-50` in its `cva` base variant

## 3. ProgressBar — Wire disabled state for forward nav

- [x] 3.1 Read `stepValidity[currentPath]` from store
- [x] 3.2 Disable forward nav links (`idx > activeIdx`) when step is invalid: add `opacity-40 cursor-default` + `e.preventDefault()`
- [x] 3.3 Verify backward nav is never disabled

## 4. Verify

- [x] 4.1 Run `pnpm build` and confirm no type/compile errors
- [x] 4.2 Run `pnpm dev` and manually verify: invalid step → Continue disabled + dimmed, forward nav disabled + dimmed; valid step → everything enabled
