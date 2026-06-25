## 1. ProgressBar Updates

- [x] 1.1 Update `src/components/atoms/ProgressBar.tsx` to accept a `currentPath` prop.
- [x] 1.2 Modify `ProgressBar` to use the `currentPath` prop for `activeIdx` calculation directly.
- [x] 1.3 Modify `ProgressBar` to evaluate `completedIdx = mounted ? getStepIndex(currentStep) : -1` to avoid hydration mismatch.
- [x] 1.4 Remove the early return `if (!currentPath) return null` since we now guarantee the path is passed from Astro, but keep hiding it for `/`.

## 2. Layout Updates

- [x] 2.1 Update `src/layouts/Layout.astro` to retrieve the current pathname using `const currentPath = Astro.url.pathname`.
- [x] 2.2 Update the `<ProgressBar />` usage in `Layout.astro` to pass the `currentPath={currentPath}` prop.

## 3. Verification

- [x] 3.1 Run `pnpm build` to verify the build passes.
