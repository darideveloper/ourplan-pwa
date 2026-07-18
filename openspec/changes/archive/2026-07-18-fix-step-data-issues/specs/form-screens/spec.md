## MODIFIED Requirements

### Requirement: Conditional hazard_flags validation

The `hazard_flags` field SHALL be cleared when its trigger field `ourlens_completed` changes value to prevent stale data from a different option set being submitted.

#### Scenario: hazard_flags resets when ourlens_completed toggles

- **WHEN** the user has selected `hazard_flags` values under one branch (e.g., `ourlens_completed === "yes"`)
- **AND** the user changes `ourlens_completed` to a different value (e.g., `"no_but_wants"`)
- **THEN** all previously selected `hazard_flags` values are cleared
- **THEN** the user sees the new set of checkbox options with nothing pre-selected

### Requirement: Summary Review and Submission includes email and message fields

The summary page SHALL render `email_recipients` (text input) and `custom_message` (textarea) fields per the existing field definitions in the `form-screens` spec. Both fields are optional.

#### Scenario: Summary page renders email and message inputs

- **WHEN** the user navigates to the summary page
- **THEN** they see a text input for `email_recipients` with label "Email this plan to your support circle (optional)"
- **THEN** they see a textarea for `custom_message` with label "Add a personal message (optional)"
- **THEN** the "Generate My Plan" button remains disabled until `disclaimer_agreed` is checked
- **WHEN** the user clicks "Generate My Plan"
- **THEN** `email_recipients` and `custom_message` values are included in the submitted data

### Requirement: Summary section title matches spec

The summary review card SHALL display the title "Environment, Digital & Lifestyle" for the Step 3 section (not "Life").

#### Scenario: Correct section title displayed

- **WHEN** the user views the summary review card
- **THEN** the Step 3 section heading reads "Environment, Digital & Lifestyle"

## ADDED Requirements

### Requirement: hobbies_social placeholder matches spec

The `hobbies_social` text input placeholder SHALL read `"e.g., gardening, church, lunch club, watching football, family visits"`.

#### Scenario: Correct placeholder displayed

- **WHEN** the user is on Step 3
- **THEN** the hobbies_social input placeholder reads `"e.g., gardening, church, lunch club, watching football, family visits"`

## REMOVED Requirements

No requirements removed.
