from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import json
from typing import List

import os

app = FastAPI()

# Configure CORS
# Configure allowed origins via env (comma-separated) or allow all by default for testing
cors_origins_env = os.getenv("ML_CORS_ORIGINS", "*")
allow_origins = [o.strip() for o in cors_origins_env.split(",")] if cors_origins_env != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Water Quality Standards (WHO/BIS typical values)
# Units:
# - pH: unitless (range)
# - turbidity: NTU (max)
# - tds: mg/L (max)
# - ec: µS/cm (max)
STANDARDS = {
    "pH": {"min": 6.5, "max": 8.5},
    "turbidity": {"max": 10.0},
    "tds": {"max": 500.0},
    "ec": {"max": 300.0},
}

# Helpers
def _within_standard(param: str, value: float) -> dict:
    """Return compliance info for a single parameter value."""
    std = STANDARDS.get(param, {})
    result = {
        "value": float(value) if value is not None else None,
        "min": std.get("min"),
        "max": std.get("max"),
        "within": None,
        "delta": None,  # negative or positive distance to nearest bound (0 if within)
    }
    if result["value"] is None:
        return result
    v = result["value"]
    min_v = result["min"]
    max_v = result["max"]
    if min_v is not None and max_v is not None:
        result["within"] = (v >= min_v) and (v <= max_v)
        if v < min_v:
            result["delta"] = v - min_v
        elif v > max_v:
            result["delta"] = v - max_v
        else:
            result["delta"] = 0.0
    elif max_v is not None:
        result["within"] = v <= max_v
        result["delta"] = 0.0 if v <= max_v else v - max_v
    elif min_v is not None:
        result["within"] = v >= min_v
        result["delta"] = 0.0 if v >= min_v else v - min_v
    else:
        result["within"] = True
        result["delta"] = 0.0
    return result

def evaluate_compliance(sample: dict) -> dict:
    """Compute compliance for all supported parameters and summarize overall status."""
    comp = {
        "pH": _within_standard("pH", sample.get("pH")),
        "turbidity": _within_standard("turbidity", sample.get("turbidity")),
        "tds": _within_standard("tds", sample.get("tds")),
        "ec": _within_standard("ec", sample.get("ec")),
    }
    overall = all(v.get("within") in (True, None) for v in comp.values())
    comp_summary = {
        "overall_within": overall,
        "standards": STANDARDS,
    }
    return {"parameters": comp, **comp_summary}

# Load model and scaler (initial attempt)
try:
    model = joblib.load('models/water_quality_model.pkl')
    scaler = joblib.load('models/scaler.pkl')
except Exception:
    model = None
    scaler = None

@app.post("/train")
async def train_model():
    try:
        # Import training functionality
        from mlService import train_water_quality_model
        
        # Train the model
        result = train_water_quality_model()
        
        if result.get('success', False):
            return {"message": "Model trained successfully", "details": result}
        else:
            raise HTTPException(status_code=500, detail=f"Training failed: {result.get('error', 'Unknown error')}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """Health/info endpoint for quick checks."""
    from datetime import datetime
    info = {
        "service": "ml_service",
        "status": "ok",
        "time": datetime.now().isoformat(),
        "endpoints": [
            "/", 
            "/train", 
            "/predict/{days}", 
            "/metrics"
        ]
    }
    return info

@app.get("/metrics")
async def metrics():
    """Return last known training metrics if available."""
    # Try to import predictor state if available via saved files only
    global model, scaler
    last_trained = None
    accuracy = None
    # We don't persist accuracy in files here; expose basic availability
    try:
        # Check if model files exist
        import os
        model_exists = os.path.exists('models/water_quality_model.pkl')
        scaler_exists = os.path.exists('models/scaler.pkl')
        ready = model_exists and scaler_exists
    except Exception:
        ready = False
    return {
        "model_ready": ready,
        "note": "Call /train to train and save model; accuracy is returned in /train response.",
    }

@app.get("/standards")
async def get_standards():
    """Expose the current water quality standards used for compliance checks."""
    return STANDARDS

@app.get("/predict/{days}")
async def predict(days: int):
    global model, scaler
    # Lazy load model/scaler if not present (e.g., after /train saved them)
    if model is None or scaler is None:
        try:
            model = joblib.load('models/water_quality_model.pkl')
            scaler = joblib.load('models/scaler.pkl')
        except Exception:
            raise HTTPException(status_code=400, detail="Model not trained yet. Call /train first.")

    try:
        # Generate future dates
        future_dates = pd.date_range(
            start=datetime.now(),
            periods=days * 24,
            freq='H'
        )
        
        # Create features
        features = pd.DataFrame({
            'hour': future_dates.hour,
            'day': future_dates.day,
            'month': future_dates.month
        })
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Make predictions
        predictions = model.predict(features_scaled)
        
        # Format results
        results = []
        for i, date in enumerate(future_dates):
            sample = {
                'timestamp': date.isoformat(),
                'pH': float(predictions[i][0]),
                'temperature': float(predictions[i][1]),
                'ec': float(predictions[i][2]),
                'tds': float(predictions[i][3]),
                'turbidity': float(predictions[i][4])
            }
            compliance = evaluate_compliance(sample)
            results.append({**sample, "compliance": compliance})
        
        return {
            "success": True,
            "standards": STANDARDS,
            "predictions": results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))