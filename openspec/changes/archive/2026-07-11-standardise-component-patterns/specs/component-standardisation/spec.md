# component-standardisation

## Purpose

Establishes mandatory conventions for all React component files in `src/components/` — declaration style, import patterns, store access, formatting, keys, and type safety. These conventions eliminate decision paralysis when creating new components and provide a consistent baseline for code review.

## ADDED Requirements

### Requirement: All components use function declaration

Every React component in `src/components/atoms/`, `molecules/`, and `organisms/` SHALL be declared as `export function ComponentName(props)` rather than `export const ComponentName: React.FC<Props>` or `export const ComponentName = ()`.

The shadcn layer (`src/components/ui/`) already follows this convention. Presentation wrapper re-exports (e.g. `export { Button } from "@/components/ui/button"`) are exempt.

#### Scenario: Stateful atom uses function declaration

- **WHEN** a stateful atom like `ValidatedInput.tsx` is read
- **THEN** it SHALL declare the component as `export function ValidatedInput({ field, label, ... }: ValidatedInputProps)`

#### Scenario: Organism uses function declaration

- **WHEN** an organism like `Step3Form.tsx` is read
- **THEN** it SHALL declare the component as `export function Step3Form()`

#### Scenario: No React.FC in any component

- **WHEN** `rg "React\.FC" src/components/` is executed
- **THEN** zero matches SHALL be returned in `src/components/atoms/`, `molecules/`, and `organisms/`

### Requirement: React is imported as namespace

Every React component file that requires React SHALL use `import * as React from "react"`. Double quotes SHALL be used for the module specifier. Files that re-export shadcn primitives without any React logic are exempt.

#### Scenario: Namespace import in component files

- **WHEN** a component file like `ContinueButton.tsx` is read
- **THEN** it SHALL contain `import * as React from "react"` as the React import

#### Scenario: No default imports of React

- **WHEN** `rg "import React from" src/components/` is executed
- **THEN** zero matches outside `src/components/ui/` SHALL be returned

### Requirement: Validated atoms use useField hook

Every stateful atom that reads or writes a single form field from the Zustand store SHALL use the `useField(field)` hook from `@/store/useField`. Direct `useFormStore` access for reading/writing individual fields is prohibited in validated atoms.

Components that read multiple fields or computed state from the store (e.g. ProgressBar, ContinueButton, SummaryReviewCard) MAY use `useFormStore` directly since they are not per-field validated atoms.

#### Scenario: ValidatedInput uses useField

- **WHEN** `ValidatedInput.tsx` is read
- **THEN** it SHALL import and use `const { value, error, setValue, mounted } = useField(field)`

#### Scenario: ValidatedCheckboxGroup uses useField

- **WHEN** `ValidatedCheckboxGroup.tsx` is read
- **THEN** it SHALL NOT re-implement the hydration safety pattern (`useState(false)` + `useEffect(() => setMounted(true))`)

#### Scenario: SupportCircleRepeater uses useField

- **WHEN** `SupportCircleRepeater.tsx` is read
- **THEN** it SHALL use `useField("support_circle")` and SHALL NOT pass a hardcoded string inline without the hook

### Requirement: No semicolons in component files

All React component files SHALL omit semicolons at the end of statements. The only exception is `for` loop syntax which requires them.

#### Scenario: No trailing semicolons

- **WHEN** any component file is checked for semicolons
- **THEN** no import, export, variable declaration, or hook call SHALL end with a semicolon

### Requirement: Double quotes for string literals

All string literals in React component files SHALL use double quotes (`"`). This includes module imports, JSX attribute strings, and inline string values.

#### Scenario: Double quotes in imports

- **WHEN** `rg "from '" src/components/` is executed
- **THEN** zero matches SHALL be returned outside `src/components/ui/`

### Requirement: Cross-directory imports use @/ alias

Any import that crosses directory boundaries (e.g. from `molecules/` into `atoms/`, or from `organisms/` into `molecules/`) SHALL use the `@/` path alias rather than relative paths. Same-directory imports MAY use relative paths.

#### Scenario: Molecule imports atom via @/ alias

- **WHEN** `DynamicLabelRadioGroup.tsx` is read
- **THEN** it SHALL import `ValidatedRadioGroup` from `@/components/atoms/ValidatedRadioGroup`, NOT from `../atoms/ValidatedRadioGroup`

#### Scenario: Same-directory imports remain relative

- **WHEN** `GlobalLoader.tsx` is read
- **THEN** it SHALL import `LoadingOverlay` from `./LoadingOverlay`

### Requirement: List keys are stable identifiers

All `.map()` calls that render React elements SHALL use stable identifiers as the `key` prop. Array index (`key={idx}`, `key={i}`) SHALL NOT be used except for static, never-reorderable lists where no other unique identifier exists.

#### Scenario: Support circle uses stable keys

- **WHEN** `SupportCircleRepeater.tsx` maps over `people`
- **THEN** each element SHALL use a composite key such as `${person.helper_name}-${idx}` rather than bare `key={idx}`

#### Scenario: Summary sections use stable keys

- **WHEN** `SummaryReviewCard.tsx` maps over section data
- **THEN** each element SHALL use `section.title` or another stable identifier as the key

#### Scenario: Checkbox and radio items use option values

- **WHEN** `ValidatedCheckboxGroup.tsx` or `ValidatedRadioGroup.tsx` maps over options
- **THEN** elements SHALL use `key={option.value}` (already correct — no change needed)

### Requirement: No as any casts in component files

Type assertions using `as any` SHALL NOT appear in any React component file. Components SHALL either:
- Use properly typed `as FormValues[typeof field]` casts when the Zod schema guarantees the shape
- Destructure the Zustand store without casting (e.g. `useFormStore()` returns the full typed state)
- Keep the inferred type when TypeScript can verify it

#### Scenario: SupportCircleRepeater has no as any

- **WHEN** `SupportCircleRepeater.tsx` is read
- **THEN** no `as any` type assertion SHALL be present

#### Scenario: SummarySubmitButton has no as any

- **WHEN** `SummarySubmitButton.tsx` is read
- **THEN** no `as any` type assertion SHALL be present

### Requirement: No "use client" directive

No file in `src/components/ui/` SHALL contain the `"use client"` directive. This directive is a Next.js convention and has no effect in an Astro project.

#### Scenario: ui/label.tsx has no directive

- **WHEN** `src/components/ui/label.tsx` is read
- **THEN** the first line SHALL NOT be `"use client"`
