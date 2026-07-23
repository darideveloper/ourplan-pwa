## Why

Dark mode styles leak into the light-only app. On Step 4, person card backgrounds and select inputs turn dark on devices with OS-level dark mode preference, violating the existing "Dark mode removed" requirement in `brand-theme/spec.md`. The root cause: Tailwind CSS v4's built-in `dark:` variant activates via `@media (prefers-color-scheme: dark)` regardless of the `color-scheme: light` meta tag.

## What Changes

- Override Tailwind v4's built-in `dark` variant to never match, killing all `dark:` classes globally
- Remove all `dark:` Tailwind classes from Step 4 components (redundant after global override, but keeps the codebase clean and explicit)
- Update the `brand-theme` spec: replace the old prohibition of `@custom-variant dark` with a requirement to USE it as the override mechanism

## Capabilities

### New Capabilities
*(none)*

### Modified Capabilities
- `brand-theme`: The existing "Dark mode removed" requirement SHALL be changed: instead of prohibiting `@custom-variant dark`, the system SHALL USE `@custom-variant dark (&:where(.no-dark-mode))` to override the built-in `@media (prefers-color-scheme: dark)` variant

## Impact

- `src/styles/global.css` — add `@custom-variant dark (&:where(.no-dark-mode))` after the `@import "tailwindcss"` line
- `src/components/atoms/ValidatedSelect.tsx` — remove `dark:bg-zinc-950 dark:border-zinc-800`
- `src/components/molecules/SupportCircleRepeater.tsx` — remove `dark:bg-zinc-900/50`, `dark:text-zinc-100`, `dark:hover:bg-red-950/30`, `dark:hover:bg-zinc-800`
- `src/components/organisms/Step4Form.tsx` — remove `dark:text-zinc-400`
- `openspec/specs/brand-theme/spec.md` — tighten dark mode requirement
