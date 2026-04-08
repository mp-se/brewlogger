# SPDX-License-Identifier: GPL-3.0-or-later
# Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger

import json

from api.config import get_settings
from .conftest import truncate_database

headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}


def test_init(app_client):
    truncate_database()


def test_add(app_client):
    data = {
        "name": "f1",
        "chipIdGravity": "BBBBBB",
        "chipIdPressure": "",
        "description": "f3",
        "brewDate": "f4",
        "style": "f5",
        "brewer": "f6",
        "brewfatherId": "1",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
        "fg": 1.050,
        "og": 1.060,
        "predictionHoursLeft": 12.5,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }

    # Add new
    r = app_client.post("/api/batch/", json=data, headers=headers)
    assert r.status_code == 201
    data1 = json.loads(r.text)
    assert data1["id"] == 1
    assert data1["name"] == data["name"]
    assert data1["chipIdGravity"] == data["chipIdGravity"]
    assert data1["chipIdPressure"] == data["chipIdPressure"]
    assert data1["active"] == data["active"]
    assert data1["description"] == data["description"]
    assert data1["brewDate"] == data["brewDate"]
    assert data1["style"] == data["style"]
    assert data1["brewer"] == data["brewer"]
    assert data1["abv"] == data["abv"]
    assert data1["ebc"] == data["ebc"]
    assert data1["ibu"] == data["ibu"]
    assert data1["fg"] == data["fg"]
    assert data1["og"] == data["og"]
    assert data1["predictionHoursLeft"] == data["predictionHoursLeft"]
    assert data1["brewfatherId"] == data["brewfatherId"]
    assert data1["fermentationChamber"] == data["fermentationChamber"]
    assert data1["fermentationSteps"] == data["fermentationSteps"]
    assert data1["tapList"] == data["tapList"]

    # Read data and check values
    r2 = app_client.get("/api/batch/1", headers=headers)
    assert r2.status_code == 200
    data2 = json.loads(r.text)
    assert data["name"] == data2["name"]

    # Not using a number for index
    r2 = app_client.get("/api/batch/hello", headers=headers)
    assert r2.status_code == 422

    data = {
        "name": "f1",
        "chipIdGravity": "",
        "chipIdPressure": "BBBBBB",
        "description": "f3",
        "brewDate": "f4",
        "style": "f5",
        "brewer": "f6",
        "brewfatherId": "1",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
        "fg": 1.050,
        "og": 1.060,
        "fermentationSteps": "",
        "tapList": True,
    }

    # Add new without optional parameters
    r = app_client.post("/api/batch/", json=data, headers=headers)
    assert r.status_code == 201


