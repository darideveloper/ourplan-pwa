## 1. Declaration style — function declarations

- [x] 1.1 Convert `ContinueButton.tsx` from `export const C: React.FC<Props>` to `export function C`
- [x] 1.2 Convert `ControlledInput.tsx` from `export const C: React.FC<Props>` to `export function C`
- [x] 1.3 Convert `ControlledSelect.tsx` from `export const C: React.FC<Props>` to `export function C`
- [x] 1.4 Convert `ValidatedInput.tsx` from `export const C: React.FC<Props>` to `export function C`
- [x] 1.5 Convert `ValidatedRadioGroup.tsx` from `export const C: React.FC<Props>` to `export function C`
- [x] 1.6 Convert `ProgressBar.tsx` from bare `export const C` to `export function C`
- [x] 1.7 Convert `ResumeRedirect.tsx` from bare `export const C` to `export function C`
- [x] 1.8 Convert `DynamicLabelRadioGroup.tsx` from `export const C: React.FC<Props>` to `export function C`
- [x] 1.9 Convert `LoadingOverlay.tsx` from `export const C: React.FC<Props>` to `export function C`
- [x] 1.10 Convert `GlobalLoader.tsx` from bare `export const C: React.FC` to `export function C`
- [x] 1.11 Convert `SupportCircleRepeater.tsx` from `export const C: React.FC` to `export function C`
- [x] 1.12 Convert `Step3Form.tsx` from `export const C: React.FC` to `export function C`
- [x] 1.13 Convert `Step4Form.tsx` from `export const C: React.FC` to `export function C`
- [x] 1.14 Verify: `rg "React\.FC" src/components/atoms/ src/components/molecules/ src/components/organisms/` returns zero matches
- [x] 1.15 Verify: `DisclaimerCheckbox.tsx`, `SummarySubmitButton.tsx`, `ValidatedCheckboxGroup.tsx`, `SummaryReviewCard.tsx` already use `export function` — no change needed

## 2. React import standardisation

- [x] 2.1 Change `import React from "react"` to `import * as React from "react"` in `ContinueButton.tsx`
- [x] 2.2 Change `import React from "react"` to `import * as React from "react"` in `ControlledInput.tsx` (keep `useId` named import)
- [x] 2.3 Change `import React from "react"` to `import * as React from "react"` in `ControlledSelect.tsx` (keep `useId` named import)
- [x] 2.4 Change `import React from "react"` to `import * as React from "react"` in `ProgressBar.tsx`
- [x] 2.5 Change `import React from "react"` to `import * as React from "react"` in `ValidatedInput.tsx`
- [x] 2.6 Change `import React from 'react'` to `import * as React from "react"` in `ValidatedRadioGroup.tsx`
- [x] 2.7 Change `import React from 'react'` to `import * as React from "react"` in `DynamicLabelRadioGroup.tsx`
- [x] 2.8 Change `import React from 'react';` to `import * as React from "react"` in `GlobalLoader.tsx`
- [x] 2.9 Change `import React from 'react';` to `import * as React from "react"` in `LoadingOverlay.tsx`
- [x] 2.10 Change `import React from 'react'` to `import * as React from "react"` in `Step3Form.tsx`
- [x] 2.11 Change `import React from "react";` to `import * as React from "react"` in `Step4Form.tsx`
- [x] 2.12 Change `import React from "react";` to `import * as React from "react"` in `SupportCircleRepeater.tsx`
- [x] 2.13 Change `import { useEffect } from "react"` to `import * as React from "react"` in `ResumeRedirect.tsx` and update `useEffect` → `React.useEffect`
- [x] 2.14 Verify: `DisclaimerCheckbox.tsx`, `SummarySubmitButton.tsx`, `ValidatedCheckboxGroup.tsx`, `SummaryReviewCard.tsx` already use `import * as React from "react"` — no change needed
- [x] 2.15 Verify: `rg "import React from" src/components/atoms/ src/components/molecules/ src/components/organisms/` returns zero matches
- [x] 2.16 Verify: all ui/ files already use `import * as React from "react"` — no change needed

## 3. Store access — adopt useField

- [x] 3.1 Rewrite `DisclaimerCheckbox.tsx` to use `useField(field)` instead of manual `useState(mounted)` + direct `useFormStore` reads
- [x] 3.2 Rewrite `ValidatedCheckboxGroup.tsx` to use `useField(field)` for primary field instead of manual hydration + direct `useFormStore` reads
- [x] 3.3 Update `SupportCircleRepeater.tsx` to accept `field` prop and pass it to `useField` instead of hardcoding `"support_circle"`
- [x] 3.4 Verify: `DisclaimerCheckbox` renders correct initial value on first paint (not blank/undefined)
- [x] 3.5 Verify: `ValidatedCheckboxGroup` renders correct initial state on first paint
- [x] 3.6 Verify: `SupportCircleRepeater` add/remove person functionality still works after refactor

