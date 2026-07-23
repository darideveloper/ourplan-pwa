## Context

The project currently has zero PWA infrastructure. The reference project (ourlens) has a proven, working PWA setup using `@vite-pwa/astro` that we replicate here. This is a greenfield addition — no existing PWA code to modify or migrate.

The app is a multi-page form wizard. Most users will access it on mobile, making installability and offline resilience important for completion rates. The AGENTS.md already calls out "Reference project: ourlens ... Reuse patterns from there: PWA integration setup."

## Goals / Non-Goals

**Goals:**
- App is installable on Android (Chrome) and iOS (Safari) via web manifest + meta tags
- Auto-generated Workbox service worker with pre-caching of static assets
- Runtime caching for API calls (NetworkFirst strategy, 10s timeout)
- Offline fallback page for navigation when network unavailable
- Full PWA icon set: standard, maskable (Android adaptive), and Apple touch
- Production nginx config: caching headers, security headers, default SPA routing
- `autoUpdate` registration mode — new version loads automatically
- Page `<title>` updated from "Astro Basics" to "OurPlan"

**Non-Goals:**
- Custom service worker logic — use Workbox defaults
- Background sync, push notifications, or periodic sync
- iOS install banner component (ourlens has `IosInstallBanner` but it's not a core PWA requirement)
- OfflineIndicator React component (nice UX but not required for PWA spec compliance)
- Complex caching strategies — NetworkFirst for /api/* is sufficient
- Custom favicon generation — existing `favicon.svg` and `favicon.ico` are already present in `public/`

## Decisions

### 1. Use `@vite-pwa/astro` (not manual SW or `vite-plugin-pwa` directly)

`@vite-pwa/astro` wraps `vite-plugin-pwa` with Astro-specific defaults (SSR-safe SW registration injection, Astro asset discovery). It is the same integration used in ourlens and is the official Astro PWA integration.

**Alternatives considered:**
- Manual `workbox-build` — more control but boilerplate; no benefit for our static caching needs
- `@vitejs/plugin-pwa` wrapper — unnecessary indirection

### 2. `registerType: 'autoUpdate'` (not `prompt`)

The app is a simple form. There is no UI state that could be lost during a SW update. `autoUpdate` means the new version takes over immediately on navigation or refresh — no user prompt needed.

### 3. `display: 'standalone'` with `orientation: 'portrait'`

Standalone gives a full-screen, app-like experience. Portrait is the natural orientation for a form wizard.

### 4. Pre-cache glob pattern: `**/*.{js,css,woff2,png,svg,jpg,ico,html}`

Matches all static build output. Same as ourlens. We exclude source maps and other unnecessary files by design — Workbox `globPatterns` only runs on `dist/` after build.

### 5. `start_url: '/?source=pwa'`

Tracks whether a session originated from PWA launch vs browser. Useful for analytics, though `?source=pwa` is a query parameter that can be ignored by the server.

### 6. Theme colour: `#fe676e`

The project uses this red/coral colour throughout the UI (e.g., StepLayout blob decorations). The manifest theme_color and `<meta name="theme-color">` must match this exact hex value.

### 7. Background colour: `#ffffff`

The shadcn mist theme sets `--background: oklch(1 0 0)` which is pure white (`#ffffff`). The manifest `background_color` must match so the PWA splash screen transitions seamlessly into the loaded app. Unlike ourlens (which uses `#fffffe` for its off-white surface colour), ourplan's background is pure white.

### 8. No `.env` dependency for PWA config

All PWA config values are hardcoded in `astro.config.mjs` — no environment variables needed. This keeps the build deterministic.

### 9. Workbox hoisting via `.npmrc`

`public-hoist-pattern[]=workbox-*` is required because Workbox expects all its sub-packages to be at the top level of `node_modules` during build. Without this, the SW generation fails.

### 10. `@vite-pwa/astro` as regular dependency, `@vite-pwa/assets-generator` as dev dependency

Matches ourlens convention. The PWA integration is imported in `astro.config.mjs` which is a source file, not a build-time-only concern in the same sense as the icon generator. `@vite-pwa/assets-generator` is only invoked via the `generate-pwa-assets` script and has no runtime presence.

### 11. Nginx includes security headers and default SPA route location

Beyond the PWA-specific caching blocks, the nginx config must include:
- **Security headers** (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`) on every response — same set as ourlens.
- **Default `location /` block** with `try_files $uri $uri/index.html =404` and `Cache-Control: no-cache` — required for Astro multi-page routing support.
- **`access_log off`** on hashed static asset blocks to reduce log volume in production.
- **`try_files $uri =404`** inside the `/_astro/` location to prevent fall-through to the default handler.

### 12. Exclude `vite-pwa-assets-generator.config.ts` from TypeScript

The assets generator config uses a Node runtime API (`@vite-pwa/assets-generator/config`) that is not a TypeScript module. Without exclusion, `tsc` or `astro check` would fail on this file. Both ourlens and this project use `exclude` in `tsconfig.json`.

### 13. Page `<title>` updated

The current `Layout.astro` has `<title>Astro Basics</title>` left from the framework scaffold. The PWA meta tags and `apple-mobile-web-app-title` both say "OurPlan", so the HTML title must match. Updated to "OurPlan — Estate Planning Made Simple".

### 14. Existing favicons reused, not regenerated

`public/favicon.svg` and `public/favicon.ico` already exist and are referenced in `Layout.astro`. They are not regenerated by `@vite-pwa/assets-generator` — the generator only produces the PWA icon set (`public/icons/`). This avoids unnecessary churn on existing assets.

## Risks / Trade-offs

- **[Cache staleness for API responses]** — `NetworkFirst` with 10s timeout means stale API data may be served if network is slow but not fully offline. Mitigation: low-risk since the app POSTs form data to n8n and the PDF URL is returned fresh each time.
- **[SW update race condition]** — `autoUpdate` means the new SW activates on next page navigation. If the user is mid-form, state is persisted to Zustand+localStorage and survives the reload. Low risk.
- **[Icons require manual regeneration]** — If the logo changes, `pnpm generate-pwa-assets` must be re-run. Mitigation: documented in the script and README.
- **[nginx config must be maintained alongside deployment]** — The full nginx config (PWA caching + security headers + SPA routing) must be deployed alongside the static files. If using a PaaS or CDN, equivalent headers and routing rules must be configured separately. Mitigation: config is version-controlled; switching platform requires replicating the same rules in the new platform's DSL.
