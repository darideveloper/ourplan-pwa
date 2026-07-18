## ADDED Requirements

### Requirement: Step validity is derived on every field change

The system SHALL maintain a `stepValidity` record in the Zustand store keyed by step path (`/step1`, `/step2`, etc.). On every call to `setField`, the system SHALL recompute and store whether the current step's full schema is satisfied using `safeParse` on the step's Zod schema.

#### Scenario: Step validity updates when a field changes
- **WHEN** user changes any field value on a step page
- **THEN** the store re-runs `stepSchemas[currentPath].safeParse(data)` using current form values
- **AND** the result (`true`/`false`) is written to `store.stepValidity[currentPath]`

#### Scenario: Invalid form sets stepValid to false
- **WHEN** any required field on the step is empty or invalid
- **THEN** `stepValidity[stepPath]` SHALL be `false`

#### Scenario: Complete valid form sets stepValid to true
- **WHEN** all required fields on the step are valid
- **THEN** `stepValidity[stepPath]` SHALL be `true`

#### Scenario: Step validity computed on page load (eager mount)
- **WHEN** a step page finishes hydration and the ContinueButton mounts
- **THEN** the system SHALL run `stepSchemas[path].safeParse(data)` using current form values from the store
- **AND** store the result in `stepValidity[path]`
- **AND** the component SHALL default to `false` (disabled) when `stepValidity[path]` is `undefined`

### Requirement: Continue button is disabled when step is invalid

The Continue button SHALL render with `disabled` attribute when the current step's `stepValidity` is `false`. Disabled state SHALL show `opacity-50` and `cursor-not-allowed` styles.

#### Scenario: Disabled Continue on invalid step
- **WHEN** step form is incomplete or invalid
- **THEN** Continue button SHALL have `disabled` attribute
- **AND** SHALL show reduced opacity (`opacity-50`) and `cursor-not-allowed`

#### Scenario: Enabled Continue on valid step
- **WHEN** step form is fully valid
- **THEN** Continue button SHALL NOT be disabled
- **AND** SHALL function normally (calls `advanceStep` on click)

### Requirement: Forward navigation is disabled when step is invalid

The ProgressBar step links SHALL disable forward navigation (steps ahead of the current page) when the current step's `stepValidity` is `false`. Disabled links SHALL show `opacity-40` and `cursor-default` and prevent navigation via `e.preventDefault()`.

#### Scenario: Forward nav disabled on invalid step
- **WHEN** user is on a step where `stepValidity` is `false`
- **THEN** all ProgressBar links to steps ahead of the current page SHALL be disabled
- **AND** SHALL show `opacity-40` and `cursor-default`
- **AND** clicking SHALL NOT navigate

#### Scenario: Back nav always enabled
- **WHEN** user is on any step
- **THEN** ProgressBar links to completed/previous steps SHALL remain clickable
- **AND** SHALL NOT show disabled styling

#### Scenario: Forward nav enabled on valid step
- **WHEN** user is on a step where `stepValidity` is `true`
- **THEN** forward navigation links SHALL behave as normal
