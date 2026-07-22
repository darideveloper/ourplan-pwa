## 1. One-time Cloudflare Tunnel Setup

- [x] 1.1 Run `cloudflared tunnel create ourplan` to create the tunnel and generate credential JSON
- [x] 1.2 Run `cloudflared tunnel route dns ourplan ourplan.darideveloper.com` to create the DNS CNAME record
- [x] 1.3 Verify DNS resolves: `dig ourplan.darideveloper.com` returns Cloudflare IPs

## 2. Update Astro Config

- [x] 2.1 Update `astro.config.mjs` — `server.allowedHosts` reads from `ALLOWED_HOSTS` env var, no fallback (falls back to `undefined` = localhost only, forcing .env usage)
- [x] 2.2 Update `.env.example` — add `ALLOWED_HOSTS=localhost,127.0.0.1,ourplan.darideveloper.com,ourplan.localhost`
- [x] 2.3 Verify `portless ourplan pnpm astro dev` starts without errors

## 3. Create dev.sh

- [x] 3.1 Create `dev.sh` at project root — tmux session with project-based name, checks for existing session (re-attach)
- [x] 3.2 Add prerequisite checks for `tmux`, `cloudflared`, and `portless` — exit with error if any missing
- [x] 3.3 In main script body (before tmux commands), ensure portless proxy is running: `portless proxy start 2>/dev/null || true`
- [x] 3.4 Read portless proxy port dynamically: `PORTLESS_PORT=$(cat ~/.portless/proxy.port 2>/dev/null || echo 443)`
- [x] 3.5 Add Astro dev window — `portless ourplan pnpm astro dev` in a tmux window named `astro`
- [x] 3.6 Generate tunnel temp config YAML — tunnel `ourplan`, credential JSON path, ingress pointing at `https://localhost:$PORTLESS_PORT` with `httpHostHeader: ourplan.localhost` and `noTLSVerify: true`
- [x] 3.7 Add tunnel window — `cloudflared tunnel --config <tempfile> run ourplan` in a tmux window named `tunnel`
- [x] 3.8 Select astro window and attach — `tmux select-window -t <session>:0` then `tmux attach`
- [x] 3.9 Add prerequisite docs in dev.sh comments (one-time setup commands including `portless proxy start`, .env setup instructions, tmux keybindings)
- [x] 3.10 Make `dev.sh` executable with `chmod +x dev.sh`

## 4. Verify End-to-End

- [x] 4.1 Start `./dev.sh` and confirm both tmux windows start without errors
- [x] 4.2 Access `https://ourplan.localhost` in browser (no port suffix, port 443 default) — page loads from portless proxy
- [x] 4.3 Access `https://ourplan.darideveloper.com` in browser — page loads via Cloudflare Tunnel through portless
- [x] 4.4 Detach and re-attach to verify session persistence
- [x] 4.5 Verify no credential files or tunnel UUIDs are tracked by git: `git status`
- [x] 4.6 Run another portless project simultaneously (e.g. ourlens) and confirm no port conflicts
