## ADDED Requirements

### Requirement: Brand colour palette
The system SHALL define colour tokens brand-{50..900} (red/pink at oklch hue 20) and accent-{50..900} (amber at oklch hue 78) matching the Ourlens palette exactly. The primary brand colour SHALL be `oklch(0.62 0.18 20)` (brand-500, hex `#dd4d57`).

#### Scenario: Brand tokens available as Tailwind utilities
- **WHEN** a component uses `bg-brand-500`, `text-brand-500`, `border-brand-500`, `ring-brand-500/40`
- **THEN** the colour resolves to `oklch(0.62 0.18 20)` at the specified opacity

#### Scenario: Accent tokens available as Tailwind utilities
- **WHEN** a component uses `bg-accent-400`, `text-accent-500`
- **THEN** the colour resolves to the corresponding accent oklch value

#### Scenario: Surface tokens available
- **WHEN** a component uses `bg-surface`, `text-on-surface`, `text-on-surface-muted`
- **THEN** the colours resolve to `#fffffe`, `oklch(0.15 0.01 260)`, and `oklch(0.45 0.01 260)` respectively

### Requirement: shadcn CSS variables map to brand palette
The shadcn CSS custom properties in `:root` SHALL use the Ourlens brand palette as specified in the design document's colour token mapping table.

#### Scenario: Primary colour applied
- **WHEN** a shadcn component renders with `bg-primary` or `text-primary-foreground`
- **THEN** it SHALL use brand-500 for the background and white for the foreground

#### Scenario: Background and foreground applied
- **WHEN** the page body renders with `bg-background text-foreground`
- **THEN** it SHALL use `#fffffe` for background and `oklch(0.15 0.01 260)` for text

### Requirement: Dark mode removed

The system SHALL override Tailwind's built-in `@media (prefers-color-scheme: dark)` variant using `@custom-variant dark (&:where(.no-dark-mode))` to prevent any `dark:` utility classes from activating. The system SHALL set `color-scheme: light` on the `<html>` element.

#### Scenario: No dark mode toggle class

- **WHEN** inspecting the stylesheet
- **THEN** there SHALL be no `.dark` CSS class definition used for toggling dark mode

#### Scenario: Light mode locked

- **WHEN** the HTML renders
- **THEN** the `<html>` element SHALL have `style="color-scheme: light;"` and `:root` SHALL omit dark mode variables

#### Scenario: Dark variant overridden

- **WHEN** inspecting the compiled CSS
- **THEN** the `dark` variant SHALL be overridden via `@custom-variant dark (&:where(.no-dark-mode))` so that no `dark:` Tailwind classes activate regardless of OS-level `prefers-color-scheme`

#### Scenario: Dark classes never activate

- **WHEN** the user has OS-level dark mode preference enabled
- **AND** they view any page in the application
- **THEN** no `dark:` Tailwind utility class SHALL apply visual changes

### Requirement: System font stack
The system SHALL use the system UI font stack instead of Inter Variable as the primary sans-serif font.

#### Scenario: Font applied globally
- **WHEN** inspecting computed styles on any text element
- **THEN** the font-family SHALL resolve to `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`

#### Scenario: Inter dependency removed
- **WHEN** inspecting `package.json`
- **THEN** `@fontsource-variable/inter` SHALL NOT be listed in dependencies or devDependencies

### Requirement: Layout meta tags
The `Layout.astro` SHALL include brand-correct meta tags matching the Ourlens conventions.

#### Scenario: theme-color present
- **WHEN** inspecting the `<head>` of any page
- **THEN** `<meta name="theme-color" content="#dd4d57" />` SHALL be present

#### Scenario: PWA meta tags present
- **WHEN** inspecting the `<head>`
- **THEN** `<meta name="mobile-web-app-capable" content="yes" />` and `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />` SHALL be present

#### Scenario: apple-touch-icon linked
- **WHEN** inspecting the `<head>`
- **THEN** `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />` SHALL be present

#### Scenario: Title not placeholder
- **WHEN** inspecting the `<title>` tag
- **THEN** it SHALL NOT contain "Astro Basics"

### Requirement: All `#fe676e` hardcoded colour references replaced
Every hardcoded `#fe676e` value in component files SHALL be replaced with the corresponding brand colour token. The files affected are listed in the design document.

#### Scenario: ProgressBar uses brand colours
- **WHEN** a step is active
- **THEN** the step circle SHALL use `bg-brand-500` and the label SHALL use `text-brand-500`

#### Scenario: Validated inputs use brand focus ring
- **WHEN** a validated input/textarea/select receives focus
- **THEN** the focus ring SHALL use `ring-brand-500/40` with `border-brand-500`

#### Scenario: Radio group uses brand for selection
- **WHEN** a radio option is selected
- **THEN** its border SHALL be `border-brand-500`, background SHALL be `bg-brand-500/5`, and description text SHALL be `text-brand-500`

#### Scenario: Loading spinner uses brand colour
- **WHEN** the loading overlay renders
- **THEN** the spinner icon SHALL use `text-brand-500`

#### Scenario: Decorative blobs use brand colour
- **WHEN** the background blobs render on index and step pages
- **THEN** they SHALL use `bg-brand-500/20` and `bg-brand-500/30`

### Requirement: Gradient button style
Primary action buttons SHALL use the Ourlens gradient style: `bg-gradient-to-r from-brand-500 to-brand-600` with hover `from-brand-600 to-brand-700`.

#### Scenario: Continue button uses gradient
- **WHEN** the Continue button renders
- **THEN** it SHALL have the brand gradient background and `focus-visible:ring-brand-500/40`

#### Scenario: Verify button uses gradient
- **WHEN** the Verify Code button renders
- **THEN** it SHALL have the brand gradient background and `focus-visible:ring-brand-500/40`
