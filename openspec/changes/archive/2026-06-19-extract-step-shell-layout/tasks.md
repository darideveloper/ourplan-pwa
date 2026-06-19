## 1. Capture the current shell for comparison

- [x] 1.1 Read `src/pages/step1.astro` and note the exact outer-wrapper class list, the three blob `<div>` class lists, the `<main>` + `max-w-xl` container classes, the header `<h1>`/`<p>` classes, the glass card class list, the inner `space-y-6` container, and the footer row markup (auto-save `<p>` + `ContinueButton` separated by `pt-6 mt-6 border-t border-slate-100`). This is the reference for `StepLayout` — it must reproduce these classes verbatim.
- [x] 1.2 Read `src/pages/step2.astro` (or `step3.astro`/`step4.astro`) and confirm its `<style>` block (`@keyframes blob` + `.animate-blob` + `.animation-delay-2000` + `.animation-delay-4000`) matches step1's, since `StepLayout` will own this block.

## 2. Create `StepLayout.astro`

- [x] 2.1 Create `src/layouts/StepLayout.astro` with frontmatter that imports `Layout` from `./Layout.astro`, `StepGuard` from `../hooks/useStepGuard`, `ContinueButton` from `@/components/atoms/ContinueButton`, and the `StepPath` type from `@/store/form`.
- [x] 2.2 Declare the props interface in the frontmatter: `interface Props { title: string; subtitle: string; stepPath: StepPath }` and destructure `const { title, subtitle, stepPath } = Astro.props`.
- [x] 2.- [x] 2.3 Render `<Layout>` as the root. Inside `<Layout>`, render `<StepGuard client:load />` first, then the outer `<div class="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col justify-center">`.
- [x] 2.- [x] 2.4 Inside the outer wrapper, render the three blob `<div>`s verbatim from step1: top-left pink (`bg-[#fe676e]/20`), top-right orange (`bg-orange-300/30` with `animation-delay-2000`), bottom-left pink (`bg-[#fe676e]/30` with `animation-delay-4000`). All three use `mix-blend-multiply filter blur-3xl opacity-50 animate-blob`.
- [x] 2.- [x] 2.5 Render `<main class="relative z-10 py-8 px-4 sm:py-12 sm:px-6 lg:px-8 w-full">` containing `<div class="max-w-xl mx-auto w-full">`.
- [x] 2.- [x] 2.6 Inside the `max-w-xl` container, render the header: `<div class="mb-8 text-center space-y-3">` with `<h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 drop-shadow-sm">{title}</h1>` and `<p class="text-sm sm:text-base text-slate-600 max-w-md mx-auto">{subtitle}</p>`.
- [x] 2.- [x] 2.7 Render the glass card `<div class="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg p-6 sm:p-8 transition-all duration-300 w-full">` containing `<div class="space-y-6 w-full">`.
- [x] 2.- [x] 2.8 Inside the `space-y-6` container, render `<slot />` followed by the footer row: `<div class="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">` containing `<p class="text-sm text-slate-500">Your progress is saved automatically.</p>` and `<ContinueButton stepPath={stepPath} client:load />`.
- [x] 2.- [x] 2.9 Add the `<style>` block with `@keyframes blob` (0% / 33% / 66% / 100% keyframes matching step1), `.animate-blob { animation: blob 7s infinite; }`, `.animation-delay-2000 { animation-delay: 2s; }`, `.animation-delay-4000 { animation-delay: 4s; }`. Place the `<style>` at the end of the file, outside `<Layout>`.

## 3. Rewrite `step1.astro`

- [x] 3.1 In `src/pages/step1.astro` frontmatter, remove the `Layout`, `StepGuard`, and `ContinueButton` imports. Add `import StepLayout from '../layouts/StepLayout.astro';`. Keep the `ValidatedInput` and `ParentHealthRadioGroup` imports.
- [x] 3.2 Replace the entire `<Layout>…</Layout>` block with `<StepLayout title="Core Identities" subtitle="Let's start with some basic information so we can personalise your plan beautifully." stepPath="/step1">…</StepLayout>`.
- [x] 3.3 Inside `<StepLayout>`, place only the three form-field wrappers as direct slot children: the `<div class="w-full"><ValidatedInput field="user_name" …/></div>`, the `<div class="w-full"><ValidatedInput field="parent_name" …/></div>`, and the `<div class="w-full"><ParentHealthRadioGroup client:load /></div>`. Remove the outer blob divs, wrapper, `<main>`, header, card, footer, `<StepGuard>`, and `<style>` block.
- [x] 3.4 Confirm the file no longer contains the strings `animate-blob`, `@keyframes`, `StepGuard`, `ContinueButton`, `Your progress is saved automatically.`, or `bg-white/80`.

