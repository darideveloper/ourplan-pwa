## Context

The form is a 5-route flow (`/step1` … `/step4` plus `/summary`) plus a welcome page (`/`). `Layout.astro` is the base HTML shell and already owns the global `<ProgressBar client:load />` (added in the prior progress refactor). Each step page (`step1.astro` … `step4.astro`) currently re-declares an identical visual shell on top of `Layout`: three animated blur-blob divs, a `min-h-screen` wrapper, a `<main>` + `max-w-xl` container, a title + subtitle header, a glass card (`bg-white/80 backdrop-blur-xl rounded-2xl …`), a footer row with the auto-save note and a `ContinueButton`, a `<StepGuard client:load />`, and a `<style>` block containing the `@keyframes blob` animation. Only the title, subtitle, `stepPath`, and the form fields inside the card vary. `summary.astro` has a deliberately different shell (a solid white, narrow `max-w-md` card with no glassmorphism, no blobs, no footer, no Continue button) and is out of scope.

The duplication is the unfinished half of the prior refactor that moved the progress bar into `Layout` but left the step shell in each page. `step1.astro` has already drifted in two ways: an edit mis-nested the card `<div>` and the `space-y-6` container by two spaces without re-indenting their children, and its `<StepGuard client:load />` sits inside the `max-w-xl` container (after the header, before the card) whereas `step2.astro`, `step3.astro`, `step4.astro`, and `summary.astro` all place it as the first child of `<Layout>`'s body, before the outer wrapper. `StepLayout` adopts the majority placement (first child of `<Layout>` body) and normalises step1 as a side effect.

**Constraints:**
- AGENTS.md convention: "Layout, header, footer, navigation are Astro components." Static shell markup stays Astro; React is reserved for interactive form atoms.
- React islands hydrate client-side; the shell itself is non-interactive and should not be a React component.
- `ContinueButton` and `StepGuard` are existing React islands; `StepLayout` will host them with `client:load` exactly as the pages do today.
- Astro `<style>` is scoped by default to the component's own elements — sufficient for the blob classes since the blob divs live inside `StepLayout`.

## Goals / Non-Goals

**Goals:**
- Collapse the duplicated step shell (blobs, wrapper, card, footer, `StepGuard`, `ContinueButton`, `@keyframes blob`) into a single `StepLayout.astro` that composes `Layout.astro`.
- Reduce every step page to its imports, a `<StepLayout title=… subtitle=… stepPath=…>` opening, the unique form fields in the default slot, and a closing tag.
- Define a stable contract (props + slot) so future step pages can be authored without touching shell markup.
- Fix the two drifts in `step1.astro` (mis-nested card/`space-y-6` indentation and `StepGuard` placed inside the `max-w-xl` container) as a side effect of the rewrite.
- Fold in the minor `advanceStep` `getState()` hoist in `src/store/form.ts` (no behaviour change).

**Non-Goals:**
- Touching `summary.astro` — its shell is intentionally different (solid white narrow card, no glassmorphism, no Continue, no blobs).
- Touching `index.astro` or `ResumeRedirect` — welcome page is separate.
- Changing `Layout.astro` — it already owns `ProgressBar`; `StepLayout` composes it.
- Changing `ContinueButton`, `StepGuard`, `ProgressBar`, or any atom/molecule — they are consumed as-is.
- Adding new interactive behaviour, new store fields, or new validation — pure structural refactor plus one no-op cleanup.
- Migrating the visual style (colours, blob sizes, card chrome) — preserved pixel-for-pixel.

## Decisions

### 1. Two-layer layout: `StepLayout` composes `Layout`

**Decision:** `StepLayout.astro` imports and wraps `Layout.astro`, adding the step shell inside `<Layout>…</Layout>`. The base `Layout` keeps the HTML shell + global `<ProgressBar client:load />`; `StepLayout` adds the step-specific shell.

**Rationale:** Separation of concerns. `Layout` owns truly global chrome (head, ProgressBar — visible on every page including `/` and `/summary` via the base layer). `StepLayout` owns step-form chrome (blobs, card, footer with Continue — only the 4 numbered steps). A step page composes both by using `StepLayout` only; a non-step page (`index`, `summary`) uses `Layout` directly.

