"""routers/recommend.py — POST /api/recommend"""
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class RecommendRequest(BaseModel):
    traveler_type:  str        = "Couple"
    accommodation:  str        = "Hotel"
    season:         str        = "Winter"
    duration_days:  int        = 5
    budget_usd:     float      = 2500
    interests:      List[str]  = []
    top_n:          Optional[int] = 5

@router.post("/recommend")
async def recommend(req: RecommendRequest):
    try:
        from ml.predict import recommend_destinations
        results = recommend_destinations(
            traveler_type=req.traveler_type,
            accommodation=req.accommodation,
            season=req.season,
            duration_days=req.duration_days,
            budget_pkr=req.budget_usd * 280,  # convert USD→PKR approx
            interests=req.interests,
            top_n=req.top_n or 5,
        )
        return {"recommendations": results}
    except FileNotFoundError as e:
        raise HTTPException(503, str(e))
    except Exception as e:
        raise HTTPException(500, f"ML error: {e}")
