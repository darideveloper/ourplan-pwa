## Context

OurPlan currently uses shadcn's default slate-blue colour theme with hardcoded `#fe676e` accent, Inter Variable font, and dark mode support. The sibling project Ourlens uses a custom brand palette (red/pink hue 20 + amber hue 78) with system font stack and light-only mode. Both projects share the same stack (Astro + React + Tailwind v4 + shadcn) so the branding gap is purely cosmetic.

The goal is to replace OurPlan's visual identity with Ourlens's while keeping shadcn compatibility.

## Goals / Non-Goals

**Goals:**
- Apply Ourlens colour palette (brand-500 `#dd4d57`, accent amber, surface/on-surface neutrals) to OurPlan
- Switch from Inter Variable to system UI font stack
- Remove all dark mode support (`.dark` class, `dark:` variants, `@custom-variant dark`)
- Update `Layout.astro` with proper meta tags (theme-color, description, PWA tags, apple-touch-icon)
- Replace all hardcoded `#fe676e` with brand-500 tokens across 11+ components
- Convert buttons from flat dark to gradient brand style

**Non-Goals:**
- PWA setup (handled separately)
- Logo/icon/favicon changes (keep current)
- ProgressBar layout/structure changes (recolour only)
- Removing unused sidebar/chart CSS variables (leave in place)
- Changing form behaviour, store, or routing

## Decisions

### 1. Theme Architecture — Hybrid approach

Unlike Ourlens (which strips all Tailwind defaults with `--color-*: initial`), OurPlan needs to keep both default Tailwind colours AND add brand tokens, because shadcn components reference utility classes indirectly and some defaults (slate, red, zinc) are used for error states, borders, and utility purposes.

Approach:
- **`@theme inline` block**: Add brand/accent/surface colour tokens so `bg-brand-500`, `text-brand-500`, `ring-brand-500/40` etc. work as utilities
- **`:root` block**: Override shadcn CSS variables (`--primary`, `--background`, `--foreground`, `--ring`, etc.) to point at brand palette values
- Keep default Tailwind palette intact — brand tokens are additive
- Remove the `.dark` block entirely

### 2. Colour Token Mapping

| shadcn CSS Var | Ourlens Token | OKLCH Value |
|---|---|---|
| `--background` | `--color-surface` | `#fffffe` |
| `--foreground` | `--color-on-surface` | `oklch(0.15 0.01 260)` |
| `--primary` | `--color-brand-500` | `oklch(0.62 0.18 20)` |
| `--primary-foreground` | white | `oklch(1 0 0)` |
| `--ring` | `--color-brand-500 / 0.4` | `oklch(0.62 0.18 20 / 0.4)` |
| `--muted` | `--color-surface-alt` | `oklch(0.97 0.005 260)` |
| `--muted-foreground` | `--color-on-surface-muted` | `oklch(0.45 0.01 260)` |
| `--border` / `--input` | subtle border | `oklch(0.925 0.005 214.3)` |
| `--accent` | `--color-surface-alt` | `oklch(0.97 0.005 260)` |
| `--accent-foreground` | `--color-on-surface` | `oklch(0.15 0.01 260)` |
| `--destructive` | `--color-danger-500` | `oklch(0.55 0.24 25)` |
| `--card` / `--popover` | `--color-surface` | `#fffffe` |
| `--card-foreground` / `--popover-foreground` | `--color-on-surface` | `oklch(0.15 0.01 260)` |

### 3. Gradient Button Style

Ourlens uses `bg-gradient-to-r from-brand-500 to-brand-600` as its primary button style. OurPlan buttons (`bg-slate-900`) will be replaced with this gradient pattern.

```
// Before
bg-slate-900 hover:bg-slate-800 text-white focus-visible:ring-[#fe676e]

// After
bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white focus-visible:ring-brand-500/40
```

The `shadcn/ui` button's `default` variant (`bg-primary text-primary-foreground shadow hover:bg-primary/90`) will automatically pick up the brand-500 colour via the overridden `--primary` CSS var, so no shadcn source edits are needed.

### 4. Font Stack

```
// Before (global.css)
--font-sans: 'Inter Variable', sans-serif;
@import "@fontsource-variable/inter";

// After
--font-sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
--font-heading: var(--font-sans);
```

Remove `@fontsource-variable/inter` from `package.json` dependencies.

### 5. Layout Meta Tags

Most meta tags already exist in `Layout.astro` (theme-color, description, mobile-web-app-capable, apple-mobile-web-app-status-bar-style, apple-touch-icon). Only value updates and one addition needed:

- **`Layout.astro`**: Change `theme-color` from `#fe676e` to `#dd4d57`, add `style="color-scheme: light;"` to `<html>`
- **`OfflineLayout.astro`**: Change `theme-color` from `#fe676e` to `#dd4d57`

## Risks / Trade-offs

- **[Low] Dark-mode dead code**: All `dark:` variant classes in shadcn sources will never fire. Since the user chose "ignore dark variants", these remain as dead CSS. Zero runtime impact.
- **[Low] Brand colour divergence**: `#fe676e` appears in the favicon SVG but is not used as a design token elsewhere. The favicon is kept as-is, so it won't match brand-500 exactly — acceptable per user decision.
- **[Low] shadcn nuance**: Some shadcn sub-components reference colours not overridden here (e.g., chart colours, sidebar colours). These won't look right if ever used, but are currently unused per user decision.
