<!-- caveman -->
## Caveman Mode (Always Active)

Speak like smart caveman. All technical substance stay. Only fluff die.

**Default: full.** Switch: `/caveman lite|full|ultra`.
**Disable:** "stop caveman" or "normal mode". Resume: "start caveman".

### Rules

- Drop: articles (a/an/the), filler (just/really/basically/actually/simply), pleasantries, hedging
- Fragments OK. Short synonyms (big not extensive, fix not "implement a solution for")
- Technical terms exact. Code blocks unchanged. Errors quoted exact
- Pattern: `[thing] [action] [reason]. [next step].`
- Code/commits/PRs: write normal (no caveman)
- Auto-clarity: suspend caveman for security warnings, destructive ops, ambiguity risk
<!-- caveman -->

# OurPlan PWA

## Quick start

```sh
pnpm dev        # dev server localhost:4321
pnpm build      # build to dist/
pnpm preview    # preview production build
```

**DON'T USE NPM.** Package manager is **pnpm** only (lockfile: `pnpm-lock.yaml`). Node >=22.12.0.

## Stack

| Layer | Choice |
|---|---|
| Meta-framework | Astro 6.4 |
| UI framework | React islands (via `@astro/react`) |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` plugin) |
| Components | shadcn/ui (Radix Rhea style) + wrapped variants |
| State | Zustand + persist middleware (localStorage) |
| Validation | Zod — per-field or per-step schemas |
| Icons | react-icons (pick one icon set & stay consistent) |
| API docs | context7 for library/API lookups |

All stack packages installed and build-verified.

## Architecture

- **Multi-page routes** — each form step is its own Astro page (`/`, `/step-2`, `/step-3`, `/step-4`, `/summary`)
- **React scope** — only form interactive elements are React islands (with `client:load`). Layout, header, footer, navigation are Astro components.
- **Cross-page state** — Zustand store at `src/store/form.ts` with `persist` middleware writes to localStorage. Each step's React island reads/writes its slice.
- **No backend in this repo** — n8n handles LLM + PDF generation + email. Front-end POSTs to n8n webhook URL, gets PDF URL back.

## Project structure

```
src/
  components/
    atoms/        -- single interactive elements (wrapped shadcn + state)
    molecules/    -- basic combinations of atoms (e.g. radio group + label + dynamic text)
    organisms/    -- complex sections (rarely used; screens live in pages/)
    ui/           -- raw shadcn components (do NOT edit directly)
  store/
    form.ts       -- single Zustand store for all form state
  pages/          -- Astro pages (one per form step)
  layouts/
    Layout.astro  -- app shell (header, footer, nav)
  lib/
    utils.ts      -- cn() helper
  styles/
    global.css    -- Tailwind v4 + shadcn theme
```

## Component pattern

Every interactive element follows this pattern:

1. **Define a Zod schema** for the field's data
2. **Create a Zustand store** (or add to `store/form.ts`) with validation inside the action
3. **Wrap the shadcn component** in a React component that reads/writes its slice of the store
4. **Render in Astro** with `client:load` — no extra React wrapper needed

```tsx
// Example: components/atoms/ValidatedCheckbox.tsx
// Wraps <Checkbox> + <Label> with Zustand + Zod
```

Why? Keeps React islands small and focused. Static content (headings, text, images) stays in Astro — not forced into React just because it's inside a form area.

No file outside `src/components/atoms/*` may import from `src/components/ui/*`; every shadcn primitive is consumed only via its atom wrapper. The `atoms/` folder has two tiers: **presentation wrappers** (e.g. `Input`, `Button`) that re-export a shadcn primitive unchanged, and **stateful atoms** (e.g. `ValidatedInput`, `ContinueButton`) that wrap a presentation wrapper plus a `useField` / store binding. Stateful atoms import from presentation wrappers, never from `ui/*`.

## Component Patterns

Every React component SHALL follow these conventions (established by `standardise-component-patterns` change):

- **Declaration**: Use `export function ComponentName({ ... }: Props)`. Never `export const ComponentName: React.FC<Props>`, bare `export const ComponentName =`, or `React.FC`.
- **React import**: Use `import * as React from "react"` — namespace import, never default import. Named imports (e.g. `useId`) may be added alongside.
- **Store access**: Validated atoms MUST use `useField(field)` from `@/store/useField`. Never re-implement hydration safety manually. Non-validated components (ProgressBar, ContinueButton) MAY use `useFormStore` directly.
- **Semicolons**: None. Omit all trailing semicolons.
- **Quotes**: Double quotes for all string literals (imports, JSX attributes, inline strings).
- **Path aliases**: Use `@/` for cross-directory imports. Same-directory imports MAY use relative paths.
- **Keys**: Stable identifiers (e.g. `key={item.id}`, `key={option.value}`). Never `key={idx}` or `key={i}`.
- **Type safety**: No `as any` casts. Use typed assertions (`as FormValues["field"]`) or inferred types.
- **`"use client"` directive**: Never used in this project (Astro convention, not Next.js).

## Conventions

- **Branch workflow** — create a feature branch for every change; use OpenSpec (`opsx-new` → `opsx-apply` → `opsx-verify` → `opsx-sync-specs` → `opsx-archive`)
- **UK English** (spelling, date format, etc.)
- **shadcn defaults** for layout — brand colors can be tuned later (shadcn `mist` base)
- **Disclaimer** — link to existing terms page + checkbox on summary; no inline legal text
- **No tests or CI** configured yet
- `.gitignore` ignores `openspec/changes/*` (except archive), `docs/`, all hidden dirs (`.*/`)
- **No PWA** in v1 — skipped intentionally

## Reference project

`ourlens.ourlivesapp.com` — same stack (Astro + n8n backend). Reuse patterns from there:
- PWA integration setup
- n8n webhook interaction
- Camera / media handling

## OpenSpec workflow

Change-driven development via `openspec/` + `.opencode/skills/`. Commands (run in opencode chat):

- `opsx-new` — start a new change
- `opsx-apply` — implement tasks from a change
- `opsx-ff` — fast-forward through artifact creation
- `opsx-verify` — validate implementation matches spec
- `opsx-sync-specs` — sync delta specs to main specs (do this BEFORE archiving)
- `opsx-archive` / `opsx-bulk-archive` — archive completed changes
- `opsx-explore` — explore/investigate before starting
