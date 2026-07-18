## MODIFIED Requirements

### Requirement: Validated atoms use useField hook

Every stateful atom that reads or writes a single form field from the Zustand store SHALL use the `useField(field)` hook from `@/store/useField`. Direct `useFormStore` access for reading/writing individual fields is prohibited in validated atoms.

The `field` argument MAY be a top-level `keyof FormValues` key or a dotted-path string for nested array fields such as `"support_circle.0.helper_name"`.

Components that read multiple fields or computed state from the store (e.g. ProgressBar, ContinueButton, SummaryReviewCard) MAY use `useFormStore` directly since they are not per-field validated atoms.

#### Scenario: ValidatedInput uses useField

- **WHEN** `ValidatedInput.tsx` is read
- **THEN** it SHALL import and use `const { value, error, setValue, mounted } = useField(field)`

#### Scenario: ValidatedSelect uses useField

- **WHEN** `ValidatedSelect.tsx` is read
- **THEN** it SHALL import and use `const { value, error, setValue, mounted } = useField(field)`

#### Scenario: ValidatedCheckboxGroup uses useField

- **WHEN** `ValidatedCheckboxGroup.tsx` is read
- **THEN** it SHALL NOT re-implement the hydration safety pattern (`useState(false)` + `useEffect(() => setMounted(true))`)

#### Scenario: SupportCircleRepeater uses useField with dotted paths

- **WHEN** `SupportCircleRepeater.tsx` is read
- **THEN** it SHALL use `useField("support_circle")` for the array top-level and SHALL render per-item fields via `ValidatedInput`/`ValidatedSelect` with dotted paths (e.g. `useField("support_circle.0.helper_name")`)

### Requirement: Validated atom field props accept dotted paths

Stateful atoms that accept a `field` prop MAY receive dotted-path strings for nested array fields in addition to top-level `keyof FormValues` keys. The `field` prop type SHALL be widened to `keyof FormValues | string` to accept both.

#### Scenario: ValidatedInput accepts dotted field path

- **WHEN** `<ValidatedInput field="support_circle.0.helper_name" label="Name" />` is rendered
- **THEN** it SHALL compile without TypeScript errors (field type widened to `keyof FormValues | string`)

#### Scenario: ValidatedRadioGroup accepts dotted field path

- **WHEN** `<ValidatedRadioGroup field="support_circle.0.helper_relationship" label="Relationship" options={[...]} />` is rendered
- **THEN** it SHALL compile without TypeScript errors

### Requirement: No Controlled* components

No component in `src/components/` SHALL use the `Controlled` prefix. The `ControlledInput` and `ControlledSelect` components SHALL be removed. All form field data flow SHALL go through the Zustand store.

#### Scenario: No ControlledInput file

- **WHEN** `ls src/components/atoms/ControlledInput.tsx` is executed
- **THEN** it SHALL return "No such file or directory"

#### Scenario: No ControlledSelect file

- **WHEN** `ls src/components/atoms/ControlledSelect.tsx` is executed
- **THEN** it SHALL return "No such file or directory"

#### Scenario: No imports of Controlled components

- **WHEN** `rg "ControlledInput|ControlledSelect" src/` is executed
- **THEN** zero matches SHALL be returned