## 4. Formatting — semicolons and quotes

- [x] 4.1 Remove trailing semicolons from `ContinueButton.tsx`
- [x] 4.2 Remove trailing semicolons from `ControlledInput.tsx`
- [x] 4.3 Remove trailing semicolons from `ControlledSelect.tsx`
- [x] 4.4 Remove trailing semicolons from `ValidatedInput.tsx`
- [x] 4.5 Remove trailing semicolons from `GlobalLoader.tsx`
- [x] 4.6 Remove trailing semicolons from `LoadingOverlay.tsx`
- [x] 4.7 Remove trailing semicolons from `SupportCircleRepeater.tsx`
- [x] 4.8 Remove trailing semicolons from `Step4Form.tsx`
- [x] 4.9 Change single quotes to double quotes in `ValidatedRadioGroup.tsx`
- [x] 4.10 Change single quotes to double quotes in `DynamicLabelRadioGroup.tsx`
- [x] 4.11 Change single quotes to double quotes in `GlobalLoader.tsx`
- [x] 4.12 Change single quotes to double quotes in `LoadingOverlay.tsx`
- [x] 4.13 Change single quotes to double quotes in `Step3Form.tsx`
- [x] 4.14 Verify: no semicolons remain in atoms/, molecules/, organisms/ files (manual visual scan)
- [x] 4.15 Verify: `rg "from '" src/components/atoms/ src/components/molecules/ src/components/organisms/` returns zero matches

## 5. Import path standardisation

- [x] 5.1 Fix `DynamicLabelRadioGroup.tsx`: change `../atoms/ValidatedRadioGroup` to `@/components/atoms/ValidatedRadioGroup`
- [x] 5.2 Verify: `rg "from '\.\./" src/components/` returns zero matches (all cross-dir paths use `@/`)

## 6. Key props — stable identifiers

- [x] 6.1 Fix `SupportCircleRepeater.tsx`: replace `key={idx}` with `key={person.helper_name + idx}` in person card list
- [x] 6.2 Fix `SummaryReviewCard.tsx`: replace `key={i}` with `key={section.title}` in section list
- [x] 6.3 Fix `SummaryReviewCard.tsx`: replace `key={i}` with stable key for support circle list items (use `person.helper_name + i`)
- [x] 6.4 Verify: `rg "key=\{idx\}" src/components/` and `rg "key=\{i\}" src/components/` return zero matches

## 7. Remove as any casts

- [x] 7.1 Remove `undefined as any` casts from PersonSchema field defaults in `SupportCircleRepeater.tsx` — replace with `""` (empty string) since PersonSchema fields are strings
- [x] 7.2 Remove `as any` casts on array spread calls (`setValue([...people, ...] as any)`) in `SupportCircleRepeater.tsx` — replace with `as FormValues["support_circle"]`
- [x] 7.3 Remove unnecessary `as any` cast from `useFormStore()` call in `SummarySubmitButton.tsx`
- [x] 7.4 Verify: `rg "as any" src/components/` returns zero matches

## 8. Remove orphan "use client"

- [x] 8.1 Remove `"use client"` directive from `src/components/ui/label.tsx` (line 1)
- [x] 8.2 Verify: `rg '"use client"' src/components/ui/` returns zero matches

## 9. Acceptance verification

- [x] 9.1 Run `pnpm build` — must succeed with zero TS errors
- [x] 9.2 Run `pnpm dev` — manually test each form step (/, /step1, /step2, /step3, /step4, /summary) for correct rendering and interactivity
- [x] 9.3 Verify form state persists across steps (fill step1, navigate to step2, navigate back — values preserved)
- [x] 9.4 Verify `SupportCircleRepeater` add/remove person works (add 2 people, remove the first, verify names don't shuffle)
- [x] 9.5 Verify no hydration warnings in browser console (no "Expected server HTML to contain..." errors)
- [x] 9.6 Run `rg "React\.FC" src/components/` — zero matches outside ui/
- [x] 9.7 Run `rg "as any" src/components/` — zero matches
- [x] 9.8 Run `rg "key=\{(idx|i)\}" src/components/` — zero matches
- [x] 9.9 Run `rg '"use client"' src/components/` — zero matches

## 10. Document conventions

- [x] 10.1 Add a "Component Patterns" section to `AGENTS.md` documenting: `export function` declaration pattern, `import * as React from "react"` import style, `useField` requirement for validated atoms, no semicolons, double quotes, `@/` alias for cross-dir imports, stable keys, and no `as any`
- [x] 10.2 Verify: `AGENTS.md` contains all convention rules from the `component-standardisation` spec
