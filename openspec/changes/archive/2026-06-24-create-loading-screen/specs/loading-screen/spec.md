## ADDED Requirements

### Requirement: Block Interaction During Navigation Transitions
The system SHALL display a loading indicator when navigating between steps to provide visual feedback and block interaction.

#### Scenario: User navigates to next step
- **WHEN** the user clicks "Continue"
- **THEN** the system displays the `LoadingOverlay` with the message "Loading..."
- **THEN** the user cannot interact with the form fields while the browser fetches the next route

### Requirement: Hydration Loading State
The system SHALL display a brief loading state while client-side hydration restores data from local storage to prevent jarring layout shifts.

#### Scenario: User loads a form page
- **WHEN** the page initially loads but the React islands have not yet hydrated from Zustand/localStorage
- **THEN** the system displays a loading spinner or skeletal state
- **THEN** it resolves to the fully populated form once hydration is complete
