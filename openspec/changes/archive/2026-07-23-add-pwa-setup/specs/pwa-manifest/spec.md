## ADDED Requirements

### Requirement: Web manifest is served at /manifest.webmanifest

The system SHALL serve a valid web app manifest at `/manifest.webmanifest` with the correct MIME type `application/manifest+json`.

#### Scenario: Manifest is accessible
- **WHEN** a browser requests `/manifest.webmanifest`
- **THEN** the server returns a JSON document with `Content-Type: application/manifest+json`

#### Scenario: Manifest includes required fields
- **WHEN** the manifest is parsed
- **THEN** it SHALL contain `name: "OurPlan"`, `short_name: "OurPlan"`, `description`, `theme_color`, `background_color`, `display`, `orientation`, `start_url`, and `icons`

### Requirement: App is installable on Android

The system SHALL provide a manifest with sufficient metadata for Chrome to trigger the install prompt.

#### Scenario: Chrome detects installable web app
- **WHEN** a user visits the app in Chrome on Android
- **THEN** Chrome presents an install prompt after the engagement heuristic is met

### Requirement: App launches in standalone display mode

The system SHALL specify `display: "standalone"` so the installed PWA opens without browser chrome.

#### Scenario: PWA opens without browser UI
- **WHEN** the app is launched from the home screen
- **THEN** no browser address bar, tabs, or navigation buttons are visible

### Requirement: App is locked to portrait orientation

The system SHALL specify `orientation: "portrait"` in the manifest.

#### Scenario: Device rotation is prevented
- **WHEN** the user rotates their device to landscape while in the installed PWA
- **THEN** the interface remains in portrait orientation

### Requirement: App specifies PWA-specific start URL

The system SHALL set `start_url: "/?source=pwa"` to distinguish PWA launches from browser visits.

#### Scenario: PWA launch includes source parameter
- **WHEN** the app is launched from the home screen
- **THEN** the URL includes `?source=pwa` query parameter

### Requirement: Manifest theme colour matches the app's brand colour

The system SHALL set `theme_color` to `#fe676e`, matching the brand coral colour used in the UI.

#### Scenario: Status bar colour on Android
- **WHEN** the user opens the installed PWA on Android
- **THEN** the status bar renders in the brand colour
