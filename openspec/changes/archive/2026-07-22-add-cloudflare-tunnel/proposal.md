## Why

The project needs a one-command dev environment that exposes localhost publicly via Cloudflare Tunnel for testing webhook integrations (n8n), mobile access, and sharing work-in-progress with stakeholders. Additionally, running multiple Astro projects simultaneously on fixed ports causes port conflicts — portless solves this by assigning each project a dynamic port with a stable `*.localhost` URL.

## What Changes

- Add `dev.sh` using tmux to run Astro dev server (via portless) + Cloudflare Tunnel side-by-side
- Cloudflare Tunnel routes through portless proxy (dynamic port read from `~/.portless/proxy.port`) with Host header override, decoupling tunnel from static ports
- Update `astro.config.mjs` to add `server.allowedHosts` reading from `ALLOWED_HOSTS` env var (required, no fallback — always use .env)
- Add `ALLOWED_HOSTS` to `.env.example` for documentation
- Subdomain: `ourplan.darideveloper.com`
- No changes to production build, Dockerfile, or nginx config

## Capabilities

### New Capabilities
- `cloudflare-tunnel-dev`: One-command tmux-based dev environment with portless (dynamic port, no conflicts) and Cloudflare Tunnel for `ourplan.darideveloper.com`

### Modified Capabilities
None — pure dev-tooling addition, no spec-level behaviour changes

## Impact

- **New file:** `dev.sh` in project root
- **Modified file:** `astro.config.mjs` — add `server.allowedHosts` for both hostnames
- **Modified file:** `.env.example` — add `ALLOWED_HOSTS` reference
- **External:** Requires `cloudflared tunnel create ourplan` + DNS route + `portless proxy start` to be run once on this machine
- **Dependencies:** `tmux`, `cloudflared`, `portless` (npm global)
