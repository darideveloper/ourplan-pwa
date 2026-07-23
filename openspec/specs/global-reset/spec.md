# global-reset

## Purpose

Provide a visible, confirmation-guarded "Start over" link on every form step page that resets form data while preserving invitation code session.

## Requirements

### Requirement: Global reset link

The system SHALL provide a "Start over" link visible at the bottom of every form step page (steps 1-4 and summary). The link SHALL NOT appear on the landing page (/).

#### Scenario: Reset link visible on form steps
- **WHEN** the user is on any form step page (/step1, /step2, /step3, /step4, /summary)
- **THEN** a muted "Start over" text link SHALL be visible at the bottom of the form card

#### Scenario: Reset link hidden on landing page
- **WHEN** the user is on the landing page (/)
- **THEN** the reset link SHALL NOT be displayed

### Requirement: Confirmation before reset

The system SHALL show a confirmation dialog before clearing form data.

#### Scenario: User confirms reset
- **WHEN** the user clicks "Start over"
- **THEN** a browser native confirm dialog SHALL appear with text "Are you sure? This will clear all your form data."
- **AND** if the user clicks "OK", all form data SHALL be cleared and the user SHALL be redirected to /step1

#### Scenario: User cancels reset
- **WHEN** the user clicks "Start over"
- **AND** the user clicks "Cancel" on the confirm dialog
- **THEN** no form data SHALL be cleared and the user SHALL remain on the current page

### Requirement: Session preserved on reset

The system SHALL preserve the invitation code session when form data is reset.

#### Scenario: Code session survives reset
- **WHEN** the user completes a reset
- **THEN** the invitation code authentication SHALL remain valid
- **AND** the user SHALL NOT need to re-enter their code or re-accept terms
