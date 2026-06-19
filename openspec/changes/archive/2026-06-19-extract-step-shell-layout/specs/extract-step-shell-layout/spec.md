## ADDED Requirements

### Requirement: StepLayout composes the base Layout
The `StepLayout.astro` component SHALL render inside `Layout.astro`, so that every step page using `StepLayout` also inherits the global HTML shell and the `<ProgressBar client:load />` owned by `Layout`. `StepLayout` SHALL NOT re-declare the HTML head, the ProgressBar, or any other global chrome already provided by `Layout`.

#### Scenario: Step page inherits the progress bar
- **WHEN** a step page renders `<StepLayout title="Core Identities" subtitle="…" stepPath="/step1">…</StepLayout>`
- **THEN** the rendered document SHALL include both the global `<ProgressBar>` (from `Layout`) and the step shell (from `StepLayout`)

#### Scenario: No double HTML shell
- **WHEN** `StepLayout` renders
- **THEN** the document SHALL contain exactly one `<html>` and one `<body>` element, contributed by `Layout` alone

### Requirement: StepLayout accepts title, subtitle, and stepPath props
The `StepLayout.astro` component SHALL accept two optional string props (`title` and `subtitle`) and one required prop (`stepPath`). The `stepPath` prop SHALL be typed as the `StepPath` union exported from `src/store/form.ts` so the Astro compiler rejects values outside that union at the call site.

#### Scenario: Title renders in the h1
- **WHEN** `title` is `"Core Identities"`
- **THEN** the shell SHALL render an `<h1>` containing exactly `"Core Identities"`

#### Scenario: Subtitle renders in the subtitle paragraph
- **WHEN** `subtitle` is `"Let's start with some basic information so we can personalise your plan beautifully."`
- **THEN** the shell SHALL render a `<p>` containing that exact string

#### Scenario: Title omitted
- **WHEN** `title` is not provided to `StepLayout`
- **THEN** the shell SHALL NOT render an `<h1>` element

#### Scenario: Subtitle omitted
- **WHEN** `subtitle` is not provided to `StepLayout`
- **THEN** the shell SHALL NOT render a subtitle `<p>` element

#### Scenario: Both title and subtitle omitted
- **WHEN** neither `title` nor `subtitle` is provided to `StepLayout`
- **THEN** the shell SHALL NOT render the header wrapper `<div class="mb-8 text-center space-y-3">` at all

#### Scenario: stepPath is passed through to ContinueButton
- **WHEN** `stepPath` is `"/step2"`
- **THEN** the shell's `<ContinueButton>` SHALL receive `stepPath="/step2"`

#### Scenario: Invalid stepPath is rejected at compile time
- **WHEN** a page passes `stepPath="/typo"` (not in the `StepPath` union) and the project is type-checked (e.g. via `astro check` or `tsc`)
- **THEN** the TypeScript compiler SHALL reject the value at the `StepLayout` call site

### Requirement: StepLayout renders the shared visual shell
The `StepLayout.astro` component SHALL render, in this order: an outer `min-h-screen` wrapper with `relative overflow-hidden`; three decorative animated blur-blob `<div>`s (top-left pink, top-right orange, bottom-left pink) using the `.animate-blob`, `.animation-delay-2000`, and `.animation-delay-4000` classes; a `<main>` with `relative z-10` containing a `max-w-xl mx-auto` container; conditionally the title `<h1>` and subtitle `<p>` inside a centred `mb-8` header (only rendered when at least one of `title` or `subtitle` is provided); a glass card `<div>` with `bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg p-6 sm:p-8`; and inside that card a `space-y-6 w-full` container holding the default `<slot />` followed by the footer row.

#### Scenario: All three blob divs are present
- **WHEN** any step page renders via `StepLayout`
- **THEN** the rendered DOM SHALL contain exactly three sibling `<div>` elements with the `animate-blob` class, one each with `animation-delay-2000` and `animation-delay-4000`

#### Scenario: Glass card is present
- **WHEN** any step page renders via `StepLayout`
- **THEN** the rendered DOM SHALL contain a `<div>` whose class list includes `bg-white/80`, `backdrop-blur-xl`, `rounded-2xl`, and `shadow-lg`

### Requirement: StepLayout defines the blob keyframes once
The `@keyframes blob` rule and the `.animate-blob`, `.animation-delay-2000`, `.animation-delay-4000` utility classes SHALL be declared exactly once, inside `StepLayout.astro`'s `<style>` block. No step page SHALL declare its own `@keyframes blob` or blob utility classes.

