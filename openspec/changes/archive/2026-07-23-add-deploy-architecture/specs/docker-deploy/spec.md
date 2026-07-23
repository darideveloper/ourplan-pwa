## ADDED Requirements

### Requirement: Multi-stage Docker build
The system SHALL produce a production Docker image via multi-stage build.

#### Scenario: Build image succeeds
- **WHEN** user runs `docker build .` from project root
- **THEN** build completes with exit code 0 and produces an image tagged `ourplan-pwa:latest` (default)

#### Scenario: Build fails on lockfile mismatch
- **WHEN** `pnpm-lock.yaml` does not match `package.json` dependencies
- **THEN** docker build fails at `pnpm install --frozen-lockfile` step with non-zero exit

### Requirement: Build-time environment variables
The Dockerfile SHALL accept `PUBLIC_*` build args and make them available during Astro build.

#### Scenario: PUBLIC_N8N_BASE_URL substitution
- **WHEN** user builds with `--build-arg PUBLIC_N8N_BASE_URL=https://example.com/webhook`
- **THEN** Astro substitutes `import.meta.env.PUBLIC_N8N_BASE_URL` with the provided value in the static build output

### Requirement: Static file serving with nginx
The runtime image SHALL serve build output via nginx with cache-control headers matching the existing `nginx.conf`.

#### Scenario: Hashed assets cached immutably
- **WHEN** client requests `/_astro/*.js` or `/_astro/*.css`
- **THEN** response includes `Cache-Control: public, max-age=31536000, immutable`

#### Scenario: Service worker not cached
- **WHEN** client requests `/sw.js` or `/workbox-*.js`
- **THEN** response includes `Cache-Control: no-cache, no-store, must-revalidate`

#### Scenario: HTML routes not cached
- **WHEN** client requests any HTML route
- **THEN** response includes `Cache-Control: no-cache`

#### Scenario: PWA offline fallback
- **WHEN** client requests a path that returns 404
- **THEN** nginx serves `/offline/index.html`

### Requirement: Build context optimisation
The `.dockerignore` file SHALL exclude unnecessary files from the Docker build context.

#### Scenario: node_modules excluded
- **WHEN** `docker build` runs
- **THEN** `node_modules/` directory is not sent to the Docker daemon

#### Scenario: Development artifacts excluded
- **WHEN** `docker build` runs
- **THEN** `.git/`, `.astro/`, `dist/`, `openspec/`, `.env`, AGENTS.md, dev.sh, test artifacts, and docs are not sent to the Docker daemon

### Requirement: pnpm-workspace.yaml present during install
The Dockerfile SHALL copy `pnpm-workspace.yaml` alongside `package.json` and `pnpm-lock.yaml` so pnpm reads `allowBuilds` settings during dependency install.

#### Scenario: Build uses workspace config
- **WHEN** `docker build` runs the install step
- **THEN** `pnpm-workspace.yaml` is present in the working directory and pnpm enforces `allowBuilds` restrictions

### Requirement: Corepack pnpm version pinning
The `package.json` SHALL declare a `packageManager` field specifying the exact pnpm version.

#### Scenario: Version declared
- **WHEN** `package.json` is read
- **THEN** it SHALL contain `"packageManager": "pnpm@10.18.3"` (matching `pnpm-lock.yaml` and ourlens convention)

#### Scenario: Docker uses pinned version
- **WHEN** Docker build runs `corepack enable && corepack prepare`
- **THEN** corepack downloads and activates the exact pnpm version specified in `packageManager`
