## ADDED Requirements

### Requirement: Offline page exists at /offline

The system SHALL render a dedicated offline page at the `/offline` route.

#### Scenario: Offline page is accessible
- **WHEN** a user navigates to `/offline` in the browser
- **THEN** an HTML page is served with a 200 status code

### Requirement: Offline page uses minimal layout

The system SHALL render the offline page with a minimal layout (`OfflineLayout.astro`) that excludes navigation bars and interactive components present on other pages.

#### Scenario: Offline layout has no navigation
- **WHEN** the offline page renders
- **THEN** no top navigation bar or interactive React islands are present

#### Scenario: Offline layout includes viewport-fit=cover
- **WHEN** the offline page renders on a notched device
- **THEN** the viewport meta tag includes `viewport-fit=cover` to fill the safe area

#### Scenario: Offline body prevents double-tap zoom
- **WHEN** the offline page renders
- **THEN** the `<body>` element has `touch-action: manipulation`

### Requirement: Offline page displays user-friendly message

The system SHALL display a clear message informing the user they are offline.

#### Scenario: User sees offline message
- **WHEN** the offline page renders
- **THEN** the page displays text indicating the user is currently offline

### Requirement: Offline page includes try-again action

The system SHALL provide a "Try Again" button that reloads the current page.

#### Scenario: User clicks try again
- **WHEN** the user clicks the "Try Again" button on the offline page
- **THEN** the browser calls `window.location.reload()`

### Requirement: Offline page includes theme colour meta tag

The system SHALL include `<meta name="theme-color" content="#fe676e" />` in the offline page `<head>` to maintain consistent branding.

#### Scenario: Theme colour preserved when offline
- **WHEN** the offline page is displayed in a supporting browser
- **THEN** the browser toolbar displays the brand colour
