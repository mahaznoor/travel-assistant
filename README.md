# 🧭 Rahbar — Smart Travel Companion Agent
> **One command. Full stack. AI-powered travel planning.**

---

## 📁 Project Structure

```
rahbar/
├── frontend/
│   ├── rahbar-app.jsx      ← Your original UI + real API calls wired in
│   ├── index.html
│   ├── index.jsx
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── main.py             ← FastAPI app (CORS enabled for :5173)
│   ├── config.py           ← Loads .env
│   └── routers/
│       ├── itinerary.py    ← POST /api/itinerary  (Gemini AI)
│       ├── weather.py      ← GET  /api/weather     (OpenWeatherMap)
│       ├── flights.py      ← GET  /api/flights     (AviationStack)
│       └── recommend.py    ← POST /api/recommend   (ML model)
│
├── ml/
│   ├── train.py            ← Train model (run once automatically)
│   ├── predict.py          ← Inference used by backend
│   ├── data/
│   │   └── travel_dataset.csv
│   └── models/
│       └── model.pkl       ← Created after training
│
├── .env.example            ← Copy to .env and add your API keys
├── requirements.txt
├── setup.sh                ← ONE COMMAND — Linux/Mac
└── run.bat                 ← ONE COMMAND — Windows
```

---

## 🚀 Quick Start — 3 Steps

### Step 1 — Get FREE API keys (5 minutes)

| API | Link | Free Tier |
|-----|------|-----------|
| **Gemini** (required) | https://aistudio.google.com/app/apikey | 15 req/min |
| **OpenWeatherMap** (required) | https://home.openweathermap.org/api_keys | 60 req/min |
| **AviationStack** (optional) | https://aviationstack.com/signup/free | 100 req/month |

### Step 2 — Start the backend

**Linux / Mac:**
```bash
bash setup.sh
```

**Windows:**
```
Double-click run.bat
```

The script will:
1. Ask you to fill `.env` keys (first time)
2. Create Python virtual environment
3. Install all packages
4. Train the ML model (~30 seconds, first time only)
5. Start FastAPI at `http://localhost:8000`

### Step 3 — Start the frontend

Open a **new terminal**:
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173** → clicks the backend at **http://localhost:8000** automatically.

---

## 🌐 API Endpoints

| Method | URL | What it does |
|--------|-----|--------------|
| `POST` | `/api/itinerary` | Generates full trip plan via Gemini AI |
| `GET`  | `/api/weather?city=Paris` | Live weather + packing list |
| `GET`  | `/api/flights?flight_iata=PK301` | Flight status + alerts |
| `POST` | `/api/recommend` | ML destination recommendations |
| `GET`  | `/health` | Backend health check |
| `GET`  | `/docs` | Swagger UI (interactive API docs) |

---

## 📦 What the Frontend Sends / Receives

### POST `/api/itinerary` — Request
```json
{
  "destination": "Istanbul",
  "budget": 2500,
  "startDate": "2026-05-01",
  "endDate": "2026-05-05",
  "travelers": "2",
  "interests": "Culture & History, Food & Cuisine",
  "style": "Balanced"
}
```

### Response (exact structure your dashboard reads)
```json
{
  "weather": "🌤️ 72°F, Clear Sky",
  "packing": ["Comfortable shoes", "Light jacket", "Camera", "..."],
  "days": [
    {
      "day": 1,
      "title": "Historic Heart of Istanbul",
      "activities": [
        { "time": "09:00", "name": "Hagia Sophia", "type": "Landmark", "cost": 15, "note": "Book tickets online" },
        { "time": "12:00", "name": "Grand Bazaar", "type": "Shopping", "cost": 0,  "note": "Free to enter" }
      ]
    }
  ],
  "phrases": [
    { "fr": "Merhaba", "en": "Hello" },
    { "fr": "Teşekkürler", "en": "Thank you" }
  ],
  "culture": [
    "Remove shoes before entering mosques",
    "Bargaining is expected in bazaars"
  ],
  "alerts": [
    { "type": "weather", "msg": "🌤️ 72°F, Clear Sky" },
    { "type": "flight",  "msg": "✅ Istanbul airport: normal operations" }
  ],
  "expenses": {
    "accommodation": 800,
    "food": 400,
    "activities": 300,
    "transport": 200
  }
}
```

---

## 🔑 Environment Variables

```env
GEMINI_API_KEY=AIza...
OPENWEATHER_API_KEY=abc123...
AVIATIONSTACK_API_KEY=xyz...     # optional
FRONTEND_URL=http://localhost:5173
```

---

## 🧠 ML Model

- **Algorithm:** Random Forest (+ XGBoost if installed, picks best)
- **Input:** traveler type, season, budget, accommodation, interests
- **Output:** ranked destination recommendations with confidence scores
- **Saved as:** `ml/models/model.pkl`

Retrain anytime:
```bash
rm ml/models/model.pkl
python ml/train.py
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `GEMINI_API_KEY not set` | Fill `.env` file |
| Frontend shows "Failed to generate" | Make sure backend is running at :8000 |
| `Model not found — run train.py` | Run `python ml/train.py` |
| CORS error in browser | Backend CORS already allows :5173 — check both servers are running |
| Port 8000 busy | Kill old process: `lsof -ti:8000 \| xargs kill` |
| Weather shows N/A | Check `OPENWEATHER_API_KEY` in `.env` |

---

## ⚠️ Disclaimer
Rahbar is an educational final year project.
It does NOT book flights or hotels, process payments, or store personal data.

**Developed by Muhammad Mahaz Noor — Final Year Project 2026 🇵🇰**
