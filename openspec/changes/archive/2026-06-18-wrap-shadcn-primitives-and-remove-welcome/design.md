## Context

The codebase has a documented atomic-design contract (`AGENTS.md:55-67`): interactive React elements are atoms that wrap a shadcn primitive and read/write a slice of the Zustand store. In practice:

- `ValidatedInput.tsx:2-3` imports `Label` and `Input` directly from `@/components/ui/`.
- `ValidatedRadioGroup.tsx:36-90` hand-rolls a `<label><input type="radio" class="sr-only">` + custom dot indicator instead of using the existing shadcn `RadioGroup` and `RadioGroupItem` in `src/components/ui/radio-group.tsx:1-40` (currently 0 importers — dead code).
- `ContinueButton.tsx:22-30` renders a raw `<button>` with hand-rolled Tailwind classes because no shadcn `Button` primitive exists in `ui/`.
- `src/components/Welcome.astro` (210 lines) is the unmodified Astro 6 starter template (Astro logo, "open `src/pages`" copy, Discord link to `astro.build`) and is the entire production landing page at `src/pages/index.astro:2-9`.

The shadcn `RadioGroup` primitive in `ui/` was added without a corresponding atom consumer, so the project has a dead primitive + a hand-rolled replacement. The fix has two halves: (1) add a thin atom wrapper layer that re-exports each shadcn primitive, then rewire the three existing atoms to consume via that layer; (2) delete the starter welcome and replace it with a real OurPlan landing in `index.astro`.

## Goals / Non-Goals

**Goals:**

- One canonical import path for every shadcn primitive: `src/components/atoms/<Name>.tsx`. Files outside `src/components/atoms/*` SHALL NOT import from `src/components/ui/*`.
- Five atom wrappers present and pass-through: `Input`, `Label`, `RadioGroup`, `RadioGroupItem`, `Button`.
- The shadcn `Button` primitive added to `ui/` once (kept untouched thereafter, per the "do NOT edit directly" rule).
- `ValidatedRadioGroup` uses the shadcn `RadioGroup` + `RadioGroupItem` (drops the hand-rolled `<input type="radio" class="sr-only">` block and the custom indicator dot).
- `ContinueButton` uses the shadcn `Button` (drops the raw `<button>` and its hand-rolled Tailwind classes).
- `Welcome.astro` deleted; `index.astro` rewritten as a real OurPlan landing (static Astro).
- `AGENTS.md` gains a 2–3-sentence paragraph codifying the "no `ui/*` imports outside `atoms/*`" rule and the presentation-wrapper / stateful-atom split.

**Non-Goals:**

- No restyling of the shadcn theme tokens, no Tailwind config changes.
- No removal of `src/assets/astro.svg` / `src/assets/background.svg` (stop importing them; physical deletion is a follow-up).
- No change to `StepLayout`, `Layout`, store, schemas, validation, or any form-step content.
- No new shadcn primitives beyond `Button` (Checkbox, Select, Textarea are deferred to the steps that need them).
- No automated lint rule to enforce the wrapper convention (the project has no ESLint config; verification is `rg` only).
- No PWA / service-worker / manifest changes.
- No content design for the welcome copy beyond the placeholder brand + CTA — marketing wording is deferred.

## Decisions

### Decision: Wrappers are pure re-exports, not enhanced components

Each wrapper file (`Input.tsx`, `Label.tsx`, `RadioGroup.tsx`, `RadioGroupItem.tsx`, `Button.tsx`) is a single statement: `export { … } from "@/components/ui/<primitive>";`. No prop extending, no `displayName`, no class merging, no `forwardRef` duplication.

**Why:** Keeps the wrappers trivially auditable (`rg "@/components/ui" src/components/atoms/` returns the 5 files, nothing else). Any visual change or behaviour tweak should happen in the atom that *uses* the wrapper (e.g. `ValidatedInput`, `ContinueButton`), not in the wrapper itself — that is what keeps the rule "no `ui/*` imports outside `atoms/*`" useful: if a non-atom file wants to change button colour, it imports the `Button` atom and overrides via `className`, never touches the primitive.

**Alternatives considered:**

- *Wrapper extends props (e.g. `interface ButtonProps extends React.ComponentProps<typeof Button> {}`)* — adds noise without value; every atom that consumes the wrapper would still need to re-type.
- *Wrapper applies a default `className`* — premature; the brand tokens live in `global.css` already.
- *Wrapper composes a `forwardRef`* — shadcn primitives are already `forwardRef`'d, re-wrapping is double work and creates a second ref chain that confuses form libraries.

### Decision: One file per shadcn export, not one file per shadcn module

`radio-group.tsx` exports both `RadioGroup` and `RadioGroupItem`. These get two atom files (`RadioGroup.tsx`, `RadioGroupItem.tsx`), not one combined `RadioGroup.tsx`.

