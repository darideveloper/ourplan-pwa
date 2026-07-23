## ADDED Requirements

### Requirement: Theme colour meta tag is present

The system SHALL include `<meta name="theme-color" content="#fe676e" />` in the `<head>` of every page.

#### Scenario: Browser uses theme colour
- **WHEN** the user visits any page of the app in a supporting browser
- **THEN** the browser toolbar/status bar renders in the brand colour `#fe676e`

### Requirement: iOS standalone mode meta tags are present

The system SHALL include `<meta name="mobile-web-app-capable" content="yes" />` and `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />` for iOS Safari support.

#### Scenario: iOS user adds to home screen
- **WHEN** an iOS Safari user adds the app to their home screen
- **THEN** the app opens in standalone mode with a translucent black status bar

### Requirement: Apple web app title is set

The system SHALL include `<meta name="apple-mobile-web-app-title" content="OurPlan" />` in the `<head>`.

#### Scenario: iOS home screen name
- **WHEN** the app is saved to the iOS home screen
- **THEN** the icon label displays "OurPlan"

### Requirement: Viewport includes viewport-fit=cover

The system SHALL set the viewport meta tag to `width=device-width, initial-scale=1.0, viewport-fit=cover` to extend into safe areas on notched devices.

#### Scenario: Content fills the safe area
- **WHEN** the app is displayed on a device with a notch or rounded corners
- **THEN** the background extends into the safe area instead of showing a white bar

### Requirement: Apple touch icon link is present

The system SHALL include `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />` in the `<head>`.

#### Scenario: iOS bookmark icon
- **WHEN** an iOS user adds the app to their home screen or bookmarks it
- **THEN** the 180x180 apple-touch-icon is used as the icon

### Requirement: Body prevents double-tap zoom

The system SHALL set `style="touch-action: manipulation"` on the `<body>` element.

#### Scenario: Rapid double-tap does not zoom
- **WHEN** the user rapidly double-taps on a button
- **THEN** the page does not zoom in

### Requirement: Page title updated

The system SHALL set the HTML `<title>` to "OurPlan — Estate Planning Made Simple".

#### Scenario: Browser tab shows app name
- **WHEN** the user opens any page of the app
- **THEN** the browser tab title displays "OurPlan — Estate Planning Made Simple"
