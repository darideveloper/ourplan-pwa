# welcome-landing

## Purpose

Replaces the Astro 6 starter template (currently rendered via `src/components/Welcome.astro`) with a real, OurPlan-branded welcome landing at `/`. The landing is a static Astro page; form-step behaviour, validation, progress tracking, and resume logic remain unchanged.

## Requirements

### Requirement: Welcome page renders at `/`

The route `/` SHALL render `src/pages/index.astro`. The page SHALL be a valid Astro page (frontmatter + body) and SHALL use `Layout.astro` as its root layout (not `StepLayout.astro`).

#### Scenario: Index page imports Layout

- **WHEN** `src/pages/index.astro` is read
- **THEN** its frontmatter SHALL import `Layout` from `../layouts/Layout.astro` and the body SHALL render `<Layout>…</Layout>`

#### Scenario: Index page does not use StepLayout

- **WHEN** `src/pages/index.astro` is read
- **THEN** it SHALL NOT import or render `StepLayout`

### Requirement: Welcome content is static Astro markup

The welcome body SHALL consist of static Astro markup only: a `<main>` containing a centred card (using the same `bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg p-6 sm:p-8` treatment as `StepLayout.astro:42`) that holds a page `<h1>` with the brand name, a subtitle `<p>`, and a primary `<a>` link styled as a button that points to `/step1`. No React island SHALL be mounted for the static content.

#### Scenario: Welcome contains heading, subtitle, and CTA link

- **WHEN** `src/pages/index.astro` is read
- **THEN** its body SHALL contain exactly one `<h1>`, exactly one subtitle `<p>`, and exactly one anchor `<a href="/step1">` styled as a primary button (dark fill, pink focus ring — matching the post-3.3 `Button` atom's visual treatment, since this is static Astro markup and cannot use a React island)

#### Scenario: Welcome contains no React island for the static content

- **WHEN** `src/pages/index.astro` is read
- **THEN** it SHALL NOT contain any element with a `client:` directive used to mount a React component for the heading, subtitle, or CTA link

#### Scenario: Welcome reuses the card chrome

- **WHEN** `src/pages/index.astro` is read
- **THEN** the wrapping element of the welcome content SHALL include the classes `bg-white/80`, `backdrop-blur-xl`, `rounded-2xl`, `border`, `border-white/50`, `shadow-lg`, and `p-6 sm:p-8`

#### Scenario: Welcome uses the page-level wrapper

- **WHEN** `src/pages/index.astro` is read
- **THEN** the page body SHALL include a wrapping element with the classes `min-h-screen`, `bg-slate-50`, `relative`, and `overflow-hidden` (matching the `StepLayout.astro:19` treatment)

### Requirement: Resume behaviour is preserved

When a returning user visits `/` with non-empty `currentStep` in the persisted Zustand store, the page SHALL redirect them to the earliest incomplete step (via the existing `ResumeRedirect` behaviour in `src/components/atoms/ResumeRedirect.tsx`). For new users (`currentStep === ""`) the welcome SHALL render in place.

#### Scenario: Returning user is redirected

- **WHEN** a user with `currentStep === "/step1"` visits `/`
- **THEN** the browser SHALL navigate to `/step2` (the earliest incomplete step)

#### Scenario: New user sees the welcome

- **WHEN** a user with `currentStep === ""` visits `/`
- **THEN** the welcome page SHALL render without a redirect

#### Scenario: ResumeRedirect remains the resume mechanism

- **WHEN** `src/pages/index.astro` is read
- **THEN** it SHALL still mount `<ResumeRedirect client:load />` inside the `<Layout>` body (position is unconstrained)

### Requirement: Welcome starter template is removed

The file `src/components/Welcome.astro` SHALL be deleted from the repository. No other file SHALL import from it.

#### Scenario: File no longer exists

- **WHEN** the repository is listed
- **THEN** the path `src/components/Welcome.astro` SHALL NOT exist

#### Scenario: No remaining import of Welcome

- **WHEN** `rg "from ['\"].*Welcome" src/` is executed
- **THEN** zero matches SHALL be found

#### Scenario: No remaining references to starter copy

- **WHEN** `rg "open src/pages|astro.build" src/` is executed
- **THEN** zero matches SHALL be found in any file under `src/pages/` or `src/components/`

### Requirement: Welcome copy is placeholder until design is finalised

The initial landing copy is a placeholder that signals brand and intent without locking in marketing wording. The page SHALL contain the brand name "OurPlan" in the `<h1>`, a one-sentence subtitle that frames the product as a calm planning tool for an older loved one's care, and a CTA label of "Start your plan" (or equivalent action verb).

#### Scenario: Brand name is present

- **WHEN** the welcome page is rendered
- **THEN** the visible `<h1>` text SHALL contain the substring "OurPlan"

#### Scenario: CTA targets the first form step

- **WHEN** the welcome page is rendered
- **THEN** the primary CTA anchor's `href` SHALL equal `/step1`

### Requirement: Astro starter assets are not reintroduced

The page SHALL NOT import `src/assets/astro.svg` or `src/assets/background.svg` (the icons bundled with the deleted `Welcome.astro`). The two asset files MAY be removed in a follow-up; this change only stops importing them.

#### Scenario: No starter asset imports

- **WHEN** `rg "assets/(astro|background)\.svg" src/` is executed
- **THEN** zero matches SHALL be found
