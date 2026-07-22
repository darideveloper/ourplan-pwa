## Context

The project uses Astro 6.4 dev server. The reference project (ourlens) uses a hardcoded port `4321` with `dev.sh` running tmux + cloudflared directly — this works for one project but breaks when multiple Astro projects need to run simultaneously.

The braulio-filoteo project uses `portless` — a global npm tool that runs a local HTTPS proxy daemon. It replaces port numbers with stable `*.localhost` URLs, assigns each project a dynamic port (4000-4999 range), and eliminates port conflicts entirely.

This design combines both tools: portless for local dev (no port conflicts) + Cloudflare Tunnel routing through portless (public URL for webhooks). The tunnel no longer needs to know the static port — it talks to portless which resolves the correct Astro instance by Host header.

```
Cloudflare Edge
    │
    │ ourplan.darideveloper.com
    │
    ▼
cloudflared tunnel run ourplan
    │
    │ service: https://localhost:<portless-port>
    │ httpHostHeader: ourplan.localhost
    │ noTLSVerify: true
    │
    ▼
portless proxy (port 443 default, read from ~/.portless/proxy.port)
    │
    │ routes by Host header
    │
    ▼
Astro dev server (dynamic port 4000-4999)
```

## Goals / Non-Goals

**Goals:**
- Single-command (`./dev.sh`) starts Astro (via portless) + tunnel
- Public URL: `https://ourplan.darideveloper.com` → local dev server through portless
- Local URL: `https://ourplan.localhost` (port 443, default) for direct browser access
- No port conflicts with other Astro projects (ourlens, braulio-filoteo, etc.)
- Graceful tmux session management (re-attach if session exists)
- Astro dev server accepts both tunnel-origin and localhost-origin requests

**Non-Goals:**
- Production tunnel (Docker deployment uses nginx on port 80, tunnel not included in Dockerfile)
- Multi-tunnel or load balancing
- HTTPS cert management (handled by Cloudflare Edge)
- Windows/macOS support (tmux prerequisite constrains to Linux/macOS)

## Decisions

1. **tmux over screen / background processes** — tmux provides session persistence, window separation, and re-attach. Same pattern as ourlens. Alternatives considered: `screen` (less ergonomic), `background &` (no session management), `docker-compose` (over-engineered for dev tunnel).

2. **Temp config over static config** — `dev.sh` generates a temp YAML at runtime instead of committing a tunnel config to the repo. Keeps credentials and tunnel ID out of version control. The config references the credential JSON at an absolute path on the developer's machine.

3. **ourplan.darideveloper.com subdomain** — Follows the convention established by `ourlens.darideveloper.com`. Consistent naming, single DNS zone management.

4. **Portless for dynamic port allocation** — Instead of hardcoding port 4321, Astro runs through `portless ourplan pnpm astro dev`. Portless assigns a dynamic port (4000-4999) and proxies `https://ourplan.localhost` → `localhost:<dynamic>` on port 443 (default HTTPS). This eliminates port conflicts when running multiple projects simultaneously. Portless already injects `--host` for Astro automatically so the explicit flag is unnecessary. Alternatives: `PORT` env var capture (fragile, adds startup race), hardcoded port per project (manual management, still conflicts).

5. **Tunnel routes through portless proxy on port 443** — The tunnel ingress points at `https://localhost:<portless-port>` with `httpHostHeader: ourplan.localhost` and `noTLSVerify: true`. The port is read dynamically from `~/.portless/proxy.port` when set, falling back to 443 (portless default on port 443). Portless resolves the correct Astro instance by Host header. Alternative considered: tunnel pointing directly at Astro's dynamic port (requires port capture and timing logic — fragile).

6. **ALLOWED_HOSTS required in .env, no fallback** — `astro.config.mjs` reads `allowedHosts` from `ALLOWED_HOSTS` env var and falls back to `undefined` (Astro default = localhost only). This forces developers to copy `.env.example` to `.env` and configure it explicitly. The dev.sh headers document this requirement alongside the one-time tunnel setup.

## Risks / Trade-offs

- **Machine-local credential** — The tunnel credential JSON and `cert.pem` live at `~/.cloudflared/`. If the machine is lost or rebuilt, `cloudflared tunnel create` + `cloudflared tunnel route dns` must be re-run. **Mitigation**: Document the one-time setup in the change summary.

- **Portless proxy as single point of failure** — If portless proxy is not running, the tunnel connects to nothing. **Mitigation**: `dev.sh` starts `portless proxy start` in the main script body (before tmux commands), ensuring proxy is running before tunnel window launches.

- **noTLSVerify between cloudflared and portless** — Portless uses a self-signed CA. `noTLSVerify: true` skips certificate validation on this hop. The external TLS termination (client → Cloudflare) remains fully verified. Acceptable for a dev tool.

- **cloudflared version drift** — Outdated versions produce warnings. **Mitigation**: `dev.sh` checks for `cloudflared` presence but not version. Acceptable for a dev tool.
