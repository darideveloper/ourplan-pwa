## Why

The app currently runs only as a standard web page — it cannot be installed on a device home screen, has no offline support, and lacks the native-like experience that our reference project (ourlens) already provides. Adding PWA capabilities is a prerequisite for real user adoption, especially on mobile where most users will access the form.

## What Changes

- Add `@vite-pwa/astro` integration with auto-generated Workbox service worker
- Add `@vite-pwa/assets-generator` as dev dependency for icon generation
- Configure web manifest (name, icons, theme colour, display mode, orientation)
- Add `public-hoist-pattern[]=workbox-*` to `.npmrc`
- Add PWA meta tags to `Layout.astro` (theme-color, apple-mobile-web-app, viewport-fit)
- Add `apple-touch-icon` link and favicon references
- Update page `<title>` from "Astro Basics" to "OurPlan"
- Create offline fallback page at `/offline` (with viewport-fit=cover, theme-colour, touch-action)
- Generate PWA icons from a source logo (192, 512, maskable variants, apple-touch-icon)
- Configure nginx: PWA caching, security headers, default SPA routing, offline 404 fallback
- Add `generate-pwa-assets` npm script
- Exclude `vite-pwa-assets-generator.config.ts` from TypeScript compilation

## Capabilities

### New Capabilities

- `pwa-manifest`: Installable web app manifest with name, icons, theme colour, display mode, orientation
- `service-worker`: Auto-generated Workbox service worker with pre-caching, runtime caching for API calls, and offline navigation fallback
- `pwa-meta-tags`: PWA meta tags in the HTML head (theme-color, apple-mobile-web-app-capable, apple-mobile-web-app-status-bar-style, apple-mobile-web-app-title, viewport-fit=cover, apple-touch-icon)
- `offline-fallback`: Dedicated offline page served when the network is unavailable
- `pwa-icons`: Full PWA icon set (standard, maskable, and Apple touch), generated from a source logo

### Modified Capabilities

_None — no existing spec-level behaviour changes._

## Impact

- **Dependencies**: Add `@vite-pwa/astro` (^1.2.0), `@vite-pwa/assets-generator` (^1.0.2, devDep)
- **Configuration**: `astro.config.mjs` (PWA integration + manifest + workbox), `.npmrc` (workbox hoisting), `tsconfig.json` (exclude assets-generator config)
- **Layout**: `src/layouts/Layout.astro` (meta tags, icons, page title)
- **New page**: `src/pages/offline.astro`
- **New layout**: `src/layouts/OfflineLayout.astro`
- **New config**: `vite-pwa-assets-generator.config.ts`
- **New icons**: `public/icons/` (generated), `public/ourplan-logo.png` (source)
- **New scripts**: `package.json` scripts `generate-pwa-assets`
- **Nginx**: `nginx.conf` (SW/manifest/asset caching, security headers, default SPA routing, offline 404 fallback)
