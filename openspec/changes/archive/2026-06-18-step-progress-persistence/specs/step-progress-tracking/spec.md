## ADDED Requirements

### Requirement: Standardise route paths
All form step routes SHALL use numeric naming: `/step1`, `/step2`, `/step3`, `/step4`, `/summary`.

#### Scenario: Routes resolve correctly
- **WHEN** a user navigates to `/step1`
- **THEN** the system SHALL render the first step page

#### Scenario: Old routes redirect or 404
- **WHEN** a user navigates to `/first-step` or `/step-2`
- **THEN** the system SHALL return a 404 or redirect (old paths removed)

### Requirement: Store farthest completed step in Zustand
The system SHALL persist the farthest completed step path in the Zustand store under `currentStep`. This SHALL only advance when a step's Zod schema passes validation via `advanceStep`.

#### Scenario: currentStep starts empty
- **WHEN** a new user opens the app (no localStorage)
- **THEN** `currentStep` SHALL be `""`

#### Scenario: currentStep advances on validation
- **WHEN** a user completes step 1 and calls `advanceStep("/step1")`
- **THEN** `currentStep` SHALL become `/step1`

#### Scenario: currentStep does NOT advance on validation failure
- **WHEN** a user attempts to advance step 1 with invalid data
- **THEN** `currentStep` SHALL remain `""`

#### Scenario: currentStep persists across refresh
- **WHEN** a user refreshes after completing step 2
- **THEN** `currentStep` SHALL remain `/step2`

#### Scenario: localStorage clear resets currentStep
- **WHEN** localStorage is cleared
- **THEN** `currentStep` SHALL be `""`

### Requirement: Restrict step access
The system SHALL allow navigation only to steps that are either: (a) completed, (b) the next incomplete step, or (c) step 1 (always accessible). Any other step SHALL redirect to the earliest incomplete step.

#### Scenario: Can access next incomplete step
- **WHEN** `currentStep` is `/step1` and user navigates to `/step2`
- **THEN** the system SHALL render `/step2` normally

#### Scenario: Cannot skip ahead
- **WHEN** `currentStep` is `/step1` and user navigates to `/step3`
- **THEN** the system SHALL redirect to `/step2`

#### Scenario: Can go back to completed step
- **WHEN** `currentStep` is `/step3` and user navigates to `/step1`
- **THEN** the system SHALL render `/step1` normally

#### Scenario: Step 1 always accessible
- **WHEN** `currentStep` is `""` and user navigates to `/step1`
- **THEN** the system SHALL render `/step1` normally

#### Scenario: Summary not accessible until all steps complete
- **WHEN** `currentStep` is `/step3` and user navigates to `/summary`
- **THEN** the system SHALL redirect to `/step4`

### Requirement: Advance step from form completion
The system SHALL provide an `advanceStep` action that validates the current step's data against its Zod schema. On success, it SHALL set `currentStep` to the step just validated (marking it complete) and return the next step URL. On failure, it SHALL write validation errors to the store and return null.

#### Scenario: Successful advance navigates forward
- **WHEN** a user submits valid step 1 data via the Continue button
- **THEN** `currentStep` SHALL become `/step1` and the system SHALL navigate to `/step2`

#### Scenario: Successful advance from step 4 to summary
- **WHEN** a user submits valid step 4 data via the Continue button
- **THEN** `currentStep` SHALL become `/step4` and the system SHALL navigate to `/summary`

#### Scenario: Failed advance shows errors
- **WHEN** a user submits invalid step 1 data via the Continue button
- **THEN** `currentStep` SHALL NOT change, validation errors SHALL display, and the system SHALL NOT navigate

### Requirement: Resume to earliest incomplete step
The system SHALL redirect users from `/` to the earliest incomplete step when `currentStep` is non-empty.

#### Scenario: Redirect to next incomplete
- **WHEN** `currentStep` is `/step1` and user visits `/`
- **THEN** the system SHALL redirect to `/step2`

#### Scenario: No redirect when no progress
- **WHEN** `currentStep` is `""` and user visits `/`
- **THEN** the system SHALL render the welcome page

### Requirement: Display progress bar in app shell
The system SHALL display a progress bar showing all 4 steps with current and completed states visually distinct.

#### Scenario: Progress bar shows all steps
- **WHEN** any form step page renders
- **THEN** the progress bar SHALL display 4 step indicators

#### Scenario: Current step highlighted
- **WHEN** the user's current URL is `/step2`
- **THEN** step 2 SHALL be visually highlighted in the progress bar

#### Scenario: Completed steps marked
- **WHEN** `currentStep` is `/step3`
- **THEN** steps 1, 2, and 3 SHALL be visually marked as completed

### Requirement: Browser back/forward syncs correctly
The system SHALL handle browser back/forward navigation consistently with the guard logic.

#### Scenario: Back to completed step renders
- **WHEN** user navigates from `/step3` to `/step1` via browser back
- **THEN** `/step1` SHALL render normally (guard allows completed steps)

#### Scenario: Forward to incomplete step redirects
- **WHEN** `currentStep` is `/step1` and user navigates forward to `/step3`
- **THEN** the system SHALL redirect to `/step2`