**Why:** The shadcn module name and the export names diverge; mirroring exports (not modules) makes the rule "import the wrapper whose name matches the primitive" unambiguous. `ValidatedRadioGroup` consumes both via two `import` statements, which is already the Radix idiomatic shape (`RadioGroup.Root` + `RadioGroupItem`).

**Alternative considered:** single `RadioGroup.tsx` re-exporting both — would let `ValidatedRadioGroup` import once, but obscures the wrapper-per-primitive rule and breaks the moment a third export (e.g. `RadioGroupIndicator`) is added.

### Decision: Atom layer has two tiers — presentation wrappers and stateful atoms

The project's `atoms/` folder holds two distinct kinds of atom, and both are legitimate:

- **Presentation wrappers** (`Input`, `Label`, `Button`, `RadioGroup`, `RadioGroupItem`) — pure re-exports of shadcn primitives; no project logic, no state binding.
- **Stateful atoms** (`ValidatedInput`, `ValidatedRadioGroup`, `ContinueButton`, `ProgressBar`, `ResumeRedirect`) — wrap a presentation wrapper (or, historically, a shadcn primitive) plus a `useField` / store binding per the existing pattern.

The `AGENTS.md:40` definition ("wrapped shadcn + state") describes stateful atoms. Presentation wrappers exist because the project enforces "no `ui/*` imports outside `atoms/*`" — without them, stateful atoms would have to import `ui/*` directly. Naming convention: the presentation wrapper takes the shadcn export name verbatim; the stateful atom prefixes or suffixes the shadcn name with the project-specific concern (e.g. `Validated*`, `Continue*`). This split resolves the apparent contradiction in `AGENTS.md:40` and is what future stateful atoms (e.g. `ValidatedCheckbox`, `DisclaimerCheckbox`, `SubmitButton` listed in `form-screens/spec.md:546-551`) will follow — wrap a presentation atom, add a `useField` or store binding, never import from `ui/*`.

### Decision: Add shadcn `Button` to `ui/`, not invent a new primitive

`ContinueButton` currently renders a raw `<button>` because `ui/` has no Button. The fix is to add the standard shadcn `Button` primitive (using `class-variance-authority` for `variant`/`size` and `@radix-ui/react-slot` for `asChild`) and wrap it in `atoms/Button.tsx`.

**Why:** Matches every other shadcn primitive in the project; `cva` is the idiomatic way to expose variants; `Slot` enables `asChild` for composition (relevant for the welcome page CTA, which is an `<a>`).

**Alternatives considered:**

- *Build a hand-rolled `Button` atom without shadcn* — duplicates what shadcn already provides and breaks the wrapper rule (the atom would *be* the primitive).
- *Skip `Button` entirely and keep the raw `<button>` in `ContinueButton`* — leaves the project without a reusable button atom; every future screen (Back, Reset, Download PDF, Submit on summary) would re-introduce the same hand-rolled Tailwind.

### Decision: `ValidatedRadioGroup` adopts shadcn's default indicator, drops the custom card style

The current hand-rolled option rows use a `border-[#fe676e] bg-[#fe676e]/5` selected state with a custom dot indicator. Switching to shadcn `RadioGroupItem` (already in `ui/radio-group.tsx:19-40`) means inheriting shadcn's default `data-checked:bg-primary` selected look.

**Why:** Restoring the "wrapped shadcn" pattern is the whole point; reintroducing custom Tailwind on top of the shadcn primitive would re-create the same problem at a different layer.

**Trade-off accepted:** The pink (`#fe676e`) selected-card visual on `parent_health` and future radio groups is lost. This is a visible regression to the brand styling on step 1. Mitigation: shadcn tokens can be retuned in `global.css` (the `--primary` CSS variable already exists per `AGENTS.md:75` "shadcn defaults — brand colours can be tuned later") so the pink brand colour can flow through `data-checked:bg-primary` once the tokens are wired.

### Decision: `ContinueButton` styling is owned by the `Button` atom, not the call site

Today `ContinueButton.tsx:24` hard-codes `bg-slate-900 hover:bg-slate-800 … focus-visible:ring-[#fe676e]` (slate-900 fill, pink focus ring). After the change `ContinueButton` renders `<Button>` and passes a `variant="default"` plus a `className` override for the pink focus ring (or the theme token handles it).

**Why:** Keeps the dark slate + pink ring visual on the Continue button (the spec is silent on whether the button stays dark or goes brand-coloured) while moving the primitive choice out of the call site.

**Alternative considered:** *Strip all overrides, let `Button`'s default variant render* — would default to a light button on a white card, worse contrast.

### Decision: Welcome is a static Astro page, not a React island

