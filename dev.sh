#!/bin/bash
# dev.sh — One-command dev environment for OurPlan
# Prerequisites: tmux, cloudflared, portless (npm i -g portless)
#
# One-time setup (run once per machine):
#   cloudflared tunnel create ourplan
#   cloudflared tunnel route dns ourplan ourplan.darideveloper.com
#   portless proxy start                # Start portless proxy (uses sudo for port 443)
#
# Also copy .env.example to .env and fill in ALLOWED_HOSTS:
#   ALLOWED_HOSTS=localhost,127.0.0.1,ourplan.darideveloper.com,ourplan.localhost
#
# Tmux keybindings:
#   Ctrl+b n  - Next window
#   Ctrl+b p  - Previous window
#   Ctrl+b d  - Detach (keep processes running)

PROJECT_NAME=$(basename "$PWD")
SESSION_NAME="${PROJECT_NAME}_dev"

if tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo "Session $SESSION_NAME already exists. Attaching..."
    tmux attach -t $SESSION_NAME
    exit 0
fi

command -v tmux >/dev/null 2>&1 || { echo "tmux is not installed. Please install it first."; exit 1; }
command -v cloudflared >/dev/null 2>&1 || { echo "cloudflared is not installed. Please install it first."; exit 1; }
command -v portless >/dev/null 2>&1 || { echo "portless is not installed. Install with: npm install -g portless"; exit 1; }

portless proxy start 2>/dev/null || true

PORTLESS_PORT=$(cat ~/.portless/proxy.port 2>/dev/null || echo 443)

if [ "$PORTLESS_PORT" = "443" ]; then
    echo "Access locally: https://ourplan.localhost"
else
    echo "Access locally: https://ourplan.localhost:$PORTLESS_PORT"
fi
echo "Access publicly: https://ourplan.darideveloper.com"
echo ""
echo "Tmux keybindings:"
echo "  Ctrl+b n  - Next window"
echo "  Ctrl+b p  - Previous window"
echo "  Ctrl+b d  - Detach (keep processes running)"

tmux new-session -d -s $SESSION_NAME -n 'astro' -c "$PWD" \
    "bash -c 'portless ourplan pnpm astro dev; read'"

TUNNEL_CONFIG=$(mktemp /tmp/cloudflared-ourplan-XXXXXX.yml)
cat > $TUNNEL_CONFIG << EOF
tunnel: ourplan
credentials-file: $HOME/.cloudflared/cc9da7e7-80c4-4cbe-838d-f4ff603a7283.json
ingress:
  - hostname: ourplan.darideveloper.com
    service: https://localhost:$PORTLESS_PORT
    originRequest:
      httpHostHeader: ourplan.localhost
      noTLSVerify: true
  - service: http_status:404
EOF

echo "Tunnel config: $TUNNEL_CONFIG"
tmux new-window -t $SESSION_NAME -n 'tunnel' -c "$PWD" \
    "bash -c 'cloudflared tunnel --config $TUNNEL_CONFIG run ourplan; read'"

tmux select-window -t $SESSION_NAME:0
tmux attach -t $SESSION_NAME