**Alternatives considered:**
- *Single `Layout` with a `variant` prop* — mixes two concerns in one file, requires conditional blobs/card/footer, harder to read.
- *Page-level `Fragment` includes instead of a layout* — less ergonomic than named props + slot; no compile-time contract.

### 2. `StepLayout` is an Astro component, not React

**Decision:** `StepLayout.astro` is a `.astro` file. It declares `title`, `subtitle`, and `stepPath` as frontmatter props and renders the shell as static HTML. The interactive pieces (`StepGuard`, `ContinueButton`) are dropped in as existing React islands with `client:load`.

**Rationale:** Matches AGENTS.md: "Layout, header, footer, navigation are Astro components." The shell has no interactivity of its own — the blobs are CSS-only, the card is static, the footer note is text. Promoting the shell to React would ship unnecessary JS and force hydration where none is needed. Astro props + a default slot is the idiomatic Astro pattern for a page wrapper.

**Alternatives considered:**
- *React shell component* — violates the project convention and adds JS payload.
- *Per-page partial include (`Astro.slots` / `Fragment`)* — works but loses the named-prop contract and is noisier at call sites.

### 3. Props contract: `title`, `subtitle`, `stepPath`

**Decision:** `StepLayout` accepts two optional string props and one required prop:
- `title` — rendered inside the `<h1>` (e.g., `"Core Identities"`). Optional — when omitted, no `<h1>` is rendered.
- `subtitle` — rendered inside the subtitle `<p>` (e.g., `"Let's start with some basic information…"`). Optional — when omitted, no `<p>` is rendered.
- `stepPath` — the canonical path token for the current step (e.g., `"/step1"`), passed straight through to `<ContinueButton stepPath={stepPath} client:load />`. Required.

When both `title` and `subtitle` are omitted, the entire header wrapper `<div class="mb-8 text-center space-y-3">` is suppressed, avoiding a dead `mb-8` gap above the card. When only one is provided, the header wrapper renders with just that element inside it.

**Rationale:** The four current step pages all provide both values, so existing call sites are unchanged. Making them optional provides future flexibility — a step that wants only a title or no header at all can simply omit the props without a layout change. The conditional rendering logic is a few lines of Astro template guards and adds no complexity at call sites. `stepPath` remains required because `ContinueButton` needs it to call `advanceStep(stepPath)` and to compute the next route.

