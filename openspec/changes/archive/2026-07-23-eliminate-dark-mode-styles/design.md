## Context

The project is light-only by design (per `brand-theme/spec.md`). However, Tailwind CSS v4's built-in `dark:` variant uses `@media (prefers-color-scheme: dark)` which activates on devices with OS-level dark mode. The existing spec only bans `.dark` class usage and `@custom-variant dark` — it doesn't address Tailwind's built-in media query variant.

The bug manifests visually on Step 4 where `SupportCircleRepeater` cards and `ValidatedSelect` inputs have explicit `dark:` classes (e.g. `dark:bg-zinc-900/50`, `dark:bg-zinc-950`) that turn dark in dark mode. The shadcn `ui/*` components also have `dark:aria-invalid:*` classes for error states, though these are minor.

## Goals / Non-Goals

**Goals:**
- Eliminate all `dark:` style activation across the entire app
- Keep the codebase explicit — remove `dark:` classes from Step 4 components that are now dead code
- Tighten the `brand-theme` spec to cover the built-in `dark:` variant

**Non-Goals:**
- Adding dark mode toggle (we are explicitly removing dark mode)
- Changing functional behavior of any component
- Editing shadcn `ui/*` files (the global override makes their `dark:` classes harmless)

## Decisions

1. **Global override over per-file removal-only**: Using `@custom-variant dark (&:where(.no-dark-mode))` in `global.css` overrides Tailwind v4's built-in `dark` variant to never match. This is the single-point fix that kills all `dark:` classes everywhere — including inside shadcn `ui/*` files we don't edit. Per-file `dark:` removal is a secondary cleanup.

2. **Dual approach (Fix A + Fix B)**: The global override alone would make `dark:` classes dead code but leave them as noise. Removing them from Step 4 components cleans up the specific files where the bug was visible. Together they provide defence-in-depth: if someone adds a new `dark:` class in the future, it won't activate.

3. **Variant override semantics**: `@custom-variant dark (&:where(.no-dark-mode))` uses Tailwind v4's override mechanism. The built-in `dark` variant is replaced with one that matches elements with class `.no-dark-mode`. Since this class never exists, `dark:` never activates.

## Risks / Trade-offs

- **Tailwind upgrade risk**: Future Tailwind v4 releases could change how built-in variant overriding works. Mitigation: this is a documented Tailwind v4 feature (`@custom-variant`), not a hack.
- **Global scope**: The override affects the entire app, not just Step 4. This is intentional but means any code expecting `dark:` to work will silently break. Mitigation: the spec explicitly requires light-only mode.
