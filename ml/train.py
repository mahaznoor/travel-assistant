"""ml/train.py — Train travel recommendation model. Run once."""
import os, joblib, warnings
import numpy as np, pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
warnings.filterwarnings("ignore")

BASE   = os.path.dirname(os.path.abspath(__file__))
DATA   = os.path.join(BASE, "data", "travel_dataset.csv")
MDIR   = os.path.join(BASE, "models")
os.makedirs(MDIR, exist_ok=True)

print("\n🧳 Training Rahbar ML recommendation model...")
df = pd.read_csv(DATA)
print(f"   {len(df)} records | {df['destination'].nunique()} destinations")

encoders = {}
for col in ["traveler_type", "accommodation", "season"]:
    le = LabelEncoder()
    df[col+"_enc"] = le.fit_transform(df[col].astype(str))
    encoders[col] = le

all_interests = sorted(set(i for row in df["interests"].astype(str) for i in row.split(";")))
for i in all_interests:
    df[f"int_{i}"] = df["interests"].apply(lambda x: 1 if i in str(x).split(";") else 0)

target_le = LabelEncoder()
y = target_le.fit_transform(df["destination"].astype(str))
encoders["destination"] = target_le

feat_cols = (["traveler_type_enc","accommodation_enc","season_enc","duration_days","budget_pkr","satisfaction_score"]
             + [f"int_{i}" for i in all_interests])
X = df[feat_cols].fillna(0)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("   Training Random Forest...")
model = RandomForestClassifier(n_estimators=300, max_depth=12, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)
print(f"   ✅ Accuracy: {accuracy_score(y_test, model.predict(X_test))*100:.1f}%")

try:
    from xgboost import XGBClassifier
    xgb = XGBClassifier(n_estimators=300, max_depth=6, learning_rate=0.1, verbosity=0, random_state=42)
    xgb.fit(X_train, y_train)
    xgb_acc = accuracy_score(y_test, xgb.predict(X_test))
    if xgb_acc > accuracy_score(y_test, model.predict(X_test)):
        model = xgb
        print(f"   ✅ XGBoost better: {xgb_acc*100:.1f}% — using XGBoost")
except ImportError:
    print("   ℹ️  XGBoost not installed — using Random Forest")

path = os.path.join(MDIR, "model.pkl")
joblib.dump({"model": model, "encoders": encoders, "feature_cols": feat_cols, "all_interests": all_interests}, path)
print(f"\n🎉 Model saved → {path}\n")
