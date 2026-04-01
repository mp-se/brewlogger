import json
import pytest
import os
from datetime import datetime
from pathlib import Path

# Adjusting path to find the relative imports if running from root
import sys
app_path = Path(__file__).resolve().parent.parent
if str(app_path) not in sys.path:
    sys.path.append(str(app_path))

from predict.predict_python import BrewloggerPredictor

def test_prediction_with_real_data():
    # Path to the data file relative to this test file
    base_path = Path(__file__).parent
    data_path = base_path / "resources" / "helles_batch_34.json"
    
    if not data_path.exists():
        pytest.skip(f"Test data file not found at {data_path}")

    with open(data_path, "r") as f:
        data = json.load(f)

    # The JSON structure of helles_batch_34.json:
    # { "og": 1.047..., "fg": 1.008, "measurements": [{ "created": "...", "gravity": ..., "temperature": ... }] }
    
    measurements = data.get("measurements", [])
    if not measurements:
        pytest.fail("No measurements found in test data")

    # Filter and sort readings by time
    parsed_readings = []
    for r in measurements:
        # ISO format: "2026-01-04T15:37:34.408033"
        ts = datetime.fromisoformat(r["created"])
        parsed_readings.append((ts, r["gravity"], r["temperature"]))
    
    parsed_readings.sort(key=lambda x: x[0])

    # Initial state from JSON
    start_gravity = data.get("og", parsed_readings[0][1])
    plateau_gravity = data.get("fg", 1.010) # default FG if not set
    # The first measurement in the JSON isn't the OG measurement (which is usually much earlier)
    # But for windowing, start_time is the first measurement
    start_time = parsed_readings[0][0]

    predictor = BrewloggerPredictor()

    # Test prediction at different stages
    # 1. Early stage (12h after first measurement)
    points_12h = [p for p in parsed_readings if (p[0] - start_time).total_seconds() / 3600 <= 12.0]
    if len(points_12h) >= 2:
        current = points_12h[-1]
        hours_elapsed = (current[0] - start_time).total_seconds() / 3600
        hours_left = predictor.predict(
            history=points_12h,
            current_gravity=current[1],
            current_temp=current[2],
            start_gravity=start_gravity,
            plateau_gravity=plateau_gravity,
            hours_elapsed=hours_elapsed
        )
        print(f"Prediction at {hours_elapsed:.1f}h: {hours_left} hours remaining")
        # Note: predictor might return None if logic requires >6h or specific conditions
        if hours_left is not None:
             assert hours_left >= 0

    # 2. Mid stage (48h after first measurement)
    points_48h = [p for p in parsed_readings if (p[0] - start_time).total_seconds() / 3600 <= 48.0]
    if len(points_48h) >= 2:
        current = points_48h[-1]
        hours_elapsed = (current[0] - start_time).total_seconds() / 3600
        # Use only last 24h for window for the history argument, matching production logic
        history_window = [p for p in points_48h if (current[0] - p[0]).total_seconds() / 3600 <= 24.0]
        
        hours_left = predictor.predict(
            history=history_window,
            current_gravity=current[1],
            current_temp=current[2],
            start_gravity=start_gravity,
            plateau_gravity=plateau_gravity,
            hours_elapsed=hours_elapsed
        )
        print(f"Prediction at {hours_elapsed:.1f}h: {hours_left} hours remaining")
        if hours_left is not None:
            assert hours_left >= 0

if __name__ == "__main__":
    test_prediction_with_real_data()

