## ADDED Requirements

### Requirement: Backward Navigation
The system SHALL provide a "Back" button on every step page subsequent to the first step, allowing the user to navigate to the chronologically preceding step.

#### Scenario: User navigates back
- **WHEN** user is on Step 2 and clicks the "Back" button
- **THEN** the system navigates the user to Step 1 URL (`/step1`)

#### Scenario: No back button on first step
- **WHEN** user is on Step 1 (`/step1`)
- **THEN** no "Back" button is rendered
