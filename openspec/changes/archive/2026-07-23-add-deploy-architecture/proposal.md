## Why

Ourplan needs containerised deployment — same proven pattern as ourlens. Currently no Dockerfile exists, so deploy is manual/adhoc. Adding multi-stage Docker build lets us ship consistently anywhere (VPS, Fly, Railway, etc.).

## What Changes

- Add `Dockerfile` — multi-stage build: `node:22-alpine` for pnpm install + Astro build, `nginx:alpine` for serving static output
- Add `.dockerignore` — exclude dev/test/ops artifacts from build context
- Add `"packageManager": "pnpm@10.18.3"` to `package.json` so corepack pins version in Docker build
- nginx.conf already exists and is correct — no change needed
- No PWA, routing, or application logic changes

## Capabilities

### New Capabilities

- `docker-deploy`: Containerised build and deployment pipeline — multi-stage Dockerfile, nginx static serving config, build context optimisation

### Modified Capabilities

None — existing capabilities unchanged. This is purely an operational/infra addition.

## Impact

- Affected files: `Dockerfile` (new), `.dockerignore` (new), `package.json` (add `packageManager` field)
- No runtime dependencies added (nginx used only at deploy layer)
- No application code changes — client bundle unchanged
- Build output (`dist/`) structure unchanged — nginx.conf already mirrors what Astro preview serves
