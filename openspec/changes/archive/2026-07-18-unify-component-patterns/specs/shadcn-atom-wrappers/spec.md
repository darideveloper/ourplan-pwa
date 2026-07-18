## MODIFIED Requirements

### Requirement: Every shadcn primitive has a matching atom wrapper

For each TypeScript module exported by `src/components/ui/`, `src/components/atoms/` SHALL contain a file whose PascalCase name matches the PascalCase export name of the corresponding primitive, and that re-exports it. The list of required wrappers SHALL be kept in sync with `src/components/ui/`; this spec covers the current set.

The required wrapper set as of this change:

| shadcn module (in `components/ui/`) | Atom wrapper (in `components/atoms/`) |
|---|---|
| `button.tsx` → `Button` | `Button.tsx` → `Button` |
| `checkbox.tsx` → `Checkbox` | `Checkbox.tsx` → `Checkbox` |
| `input.tsx` → `Input` | `Input.tsx` → `Input` |
| `label.tsx` → `Label` | `Label.tsx` → `Label` |
| `radio-group.tsx` → `RadioGroup` | `RadioGroup.tsx` → `RadioGroup` |
| `radio-group.tsx` → `RadioGroupItem` | `RadioGroupItem.tsx` → `RadioGroupItem` |
| `select.tsx` → `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` | `Select.tsx` → (re-exports all five) |

#### Scenario: All seven wrapper groups exist

- **WHEN** the directory `src/components/atoms/` is listed
- **THEN** it SHALL contain `Button.tsx`, `Checkbox.tsx`, `Input.tsx`, `Label.tsx`, `RadioGroup.tsx`, `RadioGroupItem.tsx`, and `Select.tsx`

#### Scenario: Atom wrapper re-exports the shadcn primitive

- **WHEN** any of the seven atom wrappers is read
- **THEN** it SHALL contain a `export { … } from "@/components/ui/<primitive>"` (or equivalent default re-export) and SHALL NOT redefine the underlying component implementation

### Requirement: Application code imports shadcn only via atom wrappers

No file under `src/` other than files inside `src/components/atoms/` SHALL import from `src/components/ui/`. The rule is enforced by convention and verified by a manual grep (`rg "from ['\"]@/components/ui/" src/`) returning zero matches outside `src/components/atoms/`.

#### Scenario: Stateful atoms import presentation wrappers, not shadcn primitives

- **WHEN** `src/components/atoms/ValidatedInput.tsx` is read
- **THEN** it SHALL import `Input` and `Label` from `@/components/atoms/Input` and `@/components/atoms/Label`, NOT from `@/components/ui/...`
- **WHEN** `src/components/atoms/ValidatedSelect.tsx` is read
- **THEN** it SHALL import `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` from `@/components/atoms/Select`, NOT from `@/components/ui/select`

#### Scenario: Non-atom files do not import `ui/`

- **WHEN** `rg "from ['\"]@/components/ui/" src/` is executed
- **THEN** the only matching files SHALL be inside `src/components/atoms/`, and SHALL be the wrapper files (`Button.tsx`, `Checkbox.tsx`, `Input.tsx`, `Label.tsx`, `RadioGroup.tsx`, `RadioGroupItem.tsx`, `Select.tsx`)
