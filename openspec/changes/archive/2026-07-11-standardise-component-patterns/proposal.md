# Proposal: Standardise Component Patterns

## Why

The React component codebase has accumulated 10 distinct inconsistencies across 28 files — mixed declaration styles, import patterns, store access methods, semicolons, quote styles, `as any` casts, and array index keys. Every new component forces a decision where no convention exists. This spreads inconsistency further and introduces technical debt (hydration mismatches from bypassing `useField`, broken list rendering from `key={idx}`).

## What Changes

- **Declaration style** — standardise all stateful atoms, molecules, and organisms to a single declaration pattern: `function ComponentName({ ... }: Props)`. This matches the shadcn `ui/` layer and needs no React import just for typing.
- **React import** — use `import * as React from "react"` everywhere (matches shadcn convention, avoids namespace/type ambiguity). Components that only need hooks import them directly (`import { useState } from "react"`).
- **Store access** — all validated/stateful atoms MUST use the `useField` hook. Components that need extra fields or complex logic read from the store directly only AFTER confirming `useField` can't cover it. Remove hydration-safety boilerplate from `DisclaimerCheckbox` and `ValidatedCheckboxGroup` (re-implement `useField` manually).
- **Formatting** — remove all semicolons (match the 70% majority). Standardise on double quotes for string literals. Remove stray single-quote imports.
- **Path imports** — use `@/` alias for all cross-directory imports. Fix `DynamicLabelRadioGroup` which uses a relative path (`../atoms/ValidatedRadioGroup`) to cross directories.
- **`key` props** — replace `key={idx}` / `key={i}` with stable identifiers (`option.value`, `person.id`, or field-value key strings).
- **`as any` casts** — replace in `SupportCircleRepeater` (8 instances: `undefined as any` on PersonSchema fields, `as any` on array spreads) and `SummarySubmitButton` (unnecessary `as any` on `useFormStore()`). Use typed casts (`as FormValues["support_circle"]`, explicit `PersonSchema` typed objects) where the store shape is known.
- **`"use client"` directive** — remove the orphan `"use client"` from `ui/label.tsx` (it's a leftover from shadcn init, doesn't belong in Astro).

## Capabilities

### New Capabilities

- `component-standardisation`: Enforce consistent React component patterns (declaration style, imports, store access, formatting, keys, type safety) across all `src/components/` files.

### Modified Capabilities

- `shadcn-atom-wrappers`: The atom wrapper spec already prohibits importing from `ui/*`. This change adds the declaration convention, import convention, and key convention to the same spec.
- `form-screens`: The spec currently describes form screens as Zod + Zustand + atom composition. This change updates it to mandate `useField` for all validated atoms and disallow manual hydration-safety re-implementation.

## Impact

- **Affected files**: ~17 stateful component files across `src/components/atoms/`, `molecules/`, `organisms/`, plus 1 `ui/` file and 2 hook files (`useField.ts`, `useStepGuard.ts`)
- **No breaking API changes** — all components maintain the same props interface. Changes are internal implementation and style only.
- **No runtime behaviour changes** — only hygiene and conformance improvements.
- **No dependency changes** — all dependencies already installed.
