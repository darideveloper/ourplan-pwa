## Context

Two components display terms-conditions agreement checkboxes across the user journey:

- `TermsCheckbox` (first screen, `index.astro`) — has a link but points to an old URL
- `DisclaimerCheckbox` (last screen, `summary.astro`) — has no link at all; "Terms & Disclaimer" is plain text

Both need to point users to `https://www.ourlivesapp.com/terms-conditions/`. This is a pure client-side UI change — no store, schema, validation, or backend impact.

## Goals / Non-Goals

**Goals:**
- Update the ToS URL in `TermsCheckbox` to the correct target
- Add a clickable hyperlink for "Terms & Disclaimer" in `DisclaimerCheckbox`, matching the existing styling pattern from `TermsCheckbox`

**Non-Goals:**
- No new components, state, validation, or schemas
- No backend or API changes
- No changes to the store (`form.ts`, `session.ts`)
- No i18n or dynamic URL loading

## Decisions

1. **Reuse existing link pattern from `TermsCheckbox`** — same `target="_blank"`, `rel="noopener noreferrer"`, `underline text-primary hover:text-primary/80`, and `stopPropagation` to prevent checkbox toggle when clicking the link. Consistency > novelty.

2. **Use `{" "}` spacing before the link** — matches the JSX whitespace pattern already used in `TermsCheckbox` to avoid awkward spacing between "the" and the link text.

3. **Keep "Terms & Disclaimer" as link label** — matches the checkbox's own label text. The user-facing text stays the same; only the interaction model changes (text → link).

## Risks / Trade-offs

- **Risk: Link opens in new tab, user might not return** → Mitigation: standard external-link UX; the summary page has a "Generate Plan" submit button that requires the checkbox, so users naturally return.
- **Risk: URL changes again in future** → Mitigation: trivial one-line change in each component; no config or env-var overhead warranted for a single static link.
