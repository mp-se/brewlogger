# SPDX-License-Identifier: GPL-3.0-or-later
# Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger

import os
import json
import pickle
import numpy as np
from pathlib import Path
from datetime import datetime

class BrewloggerPredictor:
    """
    Python implementation of the Brewlogger AI inference engine.
    Matches the logic used in the ESP32 C++ implementation and training pipeline.
    """

    def __init__(self, model_path=None, scaler_path=None, metadata_path=None):
        # Resolve paths relative to 'app/' directory
        app_root = Path(__file__).resolve().parent.parent
        
        self.model_path = model_path or app_root / 'predict' / 'fermentation_model_ground_truth.pkl'
        self.scaler_path = scaler_path or app_root / 'predict' / 'scaler_ground_truth.pkl'
        self.metadata_path = metadata_path or app_root / 'predict' / 'model_metadata_ground_truth.json'
        
        self.model = None
        self.scaler = None
        self.metadata = None
        
        self._load_assets()

    def _load_assets(self):
        """Load the trained model, scaler, and metadata."""
        try:
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
            
            with open(self.scaler_path, 'rb') as f:
                self.scaler = pickle.load(f)
                
            with open(self.metadata_path, 'r') as f:
                self.metadata = json.load(f)
                
            print(f"✅ Loaded model from {self.model_path.name}")
        except Exception as e:
            print(f"❌ Error loading assets: {e}")
            raise

    def calculate_features(self, history, current_gravity, current_temp, start_gravity, plateau_gravity, hours_elapsed):
        """
        Calculate features matching the training pipeline logic.
        
        Args:
            history: List of (timestamp, gravity, temp) tuples for velocity calculation
            current_gravity: Current specific gravity
            current_temp: Current temperature in Celsius
            start_gravity: Initial gravity at start of fermentation
            plateau_gravity: Expected or target plateau gravity (FG)
            hours_elapsed: Hours since fermentation start
            
        Returns:
            np.array: Scaled feature vector
        """
        # 1. gravity_drop
        gravity_drop = start_gravity - current_gravity
        
        # 2. gravity_drop_rate
        gravity_drop_rate = gravity_drop / max(hours_elapsed, 1.0)
        
        # 3. drop_velocity_6h & temp_velocity_6h
        velocity_6h = 0.0
        temp_velocity_6h = 0.0
        if history and len(history) > 1:
            # Current time (most recent in history or now)
            now_ts = history[-1][0]
            # Find measurement ~6h ago
            for i in range(len(history) - 2, -1, -1):
                item = history[i]
                ts = item[0]
                time_diff = (now_ts - ts).total_seconds() / 3600
                if time_diff >= 6.0:
                    # Gravity velocity (drop/h)
                    grav = item[1]
                    velocity_6h = (grav - current_gravity) / time_diff
                    # Temperature velocity (trend)
                    if len(item) > 2:
                        prev_temp = item[2]
                        temp_velocity_6h = (current_temp - prev_temp) / time_diff
                    break
        
        # 4. fermentation_progress (relative to measured/expected drop)
        total_expected_drop = start_gravity - plateau_gravity
        fermentation_progress = 0.0
        if total_expected_drop > 0:
            fermentation_progress = min(max(gravity_drop / total_expected_drop, 0.0), 1.0)

        # 5. temp_corrected_rate (Q10=2.0, ref=20C)
        temp_corrected_rate = 0.0
        if gravity_drop_rate > 0:
            temp_correction = 2.0 ** ((current_temp - 20.0) / 10.0)
            temp_corrected_rate = gravity_drop_rate / temp_correction
            
        # Build feature vector (order must match training: ['gravity_drop', 'gravity_drop_rate', 'drop_velocity_6h', 'temp_velocity_6h', 'temp_corrected_rate', 'fermentation_progress'])
        # NOTE: Using numpy to avoid feature name dependency in scaler
        features = np.array([[
            gravity_drop,
            gravity_drop_rate,
            velocity_6h,
            temp_velocity_6h,
            temp_corrected_rate,
            fermentation_progress
        ]])
        
        # Scale features
        return self.scaler.transform(features)

    def predict(self, history, current_gravity, current_temp, start_gravity, plateau_gravity, hours_elapsed):
        """
        Predict hours remaining until fermentation completion.
        
        Returns:
            float: Estimated hours remaining (0.0 if already completed)
        """
        # Check if we have enough data (6h window)
        if not history or len(history) < 2:
            return None
            
        first_ts = history[0][0]
        last_ts = history[-1][0]
        total_window = (last_ts - first_ts).total_seconds() / 3600
        
        if total_window < 6.0:
            return None # Waiting for 6h window
            
        # Check if already at plateau
        if current_gravity <= plateau_gravity:
            return 0.5 # Minimal time remaining
            
        try:
            # Preprocess
            X_scaled = self.calculate_features(
                history, current_gravity, current_temp, 
                start_gravity, plateau_gravity, hours_elapsed
            )
            
            # Inference
            prediction = self.model.predict(X_scaled)[0]
            
            # NOTE: Ground truth model (GradientBoostingRegressor) predicted 
            # absolute hours, not log-transformed.
            
            # Clamp reasonable values
            return max(0.0, float(prediction))
            
        except Exception as e:
            print(f"⚠️ Prediction error: {e}")
            return None

if __name__ == "__main__":
    # Simple test case
    predictor = BrewloggerPredictor()
    
    # Mock history (at 15h elapsed, starting at 1.0415)
    now = datetime.now()
    history = [
        (now.replace(hour=now.hour - 15), 1.0415, 18.5), # Start
        (now.replace(hour=now.hour - 9), 1.0350, 19.8),  # 6h gap from 15h ago
        (now, 1.0310, 20.5)                              # Current
    ]
    
    hours_left = predictor.predict(
        history=history,
        current_gravity=1.0310,
        current_temp=19.5,
        start_gravity=1.0415,
        plateau_gravity=1.0080,
        hours_elapsed=15.0
    )
    
    if hours_left:
        print(f"📊 Predicted Completion: {hours_left:.1f} hours from now")
    else:
        print("⌛ Waiting for more data (need 6h window)...")
