## ADDED Requirements

### Requirement: Summary page captures email recipients

The summary page SHALL render a text input bound to the `email_recipients` store field. The input SHALL be optional (no validation blocking submission) and accept comma-separated email addresses.

#### Scenario: Email recipients input is visible on summary

- **WHEN** the user navigates to the summary page
- **THEN** they see a text input labelled "Email this plan to your support circle (optional)"
- **THEN** the input placeholder reads "e.g., sibling@email.com, partner@email.com"
- **THEN** the input is not required to submit the form

#### Scenario: User enters email addresses

- **WHEN** the user types "john@example.com, jane@example.com" into the email recipients field
- **THEN** the value is saved in the store as `email_recipients`
- **THEN** the value is included in the plan submission data

### Requirement: Summary page captures custom message

The summary page SHALL render a textarea bound to the `custom_message` store field. The textarea SHALL be optional.

#### Scenario: Custom message textarea is visible on summary

- **WHEN** the user navigates to the summary page
- **THEN** they see a textarea labelled "Add a personal message (optional)"
- **THEN** the textarea placeholder reads "Let your support circle know what this plan means..."
- **THEN** the textarea is not required to submit the form

### Requirement: ValidatedTextarea atom exists

A new atom component `ValidatedTextarea` SHALL exist following the same pattern as `ValidatedInput`: `export function`, namespace React import, `useField` hook, error display, Tailwind styling.

#### Scenario: ValidatedTextarea renders a textarea element

- **WHEN** `ValidatedTextarea` is rendered with `field="custom_message"` and a label
- **THEN** it renders a `<textarea>` element (not an `<input>`)
- **THEN** it displays the label above the textarea
- **THEN** it reads/writes the specified field from the Zustand store via `useField`
