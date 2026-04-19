"""
routers/itinerary.py
POST /api/itinerary  →  Generate complete trip data via Gemini AI
                         Returns EXACT structure that rahbar-app.jsx dashboard reads:
                         { weather, packing, days, phrases, culture, alerts, expenses }
"""

import json, re, httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import google.generativeai as genai

from backend.config import GEMINI_API_KEY, OPENWEATHER_API_KEY, AVIATIONSTACK_API_KEY

router = APIRouter()

# ── Init Gemini ───────────────────────────────────────────────
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    _gemini = genai.GenerativeModel("gemini-1.5-flash")
else:
    _gemini = None


class ItineraryRequest(BaseModel):
    destination: str
    budget:      float       # USD
    startDate:   str         # YYYY-MM-DD
    endDate:     str         # YYYY-MM-DD
    travelers:   str         # "1","2","3","4","5+"
    interests:   str         # comma-separated
    style:       Optional[str] = "Balanced"  # Budget|Balanced|Comfort|Luxury


# ── Helpers ───────────────────────────────────────────────────
async def _get_weather(city: str) -> dict:
    """Fetch live weather from OpenWeatherMap."""
    if not OPENWEATHER_API_KEY:
        return {"emoji": "🌤️", "temp": "N/A", "desc": "Weather data unavailable (add OPENWEATHER_API_KEY)"}
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={"q": city, "appid": OPENWEATHER_API_KEY, "units": "imperial"},
            )
        if r.status_code == 200:
            d = r.json()
            temp = round(d["main"]["temp"])
            desc = d["weather"][0]["description"].title()
            cond = d["weather"][0]["main"].lower()
            emoji = "🌧️" if "rain" in cond else "❄️" if "snow" in cond else "☁️" if "cloud" in cond else "🌤️"
            return {"emoji": emoji, "temp": temp, "desc": desc}
    except Exception:
        pass
    return {"emoji": "🌤️", "temp": "N/A", "desc": "Unavailable"}


async def _get_flight_alert(destination: str) -> str:
    """Get a flight alert string. Returns demo text if no key."""
    if not AVIATIONSTACK_API_KEY:
        return f"{destination} airport: normal operations (demo — add AVIATIONSTACK_API_KEY for live data)"
    # AviationStack free tier: search by airport name
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(
                "http://api.aviationstack.com/v1/flights",
                params={"access_key": AVIATIONSTACK_API_KEY, "arr_city": destination, "limit": 1},
            )
        if r.status_code == 200:
            data = r.json().get("data", [])
            if data:
                f = data[0]
                status = f.get("flight_status", "scheduled").title()
                airline = f.get("airline", {}).get("name", "Airline")
                delay = f.get("arrival", {}).get("delay") or 0
                if delay and int(delay) > 30:
                    return f"⚠️ {airline}: arrival delayed by {delay} min"
                return f"✅ {destination} airport: {status}, no major delays"
    except Exception:
        pass
    return f"✅ {destination} airport: normal operations"


def _build_packing(items: list, weather: dict, destination: str) -> list:
    """Merge Gemini packing list with weather-specific additions."""
    extra = []
    desc = weather.get("desc", "").lower()
    temp = weather.get("temp")
    if isinstance(temp, (int, float)):
        if temp < 40:
            extra += ["Heavy winter coat", "Thermal layers", "Gloves & warm hat"]
        elif temp < 60:
            extra += ["Light jacket", "Layered clothing"]
        else:
            extra += ["Sunscreen SPF 50+", "Sunglasses", "Light breathable clothing"]
    if "rain" in desc:
        extra.append("Compact umbrella")
    if "snow" in desc:
        extra.append("Waterproof snow boots")
    combined = items + [e for e in extra if e not in items]
    return combined[:10]


# ── POST /api/itinerary ───────────────────────────────────────
@router.post("/itinerary")
async def generate_itinerary(req: ItineraryRequest):
    """
    Generate complete trip data. Returns the exact JSON structure
    that rahbar-app.jsx DashboardPage reads.
    """
    if not _gemini:
        raise HTTPException(503, "GEMINI_API_KEY not set in .env")

    # ── Fetch weather & flights in parallel ───────────────────
    weather = await _get_weather(req.destination)
    flight_alert = await _get_flight_alert(req.destination)

    weather_str = f"{weather['emoji']} {weather['temp']}°F, {weather['desc']}"

    # ── Build Gemini prompt ───────────────────────────────────
    prompt = f"""
You are Rahbar, an expert AI travel planner.
Generate a complete travel plan as VALID JSON ONLY — no markdown, no explanation, no code fences.

Trip:
- Destination: {req.destination}
- Dates: {req.startDate} to {req.endDate}
- Budget: ${req.budget} USD total
- Travelers: {req.travelers}
- Style: {req.style}
- Interests: {req.interests}

Return EXACTLY this JSON structure (no extra keys):
{{
  "days": [
    {{
      "day": 1,
      "title": "Short Day Theme",
      "activities": [
        {{
          "time": "09:00",
          "name": "Activity Name",
          "type": "Landmark",
          "cost": 25,
          "note": "Helpful tip for traveler"
        }}
      ]
    }}
  ],
  "packing": ["item 1", "item 2", "item 3", "item 4", "item 5"],
  "phrases": [
    {{ "fr": "Local phrase", "en": "English meaning" }}
  ],
  "culture": [
    "Cultural tip or etiquette rule"
  ],
  "expenses": {{
    "accommodation": 400,
    "food": 200,
    "activities": 150,
    "transport": 100
  }}
}}

Rules:
- Create one day per day between {req.startDate} and {req.endDate}
- 4 activities per day, each with realistic time, type, cost in USD
- type must be one of: Hotel, Landmark, Tour, Food, Museum, Transport, Shopping, Experience
- expenses must sum close to {req.budget}
- packing: 5-8 weather and destination specific items
- phrases: 4-5 useful local language phrases (use "fr" for the local phrase, "en" for English)
- culture: 4 practical etiquette tips
- Tailor everything to interests: {req.interests}
- Use real local place names in {req.destination}
- Return ONLY the JSON object, absolutely nothing else
"""

    raw = _gemini.generate_content(prompt).text
    clean = re.sub(r"```(?:json)?|```", "", raw).strip()

    try:
        data = json.loads(clean)
    except json.JSONDecodeError:
        # Try to extract JSON from response
        match = re.search(r'\{[\s\S]*\}', clean)
        if match:
            try:
                data = json.loads(match.group())
            except Exception:
                raise HTTPException(502, f"Gemini returned invalid JSON. Raw: {raw[:300]}")
        else:
            raise HTTPException(502, f"Could not parse Gemini response. Raw: {raw[:300]}")

    # ── Merge with live data ──────────────────────────────────
    packing = _build_packing(data.get("packing", []), weather, req.destination)

    alerts = [
        {"type": "weather", "msg": weather_str},
        {"type": "flight",  "msg": flight_alert},
    ]

    return {
        "weather":  weather_str,
        "packing":  packing,
        "days":     data.get("days", []),
        "phrases":  data.get("phrases", []),
        "culture":  data.get("culture", []),
        "alerts":   alerts,
        "expenses": data.get("expenses", {"accommodation": 0, "food": 0, "activities": 0, "transport": 0}),
    }
