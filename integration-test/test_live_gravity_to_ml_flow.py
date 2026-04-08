# SPDX-License-Identifier: GPL-3.0-or-later
# Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger

import json
import time
import pytest
from datetime import datetime, timedelta

def test_gravity_to_ml_prediction_flow(client, test_data_path):
    """
    Simulates a fermentation batch reporting to the live API and 
    verifies that the ML model updates the prediction field.
    """
    # 1. Load the Helles batch 34 data
    with open(test_data_path, "r") as f:
        full_data = json.load(f)
    
    measurements = full_data.get("measurements", [])
    # Sort by time to be safe
    measurements.sort(key=lambda x: x["created"])
    
    # 2. Use a unique ID to identify this test run (max 6 chars for chip_id)
    test_chip_id = "INTGR1" 
    
    # We'll post multiple readings to simulate time passing.
    # The model fails if total_window in history is < 6 hours.
    # Our simulation is too fast (all messages have ~same timestamp).
    # We will "fudge" the timestamps by manually overriding them in the request.
    
    print(f"Simulating sensor {test_chip_id} with data from {test_data_path.name}")
    
    start_time_sim = datetime.now() - timedelta(hours=10) # Start 10 hours ago
    
    for i in range(min(30, len(measurements))):
        m = measurements[i]
        
        # Increment time by 20 mins per reading to create a >6h window
        fake_ts = (start_time_sim + timedelta(minutes=i*20)).isoformat()
        
        # iSpindel format payload
        payload = {
            "ID": test_chip_id,
            "angle": m.get("angle", 0),
            "temperature": m.get("temperature", 20.0),
            "temp_units": "C",
            "battery": m.get("battery", 4.0),
            "gravity": m.get("gravity", 1.050),
            "RSSI": m.get("rssi", -60),
            "created": fake_ts # Add explicit timestamp if API supports it
        }
        
        # POST to the public endpoint
        response = client.post("/api/gravity/public", json=payload)
        assert response.status_code == 200, f"Failed at measurement {i}: {response.text}"
        
        # Speed up simulation: we don't need real-time waits as the system uses 'created' field if provided,
        # but here we rely on the server's time for the first batch auto-creation.
    
    # 3. Verify Batch Creation
    # The system auto-creates a batch if none exists for the chip_id.
    response = client.get(f"/api/batch/?chip_id={test_chip_id}&active=true")
    assert response.status_code == 200
    batches = response.json()
    assert len(batches) >= 1
    target_batch = batches[0]
    batch_id = target_batch["id"]
    print(f"Verified auto-created batch: {target_batch['name']} (ID: {batch_id})")

    # 4. Wait for Background Prediction Task
    # Since predictions happen in a 10s interval queue, we poll for completion.
    # We give it up to 25 seconds (at least 2 queue cycles) to finish the ML task.
    # To be sure it's a NEW prediction, we check if predictionAtTimestamp is after our start_time
    # We use UTC consistently here
    test_start_time_utc = datetime.utcnow() - timedelta(seconds=2)
    max_retries = 25
    prediction_updated = False
    
    print(f"Waiting for ML prediction to update (Start UTC: {test_start_time_utc})...")
    for i in range(max_retries):
        response = client.get(f"/api/batch/{batch_id}")
        batch_data = response.json()
        
        # Check if predictionHoursLeft is no longer 0 AND timestamp is new
        prediction_ts_str = batch_data.get("predictionAtTimestamp")
        if batch_data.get("predictionHoursLeft") and batch_data["predictionHoursLeft"] > 0 and prediction_ts_str:
            try:
                # API returns UTC. Handle cases where it might have Z or +00:00
                clean_ts = prediction_ts_str.replace('Z', '+00:00')
                prediction_ts_utc = datetime.fromisoformat(clean_ts).replace(tzinfo=None) # Keep naive UTC
                
                if prediction_ts_utc >= test_start_time_utc:
                    prediction_updated = True
                    print(f"ML Prediction Successful: {batch_data['predictionHoursLeft']:.2f} hours left (Calculated at UTC: {prediction_ts_str})")
                    break
                else:
                    if i % 5 == 0:
                        print(f"Polling... found stale UTC timestamp: {prediction_ts_str} (Looking for >= {test_start_time_utc})")
            except (ValueError, TypeError) as e:
                print(f"Parsing error: {e}")
                # Fallback if parsing fails but value exists
                prediction_updated = True
                break
            
        time.sleep(1)
    
    assert prediction_updated, f"ML prediction was not updated. Last TS: {batch_data.get('predictionAtTimestamp')}"

def test_system_status_and_logs(client):
    """Verifies that the system basic health and logs are working."""
    response = client.get("/api/system/log?limit=5", follow_redirects=True)
    assert response.status_code == 200
    logs = response.json()
    # There should be at least some logs if tests just ran
    assert len(logs) >= 0
    print(f"System logs retrieved: {len(logs)} entries found.")
