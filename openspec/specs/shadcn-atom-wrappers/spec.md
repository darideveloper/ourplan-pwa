# shadcn-atom-wrappers

## Purpose

Codifies the rule that every shadcn primitive in `src/components/ui/` is consumed only through a thin atom wrapper in `src/components/atoms/`. Centralises the import surface so that any future re-skin, prop injection, or token change is a one-atom edit, not a project-wide find-and-replace.

## Requirements

### Requirement: Every shadcn primitive has a matching atom wrapper

For each TypeScript module exported by `src/components/ui/`, `src/components/atoms/` SHALL contain a file whose PascalCase name matches the PascalCase export name of the corresponding primitive, and that re-exports it. The list of required wrappers SHALL be kept in sync with `src/components/ui/`; this spec covers the current set.

The required wrapper set as of this change:

| shadcn module (in `components/ui/`) | Atom wrapper (in `components/atoms/`) |
|---|---|
| `input.tsx` → `Input` | `Input.tsx` → `Input` |
| `label.tsx` → `Label` | `Label.tsx` → `Label` |
| `radio-group.tsx` → `RadioGroup` | `RadioGroup.tsx` → `RadioGroup` |
| `radio-group.tsx` → `RadioGroupItem` | `RadioGroupItem.tsx` → `RadioGroupItem` |
| `button.tsx` → `Button` | `Button.tsx` → `Button` |

#### Scenario: All five wrappers exist

- **WHEN** the directory `src/components/atoms/` is listed
- **THEN** it SHALL contain `Input.tsx`, `Label.tsx`, `RadioGroup.tsx`, `RadioGroupItem.tsx`, and `Button.tsx`

#### Scenario: Atom wrapper re-exports the shadcn primitive

- **WHEN** any of the five atom wrappers is read
- **THEN** it SHALL contain a `export { … } from "@/components/ui/<primitive>"` (or equivalent default re-export) and SHALL NOT redefine the underlying component implementation

### Requirement: Atom wrappers are pass-through only

A wrapper in `src/components/atoms/` SHALL re-export the corresponding shadcn primitive's props and component unchanged. The wrapper MUST NOT add, rename, wrap, or override any prop, ref forwarding, class merging, event handler, or `displayName`. The wrapper's only purpose is to fix the import path to `components/atoms/`.

#### Scenario: Wrapper has no extra props

- **WHEN** the wrapper file is read
- **THEN** the exported component's prop type SHALL be assignable to the underlying shadcn primitive's prop type without a structural change (e.g. no `& { … }` extending the props)

#### Scenario: Wrapper has no extra JSX

- **WHEN** the wrapper file is read
- **THEN** it SHALL NOT contain a `return (` JSX expression; the only statement SHALL be the re-export

### Requirement: Application code imports shadcn only via atom wrappers

No file under `src/` other than files inside `src/components/atoms/` SHALL import from `src/components/ui/`. The rule is enforced by convention and verified by a manual grep (`rg "from ['\"]@/components/ui/" src/`) returning zero matches outside `src/components/atoms/`.

#### Scenario: Stateful atoms import presentation wrappers, not shadcn primitives

- **WHEN** `src/components/atoms/ValidatedInput.tsx` is read
- **THEN** it SHALL import `Input` and `Label` from `@/components/atoms/Input` and `@/components/atoms/Label`, NOT from `@/components/ui/...`

#### Scenario: Non-atom files do not import `ui/`

- **WHEN** `rg "from ['\"]@/components/ui/" src/` is executed
- **THEN** the only matching files SHALL be inside `src/components/atoms/`, and SHALL be the five wrapper files (`Input.tsx`, `Label.tsx`, `RadioGroup.tsx`, `RadioGroupItem.tsx`, `Button.tsx`)

### Requirement: shadcn primitives are not edited

Files under `src/components/ui/` SHALL be treated as vendor output: they are produced by the shadcn CLI and re-skin only via Tailwind theme tokens, never by hand-editing the primitive file. This is the existing convention (`AGENTS.md:43`); the wrapper layer exists precisely to make hand-edits unnecessary.

#### Scenario: No edits to existing `ui/` files after this change

- **WHEN** `git diff src/components/ui/` is run against the pre-change baseline, excluding the new `button.tsx` file
- **THEN** the diff SHALL be empty; existing `input.tsx`, `label.tsx`, and `radio-group.tsx` SHALL be unchanged

### Requirement: Wrapper file names mirror shadcn export names

The file name of a wrapper in `src/components/atoms/` SHALL match the PascalCase form of the corresponding shadcn export name. Examples: shadcn `Button` → `Button.tsx`, shadcn `RadioGroupItem` → `RadioGroupItem.tsx`. New shadcn primitives added later (e.g. `Checkbox`, `Select`) MUST be mirrored with the same naming.

#### Scenario: File names match exports

- **WHEN** a wrapper file `X.tsx` in `src/components/atoms/` is read
- **THEN** the named export `X` SHALL be re-exported from it

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
