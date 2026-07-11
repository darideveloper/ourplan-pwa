# Design: Standardise Component Patterns

## Context

The project has 28 React components across 4 directories (atoms, molecules, organisms, ui). An audit revealed 10 distinct inconsistencies:

| Inconsistency | State |
|---|---|
| Declaration style | `React.FC` (11), `function` (4), bare `const` (2) |
| React import | 3 patterns: default, namespace, specific |
| Store access | `useField` (3), direct `useFormStore` (9), mix |
| Semicolons | 8 files have them, 20 don't |
| Quotes | Single quotes (5 files), double quotes (23 files) |
| Path imports | `@/` alias (26), relative paths (2) |
| `key={idx}` | Index keys (2), stable keys (3) |
| `as any` casts | Present (2), absent (15) |
| `"use client"` | Present (1), absent (27) |
| Props interface export | Exported (1), private (all others) |

No ESLint or Prettier is configured. The project relies on `astro/tsconfigs/strict` for type enforcement only.

The `ui/` layer (shadcn) is internally consistent: all use `function` declarations, `import * as React`, no semicolons, double quotes. This is the vendor code pattern — not to be edited.

## Goals / Non-Goals

**Goals:**
- Establish a single convention for each category so every new component is a copy-paste template, not a decision
- Align stateful atoms with the shadcn `ui/` layer where the convention makes sense (declaration, imports, formatting)
- Remove the hydration-safety duplication in `DisclaimerCheckbox` and `ValidatedCheckboxGroup` by routing all validated atoms through `useField`
- Remove typescript escape hatches (`as any`, `key={idx}`)
- Remove orphan artifacts (`"use client"`, relative imports)

**Non-Goals:**
- Not adding ESLint, Prettier, or any automated formatter
- Not changing runtime behaviour or component props interfaces
- Not refactoring component architecture (atoms-vs-molecules boundaries stay)
- Not editing `ui/` files beyond removing the orphan `"use client"`
- Not changing the `useField` hook's API
- Not adding tests

## Decisions

### Decision 1: Declaration style — `function ComponentName(props: Props)`

```
BEFORE (11 files):
  export const ValidatedInput: React.FC<ValidatedInputProps> = ({ field, label, ... }) => { ... }

AFTER:
  export function ValidatedInput({ field, label, ... }: ValidatedInputProps) { ... }
```

**Why:** Matches the shadcn `ui/` pattern across all 6 files. Eliminates the need to `import React` just for the `React.FC` type annotation. Works cleanly with TypeScript strict mode for return type inference. Better stack trace names (`function ValidatedInput` vs `const`).

**Alternatives considered:**
- Standardising on `React.FC` (the current majority): rejected because it creates an import divergence from the `ui/` layer and requires `import React` for the type alone.
- Bare arrow `const X = () =>` (used by ProgressBar, ResumeRedirect): rejected because it has no return type checking. `React.FC` at least enforced `ReactNode`, but `function` with strict TS catches return type issues just as well.

### Decision 2: React import — `import * as React from "react"`

```
BEFORE (split):
  import React from "react"
  import * as React from "react"
  import { useEffect } from "react"

AFTER (all non-re-export components):
  import * as React from "react"
```

**Why:** Matches the shadcn `ui/` layer. `import * as React` is unambiguous — all React API usage is prefixed `React.`, making it clear which imports come from React vs the project. When a component only needs one or two hooks, direct imports (`import { useState } from "react"`) are fine — but those can be added alongside the namespace import.

**Exception:** Re-export atoms (`Button.tsx`, `Input.tsx`, `Label.tsx`, `RadioGroup.tsx`, `RadioGroupItem.tsx`) have no React import at all — they stay as-is since they're single-line re-exports.

**Alternatives considered:**
- `import React from "react"` (default import): works fine, but is semantically a namespace import in practice, and `import * as` makes that explicit.
- Direct named imports only (`import { useState } from "react"`): cleaner for small components but inconsistent with the shadcn layer and `React.ReactNode`, `React.ComponentProps` usage.

### Decision 3: Store access — `useField` for all validated atoms

```
BEFORE (DisclaimerCheckbox, ValidatedCheckboxGroup):
  const value = useFormStore(state => state[field]) as boolean
  const error = useFormStore(state => state.errors[field])
  const setField = useFormStore(state => state.setField)
  // ... bypasses useField entirely, no hydration guard

AFTER:
  const { value, error, setValue, mounted } = useField(field)
```

**Why:** `DisclaimerCheckbox` and `ValidatedCheckboxGroup` bypass `useField` and read the Zustand store directly. While they don't have an active hydration bug for default-valued fields (`disclaimer_agreed` defaults to `false` on both SSR and client), bypassing `useField` means they miss out on the hydration-safety fallback (`initialState` before mount) that protects against any future scenario where store defaults diverge from SSR. `useField` centralises this guard — every validated atom should use it for consistency and future safety.

