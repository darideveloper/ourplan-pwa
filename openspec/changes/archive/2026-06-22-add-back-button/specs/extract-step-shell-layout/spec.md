## MODIFIED Requirements

### Requirement: StepLayout hosts StepGuard and ContinueButton
The `StepLayout.astro` component SHALL render `<StepGuard client:load />` as the first child inside `<Layout>`'s body, before the outer step wrapper `<div>` (matching the placement used by `step2.astro`, `step3.astro`, `step4.astro`, and `summary.astro`). It SHALL render `<ContinueButton stepPath={stepPath} client:load />` inside the footer row. It SHALL also optionally accept a `backUrl` prop and render a Back link if provided. Step pages using `StepLayout` SHALL NOT import or render `StepGuard` or `ContinueButton` directly.

#### Scenario: StepGuard is present once per step
- **WHEN** any step page renders via `StepLayout`
- **THEN** the rendered DOM SHALL contain exactly one `StepGuard` island mount

#### Scenario: StepGuard is placed before the outer wrapper
- **WHEN** a step page renders via `StepLayout`
- **THEN** the `StepGuard` island mount SHALL appear as the first child inside `<Layout>`'s `<body>`, preceding the outer `min-h-screen` wrapper `<div>` in document order

#### Scenario: ContinueButton receives the step's stepPath
- **WHEN** a step page renders via `<StepLayout stepPath="/step3" …>`
- **THEN** the `ContinueButton` inside the shell's footer SHALL receive `stepPath="/step3"`

#### Scenario: Step pages do not import StepGuard or ContinueButton
- **WHEN** `src/pages/step1.astro`, `step2.astro`, `step3.astro`, `step4.astro` are searched for the identifiers `StepGuard` and `ContinueButton`
- **THEN** zero matches SHALL be found in any of those four files

#### Scenario: Back link renders when backUrl is provided
- **WHEN** a step page renders via `<StepLayout stepPath="/step2" backUrl="/step1" …>`
- **THEN** the shell SHALL render a "Back" link navigating to `/step1`

#### Scenario: Back link does not render when backUrl is omitted
- **WHEN** a step page renders via `<StepLayout stepPath="/step1" …>` without a `backUrl` prop
- **THEN** the shell SHALL NOT render a "Back" link
