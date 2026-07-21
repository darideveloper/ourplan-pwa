## 1. Shared Infrastructure

- [x] 1.0 Copy all image assets from `/mnt/hd/develop/astro/ourlens/public/` to `public/` — rename `ourlens-logo.png` to `ourplan-logo.png` (also copy `favicon.ico`, `favicon.svg`, and the entire `icons/` directory)
- [x] 1.1 Create `src/lib/api/client.ts` with `FetchError` class and `safeFetch<T>` wrapper
- [x] 1.2 Create `src/lib/api/types.ts` with `ValidateCodeResponse` type
- [x] 1.3 Create `src/lib/api/validate-code.ts` — POST code to n8n `/validate`
- [x] 1.4 Create `src/components/ui/checkbox.tsx` — shadcn checkbox primitive (Radix)
- [x] 1.5 Create `src/components/atoms/Checkbox.tsx` — presentation wrapper re-exporting checkbox
- [x] 1.6 Create `src/env.d.ts` — declare `interface ImportMetaEnv { readonly PUBLIC_N8N_BASE_URL: string }`
- [x] 1.7 Create `.env.example` — document `PUBLIC_N8N_BASE_URL` with a placeholder

## 2. Session Store

- [x] 2.1 Create `src/store/session.ts` — Zustand store with persist, `validateCodeAction`, hydration safety, Zod schemas for session fields
- [x] 2.2 Create `src/store/useFieldSession.ts` — `useField`-like hook bound to session store with Zod field schemas

## 3. Atoms

- [x] 3.1 Create `src/components/atoms/CodeInput.tsx` — `useFieldSession` + `Input` presentation wrapper + error span
- [x] 3.2 Create `src/components/atoms/TermsCheckbox.tsx` — `useFieldSession` + `Checkbox` + `Label` + error span
- [x] 3.3 Create `src/components/atoms/VerifyButton.tsx` — reads session store, checks field errors before API call, calls `validateCodeAction`, spinner while loading
- [x] 3.4 Create `src/components/atoms/ApiError.tsx` — standalone island reading `apiError` from session store, renders `<p role="alert">`

## 4. Route Guard

- [x] 4.1 Create `src/components/molecules/AuthGuard.tsx` — checks session, overlays `<LoadingOverlay>` during hydration, redirects via `window.location.replace('/')` if invalid, renders children (never conditionally unmounts children)
- [x] 4.2 Modify `src/layouts/StepLayout.astro` — add `<AuthGuard client:load>` wrapping main content

## 5. Validation Gate Page

- [x] 5.1 Modify `src/pages/index.astro` — replace content with brand header (logo `public/ourplan-logo.png` + "OurPlan" heading), code input, terms checkbox, disclaimer (static HTML), verify button, API error display
- [x] 5.2 Add `<ApiError client:load />` to `index.astro` — renders when `apiError` is non-null

## 5b. Terms page

- [x] 5b.1 Create `src/pages/terms.astro` — minimal terms page (content TBD, placeholder structure) so the terms checkbox has a valid link target

## 6. Redirect Migration

- [x] 6.1 Modify `src/pages/step1.astro` — add `<ResumeRedirect client:load>` (moved from current index)

## 7. Verify

- [x] 7.1 Run `pnpm build` — confirm zero errors