**Alternatives considered:**
- *Inferring `stepPath` from `Astro.url.pathname`* — fragile (depends on the route matching the store's `STEP_ORDER` tokens exactly) and implicit; an explicit prop is clearer and survives route renames.
- *Optional `continueLabel` / `footerNote` props* — YAGNI; current copy is identical on every step.

### 4. Default `<slot />` lives inside the card's `space-y-6` container

**Decision:** `StepLayout` renders the glass card `<div>` and its inner `<div class="space-y-6 w-full">`, then places `<slot />` inside that inner container, before the footer row. The footer row (auto-save note + `ContinueButton`) is rendered by `StepLayout` after the slot, inside the same `space-y-6` container but separated by the existing `pt-6 mt-6 border-t` divider.

**Rationale:** Every current step puts its form fields inside `space-y-6` and then the footer below the divider. Putting the slot there preserves the exact visual structure and lets `space-y-6` apply its vertical rhythm to the page-supplied fields. The footer stays in `StepLayout` so it cannot be forgotten.

**Alternatives considered:**
- *Two named slots (`fields`, `footer`)* — over-engineered; the footer is identical on every step and should not be re-declared per page.
- *Slot outside the card* — would force every page to re-declare the card wrapper, defeating the dedup.

### 5. `<StepGuard client:load />` lives at the top of `StepLayout`'s body

**Decision:** `StepLayout` renders `<StepGuard client:load />` as the first child inside `<Layout>`'s body, before the outer step wrapper `<div>`. This matches the placement already used by `step2.astro`, `step3.astro`, `step4.astro`, and `summary.astro`. Step pages stop importing or rendering `StepGuard` directly.

**Rationale:** `StepGuard` is a headless island (returns `null`) that enforces the access-window invariant on every numbered step. Centralising it in `StepLayout` guarantees no step can accidentally omit the guard. It is a per-step concern (not welcome/summary), so it belongs in `StepLayout`, not in the base `Layout`. Placing it as the first child of `<Layout>`'s body (rather than inside the `max-w-xl` container, as step1 currently does) is the majority pattern across the existing pages, keeps the guard outside the visual shell so it cannot affect layout, and normalises the step1 drift.

**Alternatives considered:**
- *Placing `StepGuard` inside the `max-w-xl` container (step1's current placement)* — inconsistent with the other four pages and nests a headless island inside presentational markup for no benefit.
- *Moving `StepGuard` into the base `Layout`* — would also run on `/` and `/summary`; `ResumeRedirect` already handles `/`, and `summary` has its own access semantics, so this would be wrong.

### 6. `@keyframes blob` CSS defined once in `StepLayout`'s scoped `<style>`

**Decision:** The `@keyframes blob` block and the `.animate-blob`, `.animation-delay-2000`, `.animation-delay-4000` utility classes move into `StepLayout.astro`'s `<style>` block. The three blob `<div>`s are rendered by `StepLayout` and reference those classes. Step pages drop their `<style>` blocks entirely.

**Rationale:** Astro scopes `<style>` to the component's elements by default, which is exactly the scope needed — the classes are only used by the blob divs inside `StepLayout`. Defining the keyframes once eliminates four copies of an identical 15-line CSS block and prevents future drift in animation timing.

**Alternatives considered:**
- *Moving the keyframes to `src/styles/global.css`* — would work but pollutes the global stylesheet with step-only CSS. Scoped-in-`StepLayout` is the narrowest correct scope.
- *Replacing the CSS animation with a Tailwind plugin / `@keyframes` in `global.css`* — out of scope; preserves the existing implementation verbatim.

### 7. `advanceStep` `getState()` hoist is folded in

**Decision:** While editing `src/store/form.ts` is not strictly required by the shell extraction, the `advanceStep` action currently calls `useFormStore.getState()` inside a `for` loop over the schema shape keys. Hoist `const state = useFormStore.getState()` above the loop and reuse it. No behaviour change.

**Rationale:** The shell refactor touches step pages and layouts only; the store change is independent and trivial. Folding it in avoids a separate change for a one-line cleanup that was spotted during analysis. It is called out explicitly in `tasks.md` so it is reviewable, not hidden.

**Alternatives considered:**
- *Splitting into its own change* — overhead exceeds the fix size; bundling with clear task documentation is more honest than pretending the store file is untouched.

## Risks / Trade-offs

- **[Astro scoped `<style>` reach]** → The `.animate-blob*` classes only apply inside `StepLayout`. If a future non-step page wants the blob animation, it will need its own copy or a move to `global.css`. **Mitigation:** Acceptable — blobs are a step-form visual signature; non-step pages should not reuse them. Revisit if the design language spreads.
- **[Slot content must be valid as direct children of `space-y-6`]** → A step page that wraps its fields in an extra `<div>` will get a different vertical rhythm (the wrapper becomes one child, `space-y-6` no longer spaces the inner fields). **Mitigation:** Document the expected slot usage in `tasks.md` — pass form atoms as direct slot children, mirroring today's structure. The existing four steps already follow this.
- **[`stepPath` prop must match a `STEP_ORDER` token]** → `ContinueButton` → `advanceStep(stepPath)` → `getNextStep` relies on `stepPath` being in `STEP_ORDER`. A typo in a page's `stepPath` prop silently breaks navigation (returns `null`, no redirect). **Mitigation:** The `stepPath` prop is typed as `StepPath` (the union `"" | "/step1" | "/step2" | "/step3" | "/step4" | "/summary"`) so Astro catches typos at the prop-type layer. Verify the type import works in `.astro` frontmatter (it does — Astro supports TS in frontmatter).
- **[Visual drift risk during rewrite]** → Rewriting four pages risks accidentally changing a class, padding, or blob colour. **Mitigation:** `tasks.md` includes a verification step that compares the rendered DOM class lists before/after for one representative step, plus a `pnpm build` and manual `pnpm dev` visual check.
- **[`summary.astro` exclusion could look inconsistent]** → A reader might expect `summary` to also use `StepLayout`. **Mitigation:** `proposal.md` and `tasks.md` both call out the exclusion explicitly with the reason (different shell — solid white narrow card, no glassmorphism/Continue/blobs).
