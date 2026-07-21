# route-guard

## Requirements

### Requirement: AuthGuard component
The system SHALL provide an `AuthGuard` component that protects routes by checking session validity.

#### Scenario: Session not yet hydrated
- **WHEN** a protected page renders and the session store has `isValid: null` (hydrating)
- **THEN** the AuthGuard SHALL overlay `<LoadingOverlay isVisible={true} message="Loading..." />` on top of the page content (children are always rendered, never unmounted)

#### Scenario: No valid session
- **WHEN** a protected page renders and the session store has `isValid !== true` after hydration
- **THEN** the AuthGuard SHALL redirect to `/` via `window.location.replace('/')` (replaces history entry, prevents back-button loop)

#### Scenario: Valid session
- **WHEN** a protected page renders and the session store has `isValid: true`
- **THEN** the AuthGuard SHALL render its children without any overlay or layout wrapping (transparent pass-through)

### Requirement: AuthGuard integration with StepLayout
The system SHALL integrate `AuthGuard` into `StepLayout.astro` to protect all form step pages.

#### Scenario: AuthGuard in layout
- **WHEN** any step page (`/step1`–`/step4`, `/summary`) is rendered
- **THEN** the content SHALL be wrapped by `AuthGuard client:load` inside `StepLayout.astro`
