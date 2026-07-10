## ADDED Requirements

### Requirement: Dynamic Name Replacement
The system SHALL dynamically replace the static placeholder `[Name]` in all question labels and helper texts across all form screens with the user-provided `parent_name` from Step 1.

#### Scenario: Name is provided in Step 1
- **WHEN** the user has entered "John" in the `parent_name` field in Step 1
- **THEN** subsequent steps (e.g., Step 2) display questions using the provided name (e.g., "Do you have Lasting Power of Attorney registered for John?")

#### Scenario: Name is not yet provided
- **WHEN** the `parent_name` field is empty or not yet filled
- **THEN** subsequent steps display a fallback such as "your loved one" or "them" (e.g., "Do you have Lasting Power of Attorney registered for your loved one?")
