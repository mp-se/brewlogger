import json
from api.db.session import engine
from sqlalchemy import text
from api.config import get_settings

headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}

def test_init(app_client):
    data = {
        "name": "f1",
        "chipId": "EEEEEE",
        "description": "f3",
        "brewDate": "f4",
        "style": "f5",
        "brewer": "f6",
        "brewfatherId": "",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
    }

    # Add new
    r = app_client.post("/api/batch/", json=data, headers=headers)
    assert r.status_code == 201

def test_add(app_client):
    data = {
        "batchId": 1,
        "temperature": 0,
        "pressure": 0.3,
        "battery": 0.5,
        "rssi": 0.6,
        "runTime": 0.8
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
    assert data["battery"] == data2["battery"]
    assert data["rssi"] == data2["rssi"]
    assert data["runTime"] == data2["runTime"]

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
        "battery": 1.5,
        "rssi": 1.6,
        "runTime": 1.8, }

    # Update existing entity
    r = app_client.patch("/api/pressure/1", json=data, headers=headers)
    assert r.status_code == 200

    # Read the entity and validate data
    r2 = app_client.get("/api/batch/1", headers=headers)
    assert r2.status_code == 200
    data2 = json.loads(r.text)
    assert data["temperature"] == data2["temperature"]
    assert data["pressure"] == data2["pressure"]
    assert data["battery"] == data2["battery"]
    assert data["rssi"] == data2["rssi"]
    assert data["runTime"] == data2["runTime"]

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
        "battery": 0.5,
        "rssi": 0.6,
        "runTime": 0.8
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
        "temp": 0,
        "temp_units": "C",
        "pressure": 1.05,
        "pressure_units": "hpa",
        "battery": 3.85,
        "rssi": -76.2,
        "run-time": 1.0,
    }
    r = app_client.post("/api/pressure/public", json=data)
    assert r.status_code == 200

    # Check relation to batch
    r = app_client.get("/api/batch/?chipId=EEEEE1", headers=headers)
    assert r.status_code == 200
    data2 = json.loads(r.text)
    assert len(data2) == 1

    data["id"] = "EEEEE2"
    r = app_client.post("/api/pressure/public", json=data)
    assert r.status_code == 200

    # Check relation to batch
    r = app_client.get("/api/batch/?chipId=EEEEE2", headers=headers)
    assert r.status_code == 200
    data2 = json.loads(r.text)
    assert len(data2) == 1

def test_validation(app_client):
    pass
