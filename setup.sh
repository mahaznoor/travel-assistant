#!/usr/bin/env bash
# =============================================================================
#  setup.sh  —  Rahbar Smart Travel Companion Agent
#  Usage:  bash setup.sh
#  This script:
#    1. Checks your .env keys
#    2. Creates Python virtual environment
#    3. Installs all dependencies
#    4. Trains the ML model (first time only)
#    5. Starts the FastAPI backend
# =============================================================================
set -e

# ── Colors ────────────────────────────────────────────────────
G="\033[0;32m"; Y="\033[1;33m"; R="\033[0;31m"; B="\033[1;34m"; NC="\033[0m"
info()  { echo -e "${G}[Rahbar]${NC} $1"; }
warn()  { echo -e "${Y}[WARN]${NC}  $1"; }
err()   { echo -e "${R}[ERROR]${NC} $1"; exit 1; }
step()  { echo -e "\n${B}━━━ $1 ━━━${NC}"; }

# ── Banner ────────────────────────────────────────────────────
echo -e "${Y}"
echo "  ██████╗  █████╗ ██╗  ██╗██████╗  █████╗ ██████╗ "
echo "  ██╔══██╗██╔══██╗██║  ██║██╔══██╗██╔══██╗██╔══██╗"
echo "  ██████╔╝███████║███████║██████╔╝███████║██████╔╝"
echo "  ██╔══██╗██╔══██║██╔══██║██╔══██╗██╔══██║██╔══██╗"
echo "  ██║  ██║██║  ██║██║  ██║██████╔╝██║  ██║██║  ██║"
echo "  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝"
echo -e "${NC}"
echo "       🧭 Smart Travel Companion Agent"
echo ""

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# ── Step 0: Check Python ──────────────────────────────────────
step "Checking prerequisites"
command -v python3 >/dev/null 2>&1 || err "Python 3 not found. Install from https://python.org"
info "Python $(python3 --version) found ✅"

# ── Step 1: .env check ────────────────────────────────────────
step "Environment configuration"
if [ ! -f ".env" ]; then
    warn ".env not found — creating from .env.example"
    cp .env.example .env
    echo ""
    echo -e "${Y}  ┌─────────────────────────────────────────────────────────┐${NC}"
    echo -e "${Y}  │  ACTION REQUIRED — Fill in your free API keys in .env   │${NC}"
    echo -e "${Y}  │                                                         │${NC}"
    echo -e "${Y}  │  GEMINI_API_KEY      → https://aistudio.google.com      │${NC}"
    echo -e "${Y}  │  OPENWEATHER_API_KEY → https://openweathermap.org       │${NC}"
    echo -e "${Y}  │  AVIATIONSTACK_API_KEY (optional, 100 req/month)        │${NC}"
    echo -e "${Y}  └─────────────────────────────────────────────────────────┘${NC}"
    echo ""
    read -p "  Press ENTER after filling .env to continue (Ctrl+C to exit)... "
else
    info ".env found ✅"
fi

# ── Step 2: Virtual environment ───────────────────────────────
step "Python virtual environment"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    info "Virtual environment created ✅"
else
    info "Virtual environment exists ✅"
fi
source venv/bin/activate

# ── Step 3: Install dependencies ──────────────────────────────
step "Installing Python packages"
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
info "All packages installed ✅"

# ── Step 4: Train ML model ────────────────────────────────────
step "ML Model"
if [ ! -f "ml/models/model.pkl" ]; then
    info "Training recommendation model (first time, ~30 seconds)..."
    python3 ml/train.py
else
    info "Model already trained ✅  (delete ml/models/model.pkl to retrain)"
fi

# ── Step 5: Start backend ─────────────────────────────────────
step "Starting Rahbar Backend"
echo ""
echo -e "${G}  ╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${G}  ║   🚀 Rahbar backend is starting!                  ║${NC}"
echo -e "${G}  ║                                                   ║${NC}"
echo -e "${G}  ║   Backend  → http://localhost:8000                ║${NC}"
echo -e "${G}  ║   API Docs → http://localhost:8000/docs           ║${NC}"
echo -e "${G}  ║                                                   ║${NC}"
echo -e "${G}  ║   Now start your frontend in a new terminal:      ║${NC}"
echo -e "${G}  ║     cd frontend                                   ║${NC}"
echo -e "${G}  ║     npm install                                   ║${NC}"
echo -e "${G}  ║     npm run dev                                   ║${NC}"
echo -e "${G}  ║                                                   ║${NC}"
echo -e "${G}  ║   Frontend → http://localhost:5173                ║${NC}"
echo -e "${G}  ╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo "  Press Ctrl+C to stop the backend."
echo ""

trap 'echo ""; info "Shutting down Rahbar..."; exit 0' SIGINT SIGTERM
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
