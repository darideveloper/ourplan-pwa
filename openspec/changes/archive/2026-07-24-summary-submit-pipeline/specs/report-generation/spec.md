## ADDED Requirements

### Requirement: Submit form data to n8n for PDF generation

The system SHALL POST the validated invitation code and all form data (enriched with `_value_labels`) to the n8n `/report` webhook when the user clicks "Generate My Plan" on the summary page. The payload SHALL use `code` and `data` as top-level keys.

#### Scenario: Successful submission
- **WHEN** the user clicks "Generate My Plan"
- **THEN** the system SHALL extract the validated invitation code from the session store (`useSessionStore.getState().code`)
- **THEN** the system SHALL extract all form data from the form store, excluding store metadata (errors, currentStep, isNavigating, stepValidity)
- **THEN** the system SHALL enrich the form data with `_value_labels` containing human-readable labels for all enum values
- **THEN** the system SHALL construct the payload as `{ code: "<invitation-code>", data: { ...formData, _value_labels: { ... } } }`
- **THEN** the system SHALL POST to `${PUBLIC_N8N_BASE_URL}/report` with `Content-Type: application/json`
- **THEN** the system SHALL receive `{ pdfUrl: string }` immediately (PDF generates asynchronously on backend)

#### Scenario: Successful poll — PDF ready
- **WHEN** the POST returns `{ pdfUrl }`
- **THEN** the system SHALL start polling the pdfUrl every 10 seconds using `fetch(pdfUrl, { method: "HEAD" })`
- **THEN** the system SHALL display a fake progress bar climbing from 0% to 95% over 3 minutes
- **WHEN** a HEAD request returns HTTP 200
- **THEN** the system SHALL snap progress to 100% and show the download button after a 2-second hold

#### Scenario: Poll timeout after 3 minutes
- **WHEN** 3 minutes have elapsed without a successful HEAD response
- **THEN** the system SHALL display an inline error message "PDF generation timed out. Please try again."
- **THEN** the system SHALL show a "Try Again" button that resets to idle state

#### Scenario: Stale poll cancelled on retry
- **WHEN** the user clicks "Try Again" and then clicks "Generate My Plan" again
- **THEN** the previous poll loop SHALL be invalidated via a generation counter
- **THEN** the old poll SHALL exit without updating state when it next checks the counter

#### Scenario: Network error during submission
- **WHEN** the POST request fails with a network or timeout error
- **THEN** the system SHALL retry up to 2 times with exponential backoff (via `safeFetch`)
- **THEN** if all retries fail, the system SHALL display an inline error message
- **THEN** the system SHALL show a "Try Again" button that resets the form to the initial submission state

#### Scenario: HTTP error during submission
- **WHEN** the n8n endpoint returns a non-2xx HTTP response
- **THEN** the system SHALL NOT retry (HTTP errors are not retried by `safeFetch`)
- **THEN** the system SHALL display the error message inline
- **THEN** the system SHALL show a "Try Again" button

### Requirement: Fake progress bar during generation

The system SHALL display a fake progress bar that climbs smoothly while the poll loop checks PDF readiness in the background. The progress bar SHALL animate from 0% to 95% over 3 minutes.

#### Scenario: Progress bar is visible during generation
- **WHEN** the user clicks "Generate My Plan"
- **THEN** the "Generate My Plan" button SHALL be replaced by a progress bar
- **THEN** the progress bar SHALL start at 0% and climb to 95% over 180 seconds using `min(elapsed / 180000, 0.95)`
- **THEN** a stage message SHALL be displayed below the bar, changing at defined thresholds

#### Scenario: Progress bar snaps to 100% on poll success
- **WHEN** a poll attempt returns HTTP 200 for the pdfUrl
- **THEN** the progress SHALL jump to 100% with a CSS transition of `width 500ms ease-out`
- **THEN** the message SHALL change to "Your plan is ready!"
- **THEN** after a 2-second hold, the progress bar SHALL be replaced by the download button

#### Scenario: Progress bar stops on timeout
- **WHEN** 3 minutes have elapsed without a successful poll
- **THEN** the progress bar SHALL be replaced by a timeout error message
- **THEN** the timer SHALL be cleared

### Requirement: GenerationProgressBar molecule component

A presentational component `GenerationProgressBar` SHALL render a styled progress bar with a dynamic message below it.

