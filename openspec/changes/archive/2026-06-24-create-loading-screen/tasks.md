## 1. Store Updates

- [x] 1.1 Add `isNavigating` boolean state to `FormState` in `src/store/form.ts`
- [x] 1.2 Add `setIsNavigating` action to `FormActions` in `src/store/form.ts`

## 2. UI Implementation

- [x] 2.1 Create `src/components/molecules/LoadingOverlay.tsx` with a spinner and customizable message.
- [x] 2.2 Create a `GlobalLoader` component that reads `isNavigating` from Zustand and displays the `LoadingOverlay`.

## 3. Integration & Testing

- [x] 3.1 Update `src/layouts/Layout.astro` to include `<GlobalLoader client:load />`
- [x] 3.2 Update `src/components/atoms/ContinueButton.tsx` to call `setIsNavigating(true)` right before `window.location.href` assignment.
- [x] 3.3 Verify that clicking "Continue" briefly shows the loading spinner before the next page loads.
