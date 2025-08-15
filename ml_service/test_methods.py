#!/usr/bin/env python3
"""
Test script to verify methods exist in WaterQualityPredictor
"""

from mlService import WaterQualityPredictor

def test_methods():
    print("Testing WaterQualityPredictor methods...")
    
    try:
        # Create instance
        predictor = WaterQualityPredictor()
        print("✅ WaterQualityPredictor instance created")
        
        # Check if methods exist
        methods_to_check = [
            'train_with_real_data',
            'train_with_sample_data', 
            'predict_for_station',
            'predict_general',
            'generate_sample_predictions',
            'predict'
        ]
        
        for method_name in methods_to_check:
            if hasattr(predictor, method_name):
                print(f"✅ Method '{method_name}' exists")
            else:
                print(f"❌ Method '{method_name}' MISSING")
        
        print("\n🎉 Method check completed!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_methods() 