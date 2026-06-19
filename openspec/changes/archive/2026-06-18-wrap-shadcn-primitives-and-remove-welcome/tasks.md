## 1. shadcn primitive

- [x] 1.1 Add the shadcn `Button` primitive to `src/components/ui/button.tsx`. Use the standard shadcn template with `class-variance-authority` for `variant` and `size`, and `@radix-ui/react-slot` for the `asChild` prop. Keep the file a pure shadcn primitive (no project-specific styles).
- [x] 1.2 Verify peer dependencies. Run `rg -l '"@radix-ui/react-slot"|"class-variance-authority"' package.json`. If either is missing, run `pnpm add @radix-ui/react-slot class-variance-authority`.

## 2. Atom wrappers

- [x] 2.1 Create `src/components/atoms/Input.tsx` containing exactly `export { Input } from "@/components/ui/input";`.
- [x] 2.2 Create `src/components/atoms/Label.tsx` containing exactly `export { Label } from "@/components/ui/label";`.
- [x] 2.3 Create `src/components/atoms/RadioGroup.tsx` containing exactly `export { RadioGroup } from "@/components/ui/radio-group";`.
- [x] 2.4 Create `src/components/atoms/RadioGroupItem.tsx` containing exactly `export { RadioGroupItem } from "@/components/ui/radio-group";`.
- [x] 2.5 Create `src/components/atoms/Button.tsx` containing exactly `export { Button } from "@/components/ui/button";`.

## 3. Rewire existing atoms

- [x] 3.1 Update `src/components/atoms/ValidatedInput.tsx` so its imports become `import { Label } from "@/components/atoms/Label";` and `import { Input } from "@/components/atoms/Input";`. Remove the old `@/components/ui/...` imports.
- [x] 3.2 Update `src/components/atoms/ValidatedRadioGroup.tsx` to use the shadcn primitives: import `Label` from `@/components/atoms/Label`, `RadioGroup` from `@/components/atoms/RadioGroup`, `RadioGroupItem` from `@/components/atoms/RadioGroupItem`. Replace the hand-rolled option-row markup (the `<label>` containing `<input type="radio" class="sr-only">` plus the custom dot indicator) with a `RadioGroup` whose `value` and `onValueChange` feed `setValue`. Render a `Label` for the group and one `Label` per option, with the option label/description text next to a `RadioGroupItem`. The component must still accept `field`, `label`, `options` props and use `useField(field)`.
- [x] 3.3 Update `src/components/atoms/ContinueButton.tsx` to import `Button` from `@/components/atoms/Button` and render `<Button onClick={handleClick} className="w-full sm:w-auto" >{label}<svg …/></Button>`. Remove the hand-rolled Tailwind classes; keep the right-arrow SVG and the `label` / `stepPath` props unchanged.

## 4. Welcome replacement

- [x] 4.1 Delete `src/components/Welcome.astro`.
- [x] 4.2 Rewrite `src/pages/index.astro` as a static Astro page using `Layout.astro` as the root. Body SHALL contain: a `<main>` with the `min-h-screen bg-slate-50 relative overflow-hidden` wrapper; a single card using the `bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg p-6 sm:p-8` classes; an `<h1>` containing "OurPlan"; a one-sentence subtitle `<p>` framing the product as a calm planning tool for an older loved one's care; a primary CTA anchor `<a href="/step1" class="…">Start your plan</a>` styled to match the post-3.3 `Button` atom visual (dark fill, pink focus ring). Mount `<ResumeRedirect client:load />` inside `<Layout>` (position unconstrained).
- [x] 4.3 Stop importing `src/assets/astro.svg` and `src/assets/background.svg` (the rewrite in 4.2 must not reference them). Do not delete the files yet.

## 5. Conventions

- [x] 5.1 Update `AGENTS.md` to add a short paragraph under the "Component pattern" section (after the code block, before "Conventions") that states both rules: (a) no file outside `src/components/atoms/*` may import from `src/components/ui/*`; every shadcn primitive is consumed only via its atom wrapper; (b) the `atoms/` folder has two tiers — **presentation wrappers** (e.g. `Input`, `Button`) that re-export a shadcn primitive unchanged, and **stateful atoms** (e.g. `ValidatedInput`, `ContinueButton`) that wrap a presentation wrapper plus a `useField` / store binding. Stateful atoms import from presentation wrappers, never from `ui/*`. The paragraph may be 2–3 sentences; do not exceed 3.

## 6. Verification

- [x] 6.1 Run `pnpm install` (no-op if deps already present after 1.2).
- [x] 6.2 Run `pnpm build` and confirm zero errors.
- [x] 6.3 Run `rg "from ['\"]@/components/ui/" src/` and confirm the only matching files are `src/components/atoms/Input.tsx`, `Label.tsx`, `RadioGroup.tsx`, `RadioGroupItem.tsx`, `Button.tsx`.
- [x] 6.4 Run `rg "Welcome" src/` and confirm zero matches.
- [x] 6.5 Run `rg -e "open src/pages" -e "astro.build" src/pages src/components` and confirm zero matches.
- [x] 6.6 Run `pnpm dev`, open `http://localhost:4321/` in a browser, confirm the welcome renders with the brand heading and a CTA pointing to `/step1`. With cleared localStorage the page should render in place; with a persisted `currentStep` it should redirect to the next step.
- [x] 6.7 Open `http://localhost:4321/step1`, type into `user_name` and `parent_name`, select a `parent_health` option, and confirm validation messages still appear and the `Continue` button still navigates to `/step2`.
- [x] 6.8 Visually review the `parent_health` selected state on step 1 and confirm the brand colour is still legible. If the shadcn default is too washed out, document the follow-up to retune `--primary` in `global.css` and stop here.
- [x] 6.9 Run `rg "<StepLayout" src/pages/index.astro` and confirm zero matches (welcome uses `Layout`, not `StepLayout`).
- [x] 6.10 Run `rg "client:(load|idle|visible|media)" src/pages/index.astro` and confirm the only match is on the `<ResumeRedirect client:load />` element (no React island for the static welcome content).
- [x] 6.11 Run `rg "assets/(astro|background)\.svg" src/` and confirm zero matches (no imports of starter assets).
- [x] 6.12 Run `git diff src/components/ui/ -- ':(exclude)src/components/ui/button.tsx'` and confirm the diff is empty (the pass-through rule: no edits to existing `ui/` files beyond the new `button.tsx`).