#### Scenario: Renders progress bar with correct width
- **WHEN** `GenerationProgressBar` is rendered with `progress={0.45}`
- **THEN** the inner fill bar SHALL have `width: 45%`
- **THEN** the fill bar SHALL use `transition: width 500ms ease-out` for smooth animation

#### Scenario: Renders message below bar
- **WHEN** `GenerationProgressBar` is rendered with `message="Building your plan..."`
- **THEN** the message text SHALL be visible below the progress bar
- **THEN** the text SHALL use the standard body font size and muted colour

#### Scenario: Minimum display time at 100%
- **WHEN** the poll succeeds before the bar has reached meaningful progress
- **THEN** the system SHALL hold progress at 100% for a minimum of 2 seconds before replacing the bar with the download button
- **THEN** this prevents a flash of the download button if the PDF becomes ready very quickly

### Requirement: Download PDF button on success

After successful generation, the system SHALL replace the progress bar with a download button that opens the PDF in a new tab.

#### Scenario: Download button is visible
- **WHEN** the API returns a `pdfUrl`
- **THEN** the system SHALL render a `<a>` element with `href={pdfUrl}` and `target="_blank"`
- **THEN** the link SHALL be styled as a primary button reading "Download Your Plan (PDF)"

### Requirement: _value_labels enrichment

The system SHALL provide a `buildValueLabels()` function that maps enum values to human-readable UK English labels. For top-level form fields, the map contains the label for the current value. For the `support_circle` sub-fields, the map contains all possible enum options.

#### Scenario: buildValueLabels returns labels nested under _value_labels key
- **WHEN** `buildValueLabels()` is called
- **THEN** the return value SHALL be placed in the payload under the `_value_labels` key alongside form data, not spread at top level
- **THEN** this prevents key collisions with form data fields (e.g., `parent_health` from form data vs from labels)

#### Scenario: Top-level enum fields map current value
- **WHEN** `buildValueLabels()` is called
- **THEN** keys like `parent_health`, `lpa_status`, `psr_status`, `documents_loc`, `home_type`, `ourlens_completed`, `digital_literacy`, `has_pets` SHALL contain a single human-readable string describing the current selected value (not all possible options)
- **THEN** each label SHALL use UK English spelling

#### Scenario: support_circle sub-fields map all options
- **WHEN** `buildValueLabels()` is called
- **THEN** the `support_circle` key SHALL contain a nested object with sub-keys for `helper_relationship`, `helper_proximity`, `helper_time`, and `helper_superpower`
- **THEN** each sub-key SHALL map ALL possible enum options to labels (not just the current value), because the support circle array may contain multiple people with different values
- **THEN** each label SHALL reference the exact Zod enum string as its key (e.g., `"sibling"`, `"mid_distance"`, `"very_limited"`, `"coordinator"`)

### Requirement: SummarySubmitButton state machine

`SummarySubmitButton` SHALL implement a 4-state machine: idle, generating, complete, error.

#### Scenario: Initial state is idle
- **WHEN** the summary page loads
- **THEN** `SummarySubmitButton` SHALL show a "Generate My Plan" button
- **THEN** the button SHALL be disabled if `disclaimer_agreed` is false

#### Scenario: Click transitions to generating
- **WHEN** the user clicks "Generate My Plan"
- **THEN** the button SHALL be replaced by `GenerationProgressBar`
- **THEN** the progress timer SHALL start
- **THEN** the API call SHALL begin

#### Scenario: Success transitions to complete
- **WHEN** the API responds successfully
- **THEN** the progress SHALL snap to 100%
- **THEN** after a brief pause (minimum 2s to show 100%), the download button SHALL appear

#### Scenario: Error transitions to error state
- **WHEN** the API call fails
- **THEN** an error message SHALL be displayed
- **THEN** a "Try Again" button SHALL be rendered
- **THEN** clicking "Try Again" SHALL reset the state to idle

### Requirement: generateReport API function

The system SHALL provide a `generateReport` function in `src/lib/api/generate-report.ts` following the same pattern as `validateCode`.

#### Scenario: generateReport POSTs to /report
- **WHEN** `generateReport(formData)` is called
- **THEN** it SHALL POST to `${import.meta.env.PUBLIC_N8N_BASE_URL}/report`
- **THEN** it SHALL set `Content-Type: application/json`
- **THEN** it SHALL return the parsed response typed as `GenerateReportResponse`

#### Scenario: GenerateReportResponse type is exported
- **WHEN** importing from `src/lib/api/types.ts`
- **THEN** `GenerateReportResponse` SHALL be exported with shape `{ pdfUrl: string }`
