## ADDED Requirements

### Requirement: One-command dev environment
The project root SHALL contain a `dev.sh` script that starts the Astro dev server (via portless) and a Cloudflare Tunnel to `ourplan.darideveloper.com` in a single tmux session.

#### Scenario: Happy path
- **WHEN** user runs `./dev.sh` with no existing tmux session
- **THEN** a new tmux session is created with two windows: `astro` (running `portless ourplan pnpm astro dev`) and `tunnel` (running `cloudflared tunnel --config <temp> run ourplan`)
- **AND** the second window is selected and user is attached to the session

#### Scenario: Session already exists
- **WHEN** user runs `./dev.sh` and a tmux session for this project already exists
- **THEN** the script attaches to the existing session instead of creating a new one

### Requirement: Prerequisite checks
The `dev.sh` script SHALL verify that all required tools are installed before proceeding.

#### Scenario: Missing tool
- **WHEN** a required tool (tmux, cloudflared, portless) is not installed
- **THEN** the script prints an error message identifying the missing tool and exits with a non-zero status

### Requirement: Portless proxy is running
The `dev.sh` script SHALL verify the portless proxy is running (or auto-start it) before launching the tunnel.

#### Scenario: Portless proxy not running
- **WHEN** portless proxy is not running when `dev.sh` executes
- **THEN** `dev.sh` starts `portless proxy start` in the main script body before creating tmux windows
- **AND** the tunnel window connects to the portless proxy on its configured port

### Requirement: Tunnel routes through portless proxy
The Cloudflare Tunnel SHALL route traffic through the portless proxy instead of directly to Astro's port.

#### Scenario: Tunnel ingress config
- **WHEN** cloudflared receives a request for `ourplan.darideveloper.com`
- **THEN** it forwards to `https://localhost:<portless-port>` (read from `~/.portless/proxy.port`, fallback to 443) with `Host: ourplan.localhost` and TLS verification disabled
- **AND** portless routes the request to the correct Astro instance by Host header

### Requirement: Astro server accepts both hostnames via .env
The Astro dev server SHALL accept requests originating from both `ourplan.darideveloper.com` and `ourplan.localhost`, configured via the `ALLOWED_HOSTS` environment variable. No fallback hardcoded list — `.env` is required.

#### Scenario: Tunnel origin request
- **WHEN** a request arrives at the Astro dev server with `Host: ourplan.darideveloper.com` and `ALLOWED_HOSTS` includes it
- **THEN** the server responds normally (200) instead of rejecting

#### Scenario: Local origin request
- **WHEN** a request arrives at the Astro dev server with `Host: ourplan.localhost` and `ALLOWED_HOSTS` includes it
- **THEN** the server responds normally (200) instead of rejecting

#### Scenario: Missing ALLOWED_HOSTS
- **WHEN** a request arrives from `ourplan.darideveloper.com` and `ALLOWED_HOSTS` is not set
- **THEN** the server rejects the request (403 Forbidden)

### Requirement: Credential and tunnel ID are not in version control
Tunnel credentials, tunnel UUIDs, and Cloudflare account information SHALL NOT be committed to the repository.

#### Scenario: Credential isolation
- **WHEN** a developer inspects `.gitignore` or the committed files
- **THEN** no `.json` credential files, tunnel UUIDs, or Cloudflare account tags appear in the repository

### Requirement: One-time tunnel setup is documented
The `dev.sh` script or a comment in it SHALL reference the prerequisite one-time setup commands.

#### Scenario: Developer reads setup instructions
- **WHEN** a new developer reads `dev.sh` or project documentation
- **THEN** they can find the three one-time commands: `cloudflared tunnel create ourplan`, `cloudflared tunnel route dns ourplan ourplan.darideveloper.com`, and `portless proxy start`
- **AND** they can find instructions to copy `.env.example` to `.env` and set `ALLOWED_HOSTS`
