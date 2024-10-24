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
        "chipId": "DDDDDD",
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
    data = {"pour": 0.1, "volume": 0.2, "maxVolume": 1, "batchId": 1, "active": True}

    # Add new
    r = app_client.post("/api/pour/", json=data, headers=headers)
    assert r.status_code == 201
    data1 = json.loads(r.text)
    assert data1["id"] == 1

    # Read data and check values
    r2 = app_client.get("/api/pour/1", headers=headers)
    assert r2.status_code == 200
    data2 = json.loads(r.text)
    assert data["pour"] == data2["pour"]
    assert data["volume"] == data2["volume"]
    assert data["maxVolume"] == data2["maxVolume"]
    assert data["active"] == data2["active"]

    # Not using a number for index
    r2 = app_client.get("/api/pour/hello", headers=headers)
    assert r2.status_code == 422


def test_list(app_client):
    r = app_client.get("/api/pour/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1


def test_update(app_client):
    data = {
        "pour": 1.1,
        "volume": 1.2,
        "maxVolume": 2, 
        "batchId": 1,
        "active": True,
    }

    # Update existing entity
    r = app_client.patch("/api/pour/1", json=data, headers=headers)
    assert r.status_code == 200


def test_delete(app_client):
    # Delete
    r = app_client.delete("/api/pour/1", headers=headers)
    assert r.status_code == 204

    # Check how many are stored
    r = app_client.get("/api/pour/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 0


def test_public(app_client):
    data = {"pour": 0.1, "id": "1"}

    # Add new
    r = app_client.post("/api/pour/public", json=data, headers=headers)
    assert r.status_code == 200

    data = {"pour": 0.1, "id": "2"}

    # Add new
    r = app_client.post("/api/pour/public", json=data, headers=headers)
    assert r.status_code == 404

    data = {"volume": 0.1, "maxVolume": 1, "id": "1"}

    # Add new
    r = app_client.post("/api/pour/public", json=data, headers=headers)
    assert r.status_code == 200

    data = {"pour": 0.1, "volume": 10, "maxVolume": 20, "id": "1"}

    # Add new
    r = app_client.post("/api/pour/public", json=data, headers=headers)
    assert r.status_code == 200
