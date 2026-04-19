"""
main.py — Rahbar Smart Travel Companion | FastAPI Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import check_keys, FRONTEND_URL
from backend.routers import itinerary, weather, flights, recommend

app = FastAPI(title="Rahbar API", version="1.0.0", docs_url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(itinerary.router, prefix="/api", tags=["Itinerary"])
app.include_router(weather.router,   prefix="/api", tags=["Weather"])
app.include_router(flights.router,   prefix="/api", tags=["Flights"])
app.include_router(recommend.router, prefix="/api", tags=["ML Recommend"])

@app.on_event("startup")
async def startup():
    check_keys()
    print("\n🚀 Rahbar backend running → http://localhost:8000")
    print("   Swagger UI → http://localhost:8000/docs\n")

@app.get("/")
def root():
    return {"status": "ok", "message": "Rahbar Smart Travel API"}

@app.get("/health")
def health():
    return {"status": "healthy"}
