## ADDED Requirements

### Requirement: Service worker is auto-generated at build time

The system SHALL use Workbox via `@vite-pwa/astro` to generate a service worker file (`sw.js`) and Workbox runtime files during `astro build`.

#### Scenario: Build outputs service worker
- **WHEN** `pnpm build` completes
- **THEN** `dist/sw.js` and `dist/workbox-*.js` files exist

### Requirement: Service worker registers with autoUpdate mode

The system SHALL inject a service worker registration script into all pages that registers `sw.js` with `registerType: 'autoUpdate'`.

#### Scenario: Service worker registration
- **WHEN** a user visits any page of the app
- **THEN** the browser registers the service worker and begins pre-caching static assets

#### Scenario: New version auto-activates
- **WHEN** a new version of the service worker is detected
- **THEN** the new SW activates automatically on the next navigation or page refresh without prompting the user

### Requirement: Static assets are pre-cached

The system SHALL pre-cache all build output files matching the pattern `**/*.{js,css,woff2,png,svg,jpg,ico,html}`.

#### Scenario: Assets available offline after first visit
- **WHEN** the user has visited the app once and then goes offline
- **THEN** all static assets (JS, CSS, fonts, images, HTML pages) are served from cache

### Requirement: API requests use NetworkFirst caching

The system SHALL cache API responses matching `/api/.*` using the `NetworkFirst` strategy with a 10-second network timeout.

#### Scenario: API request succeeds online
- **WHEN** the app makes an API request while online
- **THEN** the response comes from the network and is added to cache

#### Scenario: API request fails when offline
- **WHEN** the app makes an API request while offline
- **THEN** the service worker serves the last cached response (if available)

### Requirement: Navigation requests fall back to offline page

The system SHALL serve `/offline` as the navigation fallback when the network is unavailable.

#### Scenario: User navigates to new page while offline
- **WHEN** the user attempts to navigate to a page that is not cached while offline
- **THEN** the service worker serves the `/offline` page instead
