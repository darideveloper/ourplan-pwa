## MODIFIED Requirements

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
