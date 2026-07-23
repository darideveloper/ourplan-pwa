## Context

The validation code screen at `/` includes a `TermsCheckbox` component that links to `/terms`. That page contains generic legal placeholder text written during initial scaffolding. The real terms are hosted at `https://ourlivesapp.com/our-plan-terms-and-conditions/` — same org, same legal framework as the reference project.

## Goals / Non-Goals

**Goals:**
- Point the terms link to the real external URL
- Remove the local placeholder terms page
- Update the spec to reflect the final decision

**Non-Goals:**
- Changing the disclaimer text on the `/` page or summary page
- Adding a redirect layer for `/terms`
- Modifying checkbox validation logic or store

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| External link vs redirect | Direct external link in `href` | Simplest. No stale page to maintain. Bookmarks to `/terms` will 404, but the page was never publicised. |
| Delete vs redirect for terms.astro | Delete | No internal links to `/terms` remain after the href change. A redirect page would need upkeep for zero benefit. |
| Open in same tab vs new tab | Keep `target="_blank"` | External site — user shouldn't lose form state (code input, checkbox). Already implemented correctly. |

## Risks / Trade-offs

- **[Low] Broken bookmarks** → `/terms` will 404. Mitigation: the page was never linked externally; the only link was from the checkbox, which we're updating.
- **[Low] External URL changes** → If OurLens changes their T&C URL, the link breaks silently. Mitigation: single source of truth — one href to update.
