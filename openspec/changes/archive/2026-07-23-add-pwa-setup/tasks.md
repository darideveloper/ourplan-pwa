## 1. Dependencies and package setup

- [x] 1.1 Install `@vite-pwa/astro` as dependency and `@vite-pwa/assets-generator` as dev dependency
- [x] 1.2 Add `public-hoist-pattern[]=workbox-*` to `.npmrc`
- [x] 1.3 Add `generate-pwa-assets` script to `package.json` using `pwa-assets-generator`

## 2. Astro PWA configuration

- [x] 2.1 Import and add `vitePwa` integration to `astro.config.mjs`
- [x] 2.2 Configure manifest: name "OurPlan", short_name "OurPlan", description "Estate planning made simple", display "standalone", orientation "portrait", start_url "/?source=pwa", theme_color "#fe676e", background_color "#ffffff"
- [x] 2.3 Configure icons array with standard (192, 512), maskable (192, 512 with purpose: maskable), all type image/png
- [x] 2.4 Configure Workbox: registerType "autoUpdate", globPatterns for static assets, runtime caching for /api/* with NetworkFirst 10s timeout, navigateFallback "/offline/"

## 3. PWA meta tags in Layout.astro

- [x] 3.1 Add `<meta name="theme-color" content="#fe676e">` to `<head>`
- [x] 3.2 Add `<meta name="mobile-web-app-capable" content="yes">` for legacy iOS support
- [x] 3.3 Add `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
- [x] 3.4 Add `<meta name="apple-mobile-web-app-title" content="OurPlan">`
- [x] 3.5 Add `viewport-fit=cover` to existing viewport meta tag
- [x] 3.6 Add `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">`
- [x] 3.7 Add `style="touch-action: manipulation"` to `<body>`
- [x] 3.8 Add `<meta name="description" content="Estate planning made simple">` to `<head>`
- [x] 3.9 Update `<title>` from "Astro Basics" to "OurPlan — Estate Planning Made Simple"

## 4. Offline fallback page

- [x] 4.1 Create `src/layouts/OfflineLayout.astro` — minimal HTML shell with `theme-color` meta, `viewport-fit=cover` in viewport, `touch-action: manipulation` on `<body>`, and description meta; no React islands, no navigation bar
- [x] 4.2 Create `src/pages/offline.astro` — displays "You're Offline" message with a "Try Again" button that calls `window.location.reload()`

## 5. PWA icons

- [x] 5.1 Create `vite-pwa-assets-generator.config.ts` — define sizes (192, 512 transparent; 192, 512 maskable with 0.3 padding; 180 apple), source image `public/ourplan-logo.png`
- [x] 5.2 Ensure source logo exists at `public/ourplan-logo.png` (already present — verify)
- [x] 5.3 Add `"vite-pwa-assets-generator.config.ts"` to the `exclude` array in `tsconfig.json` (prevents TypeScript compilation errors on the Node-only config file)
- [x] 5.4 Run `pnpm generate-pwa-assets` to generate all icon variants in `public/icons/`

## 6. Nginx configuration

- [x] 6.1 Create `nginx.conf` — root `/usr/share/nginx/html`, gzip enabled with `application/manifest+json` included, security headers on every response (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`)
- [x] 6.2 Add SW/workbox location block: `Cache-Control: no-cache, no-store, must-revalidate` for `sw.js` and `workbox-*.js`
- [x] 6.3 Add manifest location block: `Cache-Control: no-cache` with explicit `Content-Type: application/manifest+json` for `manifest.webmanifest`
- [x] 6.4 Add hashed assets location block: `Cache-Control: public, max-age=31536000, immutable` for `/_astro/` (`try_files $uri =404`, `access_log off`)
- [x] 6.5 Add static media location for `.ico,.gif,.jpe?g,.png,.woff2?,.svg,.webp`: `Cache-Control: public, max-age=31536000, immutable`, `access_log off`
- [x] 6.6 Add default `location /` block: `try_files $uri $uri/index.html =404`, `Cache-Control: no-cache`
- [x] 6.7 Add `error_page 404 /offline/index.html` for offline navigation fallback

## 7. Verification

- [x] 7.1 Run `pnpm build` — verify `dist/sw.js` and `dist/workbox-*.js` are generated
- [x] 7.2 Verify `dist/manifest.webmanifest` exists and includes all required fields
- [x] 7.3 Verify all icon files exist in `dist/icons/`
- [x] 7.4 Verify offline page is built at `dist/offline/index.html`
