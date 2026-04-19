"""routers/flights.py — GET /api/flights?flight_iata=PK301"""
import httpx
from fastapi import APIRouter, HTTPException, Query
from backend.config import AVIATIONSTACK_API_KEY

router = APIRouter()

@router.get("/flights")
async def get_flight(flight_iata: str = Query(...)):
    if not AVIATIONSTACK_API_KEY:
        return {
            "flight_iata": flight_iata.upper(), "airline": "Demo Airline",
            "status": "Scheduled", "alert": "Demo data — add AVIATIONSTACK_API_KEY for live flights",
            "departure": {"airport": "Origin Airport", "scheduled": "On time"},
            "arrival":   {"airport": "Destination Airport", "scheduled": "On time"},
        }
    async with httpx.AsyncClient(timeout=12) as client:
        r = await client.get(
            "http://api.aviationstack.com/v1/flights",
            params={"access_key": AVIATIONSTACK_API_KEY, "flight_iata": flight_iata.upper(), "limit": 1},
        )
    if r.status_code != 200:
        raise HTTPException(r.status_code, "AviationStack error")
    data = r.json().get("data", [])
    if not data:
        raise HTTPException(404, f"Flight {flight_iata} not found")
    f = data[0]
    dep = f.get("departure", {}); arr = f.get("arrival", {})
    delay = dep.get("delay") or 0
    status = f.get("flight_status", "scheduled").title()
    alert = f"⚠️ Delayed {delay} min" if int(delay) > 30 else f"✅ {status}"
    return {
        "flight_iata": f.get("flight", {}).get("iata", flight_iata),
        "airline": f.get("airline", {}).get("name", ""),
        "status": status, "alert": alert,
        "departure": {"airport": dep.get("airport",""), "scheduled": dep.get("scheduled",""), "delay": delay},
        "arrival":   {"airport": arr.get("airport",""), "scheduled": arr.get("scheduled","")},
    }
