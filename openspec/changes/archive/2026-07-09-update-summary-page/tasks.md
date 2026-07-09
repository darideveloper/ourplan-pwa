## 1. Store Updates

- [x] 1.1 Update `src/store/form.ts` to include `summarySchema` with validation for the `disclaimer_agreed` checkbox.
- [x] 1.2 Update the `FormState` in `src/store/form.ts` to include `disclaimer_agreed` with a default value of `false`.

## 2. Components

- [x] 2.1 Create `src/components/atoms/DisclaimerCheckbox.tsx` to render the legal disclaimer checkbox and bind it to the Zustand store.
- [x] 2.2 Create `src/components/atoms/SummarySubmitButton.tsx` (or update existing) that reads `disclaimer_agreed` to disable itself, and prints the store state to the console on click.
- [x] 2.3 Create `src/components/organisms/SummaryReviewCard.tsx` that reads data from the Zustand store for Steps 1-4 and renders it in a read-only format.

## 3. Page Implementation

- [x] 3.1 Update `src/pages/summary.astro` to import and render `SummaryReviewCard`, `DisclaimerCheckbox`, and `SummarySubmitButton` within the base `Layout`.
