"""routers/weather.py — GET /api/weather?city=Paris"""
import httpx
from fastapi import APIRouter, HTTPException, Query
from backend.config import OPENWEATHER_API_KEY

router = APIRouter()

@router.get("/weather")
async def get_weather(city: str = Query(...)):
    if not OPENWEATHER_API_KEY:
        raise HTTPException(503, "OPENWEATHER_API_KEY not set in .env")
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            "https://api.openweathermap.org/data/2.5/weather",
            params={"q": city, "appid": OPENWEATHER_API_KEY, "units": "imperial"},
        )
    if r.status_code == 404:
        raise HTTPException(404, f"City '{city}' not found")
    if r.status_code != 200:
        raise HTTPException(r.status_code, "OpenWeatherMap error")
    d = r.json()
    temp = round(d["main"]["temp"])
    cond = d["weather"][0]["main"].lower()
    desc = d["weather"][0]["description"].title()
    emoji = "🌧️" if "rain" in cond else "❄️" if "snow" in cond else "☁️" if "cloud" in cond else "🌤️"

    # Packing based on weather
    packing = []
    if temp < 40:  packing += ["Heavy coat", "Thermal layers", "Gloves", "Warm hat"]
    elif temp < 60: packing += ["Light jacket", "Layered clothing", "Scarf"]
    else:           packing += ["Sunscreen SPF 50+", "Sunglasses", "Light clothing", "Cap/hat"]
    if "rain" in cond: packing.append("Compact umbrella")
    packing += ["Comfortable walking shoes", "Power bank", "Travel adapter"]

    return {
        "city": d["name"], "country": d["sys"]["country"],
        "temperature": temp, "feels_like": round(d["main"]["feels_like"]),
        "humidity": d["main"]["humidity"], "condition": desc,
        "emoji": emoji, "wind_speed": round(d["wind"]["speed"], 1),
        "packing": packing[:8],
    }
