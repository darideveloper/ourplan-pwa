# form-screens (delta)

## MODIFIED Requirements

### Requirement: Implementation Status

The implementation status of form screens MUST be tracked.

#### Scenario: Step 3 is implemented

- **WHEN** the Step 3 functionality is complete
- **THEN** the implementation status table MUST list Step 3 as DONE and list its fields and components as complete.

#### Scenario: Step 4 is implemented

- **WHEN** the Step 4 functionality is complete
- **THEN** the implementation status table MUST list Step 4 as DONE and list its fields and components as complete.

#### Scenario: Summary is implemented

- **WHEN** the Summary functionality is complete
- **THEN** the implementation status table MUST list Summary as DONE and list its fields and components as complete.

### Requirement: Summary Review and Disclaimer

The Summary page SHALL display a read-only review of all previously filled-in form information. The page MUST include an unchecked checkbox for the legal disclaimer. The "Generate My Plan" button MUST be disabled until this checkbox is ticked. When the button is clicked, all form data MUST be printed to the console.

#### Scenario: Viewing the summary page

- **WHEN** the user navigates to the summary page
- **THEN** they see a read-only review card containing all filled-in information from previous steps
- **THEN** the legal disclaimer checkbox is unchecked
- **THEN** the "Generate My Plan" button is disabled

#### Scenario: Submitting with disclaimer accepted

- **WHEN** the user is on the summary page and ticks the legal disclaimer checkbox
- **THEN** the "Generate My Plan" button becomes enabled
- **WHEN** the user clicks the "Generate My Plan" button
- **THEN** all collected form details are printed to the console

## ADDED Requirements

### Requirement: Validated atoms use useField hook exclusively

Every stateful atom component that reads or writes a single form field from the Zustand store SHALL use the `useField(field)` hook. Direct re-implementation of hydration safety (i.e. `const [mounted, setMounted] = useState(false)` + `useEffect(() => setMounted(true))`) SHALL NOT appear in any atom component — that logic belongs solely in `useField`.

#### Scenario: DisclaimerCheckbox uses useField

- **WHEN** `DisclaimerCheckbox.tsx` is read
- **THEN** it SHALL use `const { value, error, setValue, mounted } = useField(field)` for store access
- **THEN** it SHALL NOT contain `useState(false)` or `useEffect(() => setMounted(true))` hydration patterns

#### Scenario: ValidatedCheckboxGroup uses useField

- **WHEN** `ValidatedCheckboxGroup.tsx` is read
- **THEN** it SHALL use `useField(field)` for the primary field
- **THEN** it SHALL NOT manually implement hydration guards

#### Scenario: All validated atoms are hydration-safe

- **WHEN** any validated atom renders on first paint (before Zustand persist hydrates)
- **THEN** it SHALL display the correct `initialState` value (not `undefined`) via the `useField` hook

## REMOVED Requirements

None.