**Non-validated atoms** (ProgressBar, ResumeRedirect, ContinueButton) read from the store directly — this is intentional since they don't have field-level validation and don't need hydration guards.

### Decision 4: Semicolons — remove all

```
BEFORE: mixed (8 files with, 20 without)
AFTER: none
```

**Why:** 70% majority already omits them. The shadcn layer omits them. TypeScript strict mode makes ASI (automatic semicolon insertion) safe.

### Decision 5: Quotes — double quotes everywhere

```
BEFORE: mixed single (5 files) and double (23 files)
AFTER: double quotes
```

**Why:** 82% majority already uses double quotes. The shadcn layer uses double quotes. This is a cosmetic consistency fix.

### Decision 6: Path imports — `@/` alias for all cross-directory imports

```
BEFORE (DynamicLabelRadioGroup):
  import { ValidatedRadioGroup } from '../atoms/ValidatedRadioGroup'

AFTER:
  import { ValidatedRadioGroup } from '@/components/atoms/ValidatedRadioGroup'
```

**Why:** The `@/` alias (`src/`) is the convention for every other import in the project. `DynamicLabelRadioGroup` (in `molecules/`) uses `../atoms/ValidatedRadioGroup` instead of `@/components/atoms/ValidatedRadioGroup` — the only cross-directory relative import. Same-directory imports (e.g. `GlobalLoader` → `./LoadingOverlay` within `molecules/`) stay relative.

### Decision 7: Keys — stable identifiers, not array indices

```
BEFORE:
  {people.map((person, idx) => <PersonCard key={idx} ... />)}
  {sections.map((section, i) => <Section key={i} ... />)}

AFTER:
  {people.map((person, idx) => <PersonCard key={person.helper_name + idx} ... />)}
  {sections.map((section, i) => <Section key={section.title} ... />)}
```

**Why:** `key={idx}` causes React reconciliation bugs when list order changes — components don't unmount/remount correctly, internal state leaks. `SummaryReviewCard` uses `key={i}` for sections (these are static, so low risk but still bad practice). `SupportCircleRepeater` uses `key={idx}` for a dynamic repeater (real risk — removing a person causes index shifts).

**Resolution:** For sections (static order), use `section.title` as key. For support circle, use `helper_name + idx` (since names aren't guaranteed unique in a list, but `name + index` is). For checkbox/radio groups, already correct (`key={option.value}`).

### Decision 8: `as any` — typed casts or explicit type assertions

```
BEFORE:
  setValue([...people, newPerson] as any)
  const state = useFormStore() as any

AFTER:
  setValue([...people, newPerson] as FormValues["support_circle"])
```
Or for complex cases where the store shape is known:
```ts
interface SupportCircleItem {
  helper_name: string
  // ...
}
setValue([...people, newPerson] as SupportCircleItem[])
```

**Why:** `as any` bypasses TypeScript entirely — undetected errors don't surface until runtime. In `SupportCircleRepeater`, the arrays are known to match the Zod schema's shape. In `SummarySubmitButton`, `useFormStore() as any` is used to get the entire store — this is valid because `useFormStore` without a selector returns the full state, so the cast is unnecessary.

### Decision 9: `"use client"` — remove orphan

```
BEFORE (ui/label.tsx only):
  "use client"
  import * as React from "react"

AFTER:
  import * as React from "react"
```

**Why:** The `"use client"` directive is a Next.js convention for server component boundaries. In Astro, all React components in `.tsx` files are automatically client-side via `client:load` directives in `.astro` files. The directive does nothing in this project and was likely included by the shadcn CLI during init. Only `label.tsx` has it — the other 5 `ui/` files don't.

### Decision 10: Props interface — keep private

No change. The one exported interface (`LoadingOverlayProps`) stays exported (it's reasonable for a loading overlay to be consumable with typed props from outside the component). All other props interfaces stay file-private.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| No automated enforcement — drift will re-accumulate over time | Document conventions in `AGENTS.md` under a "Component Patterns" section. Future PRs reviewed manually. |
| Bulk editing 17 files could introduce merge conflicts with in-progress feature branches | Schedule this after other PRs merge. No architectural changes, so conflicts are import-level only. |
| Removing `as any` from `SupportCircleRepeater` may reveal type errors | Test all form steps after the change. The Zod schemas should make types correct already. |
| Changing `key={idx}` to stable keys could unmount/re-mount components differently | Verify that list manipulation (add/remove person in support circle) still works correctly post-change. |
| `useField` doesn't expose `useFormStore`'s `setField` directly | `useField` exports `setValue` which wraps `setField` — already verified. `DisclaimerCheckbox` and `ValidatedCheckboxGroup` use `setField(field, value)` directly; `useField`'s `setValue(value)` provides the same behaviour since the field is pre-bound. |

## Open Questions

- None. All decisions resolved by current audit + existing conventions.
