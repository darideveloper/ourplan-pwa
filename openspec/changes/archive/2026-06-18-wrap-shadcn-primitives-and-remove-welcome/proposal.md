## Why

Two rule violations in the current codebase undermine the documented component pattern in `AGENTS.md`:

1. **`src/components/Welcome.astro` ships the unmodified Astro 6 starter template** (Astro logo, "open `src/pages`" copy, Discord link to `astro.build`) as the production landing page (`src/pages/index.astro:2-9`). It is also the only Astro component loose in `src/components/`, where the convention reserves that tree for React islands organised by atomic-design tier.
2. **Application code imports shadcn primitives directly from `src/components/ui/`.** The pattern requires every primitive to be wrapped by an atom in `src/components/atoms/` before it is consumed. `ValidatedInput.tsx:2-3` imports `Label` and `Input` directly, and `ContinueButton.tsx:22-30` does not wrap a shadcn primitive at all (no shadcn `Button` exists in `ui/`). `ValidatedRadioGroup.tsx:36-90` hand-rolls a `<label><input type="radio" class="sr-only" />` indicator to work around the same gap.

Both issues are blockers for clean component reuse: any new screen or molecule that needs a button, label, input, or radio group would re-introduce direct `ui/*` imports or hand-rolled markup. The shadcn primitives in `src/components/ui/radio-group.tsx` are currently **0 importers** — dead code.

## What Changes

- **BREAKING**: Delete `src/components/Welcome.astro`. Replace its content with a real OurPlan welcome landing rendered inline in `src/pages/index.astro` (static Astro, no React island required for the copy).
- **Add shadcn `Button` primitive** at `src/components/ui/button.tsx` (kept untouched per the "do NOT edit directly" rule for `ui/`; it is the first shadcn component we are *adding*, not editing).
- **Add a thin atom wrapper for every shadcn primitive** in `src/components/atoms/`:
  - `Input.tsx` wraps `ui/input.tsx`
  - `Label.tsx` wraps `ui/label.tsx`
  - `RadioGroup.tsx` wraps `ui/radio-group.tsx` `RadioGroup`
  - `RadioGroupItem.tsx` wraps `ui/radio-group.tsx` `RadioGroupItem`
  - `Button.tsx` wraps the new `ui/button.tsx`
- **Refactor existing atoms** to import from `components/atoms/*` only, never from `components/ui/*`:
  - `ValidatedInput.tsx` → uses `Input` and `Label` atoms
  - `ValidatedRadioGroup.tsx` → uses `Label`, `RadioGroup`, `RadioGroupItem` atoms; deletes the hand-rolled `<input type="radio">` markup and indicator dot (replaced by the Radix `RadioGroupItem` indicator from `ui/radio-group.tsx:32-37`)
  - `ContinueButton.tsx` → uses the new `Button` atom; deletes the raw `<button>` + custom Tailwind classes
- **Codify the rule in `AGENTS.md`**: no file outside `src/components/atoms/*` may import from `src/components/ui/*`. The audit documents this is the project's atomic-design intent (`AGENTS.md:43`).
- **Add a verification step** to the build (manual grep at minimum) confirming zero `components/ui/*` imports exist outside `components/atoms/`.

## Capabilities

### New Capabilities

- `shadcn-atom-wrappers`: Defines the rule that every shadcn primitive in `src/components/ui/` is consumed only via a thin atom wrapper in `src/components/atoms/`. Specifies the file naming, the wrapper contract (pure re-export of props, no business logic), the allowlist of primitives, and the prohibition on `components/ui/*` imports from anywhere else.
- `welcome-landing`: Defines the new static Astro welcome page rendered at `/`. Specifies content structure (title, subtitle, primary CTA), routing behaviour (delegates to `ResumeRedirect` for resume logic), the `StepLayout`/`Layout` decision (uses `Layout` directly — no step content), and the file changes (`Welcome.astro` deleted, `index.astro` rewritten).

### Modified Capabilities

None. The existing `form-screens`, `extract-step-shell-layout`, and `step-progress-tracking` specs do not change at the requirement level. `form-screens` references the welcome page only in the navigation map (`spec.md:20-25`) without specifying its content; the welcome is a static landing outside the form-step flow.

## Impact

- **Files deleted**: `src/components/Welcome.astro` (1).
- **Files added**: `src/components/ui/button.tsx` (shadcn primitive, 1), `src/components/atoms/Input.tsx`, `Label.tsx`, `RadioGroup.tsx`, `RadioGroupItem.tsx`, `Button.tsx` (5 wrappers).
- **Files modified**: `src/components/atoms/ValidatedInput.tsx` (imports), `src/components/atoms/ValidatedRadioGroup.tsx` (imports + ~50 lines of hand-rolled markup replaced by Radix `RadioGroupItem`), `src/components/atoms/ContinueButton.tsx` (imports + `<button>` swapped for shadcn `Button`), `src/pages/index.astro` (rewritten as inline Astro welcome), `AGENTS.md` (2–3-sentence convention note added under the existing "Component pattern" section).
- **Assets**: the `src/assets/astro.svg` and `src/assets/background.svg` files imported only by `Welcome.astro` become unreferenced and can be removed in a follow-up (out of scope for this change).
- **Behavioural impact on users**: visible change is the welcome page copy/imagery; the form-step screens, validation, progress tracking, and resume logic are unchanged. `ValidatedRadioGroup` loses its custom card-style selected border (`border-[#fe676e] bg-[#fe676e]/5`) and inherits the standard shadcn `RadioGroupItem` selected look — a visual regression that must be reviewed before merge.
- **May add dependencies to `package.json`.** The shadcn `Button` primitive requires `class-variance-authority` and `@radix-ui/react-slot`. Both are likely already present (the project already uses Radix primitives), but task 1.2 verifies and runs `pnpm add` if either is missing. No build, config, or other dependency changes.
