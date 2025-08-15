from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mlService import WaterQualityPredictor
import uvicorn
import os
import requests
import httpx
from datetime import datetime, timedelta

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize predictor
predictor = WaterQualityPredictor()

@app.post("/train")
async def train_model():
    try:
        # Fetch data from your backend
        response = requests.get(
            'http://localhost:5000/api/waterQuality/getall',
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code != 200:
            print(f"Error fetching data: {response.status_code}")
            print(f"Response: {response.text}")
            raise HTTPException(
                status_code=500,
                detail="Failed to fetch training data from backend"
            )

        data = response.json()
        if not data.get('data') or len(data['data']) == 0:
            print("No data received from backend")
            # Use sample data instead
            sample_data = predictor.generate_sample_data()
            result = predictor.train_with_sample_data(sample_data)
            return {"message": "Model trained with sample data", "details": result}

        # Train with real data using the correct method
        result = predictor.train_with_real_data(data['data'])
        return {"message": "Model trained successfully with real data", "details": result}
        
    except Exception as e:
        print(f"Training error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to train model: {str(e)}"
        )

@app.get("/predict/{days}")
async def get_predictions(days: int):
    try:
        predictions = predictor.predict(days)
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/predict/station/{station_id}/{days}")
async def get_station_predictions(station_id: str, days: int):
    try:
        # Check if model needs retraining (every 24 hours or if accuracy is low)
        needs_training = (
            not predictor.last_training_time or
            datetime.now() - predictor.last_training_time > timedelta(hours=24) or
            predictor.current_accuracy < predictor.min_accuracy
        )
        
        if needs_training:
            print("Model needs retraining...")
            # Fetch training data
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    'http://localhost:5000/api/waterQuality/getall'
                )
                if response.status_code == 200:
                    # Use the correct training method for MongoDB data
                    training_result = predictor.train_with_real_data(response.json()['data'])
                    if not training_result['success']:
                        raise HTTPException(
                            status_code=500,
                            detail=f"Model training failed: {training_result['error']}"
                        )
        
        # Generate predictions using the correct method
        predictions = await predictor.predict_for_station(station_id, days)
        
        return {
            'predictions': predictions,
            'modelAccuracy': predictor.current_accuracy,
            'lastTrained': predictor.last_training_time.isoformat() if predictor.last_training_time else None
        }
        
    except Exception as e:
        print(f"Error in station predictions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/waterQuality/latest/{station_id}")
async def get_latest_reading(station_id: str):
    try:
        print(f"Fetching latest reading for station: {station_id}")  # Debug log
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            # First get latest reading
            response = await client.get(
                f'http://localhost:5000/api/waterQuality/latest/{station_id}'
            )
            
            print(f"Backend response status: {response.status_code}")  # Debug log
            print(f"Backend response: {response.text[:200]}")  # Debug log
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Backend error: {response.text}"
                )
            
            data = response.json()
            if not data.get('data'):
                raise HTTPException(
                    status_code=404,
                    detail="No latest reading found"
                )
            
            # Get short-term prediction
            print("Fetching predictions...")  # Debug log
            predictions = await predictor.predict_for_station(station_id, 1)
            print(f"Predictions received: {predictions is not None}")  # Debug log
            
            result = {
                "current": data['data'],
                "predicted": predictions[0] if predictions else None
            }
            
            print(f"Returning data: {str(result)[:200]}")  # Debug log
            return result
            
    except Exception as e:
        print(f"Error in get_latest_reading: {str(e)}")  # Detailed error log
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("start:app", host="0.0.0.0", port=8000, reload=True)