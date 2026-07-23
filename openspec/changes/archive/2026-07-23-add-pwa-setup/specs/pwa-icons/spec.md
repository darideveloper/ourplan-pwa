## ADDED Requirements

### Requirement: PWA icon set is generated from source logo

The system SHALL provide a `generate-pwa-assets` npm script that uses `@vite-pwa/assets-generator` to produce all required PWA icon variants from a source PNG.

#### Scenario: Script generates all icon files
- **WHEN** `pnpm generate-pwa-assets` is run
- **THEN** the following files are created in `public/icons/`: `icon-192x192.png`, `icon-512x512.png`, `icon-maskable-192x192.png`, `icon-maskable-512x512.png`, `apple-touch-icon.png`

### Requirement: Standard icons are available at 192x192 and 512x512

The system SHALL include transparent PNG icons at 192x192 and 512x512 in the manifest `icons` array.

#### Scenario: Manifest references standard icons
- **WHEN** the manifest is parsed
- **THEN** the `icons` array contains entries for `/icons/icon-192x192.png` (size 192x192) and `/icons/icon-512x512.png` (size 512x512) with `type: "image/png"`

### Requirement: Maskable icons are available for Android adaptive icons

The system SHALL include maskable PNG icons at 192x192 and 512x512 with `purpose: "maskable"` in the manifest.

#### Scenario: Manifest references maskable icons
- **WHEN** the manifest is parsed
- **THEN** the `icons` array contains entries for `/icons/icon-maskable-192x192.png` and `/icons/icon-maskable-512x512.png` with `purpose: "maskable"`

### Requirement: Apple touch icon is available at 180x180

The system SHALL include a 180x180 Apple touch icon referenced via `<link rel="apple-touch-icon">`.

#### Scenario: Apple touch icon linked in head
- **WHEN** any page's `<head>` is parsed
- **THEN** a `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">` tag is present

### Requirement: Source logo file exists

The system SHALL include the source logo file at `public/ourplan-logo.png` for icon generation.

#### Scenario: Logo file available for regeneration
- **WHEN** an icon regeneration is needed
- **THEN** `public/ourplan-logo.png` is available as the source image
