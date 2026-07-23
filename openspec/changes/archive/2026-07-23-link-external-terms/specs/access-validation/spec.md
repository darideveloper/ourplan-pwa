## MODIFIED Requirements

### Requirement: Terms acceptance checkbox
The system SHALL display a checkbox for terms and conditions acceptance with Zod `z.boolean().refine(val => val === true)` validation.

#### Scenario: User checks the box
- **WHEN** the user clicks the terms checkbox
- **THEN** the checked state SHALL be written to the session store

#### Scenario: User submits without checking
- **WHEN** the user clicks "Verify Code" with the terms checkbox unchecked
- **THEN** the system SHALL display a Zod validation error ("You must agree to the terms") below the checkbox

#### Scenario: Terms link is present
- **WHEN** the terms checkbox label is rendered
- **THEN** it SHALL include a link to `https://ourlivesapp.com/our-plan-terms-and-conditions/` that opens in a new tab
