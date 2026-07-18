## ADDED Requirements

### Requirement: Select presentation wrapper exists in atoms

`src/components/atoms/Select.tsx` SHALL exist and SHALL re-export `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, and `SelectValue` from `@/components/ui/select`. This mirrors the existing pattern of `Button.tsx`, `Input.tsx`, `Label.tsx`, `RadioGroup.tsx`, `RadioGroupItem.tsx`, and `Checkbox.tsx`.

#### Scenario: Select wrapper re-exports shadcn primitives

- **WHEN** `src/components/atoms/Select.tsx` is read
- **THEN** it SHALL contain re-exports from `@/components/ui/select` and SHALL NOT contain JSX or component definitions

#### Scenario: ValidatedSelect imports from atom wrapper

- **WHEN** `src/components/atoms/ValidatedSelect.tsx` is read
- **THEN** it SHALL import Select components from `@/components/atoms/Select`, NOT from `@/components/ui/select`
