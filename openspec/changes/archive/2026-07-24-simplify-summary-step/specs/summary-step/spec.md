## ADDED Requirements

### Requirement: Summary step shows plan review

The system SHALL display a review card summarising all data entered across steps 1-4 before submission.

#### Scenario: Review card renders all step data

- **WHEN** user navigates to `/summary`
- **THEN** the review card SHALL display fields from step 1 (user_name, parent_name, parent_health), step 2 (lpa_status, psr_status, documents_loc), step 3 (home_type, ourlens_completed, hazard_flags, digital_literacy, has_pets, hobbies_social), and step 4 (support_circle members)

#### Scenario: Empty optional data is omitted

- **WHEN** a field has no value (empty string, undefined, or empty array)
- **THEN** that field SHALL NOT render in the review card

### Requirement: User must agree to disclaimer before submitting

The system SHALL require explicit agreement to Terms & Disclaimer before enabling the submit button.

#### Scenario: Submit disabled without agreement

- **WHEN** disclaimer_agreed is `false`
- **THEN** the submit button SHALL be disabled

#### Scenario: Submit enabled after agreement

- **WHEN** user checks the disclaimer checkbox
- **THEN** the submit button SHALL become enabled

### Requirement: Submit button logs plan data to console

The system SHALL log the complete form state to the browser console when the user submits.

#### Scenario: Successful submission

- **WHEN** user clicks "Generate My Plan" with disclaimer agreed
- **THEN** the system SHALL print the full form state as JSON to `console.log`

### Requirement: Summary step has no email or message fields

The summary page SHALL NOT display the `email_recipients` input or `custom_message` textarea.

#### Scenario: Email field absent

- **WHEN** user views `/summary`
- **THEN** there SHALL be no input for email recipients

#### Scenario: Custom message field absent

- **WHEN** user views `/summary`
- **THEN** there SHALL be no textarea for custom message