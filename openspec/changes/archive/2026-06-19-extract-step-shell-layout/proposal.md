## Why

The decorative background blobs, page wrapper, glass card, footer row ("Your progress is saved automatically." + `ContinueButton`), `StepGuard`, and the `@keyframes blob` CSS are duplicated verbatim across `step1.astro`, `step2.astro`, `step3.astro`, and `step4.astro`. Every new step copies the same ~40 lines of shell markup and the same keyframes block, with only the title, subtitle, `stepPath`, and form fields varying. This is the exact duplication the prior progress-bar refactor identified but did not finish. It bloats each step page, drifts out of sync (step1 already has mis-nested indentation from an edit), and forces every step author to remember the full shell rather than just their form content.

## What Changes

- **New layout** `src/layouts/StepLayout.astro` that renders the shared step shell: decorative blob background, `min-h-screen` wrapper, `<main>` + `max-w-xl` container, conditional header with title (`h1`) and subtitle (`p`), glass card wrapper, `<StepGuard client:load />`, footer row with the auto-save note and `<ContinueButton client:load />`, and the `@keyframes blob` style block (defined once). It accepts optional `title` and `subtitle` string props (when omitted, their elements and the header wrapper are not rendered), a required `stepPath` prop (typed as `StepPath`), and a default `<slot />` for the step's form fields.
- **New capability** `step-shell-layout` covering the contract between step pages and the shared shell (props, slot, included elements, behaviour).
- **Update step pages** `step1.astro`, `step2.astro`, `step3.astro`, `step4.astro` to use `<StepLayout>` — each page collapses to its imports, the `<StepLayout>` wrapper with `title` / `subtitle` / `stepPath`, and the unique form fields in the slot. The duplicated blob divs, wrapper, card, footer, `StepGuard` import, `ContinueButton` import, and `<style>` keyframes block are removed from each page.
- **`summary.astro` unchanged** — it has a deliberately different shell (solid white narrow card, no glassmorphism, no blobs, no footer, no Continue button) and stays on the base `Layout.astro` directly.
- **`Layout.astro` unchanged** — already owns the global `<ProgressBar client:load />`; `StepLayout` composes `Layout` rather than replacing it.
- **Small fix folded in:** hoist `const state = useFormStore.getState()` above the key loop in `advanceStep` (`src/store/form.ts`) to avoid calling `getState()` on every iteration. No behaviour change.

## Capabilities

### New Capabilities
- `step-shell-layout`: A shared Astro layout that renders the common step shell (animated blob background, page wrapper, glass card, step guard, footer with auto-save note and continue button) for every form step page. Step pages optionally provide title and subtitle, and always provide a `stepPath`; form fields go in the default slot.

### Modified Capabilities
<!-- No existing specs in openspec/specs/ to modify -->

## Impact

- **Layouts**: New file `src/layouts/StepLayout.astro`; `src/layouts/Layout.astro` unchanged.
- **Pages**: `src/pages/step1.astro`, `src/pages/step2.astro`, `src/pages/step3.astro`, `src/pages/step4.astro` rewritten to use `<StepLayout>`; `src/pages/summary.astro` and `src/pages/index.astro` unchanged.
- **Store**: Minor no-op refactor in `src/store/form.ts` (`advanceStep` — hoist `getState()` call).
- **Components**: No new atoms or molecules; `ContinueButton` and `StepGuard` continue to be used (now via `StepLayout` for steps that previously imported them directly).
- **Dependencies**: None added or removed.
- **Future steps**: Any new form step page is a ~10-line file declaring its `stepPath`, optional `title`/`subtitle`, and form fields — no shell boilerplate to copy.
