## ADDED Requirements

### Requirement: Conditional hazard_flags validation

The `hazard_flags` field SHALL be cleared when its trigger field `ourlens_completed` changes value to prevent stale data from a different option set being submitted. The clear SHALL NOT fire on component mount — only when `ourlens_completed` transitions between values.

**Rationale for modification**: The initial implementation used a bare `useEffect` which fires on every component mount, causing `hazard_flags` to lose its value every time the user navigates between form steps.

#### Scenario: hazard_flags resets when ourlens_completed toggles

- **WHEN** the user has selected `hazard_flags` values under one branch (e.g., `ourlens_completed === "yes"`)
- **AND** the user changes `ourlens_completed` to a different value (e.g., `"no_but_wants"`)
- **THEN** all previously selected `hazard_flags` values are cleared
- **THEN** the user sees the new set of checkbox options with nothing pre-selected

#### Scenario: hazard_flags persists across navigation

- **WHEN** the user has selected `hazard_flags` values on Step 3
- **AND** the user navigates to another step and returns to Step 3
- **AND** `ourlens_completed` has not changed
- **THEN** the previously selected `hazard_flags` values remain checked
