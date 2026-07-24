## ADDED Requirements

### Requirement: Template shell structure

The template SHALL be a self-contained HTML file at `public/templates/report-template.html` with fixed header, fixed footer, and a dynamic `<main>` content area. The file SHALL contain all CSS inline and MUST NOT require any external stylesheets.

#### Scenario: File exists at expected path
- **WHEN** the project is built
- **THEN** `public/templates/report-template.html` exists and is accessible as a static asset

#### Scenario: Complete HTML document
- **WHEN** the template is served
- **THEN** it SHALL contain `<html>`, `<head>`, and `<body>` tags

### Requirement: Header with branding

The `<header>` element SHALL contain the OurPlan logo, the report title "OurPlan — Estate Planning Guide", and a dynamically generated date.

#### Scenario: Logo present
- **WHEN** the template renders
- **THEN** an `<img>` tag with `src="https://ourplan.ourlivesapp.com/ourplan-logo.png"` and `alt="OurPlan"` SHALL be visible in the header

#### Scenario: Dynamic date
- **WHEN** the template renders
- **THEN** a JS script SHALL set the date text content using `new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })` producing UK format (e.g. "24 July 2026")

### Requirement: Dynamic main content area

The `<main>` element SHALL contain the placeholder `{{ $('Report Agent').item.json.output }}` which the n8n agent replaces with generated HTML content.

#### Scenario: Placeholder present
- **WHEN** the raw template file is read
- **THEN** the string `{{ $('Report Agent').item.json.output }}` SHALL exist as the only content inside `<main>`

### Requirement: Footer with disclaimer

The `<footer>` element SHALL contain the disclaimer text and a clickable link to www.ourlivesapp.com.

#### Scenario: Disclaimer text
- **WHEN** the footer renders
- **THEN** it SHALL display: "OurPlan is an automated informational guide by Ourlives and does not constitute legal, financial, or clinical medical advice. See full terms at www.ourlivesapp.com."

#### Scenario: Link to ourlivesapp.com
- **WHEN** the footer renders
- **THEN** an `<a>` tag with `href="https://www.ourlivesapp.com"` SHALL be present and clickable

### Requirement: CSS print layout for Gotenberg

The template SHALL include CSS that renders correctly in Gotenberg (Chromium headless) and produces A4-sized PDF output.

#### Scenario: A4 page size
- **WHEN** Gotenberg converts the template to PDF
- **THEN** the output SHALL be A4 format as defined by `@page { size: A4; margin: 20mm }`

#### Scenario: Sticky footer layout
- **WHEN** the template renders with short or long `<main>` content
- **THEN** the footer SHALL remain at the bottom of the page / last printed page using a flexbox sticky-footer pattern

### Requirement: Brand colours

The template SHALL use the OurPlan brand colour palette for all styled elements.

#### Scenario: Brand colour applied
- **WHEN** any element uses a brand colour
- **THEN** the colour SHALL be coral/red tones (matching `#fe676e` or `#dd4d57`) for primary brand elements

### Requirement: Image dimensions

The logo `<img>` element SHALL include explicit `width` and `height` attributes matching the image's intrinsic dimensions.

#### Scenario: Width and height present
- **WHEN** the template renders
- **THEN** the logo `<img>` tag SHALL have `width="300"` and `height="300"` attributes

### Requirement: Focus-visible state on links

All interactive elements (links) SHALL have a visible `:focus-visible` style for keyboard navigation.

#### Scenario: Focus outline on footer link
- **WHEN** the footer link receives keyboard focus
- **THEN** a visible outline SHALL appear, defined by `outline: 2px solid #dd4d57; outline-offset: 2px; border-radius: 2px`

### Requirement: Brand name translation guard

Brand names "OurPlan" and "Ourlives" SHALL be wrapped with `translate="no"` to prevent auto-translation garbling.

#### Scenario: OurPlan in title has translate="no"
- **WHEN** inspecting the `<title>` element
- **THEN** it SHALL have `translate="no"` attribute

#### Scenario: OurPlan in h1 has translate="no"
- **WHEN** inspecting the `<h1>` element
- **THEN** it SHALL have `translate="no"` attribute

#### Scenario: OurPlan in footer has translate="no"
- **WHEN** inspecting the footer disclaimer text
- **THEN** the word "OurPlan" SHALL be wrapped in `<span translate="no">`

#### Scenario: Ourlives in footer has translate="no"
- **WHEN** inspecting the footer disclaimer text
- **THEN** the word "Ourlives" SHALL be wrapped in `<span translate="no">`

### Requirement: Font stack

The template SHALL use the system UI font stack without any web font dependencies.

#### Scenario: Font declaration
- **WHEN** inspecting the CSS
- **THEN** `font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` SHALL be declared

### Requirement: UK English spelling

All visible text in the template SHALL use UK English spelling and date formatting.

#### Scenario: Date format
- **WHEN** the date renders
- **THEN** it SHALL use UK format: day month year (e.g. "24 July 2026"), not US format
