#!/usr/bin/env bash
# Idempotent Ubuntu 22/24 bootstrap for the qanda.online VPS.
# Installs Docker Engine + compose plugin, Nginx, and certbot; ensures swap on
# small boxes; opens the firewall. Safe to run repeatedly.
#
#   sudo bash deploy/setup-server.sh
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Please run as root (sudo bash deploy/setup-server.sh)" >&2
  exit 1
fi

log() { printf '\n\033[1;32m→ %s\033[0m\n' "$*"; }

export DEBIAN_FRONTEND=noninteractive

log "Updating apt and installing base packages"
apt-get update -y
apt-get install -y ca-certificates curl gnupg git ufw

# ── Docker Engine + compose plugin (official convenience script) ──────────
if ! command -v docker >/dev/null 2>&1; then
  log "Installing Docker Engine (get.docker.com)"
  curl -fsSL https://get.docker.com | sh
else
  log "Docker already installed: $(docker --version)"
fi

# get.docker.com bundles the compose plugin; ensure it is present anyway.
if ! docker compose version >/dev/null 2>&1; then
  log "Installing docker-compose-plugin"
  apt-get install -y docker-compose-plugin
else
  log "docker compose already available: $(docker compose version | head -n1)"
fi

systemctl enable --now docker >/dev/null 2>&1 || true

# ── Nginx ─────────────────────────────────────────────────────────────────
if ! command -v nginx >/dev/null 2>&1; then
  log "Installing Nginx"
  apt-get install -y nginx
else
  log "Nginx already installed: $(nginx -v 2>&1)"
fi
systemctl enable --now nginx >/dev/null 2>&1 || true

# ── certbot + nginx plugin ────────────────────────────────────────────────
if ! command -v certbot >/dev/null 2>&1; then
  log "Installing certbot + python3-certbot-nginx"
  apt-get install -y certbot python3-certbot-nginx
else
  log "certbot already installed: $(certbot --version 2>&1)"
fi

# ── Swap (only if total RAM < 2GB and no swap yet) ────────────────────────
mem_kb="$(awk '/MemTotal/ {print $2}' /proc/meminfo)"
swap_kb="$(awk '/SwapTotal/ {print $2}' /proc/meminfo)"
if [[ "${mem_kb}" -lt 2000000 && "${swap_kb}" -lt 1000 && ! -f /swapfile ]]; then
  log "RAM < 2GB and no swap — creating a 2G swapfile"
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  if ! grep -q '^/swapfile' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' >>/etc/fstab
  fi
else
  log "Swap not needed (RAM $((mem_kb / 1024))MB, swap $((swap_kb / 1024))MB) — skipping"
fi

# ── Firewall (only if ufw is present) ─────────────────────────────────────
if command -v ufw >/dev/null 2>&1; then
  log "Configuring ufw (OpenSSH, 80, 443)"
  ufw allow OpenSSH || ufw allow 22/tcp || true
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
  ufw --force enable || true
fi

# ── App directory ─────────────────────────────────────────────────────────
log "Ensuring /opt/qanda exists"
mkdir -p /opt/qanda

cat <<'NEXT'

╭──────────────────────────────────────────────────────────────────────────╮
│  Server bootstrap complete. NEXT STEPS:                                    │
│                                                                            │
│  1) Point DNS A-records at this VPS:                                       │
│       qanda.online · www.qanda.online · staging.qanda.online → <VPS IP>    │
│                                                                            │
│  2) Clone the repo:                                                        │
│       git clone <repo-url> /opt/qanda && cd /opt/qanda                     │
│                                                                            │
│  3) Create runtime env files from the examples and fill secrets:           │
│       cp deploy/.env.prod.example    deploy/.env.prod                       │
│       cp deploy/.env.staging.example deploy/.env.staging                    │
│       # set Supabase URL/keys, service-role key, ANON_SECRET               │
│       export $(grep -v '^#' deploy/.env.prod | xargs)  # for build args    │
│                                                                            │
│  4) Build + start both containers:                                         │
│       docker compose build app-prod && docker compose up -d                │
│                                                                            │
│  5) Install Nginx site + TLS:                                              │
│       cp deploy/nginx/qanda.conf /etc/nginx/sites-available/qanda.conf      │
│       ln -sf /etc/nginx/sites-available/qanda.conf \                        │
│              /etc/nginx/sites-enabled/qanda.conf                            │
│       nginx -t && systemctl reload nginx                                    │
│       certbot --nginx -d qanda.online -d www.qanda.online \                 │
│               -d staging.qanda.online                                       │
│                                                                            │
│  Full runbook: DEPLOY.md                                                    │
╰──────────────────────────────────────────────────────────────────────────╯
NEXT
