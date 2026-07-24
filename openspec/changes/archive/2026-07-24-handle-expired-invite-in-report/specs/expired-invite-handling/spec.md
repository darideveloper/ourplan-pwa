## ADDED Requirements

### Requirement: Detect expired invitation code from /report response

When the `/report` webhook returns `{ valid: false }`, the system SHALL recognise this as an expired invitation code and abort the normal polling flow.

#### Scenario: Response contains valid: false
- **WHEN** the POST to `/report` returns `{ valid: false }`
- **THEN** the system MUST NOT start polling the `pdfUrl`
- **AND** the system MUST transition to the expired state

#### Scenario: Response contains valid: true or no valid field (backwards compat)
- **WHEN** the POST to `/report` returns `{ pdfUrl: "https://..." }` with `valid: true` or without a `valid` field
- **THEN** the system MUST proceed with the existing polling flow unchanged

### Requirement: Show expired-code modal overlay

When the expired state is active, the system SHALL display a modal overlay with the expired-code error message and a single action button.

#### Scenario: Expired overlay renders
- **WHEN** in the expired state
- **THEN** the overlay MUST show the text: "That invitation code is not recognised or has expired. Please check and try again."
- **AND** the overlay MUST show a "Enter New Invitation Code" button
- **AND** the overlay MUST block interaction with the page behind it

### Requirement: Navigate to landing page with clean state

When the user clicks "Request New Invitation Code", the system SHALL reset all form and session state and navigate to the landing page.

#### Scenario: User clicks Request New Invitation Code
- **WHEN** the user clicks the "Request New Invitation Code" button
- **THEN** the form store SHALL be reset (all form data cleared)
- **THEN** the session store SHALL be reset (code cleared, isValid set to false)
- **THEN** the browser SHALL navigate to `/`
