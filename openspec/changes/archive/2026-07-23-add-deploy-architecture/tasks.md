## 1. Foundation

- [x] 1.1 Add `"packageManager": "pnpm@10.18.3"` to `package.json` (after `"version"`, before `"engines"`)

## 2. Docker Assets

- [x] 2.1 Create `.dockerignore` excluding `node_modules`, `dist`, `.git`, `.astro`, `.env*`, `openspec/`, `docs/`, AGENTS.md, README, dev.sh, `.dockerignore`, `Dockerfile`
- [x] 2.2 Create `Dockerfile` — multi-stage build (node:22-alpine build → nginx:alpine serve), `corepack enable` + `pnpm install --frozen-lockfile`, `ARG PUBLIC_N8N_BASE_URL` as sole build arg, `COPY pnpm-workspace.yaml` alongside `package.json` + `pnpm-lock.yaml` for install step, `pnpm build`, copy `dist/` + `nginx.conf` to nginx stage

## 3. Verification

- [x] 3.1 Run `docker build .` and confirm image builds successfully with exit 0
- [x] 3.2 Run `docker run -p 8080:80 <image>` and confirm nginx serves the app and PWA offline page works