The welcome body is a heading, a paragraph, and a CTA link. None of those need React state, so the welcome stays Astro. `ResumeRedirect` remains the only React island on the page, and it stays a `client:load` island because it must run after hydration to read the persisted store.

**Why:** Follows the documented "static content stays in Astro — not forced into React" principle (`AGENTS.md:69`). Cuts a hydration boundary.

**Alternative considered:** *Replace `ResumeRedirect` with an inline `<script>` in `index.astro`* — possible, but the project has no precedent for inline scripts and `ResumeRedirect` is already working; refactoring it is a separate change.

### Decision: Welcome copy is a placeholder, not finalised

The `<h1>` says "OurPlan" and the subtitle frames the product as a planning tool for an older loved one. The CTA label and subtitle wording are TBD until design lands.

**Why:** The user asked to *remove* the welcome and replace it; the proposal is not the moment to lock marketing copy. The placeholder copy is brand-correct (matches the form-step subtitles' tone) and small enough to swap in a one-line edit.

## Risks / Trade-offs

- **Visual regression on radio groups (Step 1)** — swapping hand-rolled markup for shadcn `RadioGroupItem` loses the pink selected card. → Mitigation: retune `--primary` in `global.css` and ensure the focus/selected state pulls from the brand token. Acceptance check during apply: load `/step1` and confirm the selected radio still reads as the brand colour.

- **Visual regression on Continue button** — `Button`'s default `variant="default"` may not match the current slate-900 + pink ring. → Mitigation: keep the focus ring override via `className` on the `Button` atom; if the default variant is too light, switch to `variant="dark"` (defined in `button.tsx`) instead of re-adding hand-rolled classes.

- **Slot import for `Button` requires `@radix-ui/react-slot`** — shadcn's `Button` uses `Slot` for `asChild`. → Mitigation: check `package.json` during task 1; if absent, add via `pnpm add @radix-ui/react-slot class-variance-authority` (both are small, no transitive surprises).

- **Wrapper rule has no automated enforcement** — without ESLint, drift is possible. → Mitigation: the verification task greps `rg "from ['\"]@/components/ui/" src/` and expects matches only in `components/atoms/`. Add this check to a future lint config as a follow-up.

- **`ResumeRedirect` left as a `client:load` island that renders `null`** — pre-existing inefficiency from the prior audit (Win "Honourable mention" in the audit summary). Not addressed in this change to keep scope tight. → Follow-up change can inline it as an `<script>` in `index.astro`.

- **Welcome copy is generic** — design may want a hero illustration, tagline, or trust signals. → Out of scope; documented as a non-goal. The placeholder card is the smallest valid landing that satisfies the spec.

## Migration Plan

This change is a pure refactor + file deletion, with no data migration and no deploy step beyond a normal `pnpm build` + deploy. Steps in order:

1. **Add shadcn `Button`** at `src/components/ui/button.tsx` (vendored from shadcn docs, not edited). Install missing peer deps (`@radix-ui/react-slot`, `class-variance-authority`) if absent.
2. **Create the five atom wrappers** in `src/components/atoms/`. Each is a single re-export.
3. **Rewire `ValidatedInput`** to import `Input` and `Label` from `@/components/atoms/...`.
4. **Rewire `ValidatedRadioGroup`** to import `Label`, `RadioGroup`, `RadioGroupItem` from `@/components/atoms/...` and replace the hand-rolled option markup with the shadcn primitives.
5. **Rewire `ContinueButton`** to import `Button` from `@/components/atoms/...` and render it instead of the raw `<button>`.
6. **Delete** `src/components/Welcome.astro`.
7. **Rewrite** `src/pages/index.astro` as the inline OurPlan landing.
8. **Update `AGENTS.md`** with the wrapper rule (2–3 sentences under "Component pattern").
9. **Verify**: `pnpm install` (if deps added), `pnpm build`, `pnpm preview`, manually visit `/` and `/step1` to confirm the radio regression is acceptable; grep verification command.

**Rollback:** `git revert` of the change commit. No data migration, no schema change, no API. The two asset files (`astro.svg`, `background.svg`) stay on disk during the change so a revert does not break the import. They can be removed in a follow-up.

## Open Questions

- **Does the welcome page need the same `min-h-screen` + blob-background treatment as the step pages, or should it be a quieter, simpler card?** Recommend: simpler card (`bg-white/80 backdrop-blur-xl rounded-2xl`, no blobs) so the welcome reads as "arrival" and the form steps read as "in-progress". Open for design input.
- **Defer to follow-up**: add the verification grep as a `pnpm lint:ui-imports` script (`rg "from ['\"]@/components/ui/" src/ | rg -v "^src/components/atoms/"`) so future contributors get a fast signal. Not in this change's scope.
