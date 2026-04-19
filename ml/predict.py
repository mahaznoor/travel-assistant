"""ml/predict.py — Inference for recommendation model."""
import os, joblib
import numpy as np

BASE = os.path.dirname(os.path.abspath(__file__))
PATH = os.path.join(BASE, "models", "model.pkl")
_arts = None

def _load():
    global _arts
    if _arts is None:
        if not os.path.exists(PATH):
            raise FileNotFoundError(f"Model not found at {PATH}. Run: python ml/train.py")
        _arts = joblib.load(PATH)
    return _arts

def recommend_destinations(traveler_type, accommodation, season, duration_days, budget_pkr, interests, top_n=5):
    arts = _load()
    model, encoders, feat_cols, all_interests = arts["model"], arts["encoders"], arts["feature_cols"], arts["all_interests"]

    def enc(col, val):
        try: return encoders[col].transform([str(val)])[0]
        except: return 0

    row = {
        "traveler_type_enc": enc("traveler_type", traveler_type),
        "accommodation_enc": enc("accommodation",  accommodation),
        "season_enc":        enc("season",         season),
        "duration_days":     int(duration_days),
        "budget_pkr":        float(budget_pkr),
        "satisfaction_score": 4,
    }
    il = [i.lower() for i in interests]
    for i in all_interests:
        row[f"int_{i}"] = 1 if i.lower() in il else 0

    X = np.array([[row.get(c, 0) for c in feat_cols]])
    proba = model.predict_proba(X)[0]
    top = np.argsort(proba)[::-1][:top_n]
    return [{"destination": encoders["destination"].inverse_transform([i])[0], "score": round(float(proba[i]),4), "rank": r+1}
            for r, i in enumerate(top)]