#### Scenario: No step page contains the keyframes
- **WHEN** `src/pages/step1.astro`, `src/pages/step2.astro`, `src/pages/step3.astro`, and `src/pages/step4.astro` are searched for the string `@keyframes blob`
- **THEN** zero matches SHALL be found in any of those four files

#### Scenario: StepLayout contains the keyframes
- **WHEN** `src/layouts/StepLayout.astro` is read
- **THEN** it SHALL contain exactly one `<style>` block defining `@keyframes blob`, `.animate-blob`, `.animation-delay-2000`, and `.animation-delay-4000`

### Requirement: StepLayout hosts StepGuard and ContinueButton
The `StepLayout.astro` component SHALL render `<StepGuard client:load />` as the first child inside `<Layout>`'s body, before the outer step wrapper `<div>` (matching the placement used by `step2.astro`, `step3.astro`, `step4.astro`, and `summary.astro`). It SHALL render `<ContinueButton stepPath={stepPath} client:load />` inside the footer row. Step pages using `StepLayout` SHALL NOT import or render `StepGuard` or `ContinueButton` directly.

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

### Requirement: StepLayout footer is fixed
The footer row rendered by `StepLayout` SHALL contain the literal text `"Your progress is saved automatically."` followed by the `ContinueButton`. The footer SHALL be separated from the slot content by a top border (`pt-6 mt-6 border-t border-slate-100`). The footer copy and structure SHALL NOT be overridable by the step page.

#### Scenario: Footer text is present
- **WHEN** any step page renders via `StepLayout`
- **THEN** the rendered DOM SHALL contain a `<p>` with the exact text `"Your progress is saved automatically."`

#### Scenario: Footer sits below the slot content with a divider
- **WHEN** a step page passes form fields via the default slot
- **THEN** the slot content SHALL appear before the footer row in document order, and the footer row SHALL have `border-t` styling

### Requirement: Step pages declare only content
Each of `src/pages/step1.astro`, `step2.astro`, `step3.astro`, `step4.astro` SHALL consist of: the frontmatter imports for `StepLayout` and any form atoms/molecules the step needs; a single `<StepLayout title=… subtitle=… stepPath=…>` root element; and the step's form fields as direct slot children. The page SHALL NOT contain the blob `<div>`s, the `min-h-screen` wrapper, the `<main>` element, the glass card, the footer row, the `<StepGuard>` import, the `<ContinueButton>` import, or a `<style>` block.

#### Scenario: step1.astro contains only content
- **WHEN** `src/pages/step1.astro` is read
- **THEN** it SHALL import `StepLayout`, `ValidatedInput`, and `ParentHealthRadioGroup`; it SHALL NOT contain the strings `animate-blob`, `@keyframes`, `StepGuard`, or `Your progress is saved automatically.`

#### Scenario: Placeholder steps contain only the shell plus their placeholder text
- **WHEN** `src/pages/step2.astro`, `step3.astro`, `step4.astro` are read
- **THEN** each SHALL use `<StepLayout>` with its existing `title`, `subtitle`, and `stepPath`, and its slot SHALL contain only the existing `"Step N content coming soon."` placeholder `<p>`

### Requirement: summary.astro is unchanged
The `src/pages/summary.astro` page SHALL continue to use `Layout.astro` directly and SHALL NOT use `StepLayout`. Its existing title, subtitle, solid white narrow card (`max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-100`), and `<StepGuard client:load />` usage SHALL remain as-is.

#### Scenario: summary does not use StepLayout
- **WHEN** `src/pages/summary.astro` is read
- **THEN** it SHALL import `Layout` (not `StepLayout`) and SHALL render `<Layout>…</Layout>`

#### Scenario: summary keeps its own card and StepGuard
- **WHEN** `src/pages/summary.astro` is read
- **THEN** it SHALL still import and render `<StepGuard client:load />` directly, and SHALL still contain the `max-w-md` solid white card with `border border-slate-100`

### Requirement: advanceStep reads store state once
The `advanceStep` action in `src/store/form.ts` SHALL call `useFormStore.getState()` exactly once per invocation, hoisting the result into a local `state` variable that is reused when building the data object for schema validation. The observable behaviour (validation outcome, error map, return value) SHALL be unchanged.

#### Scenario: getState is called once
- **WHEN** `advanceStep("/step1")` is invoked
- **THEN** `useFormStore.getState` SHALL be called exactly once during the data-building loop, regardless of how many keys the step schema's shape contains
