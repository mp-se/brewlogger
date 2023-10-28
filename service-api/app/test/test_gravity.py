import json
from api.db.session import engine
from sqlalchemy import text
from api.config import get_settings

headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}

def test_init(app_client):
    r = app_client.delete("/html/test/cleardb", headers=headers)
    assert r.status_code == 204

    data = {
        "name": "f1",
        "chipId": "012345",
        "description": "f3",
        "brewDate": "f4",
        "style": "f5",
        "brewer": "f6",
        "brewfatherId": "f7",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
    }

    # Add new
    r = app_client.post("/api/batch/", json=data, headers=headers)
    assert r.status_code == 201
    #r = app_client.post("/api/batch/", json=data, headers=headers)
    #assert r.status_code == 201


def test_add(app_client):
    data = {
        "chipId": "012345",
        "name": "f3",
        "batchId": 1,
        "token": "f2",
        "interval": 1,
        "temperature": 0.2,
        "tempUnits": "C",
        "gravity": 0.3,
        "angle": 0.4,
        "battery": 0.5,
        "rssi": 0.6,
        "corrGravity": 0.7,
        "gravityUnits": "SG",
        "runTime": 0.8
    }

    # Add new
    r = app_client.post("/api/gravity/", json=data, headers=headers)
    assert r.status_code == 201
    data1 = json.loads(r.text)
    assert data1["id"] == 1

    # Read data and check values
    r2 = app_client.get("/api/gravity/1", headers=headers)
    assert r2.status_code == 200
    data2 = json.loads(r.text)
    assert data["chipId"] == data2["chipId"]
    assert data["token"] == data2["token"]
    assert data["interval"] == data2["interval"]
    assert data["temperature"] == data2["temperature"]
    assert data["tempUnits"] == data2["tempUnits"]
    assert data["gravity"] == data2["gravity"]
    assert data["angle"] == data2["angle"]
    assert data["battery"] == data2["battery"]
    assert data["rssi"] == data2["rssi"]
    assert data["corrGravity"] == data2["corrGravity"]
    assert data["gravityUnits"] == data2["gravityUnits"]
    assert data["runTime"] == data2["runTime"]

    # Not using a number for index
    r2 = app_client.get("/api/gravity/hello", headers=headers)
    assert r2.status_code == 422

