## Why

OurPlan shares the same stack and parent brand as Ourlens but uses a different visual identity (slate-blue shadcn defaults, hardcoded `#fe676e` accent, Inter font, dark mode support). Applying the Ourlens brand palette makes the two projects visually consistent and reinforces the shared brand.

## What Changes

- Replace the CSS theme (`global.css`): swap shadcn slate-blue defaults for Ourlens brand palette (`brand-500 #dd4d57` red/pink + amber accent, surface/on-surface neutrals)
- Switch font from Inter Variable to system UI stack (matching Ourlens)
- Remove dark mode (`.dark` class support, all `dark:` variants)
- Update meta tag values in `Layout.astro` and `OfflineLayout.astro` (`theme-color` `#fe676e` → `#dd4d57`), add `style="color-scheme: light;"` to `<html>`
- Recolor all interactive elements: ProgressBar, validated inputs/selects/radios/textareas, buttons, loading spinner, decorative blobs
- Convert buttons from flat dark (`bg-slate-900`) to gradient brand style (`from-brand-500 to-brand-600`)
- Remove `@fontsource-variable/inter` dependency
- Leave `dark:` variant classes untouched

## Capabilities

### New Capabilities
- `brand-theme`: Visual identity tokens (colours, fonts, shadows, radii, animations) inherited from Ourlens

### Modified Capabilities
None — no existing specs in this project

## Impact

- `src/styles/global.css` — full theme replacement
- `src/layouts/Layout.astro` — update theme-color value, add `style="color-scheme: light;"`
- `src/layouts/OfflineLayout.astro` — update theme-color value
- 11 React component files — replace hardcoded `#fe676e` with brand tokens, convert button styles
- 4 Astro page/layout files — recolor decorative blobs (index.astro, StepLayout.astro) and focus rings (terms.astro)
- `package.json` — remove Inter font dependency
- No API, routing, store, or behaviour changes
