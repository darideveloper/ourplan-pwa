## MODIFIED Requirements

### Requirement: Step validity is derived on every field change

The system SHALL maintain a `stepValidity` record in the Zustand store keyed by step path (`/step1`, `/step2`, etc.). On every call to `setField`, the system SHALL recompute and store whether the current step's full schema is satisfied using `safeParse` on the step's Zod schema.

`hazard_flags` SHALL be validated as `z.array(z.string())` with no `.min(1)` constraint — an empty array SHALL pass validation.

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

#### Scenario: Empty hazard_flags passes validation
- **WHEN** `hazard_flags` is `[]` on step 3 and all other step 3 fields are valid
- **THEN** `stepValidity["/step3"]` SHALL be `true`

#### Scenario: Step validity computed on page load (eager mount)
- **WHEN** a step page finishes hydration and the ContinueButton mounts
- **THEN** the system SHALL run `stepSchemas[path].safeParse(data)` using current form values from the store
- **AND** store the result in `stepValidity[path]`
- **AND** the component SHALL default to `false` (disabled) when `stepValidity[path]` is `undefined`
