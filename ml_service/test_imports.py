#!/usr/bin/env python3
"""
Test script to verify all required imports for ML service
"""

def test_imports():
    print("Testing imports for ML service...")
    
    try:
        print("1. Testing FastAPI...")
        from fastapi import FastAPI, HTTPException
        print("   ✅ FastAPI imported successfully")
        
        print("2. Testing sklearn...")
        from sklearn.model_selection import train_test_split
        from sklearn.ensemble import RandomForestRegressor
        from sklearn.preprocessing import StandardScaler
        from sklearn.metrics import r2_score
        print("   ✅ sklearn imported successfully")
        
        print("3. Testing pandas...")
        import pandas as pd
        print("   ✅ pandas imported successfully")
        
        print("4. Testing numpy...")
        import numpy as np
        print("   ✅ numpy imported successfully")
        
        print("5. Testing joblib...")
        import joblib
        print("   ✅ joblib imported successfully")
        
        print("6. Testing requests...")
        import requests
        print("   ✅ requests imported successfully")
        
        print("7. Testing httpx...")
        import httpx
        print("   ✅ httpx imported successfully")
        
        print("8. Testing datetime...")
        from datetime import datetime, timedelta
        print("   ✅ datetime imported successfully")
        
        print("9. Testing os...")
        import os
        print("   ✅ os imported successfully")
        
        print("\n🎉 All imports successful! ML service should work properly.")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print(f"   Missing module: {e.name}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    test_imports() 