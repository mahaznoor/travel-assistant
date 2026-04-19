import os
from dotenv import load_dotenv
load_dotenv()

GEMINI_API_KEY        = os.getenv("GEMINI_API_KEY", "")
OPENWEATHER_API_KEY   = os.getenv("OPENWEATHER_API_KEY", "")
AVIATIONSTACK_API_KEY = os.getenv("AVIATIONSTACK_API_KEY", "")
FRONTEND_URL          = os.getenv("FRONTEND_URL", "http://localhost:5173")

def check_keys():
    missing = [k for k, v in {
        "GEMINI_API_KEY": GEMINI_API_KEY,
        "OPENWEATHER_API_KEY": OPENWEATHER_API_KEY,
    }.items() if not v]
    if missing:
        print(f"⚠️  Missing in .env: {', '.join(missing)}")
        print("   Copy .env.example → .env and fill your keys!\n")
    if not AVIATIONSTACK_API_KEY:
        print("   ℹ️  AVIATIONSTACK_API_KEY not set — demo flight data will be used.")
