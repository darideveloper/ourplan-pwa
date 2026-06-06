# OurPlan PWA

## Quick start

```sh
pnpm dev        # dev server localhost:4321
pnpm build      # build to dist/
pnpm preview    # preview production build
```

Package manager is **pnpm** (lockfile: `pnpm-lock.yaml`). Node >=22.12.0.

## Stack

| Layer | Choice |
|---|---|
| Meta-framework | Astro 6.4 |
| UI framework | React islands (via `@astro/react`) |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` plugin) |
| Components | shadcn/ui (Radix Rhea style, `@/components/ui/*`) |
| State | Zustand + persist middleware (localStorage) |
| Validation | Zod — per-step schemas |
| Icons | react-icons |

All stack packages installed and build-verified.

## Architecture

- **Multi-page routes** — each form step is its own Astro page (`/`, `/step-2`, `/step-3`, `/step-4`, `/summary`)
- **React scope** — only form interactive elements are React islands. Layout, header, footer, navigation are Astro components.
- **Cross-page state** — Zustand store with `persist` middleware writes to localStorage. Each step's React island reads/writes its slice.
- **No backend in this repo** — n8n handles LLM + PDF generation + email. Front-end POSTs to n8n webhook URL, gets PDF URL back.

## Config

- Path alias `@/*` → `./src/*` (tsconfig.json + Astro convention)
- shadcn components: `npx shadcn add <component>` installs to `@/components/ui/`
- CSS entry: `src/styles/global.css` (Tailwind v4 import + shadcn theme)
- Brand theme: shadcn `mist` base, tunable later

## OpenSpec workflow

Change-driven development via `openspec/` + `.opencode/skills/`. Commands (run in opencode chat):

- `opsx-new` — start a new change
- `opsx-apply` — implement tasks from a change
- `opsx-ff` — fast-forward through artifact creation
- `opsx-verify` — validate implementation matches spec
- `opsx-archive` / `opsx-bulk-archive` — archive completed changes
- `opsx-explore` — explore/investigate before starting

## Conventions

- UK English (spelling, date format, etc.)
- shadcn defaults for layout — brand colors can be tuned later
- Disclaimer: link to existing terms page + checkbox on summary — no inline legal text
- No tests or CI configured yet
- `.gitignore` ignores `openspec/changes/*` (except archive), `docs/`, all hidden dirs (`.*/`)
