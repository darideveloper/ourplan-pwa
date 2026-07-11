# shadcn-atom-wrappers (delta)

## ADDED Requirements

### Requirement: Stateful atoms follow function declaration convention

All stateful atom files in `src/components/atoms/` that contain a React component (not re-export wrappers) SHALL use `export function ComponentName` as the declaration pattern. Presentation wrapper re-exports (e.g. `Input.tsx`, `Label.tsx`) are exempt and remain as single-line re-exports.

#### Scenario: Stateful atoms use function declaration

- **WHEN** any stateful atom file in `src/components/atoms/` (ValidatedInput.tsx, ValidatedRadioGroup.tsx, ContinueButton.tsx, ControlledInput.tsx, ControlledSelect.tsx, DisclaimerCheckbox.tsx, SummarySubmitButton.tsx, ValidatedCheckboxGroup.tsx, ProgressBar.tsx, ResumeRedirect.tsx) is read
- **THEN** the component declaration SHALL be `export function` followed by the PascalCase component name

#### Scenario: Re-export wrappers remain unchanged

- **WHEN** a presentation wrapper (Input.tsx, Label.tsx, Button.tsx, RadioGroup.tsx, RadioGroupItem.tsx) is read
- **THEN** it SHALL still contain a single re-export statement and no component declaration

### Requirement: Atom files import React as namespace

All stateful atom files that import React SHALL use `import * as React from "react"`. This aligns with the shadcn `ui/` layer convention. Re-export wrappers that don't use React are exempt.

#### Scenario: Stateful atom uses namespace import

- **WHEN** a stateful atom file is read
- **THEN** it SHALL contain `import * as React from "react"` if it uses any React API

### Requirement: Atoms import from @/ alias for cross-directory

All stateful atoms SHALL maintain consistency with the `@/` alias pattern. This is already the case for all atom files — the requirement ensures future atoms follow the same convention.

#### Scenario: Atoms use @/ for store and hook imports

- **WHEN** a stateful atom imports from the store or hooks directory
- **THEN** the import SHALL use the `@/` path alias (e.g. `@/store/form`, `@/store/useField`)
