## 1. Route Standardisation

- [x] 1.1 Rename `src/pages/first-step.astro` → `src/pages/step1.astro`
- [x] 1.2 Rename `src/pages/step-2.astro` → `src/pages/step2.astro`
- [x] 1.3 Create placeholder `src/pages/step3.astro`, `step4.astro`, `summary.astro`
- [x] 1.4 Update all `<a href>` links across pages and layout to use new paths
- [x] 1.5 Remove or redirect old `/first-step`, `/step-2` routes

## 2. Zustand Store Changes

- [x] 2.1 Add `StepPath` type (`"" | "/step1" | "/step2" | "/step3" | "/step4" | "/summary"`)
- [x] 2.2 Add `currentStep` field to `FormState` interface and `initialState`
- [x] 2.3 Add `STEP_ORDER` constant array and `getStepIndex`, `getNextStep`, `getEarliestIncomplete` helpers
- [x] 2.4 Add `advanceStep` action — validates step schema, sets `currentStep` to next step if valid
- [x] 2.5 Add step schema registry mapping step paths to Zod schemas
- [x] 2.6 Export new types, constants, and helpers from `store/form.ts`

## 3. useStepGuard Hook

- [x] 3.1 Create `src/hooks/useStepGuard.ts`
- [x] 3.2 On call: read `currentStep` from store, get target path from `window.location.pathname`
- [x] 3.3 Compute accessibility: `targetIdx <= completedIdx + 1`
- [x] 3.4 If blocked: redirect via `window.location.href` to `getEarliestIncomplete(currentStep)`
- [x] 3.5 Handle edge: step 1 always accessible (no guard needed, but handle gracefully)
- [x] 3.6 Handle edge: summary only accessible if all 4 steps complete
- [x] 3.7 Export as named function `useStepGuard`

## 4. ResumeRedirect Component

- [x] 4.1 Create `src/components/atoms/ResumeRedirect.tsx`
- [x] 4.2 On mount: read `currentStep` from store
- [x] 4.3 If `currentStep` is non-empty: redirect to `getEarliestIncomplete(currentStep)`
- [x] 4.4 If `currentStep` is `""`: stay on welcome page

## 5. ProgressBar Component

- [x] 5.1 Create `src/components/atoms/ProgressBar.tsx`
- [x] 5.2 Read `currentStep` from Zustand store
- [x] 5.3 Render 4 step indicators with labels (Step 1, Step 2, Step 3, Step 4)
- [x] 5.4 Highlight current step based on `currentStep` + current URL
- [x] 5.5 Visually mark completed steps (steps with index <= currentStep index)
- [x] 5.6 Style with Tailwind (matching existing design: pill badge, slate/grey tones, `#fe676e` accent)
- [x] 5.7 Hide progress bar on welcome page (`/`)

## 6. Page Integration

- [x] 6.1 Call `useStepGuard()` inside each step page's main React island (step1–step4 and summary)
- [x] 6.2 Add `<ResumeRedirect client:load />` to `src/pages/index.astro`
- [x] 6.3 Add `<ProgressBar client:load />` to `src/layouts/Layout.astro`
- [x] 6.4 Update "Continue" button on each step to call `advanceStep` before navigating

## 7. Verification

- [x] 7.1 Run `pnpm build` — ensure no type errors or build failures
- [x] 7.2 Test: fresh user sees welcome page, navigate to step 1 works
- [x] 7.3 Test: complete step 1, advance to step 2, can go back to step 1
- [x] 7.4 Test: cannot skip to step 3 before completing step 2
- [x] 7.5 Test: refresh on step 2, progress bar still correct
- [x] 7.6 Test: localStorage clear → back to step 1
- [x] 7.7 Test: `/summary` blocked until all 4 steps complete
- [x] 7.8 Test: browser back/forward respects guard rules