def test_list(app_client):
    r = app_client.get("/api/batch/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 2


def test_update(app_client):
    data = {
        "name": "ff1",
        "chipIdGravity": "BBBBBB",
        "chipIdPressure": "",
        "description": "ff3",
        "brewDate": "ff4",
        "style": "ff5",
        "brewer": "ff6",
        "brewfatherId": "1",
        "active": True,
        "abv": 1.1,
        "ebc": 1.2,
        "ibu": 1.3,
        "fg": 1.050,
        "og": 1.060,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }

    # Update existing entity
    r = app_client.patch("/api/batch/1", json=data, headers=headers)
    assert r.status_code == 200

    # Read the entity and validate data
    r2 = app_client.get("/api/batch/1", headers=headers)
    assert r2.status_code == 200
    data2 = json.loads(r.text)
    assert data["name"] == data2["name"]
    assert data["chipIdGravity"] == data2["chipIdGravity"]
    assert data["chipIdPressure"] == data2["chipIdPressure"]
    assert data["active"] == data2["active"]
    assert data["description"] == data2["description"]
    assert data["brewDate"] == data2["brewDate"]
    assert data["style"] == data2["style"]
    assert data["brewer"] == data2["brewer"]
    assert data["abv"] == data2["abv"]
    assert data["ebc"] == data2["ebc"]
    assert data["ibu"] == data2["ibu"]
    assert data["brewfatherId"] == data2["brewfatherId"]
    assert data["fermentationChamber"] == data2["fermentationChamber"]
    assert data["fermentationSteps"] == data2["fermentationSteps"]
    assert data["tapList"] == data2["tapList"]

    # Update missing entity
    r = app_client.patch("/api/batch/10", json=data, headers=headers)
    assert r.status_code == 404


def test_delete(app_client):
    # Delete
    r = app_client.delete("/api/batch/1", headers=headers)
    assert r.status_code == 204

    # Check how many are stored
    r = app_client.get("/api/batch/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1


def test_query(app_client):
    data = {
        "name": "f1",
        "chipIdGravity": "BBBBB2",
        "chipIdPressure": "",
        "description": "f3",
        "brewDate": "f4",
        "style": "f5",
        "brewer": "f6",
        "brewfatherId": "1",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
        "fg": 1.050,
        "og": 1.060,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }

    # Update existing entity
    r = app_client.post("/api/batch/", json=data, headers=headers)
    assert r.status_code == 201

    r = app_client.get("/api/batch/?chipId=BBBBB2", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1

    r = app_client.get("/api/batch?chipId=chip1&active=false", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 0

    r = app_client.get("/api/batch/?chipId=BBBBB2&active=true", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1


def test_validation(app_client):
    data = {
        "name": "f1",
        "chipIdGravity": "BBBBBBB",  # Failure point
        "chipIdPressure": "",
        "description": "f3",
        "brewDate": "f4",
        "style": "f5",
        "brewer": "f6",
        "brewfatherId": "1",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }

    # Add new
    r = app_client.post("/api/batch/", json=data, headers=headers)
    assert r.status_code == 422

    data = {
        "name": "f1",
        "chipIdGravity": "",
        "chipIdPressure": "23",  # Failure point
        "description": "f3",
        "brewDate": "f4",
        "style": "f5",
        "brewer": "f6",
        "brewfatherId": "1",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }

    # Add new
    r = app_client.post("/api/batch/", json=data, headers=headers)
    assert r.status_code == 422

    data = {
        "name": "01234567890123456789012345678901234567890",  # Failure point
        "chipIdGravity": "012345",
        "chipIdPressure": "",
        "description": "f3",
        "brewDate": "f4",
        "style": "f5",
        "brewer": "f6",
        "brewfatherId": "1",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }

    # Add new
    r = app_client.post("/api/batch/", json=data, headers=headers)
    assert r.status_code == 422

    data = {
        "name": "f1",
        "chipIdGravity": "012345",
        "chipIdPressure": "",
        "description": "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890",  # Failure point
        "brewDate": "f4",
        "style": "f5",
        "brewer": "f6",
        "brewfatherId": "1",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }

    # Add new
    r = app_client.post("/api/batch/", json=data, headers=headers)
    assert r.status_code == 422

    data = {
        "name": "f1",
        "chipIdGravity": "012345",
        "chipIdPressure": "",
        "description": "f2",
        "brewDate": "012345678901234567890",  # Failure point
        "style": "f5",
        "brewer": "f6",
        "brewfatherId": "1",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }

    # Add new
    r = app_client.post("/api/batch/", json=data, headers=headers)
    assert r.status_code == 422

    data = {
        "name": "f1",
        "chipIdGravity": "012345",
        "chipIdPressure": "",
        "description": "f2",
        "brewDate": "f3",
        "style": "0123456789012345678901234567890123456789012345",  # Failure point
        "brewer": "f6",
        "brewfatherId": "1",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }

    # Add new
    r = app_client.post("/api/batch/", json=data, headers=headers)
    assert r.status_code == 422

    data = {
        "name": "f1",
        "chipIdGravity": "012345",
        "chipIdPressure": "",
        "description": "f2",
        "brewDate": "f3",
        "style": "f4",
        "brewer": "012345678901234567890012345678901234567890012345678901234567890",  # Failure point
        "brewfatherId": "1",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }

    # Add new
    r = app_client.post("/api/batch/", json=data, headers=headers)
    assert r.status_code == 422


def test_taplist(app_client):
    """Test getting batches in tap list"""
    test_init(app_client)
    
    # Create batch with tapList = True
    data = {
        "name": "Tap List Batch",
        "chipIdGravity": "AAAAAA",
        "chipIdPressure": "",
        "description": "test",
        "brewDate": "2024-01-01",
        "style": "IPA",
        "brewer": "test",
        "brewfatherId": "123",
        "active": True,
        "abv": 6.5,
        "ebc": 50,
        "ibu": 60,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }
    
    r = app_client.post("/api/batch/", json=data, headers=headers)
    assert r.status_code == 201
    
    # Create batch with tapList = False
    data["name"] = "Not in Tap List"
    data["chipIdGravity"] = "BBBBBB"
    data["tapList"] = False
    
    r = app_client.post("/api/batch/", json=data, headers=headers)
    assert r.status_code == 201
    
    # Get tap list (should only include first batch)
    r = app_client.get("/api/batch/taplist")
    assert r.status_code == 200
    res = json.loads(r.text)
    assert len(res) == 1
    assert res[0]["name"] == "Tap List Batch"
    assert res[0]["brewfatherId"] == "123"
    assert res[0]["abv"] == 6.5


def test_search_by_active_flag(app_client):
    """Test searching batches by active flag"""
    test_init(app_client)
    
    # Create active batch
    active_data = {
        "name": "Active Batch",
        "chipIdGravity": "AAAAAA",
        "chipIdPressure": "",
        "description": "test",
        "brewDate": "2024-01-01",
        "style": "IPA",
        "brewer": "test",
        "brewfatherId": "",
        "active": True,
        "abv": 6.5,
        "ebc": 50,
        "ibu": 60,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }
    
    r = app_client.post("/api/batch/", json=active_data, headers=headers)
    assert r.status_code == 201
    
    # Create inactive batch
    inactive_data = active_data.copy()
    inactive_data["name"] = "Inactive Batch"
    inactive_data["chipIdGravity"] = "BBBBBB"
    inactive_data["active"] = False
    
    r = app_client.post("/api/batch/", json=inactive_data, headers=headers)
    assert r.status_code == 201
    
    # Search for active only
    r = app_client.get("/api/batch/?active=true", headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert len(res) == 1
    assert res[0]["name"] == "Active Batch"
    assert res[0]["active"] == True
    
    # Search for inactive only
    r = app_client.get("/api/batch/?active=false", headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert len(res) == 1
    assert res[0]["name"] == "Inactive Batch"
    assert res[0]["active"] == False


def test_batch_with_gravity_and_pressure(app_client):
    """Test batch with related gravity and pressure records"""
    test_init(app_client)
    
    # Create batch
    batch_data = {
        "name": "Test Batch",
        "chipIdGravity": "AAAAAA",
        "chipIdPressure": "BBBBBB",
        "description": "test",
        "brewDate": "2024-01-01",
        "style": "IPA",
        "brewer": "test",
        "brewfatherId": "",
        "active": True,
        "abv": 6.5,
        "ebc": 50,
        "ibu": 60,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }
    
    r = app_client.post("/api/batch/", json=batch_data, headers=headers)
    assert r.status_code == 201
    batch_id = json.loads(r.text)["id"]
    
    # Add gravity record
    gravity_data = {
        "batchId": batch_id,
        "temperature": 20.0,
        "gravity": 1.050,
        "velocity": 0.1,
        "angle": 45.0,
        "battery": 3.8,
        "rssi": -75,
        "corrGravity": 1.050,
        "runTime": 0.8,
        "active": True,
    }
    
    r = app_client.post("/api/gravity/", json=gravity_data, headers=headers)
    assert r.status_code == 201
    
    # Add pressure record
    pressure_data = {
        "batchId": batch_id,
        "temperature": 20.0,
        "pressure": 1.050,
        "pressure1": 1.050,
        "battery": 3.8,
        "rssi": -75,
        "runTime": 0.8,
        "active": True,
    }
    
    r = app_client.post("/api/pressure/", json=pressure_data, headers=headers)
    assert r.status_code == 201
    
    # Get batch and verify counts
    r = app_client.get(f"/api/batch/{batch_id}", headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert len(res["gravity"]) == 1
    assert len(res["pressure"]) == 1
    
    # Get batch list and verify counts in list
    r = app_client.get("/api/batch/", headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res[0]["gravityCount"] == 1
    assert res[0]["pressureCount"] == 1

def test_batch_dashboard_inactive_batch(app_client):
    """Test dashboard endpoint returns 404 for inactive batch."""
    truncate_database()
    
    # Create an inactive batch
    data = {
        "name": "inactive_batch",
        "chipIdGravity": "AAAAAA",
        "chipIdPressure": "",
        "description": "test",
        "brewDate": "2024-01-01",
        "style": "IPA",
        "brewer": "test",
        "brewfatherId": "1",
        "active": False,
        "abv": 5.0,
        "ebc": 20,
        "ibu": 60,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": False,
    }
    
    r = app_client.post("/api/batch/", json=data, headers=headers)
    assert r.status_code == 201
    batch_id = json.loads(r.text)["id"]
    
    # Try to get dashboard for inactive batch
    r = app_client.get(f"/api/batch/{batch_id}/dashboard", headers=headers)
    assert r.status_code == 404
    assert "not active" in r.text


def test_batch_dashboard_with_gravity_and_pressure(app_client):
    """Test dashboard endpoint with gravity and pressure data."""
    truncate_database()
    
    # Create active batch
    batch_data = {
        "name": "test_batch",
        "chipIdGravity": "AAAAAA",
        "chipIdPressure": "BBBBBB",
        "description": "test",
        "brewDate": "2024-01-01",
        "style": "IPA",
        "brewer": "test",
        "brewfatherId": "1",
        "active": True,
        "abv": 5.0,
        "ebc": 20,
        "ibu": 60,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }
    
    r = app_client.post("/api/batch/", json=batch_data, headers=headers)
    batch_id = json.loads(r.text)["id"]
    
    # Add gravity readings with all required fields
    gravity_data = {
        "batchId": batch_id,
        "temperature": 20.0,
        "gravity": 1.050,
        "velocity": 0.0,
        "angle": 0.0,
        "battery": 3.0,
        "rssi": -50,
        "corrGravity": 1.050,
        "runTime": 0.0,
        "active": True,
        "chamberTemperature": 0,
        "beerTemperature": 0,
        "fermentationSteps": "",
    }
    app_client.post("/api/gravity/", json=gravity_data, headers=headers)
    app_client.post("/api/gravity/", json=gravity_data, headers=headers)
    app_client.post("/api/gravity/", json=gravity_data, headers=headers)
    
    # Add pressure readings with all required fields
    pressure_data = {
        "batchId": batch_id,
        "temperature": 20.0,
        "pressure": 1.5,
        "pressure1": 1.5,
        "battery": 3.0,
        "rssi": -50,
        "runTime": 0.0,
        "active": True,
    }
    app_client.post("/api/pressure/", json=pressure_data, headers=headers)
    app_client.post("/api/pressure/", json=pressure_data, headers=headers)
    app_client.post("/api/pressure/", json=pressure_data, headers=headers)
    
    # Add pour readings with all required fields
    pour_data = {
        "pour": 0.0,
        "volume": 10.0,
        "maxVolume": 20.0,
        "batchId": batch_id,
        "active": True,
    }
    app_client.post("/api/pour/", json=pour_data, headers=headers)
    app_client.post("/api/pour/", json=pour_data, headers=headers)
    app_client.post("/api/pour/", json=pour_data, headers=headers)
    
    # Get dashboard
    r = app_client.get(f"/api/batch/{batch_id}/dashboard", headers=headers)
    assert r.status_code == 200
    
    dash = json.loads(r.text)
    assert dash["id"] == batch_id
    assert dash["name"] == "test_batch"
    assert len(dash["gravity"]) == 2  # First and last
    assert len(dash["pressure"]) == 2  # First and last
    assert len(dash["pour"]) == 2  # First and last


def test_batch_dashboard_with_single_readings(app_client):
    """Test dashboard endpoint with only one reading of each type."""
    truncate_database()
    
    # Create active batch
    batch_data = {
        "name": "test_batch",
        "chipIdGravity": "AAAAAA",
        "chipIdPressure": "BBBBBB",
        "description": "test",
        "brewDate": "2024-01-01",
        "style": "IPA",
        "brewer": "test",
        "brewfatherId": "1",
        "active": True,
        "abv": 5.0,
        "ebc": 20,
        "ibu": 60,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }
    
    r = app_client.post("/api/batch/", json=batch_data, headers=headers)
    batch_id = json.loads(r.text)["id"]
    
    # Add single gravity reading
    gravity_data = {
        "batchId": batch_id,
        "temperature": 20.0,
        "gravity": 1.050,
        "velocity": 0.0,
        "angle": 0.0,
        "battery": 3.0,
        "rssi": -50,
        "corrGravity": 1.050,
        "runTime": 0.0,
        "active": True,
        "chamberTemperature": 0,
        "beerTemperature": 0,
        "fermentationSteps": "",
    }
    app_client.post("/api/gravity/", json=gravity_data, headers=headers)
    
    # Get dashboard
    r = app_client.get(f"/api/batch/{batch_id}/dashboard", headers=headers)
    assert r.status_code == 200
    
    dash = json.loads(r.text)
    assert len(dash["gravity"]) == 0  # Not enough for first+last
    assert len(dash["pressure"]) == 0
    assert len(dash["pour"]) == 0