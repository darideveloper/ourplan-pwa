## Why

The app currently has no access gate — anyone can land on step pages directly. Users need invitation codes to access the planning tool, matching the reference project (Ourlens) pattern. An invitation code validation screen at `/` serves as the entry point, with an API backend verifying codes via n8n.

## What Changes

- Replace `/` (index.astro) welcome page with an invitation code validation gate
- Copy logo assets from ourlens `public/` to `public/` (rename `ourlens-logo.png` to `ourplan-logo.png`, copy `favicon.*` and `icons/`)
- Add `src/store/session.ts` — Zustand store for session/access state with localStorage persist
- Add `src/lib/api/client.ts` — fetch wrapper (`safeFetch`, `FetchError`) reusable across the project
- Add `src/lib/api/validate-code.ts` — POST code to n8n `/validate` endpoint
- Add `src/components/ui/checkbox.tsx` — shadcn checkbox primitive (new dependency)
- Add `src/components/atoms/Checkbox.tsx` — presentation wrapper for checkbox
- Add `src/components/atoms/CodeInput.tsx` — validated code input field with Zod schema
- Add `src/components/atoms/TermsCheckbox.tsx` — validated terms acceptance checkbox with Zod schema
- Add `src/components/atoms/VerifyButton.tsx` — submit button wired to session store, checks field errors before API call
- Add `src/components/atoms/ApiError.tsx` — standalone React island displaying API-level validation errors
- Add `src/components/molecules/AuthGuard.tsx` — route guard redirects to `/` if session invalid
- Add `src/store/useFieldSession.ts` — `useField`-like hook for session store fields
- Modify `src/layouts/StepLayout.astro` — add `<AuthGuard client:load>` inside layout (overlay pattern, no conditional children)
- Modify `src/pages/step1.astro` — add `ResumeRedirect` (moved from index)

## Capabilities

### New Capabilities
- `access-validation`: Invitation code entry, terms acceptance, API validation, error display at `/`
- `session-auth`: Session state management with localStorage persist and hydration safety
- `api-client`: Typed fetch wrapper with error classes and retry logic for n8n API calls
- `route-guard`: AuthGuard component protecting all form step routes

### Modified Capabilities

N/A — no existing specs to modify.

## Impact

- `src/pages/index.astro` — complete replacement of content
- `src/layouts/StepLayout.astro` — adds `<AuthGuard client:load>` wrapper
- `src/pages/step1.astro` — adds `<ResumeRedirect client:load>` (moved from index)
- No changes to existing `src/store/form.ts`, `src/store/useField.ts`, `src/components/ui/*`, or `src/styles/global.css`
- New env var required: `PUBLIC_N8N_BASE_URL` (same pattern as Ourlens)