## 4. Rewrite `step2.astro`, `step3.astro`, `step4.astro`

- [x] 4.1 In `src/pages/step2.astro` frontmatter, remove the `Layout`, `StepGuard`, and `ContinueButton` imports; add `import StepLayout from '../layouts/StepLayout.astro';`.
- [x] 4.2 Replace the `<Layout>…</Layout>` block (including the three blob divs, wrapper, `<main>`, header, card, footer, and `<style>` block) with `<StepLayout title="Systemic Safeguards" subtitle="Help us understand what safeguards matter most." stepPath="/step2"><p class="text-sm text-slate-500 text-center py-8">Step 2 content coming soon.</p></StepLayout>`.
- [x] 4.3 Repeat for `src/pages/step3.astro`: `<StepLayout title="Future Planning" subtitle="Help us understand your wishes for the future." stepPath="/step3"><p class="text-sm text-slate-500 text-center py-8">Step 3 content coming soon.</p></StepLayout>`.
- [x] 4.4 Repeat for `src/pages/step4.astro`: `<StepLayout title="Final Details" subtitle="One last step before we create your plan." stepPath="/step4"><p class="text-sm text-slate-500 text-center py-8">Step 4 content coming soon.</p></StepLayout>`.
- [x] 4.5 Confirm none of `step2.astro`, `step3.astro`, `step4.astro` contain `animate-blob`, `@keyframes`, `StepGuard`, `ContinueButton`, `bg-white/80`, or a `<style>` block.

## 5. Leave `summary.astro` and `index.astro` untouched

- [x] 5.1 Confirm `src/pages/summary.astro` still imports `Layout` (not `StepLayout`), still renders `<Layout>…</Layout>`, still has its own `<StepGuard client:load />`, and still has its solid white narrow card (`max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center space-y-6`) unchanged.
- [x] 5.2 Confirm `src/pages/index.astro` is unchanged (still imports `Layout` and `ResumeRedirect`, still renders the Welcome component).

## 6. Fold in the `advanceStep` cleanup

- [x] 6.1 In `src/store/form.ts`, inside the `advanceStep` action, hoist `const state = useFormStore.getState() as Record<string, unknown>;` to a single line above the `for (const key of Object.keys(shape))` loop, and replace the per-iteration `const state = useFormStore.getState() …` line with `data[key] = state[key];`.
- [x] 6.2 Confirm the rest of `advanceStep` (schema lookup, no-schema early return, `safeParse`, error aggregation, success path clearing errors and setting `currentStep`, return value) is unchanged.

## 7. Verify

- [x] 7.1 Run `pnpm build` and confirm no type errors, no build failures, and all five routes (`/`, `/step1` … `/step4`, `/summary`) build successfully.
- [x] 7.2 If `astro check` is available (install `@astrojs/check` + `typescript` as dev deps if not — they are not currently in `package.json`), run it and confirm no type errors. If unavailable, rely on `pnpm build` and note the gap.
- [x] 7.3 Run `pnpm dev` and load `/step1` — confirm the three blobs animate, the glass card renders, the title reads "Core Identities", the `ValidatedInput` fields and `ParentHealthRadioGroup` render and validate, the auto-save note and Continue button appear in the footer, and the global `ProgressBar` is visible at the top. Confirm `<StepGuard>` now fires before the outer wrapper (the step1 drift is normalised — it no longer sits inside the `max-w-xl` container).
- [x] 7.4 In `pnpm dev`, complete step1 and click Continue — confirm navigation to `/step2` works, the step2 placeholder text renders inside the same shell, and deep-linking to `/step4` directly redirects back to the earliest incomplete step (verifying `StepGuard` still fires through `StepLayout`).
- [x] 7.5 In `pnpm dev`, load `/summary` — confirm it renders its own (non-`StepLayout`) shell unchanged, with its solid white narrow card, no blobs, and no Continue button.
- [x] 7.6 Grep `src/pages/step1.astro` … `step4.astro` for `@keyframes blob` and confirm zero matches; grep `src/layouts/StepLayout.astro` for `@keyframes blob` and confirm exactly one match.
