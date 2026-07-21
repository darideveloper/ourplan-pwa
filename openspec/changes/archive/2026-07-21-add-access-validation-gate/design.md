## Context

The app has a multi-step Astro form with Zustand state management but no access control — any visitor can navigate to `/step1` directly. The reference project (Ourlens) gates access behind an invitation code validation screen at `/`. We need to replicate this pattern while adhering to Ourplan's existing conventions: Zod-per-field validation, per-field React islands, Astro for static content, presentation wrapper atom hierarchy.

## Goals / Non-Goals

**Goals:**
- Replace the `/` homepage with an invitation code validation gate
- Accept invitation code → validate via n8n API → store valid session in localStorage → redirect to `/step1`
- Enforce session validity across all form step pages via AuthGuard
- Match Ourplan's existing component patterns (Zod, useField, presentation wrappers, React convention: `export const` + JSX in `.tsx` with semicolons and double quotes; plain `.ts` may skip semicolons)
- Keep the session store separate from the existing form store

**Non-Goals:**
- No PWA changes
- No changes to existing form steps or form store
- No offline access support for the validation gate
- No admin/invitation-code management UI

## Decisions

### Decision 1: Separate session store (`src/store/session.ts`)
Session state (code, terms, isValid) is an **access concern**, not form data. Mixing it into `src/store/form.ts` would conflate two distinct concerns. A separate store with `persist` middleware follows the reference project pattern and keeps the codebase modular.

### Decision 2: Per-field islands (not monolithic CodeForm)
Matching Ourplan's existing step-page pattern, each interactive element is its own `client:load` React island. Four islands on `/`:
- `CodeInput` — text input with Zod `.min(1)` validation
- `TermsCheckbox` — checkbox with Zod `z.boolean().refine(val => val === true)` validation
- `ApiError` — standalone `<p role="alert">` reading `apiError` from session store
- `VerifyButton` — submit button reading session store, calling API

These interact via the shared session store (same pattern as form store + ContinueButton).

### Decision 3: `useFieldSession` hook (mirrors `useField`)
The existing `useField` in `src/store/useField.ts` is hard-wired to `src/store/form.ts`. Rather than modifying the original to accept a generic store, create `src/store/useFieldSession.ts` that follows the same hydration-safety pattern but reads from the session store. This keeps the existing `useField` untouched and keeps both field-binding hooks co-located in `src/store/`.

Session-field Zod schemas are defined in `src/store/session.ts` alongside the store and imported by `useFieldSession` — same pattern as `form.ts` + `useField`.

### Decision 4: AuthGuard in StepLayout, not per-page
Every step page already uses `StepLayout.astro`. Adding `<AuthGuard client:load>` there protects ALL step pages with one change. AuthGuard and StepGuard are orthogonal and can compose naturally without interfering.

**Overlay pattern (not conditional children)**: AuthGuard does NOT conditionally render children (which would unmount/remount nested React islands). Instead it renders children always and overlays a `<LoadingOverlay>` when `isValid: null` (hydration). When `isValid` flips to `false`, it redirects via `window.location.replace('/')` — this navigates away and replaces the history entry to prevent back-button loops. When `isValid: true`, no overlay, children render normally.

### Decision 5: `safeFetch` + `FetchError` in `src/lib/api/client.ts`
The existing project has no API client. The reference project's `safeFetch` with exponential backoff retry and typed `FetchError` is a proven pattern. Creating it now makes it reusable for the summary page's n8n submission later.

### Decision 6: New shadcn checkbox dependency chain
Ourplan has no checkbox component. Creating `TermsCheckbox` requires:
1. `src/components/ui/checkbox.tsx` — new shadcn checkbox primitive (Radix-based)
2. `src/components/atoms/Checkbox.tsx` — presentation wrapper (one-line re-export)
3. `src/components/atoms/TermsCheckbox.tsx` — stateful atom using `useFieldSession`

This follows the same `ui/` → presentation wrapper → stateful atom hierarchy used by all existing form elements.

### Decision 7: VerifyButton checks local Zod errors before API call
Unlike `ContinueButton` which calls `advanceStep()` (runs step-level Zod validation), `VerifyButton` calls an async API. Before enabling submission, it must check that `codeInput` and `termsChecked` have no local Zod errors in the session store. This prevents submission when field validation is actively showing errors, and keeps the UX consistent with step-page behavior.

`validateCodeAction` handles the redirect internally (matching the store-action-owned flow): on `{ valid: true }`, it sets `isValid: true` and `window.location.href = '/step1'`. VerifyButton only reads `isValidating` to disable itself until the action finishes.

### Decision 8: ApiError as standalone atom
The API error display is a small React island (`<p role="alert">`) that reads `apiError` from the session store. Making it a component at `src/components/atoms/ApiError.tsx` keeps it independently `client:load`-able, matching the per-field island pattern. The store field is named `apiError` (not `error`) to distinguish it from per-field Zod `errors`.

## Risks / Trade-offs

- [Risk] **Four `client:load` islands on `/`** → Multiple React hydration instances on a single page. Mitigation: each island is small and these are independent; no shared DOM state.
- [Risk] **`useFieldSession` diverges from `useField`** → Two hydration patterns to maintain. Mitigation: they share the same logic; if `useField` is ever generalised, `useFieldSession` can be deprecated.
- [Risk] **AuthGuard in StepLayout delays rendering** → Every step page must wait for session hydration before the content is revealed. Mitigation: `<LoadingOverlay>` during hydration (reuse existing component in `molecules/LoadingOverlay.tsx`).
- [Risk] **No dummy/dev mode** → Developers need n8n URL to test. Mitigation: the store can return mock state or the n8n URL can point to a simple mock endpoint in dev.
- [Risk] **No env declaration or `.env.example`** → `PUBLIC_N8N_BASE_URL` needs `src/env.d.ts` and `.env.example` for type safety and developer setup.
- [Risk] **Persisted session never expires** → `isValid: true` stored in localStorage never invalidates. Mitigation: v1 limitation; future versions can add token expiry or re-validation.
