# access-validation

## Requirements

### Requirement: Invitation code entry
The system SHALL display a text input for invitation code entry on the `/` page with Zod `.min(1)` validation.

#### Scenario: User enters a code
- **WHEN** the user types characters into the code input field
- **THEN** the input value SHALL be written to the session store in real-time

#### Scenario: User submits empty code
- **WHEN** the user clicks "Verify Code" with an empty input
- **THEN** the system SHALL display a Zod validation error ("Enter your invitation code") below the input

#### Scenario: Input has correct styling
- **WHEN** the code input is rendered
- **THEN** it SHALL use the `Input` presentation wrapper from `src/components/atoms/Input.tsx` with consistent styling

#### Scenario: Input has a label
- **WHEN** the code input is rendered
- **THEN** it SHALL display a label "Your invitation code" above the input

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

### Requirement: VerifyButton field-error check
The `VerifyButton` SHALL check both field errors from the session store before allowing the API call.

#### Scenario: Field errors exist
- **WHEN** the user clicks "Verify Code" while `codeInput` or `termsChecked` has a Zod validation error in the session store
- **THEN** the button SHALL NOT call the API and remain disabled

#### Scenario: Field errors cleared
- **WHEN** the user clicks "Verify Code" after both fields have no Zod errors
- **THEN** the button SHALL proceed with the API validation call

### Requirement: API validation
The system SHALL POST the invitation code to the n8n `/validate` endpoint and interpret the response.

#### Scenario: Valid code
- **WHEN** the user submits a valid invitation code with terms accepted
- **THEN** the system SHALL set `isValid: true` in the session store and redirect to `/step1`

#### Scenario: Invalid code
- **WHEN** the user submits an unrecognised or expired invitation code
- **THEN** the system SHALL display an API error message ("That invitation code is not recognised or has expired. Please check and try again.") as a standalone `<p role="alert">` element

#### Scenario: Network error during validation
- **WHEN** the API request fails due to a network error
- **THEN** the system SHALL display an appropriate error message in the error element

#### Scenario: Validation while in progress
- **WHEN** the user clicks "Verify Code" while a validation request is in flight
- **THEN** the button SHALL be disabled and display a loading spinner

### Requirement: API error island
The system SHALL provide a standalone `ApiError` React island at `src/components/atoms/ApiError.tsx` that reads `apiError` from the session store and renders it as a `<p role="alert">` element.

#### Scenario: Error occurs
- **WHEN** the session store has a non-null `apiError` value
- **THEN** the `ApiError` component SHALL render a `<p>` with `role="alert"` displaying the error message

#### Scenario: Error cleared
- **WHEN** the session store `apiError` is `null`
- **THEN** the `ApiError` component SHALL render nothing

### Requirement: Disclaimer text
The system SHALL display a disclaimer notice on the `/` page below the terms checkbox.

#### Scenario: Disclaimer is rendered
- **WHEN** the `/` page loads
- **THEN** the disclaimer text SHALL be rendered as static HTML (not React) in the Astro page

### Requirement: Brand header
The system SHALL display a logo and welcome heading on the `/` page.

#### Scenario: Header is rendered
- **WHEN** the `/` page loads
- **THEN** the brand logo (`public/ourplan-logo.png`) and welcome heading SHALL be rendered as static HTML (not React) in the Astro page
