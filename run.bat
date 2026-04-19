@echo off
REM =============================================================================
REM  run.bat  —  Rahbar Smart Travel Companion Agent (Windows)
REM  Double-click this file OR run from Command Prompt
REM =============================================================================
title Rahbar – Smart Travel Companion

echo.
echo   ██████╗  █████╗ ██╗  ██╗██████╗  █████╗ ██████╗
echo   ██╔══██╗██╔══██╗██║  ██║██╔══██╗██╔══██╗██╔══██╗
echo   ██████╔╝███████║███████║██████╔╝███████║██████╔╝
echo   ██╔══██╗██╔══██║██╔══██║██╔══██╗██╔══██║██╔══██╗
echo   ██║  ██║██║  ██║██║  ██║██████╔╝██║  ██║██║  ██║
echo   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
echo.
echo        Smart Travel Companion Agent
echo.

REM ── Check Python ─────────────────────────────────────────────
python --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo [ERROR] Python not found. Download from https://python.org
    pause & exit /b 1
)
echo [OK] Python found

REM ── Check .env ───────────────────────────────────────────────
IF NOT EXIST ".env" (
    echo.
    echo [WARN] .env not found — creating from .env.example
    copy .env.example .env >nul
    echo.
    echo  ┌──────────────────────────────────────────────────────────┐
    echo  │  ACTION REQUIRED — Fill in your free API keys in .env    │
    echo  │                                                          │
    echo  │  GEMINI_API_KEY      ^→  https://aistudio.google.com     │
    echo  │  OPENWEATHER_API_KEY ^→  https://openweathermap.org      │
    echo  │  AVIATIONSTACK_API_KEY  (optional)                       │
    echo  └──────────────────────────────────────────────────────────┘
    echo.
    echo  Open .env in Notepad, fill your keys, then press any key...
    pause >nul
) ELSE (
    echo [OK] .env found
)

REM ── Virtual environment ───────────────────────────────────────
echo.
echo [1/4] Setting up Python virtual environment...
IF NOT EXIST "venv\" (
    python -m venv venv
    echo [OK] Virtual environment created
) ELSE (
    echo [OK] Virtual environment exists
)
CALL venv\Scripts\activate.bat

REM ── Install dependencies ──────────────────────────────────────
echo.
echo [2/4] Installing Python packages...
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
echo [OK] Packages installed

REM ── Train ML model ────────────────────────────────────────────
echo.
echo [3/4] ML Model...
IF NOT EXIST "ml\models\model.pkl" (
    echo Training recommendation model (first time, ~30 seconds)...
    python ml\train.py
    echo [OK] Model trained
) ELSE (
    echo [OK] Model already trained — skipping
)

REM ── Start backend ─────────────────────────────────────────────
echo.
echo [4/4] Starting Rahbar backend...
start "Rahbar Backend" cmd /k "venv\Scripts\activate && uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 /nobreak >nul

REM ── Done ─────────────────────────────────────────────────────
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║  Rahbar backend started in a separate window!       ║
echo  ║                                                     ║
echo  ║  Backend  →  http://localhost:8000                  ║
echo  ║  API Docs →  http://localhost:8000/docs             ║
echo  ║                                                     ║
echo  ║  Now start your frontend (new cmd window):          ║
echo  ║    cd frontend                                      ║
echo  ║    npm install                                      ║
echo  ║    npm run dev                                      ║
echo  ║                                                     ║
echo  ║  Frontend → http://localhost:5173                   ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
pause