def test_list(app_client):
    r = app_client.get("/api/gravity/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1

def test_update(app_client):
    data = {
        "chipId": "012345",
        "name": "f3",
        "token": "f2",
        "interval": 2,
        "temperature": 1.2,
        "tempUnits": "F",
        "gravity": 1.3,
        "angle": 1.4,
        "battery": 1.5,
        "rssi": 1.6,
        "corrGravity": 1.7,
        "gravityUnits": "P",
        "runTime": 1.8,    }

    # Update existing entity
    r = app_client.patch("/api/gravity/1", json=data, headers=headers)
    assert r.status_code == 200

    # Read the entity and validate data
    r2 = app_client.get("/api/batch/1", headers=headers)
    assert r2.status_code == 200
    data2 = json.loads(r.text)
    assert data["chipId"] == data2["chipId"]
    assert data["token"] == data2["token"]
    assert data["interval"] == data2["interval"]
    assert data["temperature"] == data2["temperature"]
    assert data["tempUnits"] == data2["tempUnits"]
    assert data["gravity"] == data2["gravity"]
    assert data["angle"] == data2["angle"]
    assert data["battery"] == data2["battery"]
    assert data["rssi"] == data2["rssi"]
    assert data["corrGravity"] == data2["corrGravity"]
    assert data["gravityUnits"] == data2["gravityUnits"]
    assert data["runTime"] == data2["runTime"]


    # Update missing entity
    r = app_client.patch("/api/gravity/10", json=data, headers=headers)
    assert r.status_code == 404

def test_delete(app_client):
    # Delete
    r = app_client.delete("/api/gravity/1", headers=headers)
    assert r.status_code == 204

    # Check how many are stored
    r = app_client.get("/api/gravity/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 0

def test_gravity_batch(app_client):
    data = {
        "chipId": "012345",
        "name": "f3",
        "batchId": 1,
        "token": "f2",
        "interval": 1,
        "temperature": 0.2,
        "tempUnits": "C",
        "gravity": 0.3,
        "angle": 0.4,
        "battery": 0.5,
        "rssi": 0.6,
        "corrGravity": 0.7,
        "gravityUnits": "P",
        "runTime": 0.8
    }

    # Add new
    r = app_client.post("/api/gravity/", json=data, headers=headers)
    assert r.status_code == 201
    r = app_client.post("/api/gravity/", json=data, headers=headers)
    assert r.status_code == 201

    # Check relation to batch
    r = app_client.get("/api/batch/1", headers=headers)
    assert r.status_code == 200
    data2 = json.loads(r.text)
    assert len(data2["gravity"]) == 2


def test_ispindel(app_client):
    test_init(app_client)
    data = {
        "name": "name",
        "ID": "012345",
        "token": "token",
        "interval": 1,
        "temperature": 20.2,
        "temp_units": "C",
        "gravity": 1.05,
        "angle": 34.45,
        "battery": 3.85,
        "RSSI": -76.2,
    }
    r = app_client.post("/api/gravity/ispindel", json=data)
    assert r.status_code == 200

    # Check relation to batch
    r = app_client.get("/api/batch/", headers=headers)
    assert r.status_code == 200
    data2 = json.loads(r.text)
    assert len(data2) == 1

    data["ID"] = "012346"
    r = app_client.post("/api/gravity/ispindel", json=data)
    assert r.status_code == 200

    # Check relation to batch
    r = app_client.get("/api/batch/", headers=headers)
    assert r.status_code == 200
    data2 = json.loads(r.text)
    assert len(data2) == 2

def test_validation(app_client):
    data = {
        "chipId": "0123456", # too long name
        "name": "",
        "batchId": 1,
        "token": "",
        "interval": 0,
        "temperature": 0.0,
        "tempUnits": "C",
        "gravity": 0.0,
        "angle": 0.0,
        "battery": 0.0,
        "rssi": 0.0,
        "corrGravity": 0.0,
        "gravityUnits": "SG",
        "runTime": 0.0
    }

    # Add new
    r = app_client.post("/api/gravity/", json=data, headers=headers)
    assert r.status_code == 422

    data = {
        "chipId": "012345",
        "name": "",
        "batchId": 1,
        "token": "",
        "interval": 0,
        "temperature": 0.0,
        "tempUnits": "X", # invalid value
        "gravity": 0.0,
        "angle": 0.0,
        "battery": 0.0,
        "rssi": 0.0,
        "corrGravity": 0.0,
        "gravityUnits": "SG",
        "runTime": 0.0
    }

    # Add new
    r = app_client.post("/api/gravity/", json=data, headers=headers)
    assert r.status_code == 422

    data = {
        "chipId": "012345",
        "name": "",
        "batchId": 1,
        "token": "",
        "interval": 0,
        "temperature": 0.0,
        "tempUnits": "C",
        "gravity": 0.0,
        "angle": 0.0,
        "battery": 0.0,
        "rssi": 0.0,
        "corrGravity": 0.0,
        "gravityUnits": "XX", # invalid value
        "runTime": 0.0
    }

    # Add new
    r = app_client.post("/api/gravity/", json=data, headers=headers)
    assert r.status_code == 422

    data = {
        "chipId": "012345",
        "name": "",
        "batchId": 1,
        "token": "01234567890123456789012345678901234567890", # too long name
        "interval": 0,
        "temperature": 0.0,
        "tempUnits": "C",
        "gravity": 0.0,
        "angle": 0.0,
        "battery": 0.0,
        "rssi": 0.0,
        "corrGravity": 0.0,
        "gravityUnits": "SG",
        "runTime": 0.0
    }

    # Add new
    r = app_client.post("/api/gravity/", json=data, headers=headers)
    assert r.status_code == 422

    data = {
        "chipId": "012345",
        "name": "01234567890123456789012345678901234567890", # too long name
        "batchId": 1,
        "token": "",
        "interval": 0,
        "temperature": 0.0,
        "tempUnits": "C",
        "gravity": 0.0,
        "angle": 0.0,
        "battery": 0.0,
        "rssi": 0.0,
        "corrGravity": 0.0,
        "gravityUnits": "SG",
        "runTime": 0.0
    }

    r = app_client.post("/api/gravity/", json=data, headers=headers)
    assert r.status_code == 422
