import json
from api.config import get_settings
from .conftest import truncate_database

headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}


def test_init(app_client):
    truncate_database()

    data = {
        "name": "f1",
        "chipIdGravity": "",
        "chipIdPressure": "EEEEEE",
        "description": "f3",
        "brewDate": "f4",
        "style": "f5",
        "brewer": "f6",
        "brewfatherId": "",
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
    assert r.status_code == 201


def test_add(app_client):
    data = {
        "batchId": 1,
        "temperature": 0,
        "pressure": 0.3,
        "pressure1": 0.4,
        "battery": 0.5,
        "rssi": 0.6,
        "runTime": 0.8,
        "active": True,
    }

    # Add new
    r = app_client.post("/api/pressure/", json=data, headers=headers)
    assert r.status_code == 201
    data1 = json.loads(r.text)
    assert data1["id"] == 1

    # Read data and check values
    r2 = app_client.get("/api/pressure/1", headers=headers)
    assert r2.status_code == 200
    data2 = json.loads(r.text)
    assert data["temperature"] == data2["temperature"]
    assert data["pressure"] == data2["pressure"]
    assert data["pressure1"] == data2["pressure1"]
    assert data["battery"] == data2["battery"]
    assert data["rssi"] == data2["rssi"]
    assert data["runTime"] == data2["runTime"]
    assert data["active"] == data2["active"]

    # Not using a number for index
    r2 = app_client.get("/api/pressure/hello", headers=headers)
    assert r2.status_code == 422


def test_list(app_client):
    r = app_client.get("/api/pressure/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1


def test_update(app_client):
    data = {
        "temperature": 0,
        "pressure": 1.3,
        "pressure1": 2.3,
        "battery": 1.5,
        "rssi": 1.6,
        "runTime": 1.8,
        "active": True,
    }

    # Update existing entity
    r = app_client.patch("/api/pressure/1", json=data, headers=headers)
    assert r.status_code == 200

    # Read the entity and validate data
    r2 = app_client.get("/api/batch/1", headers=headers)
    assert r2.status_code == 200
    data2 = json.loads(r.text)
    assert data["temperature"] == data2["temperature"]
    assert data["pressure"] == data2["pressure"]
    assert data["pressure1"] == data2["pressure1"]
    assert data["battery"] == data2["battery"]
    assert data["rssi"] == data2["rssi"]
    assert data["runTime"] == data2["runTime"]
    assert data["active"] == data2["active"]

    # Update missing entity
    r = app_client.patch("/api/pressure/10", json=data, headers=headers)
    assert r.status_code == 404


def test_delete(app_client):
    # Delete
    r = app_client.delete("/api/pressure/1", headers=headers)
    assert r.status_code == 204

    # Check how many are stored
    r = app_client.get("/api/pressure/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 0


def test_pressure_batch(app_client):
    data = {
        "batchId": 1,
        "temperature": 0,
        "pressure": 0.3,
        "pressure1": 0.5,
        "battery": 0.5,
        "rssi": 0.6,
        "runTime": 0.8,
        "active": True,
    }

    # Add new
    r = app_client.post("/api/pressure/", json=data, headers=headers)
    assert r.status_code == 201
    r = app_client.post("/api/pressure/", json=data, headers=headers)
    assert r.status_code == 201

    # Check relation to batch
    r = app_client.get("/api/batch/1", headers=headers)
    assert r.status_code == 200
    data2 = json.loads(r.text)
    assert len(data2["pressure"]) == 2


def test_public(app_client):
    test_init(app_client)
    data = {
        "name": "012345",
        "token": "",
        "interval": 0,
        "id": "EEEEE1",
        "temperature": 0,
        "temperature-unit": "C",
        "pressure": 1.05,
        "pressure-unit": "kPa",
        "battery": 3.85,
        "rssi": -76.2,
        "run-time": 1.0,
    }
    r = app_client.post("/api/pressure/public", json=data)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["pressure"] == 1.05
    assert res["battery"] == 3.85
    assert res["rssi"] == -76.2
    assert res["temperature"] == 0.0

    # Check relation to batch and validate stored values
    r = app_client.get("/api/batch/?chipId=EEEEE1", headers=headers)
    assert r.status_code == 200
    data2 = json.loads(r.text)
    assert len(data2) == 1
    print(data2)
    assert data2[0]["pressureCount"] == 1
    batch_id = data2[0]["id"]
    
    # Get the batch details which includes pressure records
    r = app_client.get(f"/api/batch/{batch_id}", headers=headers)
    assert r.status_code == 200
    batch_detail = json.loads(r.text)
    assert len(batch_detail["pressure"]) == 1
    pressure = batch_detail["pressure"][0]
    assert pressure["pressure"] == 1.05
    assert pressure["battery"] == 3.85
    assert pressure["rssi"] == -76.2
    assert pressure["temperature"] == 0.0

    data["id"] = "EEEEE2"
    r = app_client.post("/api/pressure/public", json=data)
    assert r.status_code == 200

    # Check relation to batch
    r = app_client.get("/api/batch/?chipId=EEEEE2", headers=headers)
    assert r.status_code == 200
    data2 = json.loads(r.text)
    assert len(data2) == 1

    data = {
        "name": "012345",
        "token": "",
        "interval": 0,
        "id": "EEEEE3",
        "temperature": 10,
        "temperature-unit": "C",
        "pressure": 1.15,
        "pressure1": 1.25,
        "pressure-unit": "PSI",
        "battery": 3.85,
        "rssi": -72.2,
        "run-time": 1.1,
    }
    r = app_client.post("/api/pressure/public", json=data)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["pressure"] == 7.929  # 1.15 * 6.89476 rounded to 3 decimals
    assert res["pressure1"] == 8.6184  # 1.25 * 6.89476 rounded to 4 decimals
    assert res["battery"] == 3.85
    assert res["rssi"] == -72.2
    assert res["runTime"] == 1.1
    assert res["temperature"] == 10.0

    # Check relation to batch and validate stored values
    r = app_client.get("/api/batch/?chipId=EEEEE3", headers=headers)
    assert r.status_code == 200
    data2 = json.loads(r.text)
    assert len(data2) == 1
    print(data2)
    assert data2[0]["pressureCount"] == 1
    batch_id = data2[0]["id"]
    
    # Get the batch details which includes pressure records
    r = app_client.get(f"/api/batch/{batch_id}", headers=headers)
    assert r.status_code == 200
    batch_detail = json.loads(r.text)
    assert len(batch_detail["pressure"]) == 1
    pressure = batch_detail["pressure"][0]
    assert pressure["pressure"] == 7.929
    assert pressure["pressure1"] == 8.6184
    assert pressure["battery"] == 3.85
    assert pressure["rssi"] == -72.2
    assert pressure["runTime"] == 1.1
    assert pressure["temperature"] == 10.0

    data = {
        "name": "012345",
        "token": "",
        "interval": 0,
        "id": "EEEEE4",
        "temperature": 10,
        "temperature-unit": "F",
        "pressure": 1.15,
        "pressure1": 1.25,
        "pressure-unit": "Bar",
        "battery": 3.85,
        "rssi": -72.2,
        "run-time": 1.1,
    }
    r = app_client.post("/api/pressure/public", json=data)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["pressure"] == 1150.0  # 1.15 * 1000
    assert res["pressure1"] == 1250.0  # 1.25 * 1000
    assert res["battery"] == 3.85
    assert res["rssi"] == -72.2
    assert res["runTime"] == 1.1
    assert res["temperature"] == -12.22  # (10 - 32) * 5/9

    # Check relation to batch and validate stored values
    r = app_client.get("/api/batch/?chipId=EEEEE4", headers=headers)
    assert r.status_code == 200
    data2 = json.loads(r.text)
    assert len(data2) == 1
    print(data2)
    assert data2[0]["pressureCount"] == 1
    batch_id = data2[0]["id"]
    
    # Get the batch details which includes pressure records
    r = app_client.get(f"/api/batch/{batch_id}", headers=headers)
    assert r.status_code == 200
    batch_detail = json.loads(r.text)
    assert len(batch_detail["pressure"]) == 1
    pressure = batch_detail["pressure"][0]
    assert pressure["pressure"] == 1150.0
    assert pressure["pressure1"] == 1250.0
    assert pressure["battery"] == 3.85
    assert pressure["rssi"] == -72.2
    assert pressure["runTime"] == 1.1
    assert abs(pressure["temperature"] - (-12.22)) < 0.01  # Allow small float precision difference


def test_public_with_none_pressure1(app_client):
    """Test that pressure1 with None value is handled correctly"""
    truncate_database()
    
    # Test with pressure1 as None - should not crash
    data = {
        "name": "012345",
        "token": "",
        "interval": 0,
        "id": "ZZZZZ1",
        "temperature": 20,
        "temperature-unit": "C",
        "pressure": 1.05,
        "pressure1": None,
        "pressure-unit": "kPa",
        "battery": 3.85,
        "rssi": -76.2,
        "run-time": 1.0,
    }
    r = app_client.post("/api/pressure/public", json=data)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["pressure"] == 1.05
    assert res["pressure1"] == 0.0
    assert res["battery"] == 3.85
    assert res["temperature"] == 20
    
    # Test with pressure1 None and unit conversion (PSI)
    data = {
        "name": "012345",
        "token": "",
        "interval": 0,
        "id": "ZZZZZ2",
        "temperature": 20,
        "temperature-unit": "C",
        "pressure": 1.05,
        "pressure1": None,
        "pressure-unit": "PSI",
        "battery": 3.85,
        "rssi": -76.2,
        "run-time": 1.0,
    }
    r = app_client.post("/api/pressure/public", json=data)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["pressure"] == 7.2395  # 1.05 * 6.89476
    assert res["pressure1"] == 0.0  # Stays 0 when None
    assert res["battery"] == 3.85
    
    # Test with pressure1 None and unit conversion (BAR)
    data = {
        "name": "012345",
        "token": "",
        "interval": 0,
        "id": "ZZZZZ3",
        "temperature": 20,
        "temperature-unit": "C",
        "pressure": 1.05,
        "pressure1": None,
        "pressure-unit": "BAR",
        "battery": 3.85,
        "rssi": -76.2,
        "run-time": 1.0,
    }
    r = app_client.post("/api/pressure/public", json=data)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["pressure"] == 1050.0  # 1.05 * 1000
    assert res["pressure1"] == 0.0  # Stays 0 when None
    assert res["battery"] == 3.85


def test_validation(app_client):
    pass
