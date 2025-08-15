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

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and scaler
try:
    model = joblib.load('models/water_quality_model.pkl')
    scaler = joblib.load('models/scaler.pkl')
except:
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

@app.get("/predict/{days}")
async def predict(days: int):
    if not model:
        raise HTTPException(status_code=400, detail="Model not trained yet")
    
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
            results.append({
                'timestamp': date.isoformat(),
                'pH': float(predictions[i][0]),
                'temperature': float(predictions[i][1]),
                'ec': float(predictions[i][2]),
                'tds': float(predictions[i][3]),
                'turbidity': float(predictions[i][4])
            })
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))