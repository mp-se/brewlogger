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
        "chipIdGravity": "AAAAAA",
        "chipIdPressure": "",
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
        "temperature": 0.2,
        "gravity": 0.3,
        "angle": 0.4,
        "battery": 0.5,
        "rssi": 0.6,
        "corrGravity": 0.7,
        "runTime": 0.8,
        "active": True,
        "chamberTemperature": 0,
        "beerTemperature": 0,
        "fermentationSteps": "",
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
    assert data["temperature"] == data2["temperature"]
    assert data["gravity"] == data2["gravity"]
    assert data["angle"] == data2["angle"]
    assert data["battery"] == data2["battery"]
    assert data["rssi"] == data2["rssi"]
    assert data["corrGravity"] == data2["corrGravity"]
    assert data["runTime"] == data2["runTime"]
    assert data["active"] == data2["active"]
    assert data["chamberTemperature"] == data2["chamberTemperature"]
    assert data["beerTemperature"] == data2["beerTemperature"]

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
        "temperature": 1.2,
        "gravity": 1.3,
        "angle": 1.4,
        "battery": 1.5,
        "rssi": 1.6,
        "corrGravity": 1.7,
        "runTime": 1.8,
        "active": True,
        "chamberTemperature": 0,
        "beerTemperature": 0,
    }

    # Update existing entity
    r = app_client.patch("/api/gravity/1", json=data, headers=headers)
    assert r.status_code == 200

    # Read the entity and validate data
    r2 = app_client.get("/api/batch/1", headers=headers)
    assert r2.status_code == 200
    data2 = json.loads(r.text)
    assert data["temperature"] == data2["temperature"]
    assert data["gravity"] == data2["gravity"]
    assert data["angle"] == data2["angle"]
    assert data["battery"] == data2["battery"]
    assert data["rssi"] == data2["rssi"]
    assert data["corrGravity"] == data2["corrGravity"]
    assert data["runTime"] == data2["runTime"]
    assert data["active"] == data2["active"]
    assert data["chamberTemperature"] == data2["chamberTemperature"]
    assert data["beerTemperature"] == data2["beerTemperature"]

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
        "batchId": 1,
        "temperature": 0.2,
        "gravity": 0.3,
        "angle": 0.4,
        "battery": 0.5,
        "rssi": 0.6,
        "corrGravity": 0.7,
        "runTime": 0.8,
        "active": True,
        "chamberTemperature": 0,
        "beerTemperature": 0,
        "fermentationSteps": "",
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

    data = {
        "batchId": 1,
        "temperature": 0.2,
        "gravity": 0.3,
        "angle": 0.4,
        "battery": 0.5,
        "rssi": 0.6,
        "corrGravity": 0.7,
        "runTime": 0.8,
        "active": True,
    }

    # Add new without optional params
    r = app_client.post("/api/gravity/", json=data, headers=headers)
    assert r.status_code == 201


def test_public(app_client):
    test_init(app_client)
    data = {
        "name": "name",
        "ID": "AAAAA1",
        "token": "token",
        "interval": 1,
        "temperature": 20.2,
        "temp_units": "C",
        "gravity": 1.05,
        "angle": 34.45,
        "battery": 3.85,
        "RSSI": -76.2,
    }
    r = app_client.post("/api/gravity/public", json=data)
    assert r.status_code == 200

    # Check relation to batch
    r = app_client.get("/api/batch/?chipId=AAAAA1", headers=headers)
    assert r.status_code == 200
    data2 = json.loads(r.text)
    print(data2)
    assert len(data2) == 1
    assert data2[0]["gravity"][0]["gravity"] == 1.05
    assert data2[0]["gravity"][0]["angle"] == 34.45
    assert data2[0]["gravity"][0]["battery"] == 3.85
    assert data2[0]["gravity"][0]["rssi"] == -76.2
    assert data2[0]["gravity"][0]["runTime"] == 0.0
    assert data2[0]["gravity"][0]["temperature"] == 20.2

    data["ID"] = "AAAAA2"
    r = app_client.post("/api/gravity/public", json=data)
    assert r.status_code == 200

    # Check relation to batch
    r = app_client.get("/api/batch/?chipId=AAAAA2", headers=headers)
    assert r.status_code == 200
    data2 = json.loads(r.text)
    print(data2)
    assert len(data2) == 1

    data = {
        "name": "name",
        "ID": "AAAAAA",
        "token": "token",
        "interval": 1,
        "temperature": 56.2,
        "temp_units": "F",
        "gravity": 5,
        "angle": 34.45,
        "gravity_units": "P",
        "battery": 3.85,
        "RSSI": -76.2,
    }
    r = app_client.post("/api/gravity/public", json=data)
    assert r.status_code == 200
    assert data2[0]["gravity"][0]["gravity"] == 1.05
    assert data2[0]["gravity"][0]["angle"] == 34.45
    assert data2[0]["gravity"][0]["battery"] == 3.85
    assert data2[0]["gravity"][0]["rssi"] == -76.2
    assert data2[0]["gravity"][0]["runTime"] == 0.0
    assert data2[0]["gravity"][0]["temperature"] == 20.2


def test_public2(app_client):
    test_init(app_client)

    data = {
        "chipId": "AAAAA3",
        "chipFamily": "",
        "software": "",
        "description": "",
        "mdns": "",
        "config": "",
        "url": "",
        "bleColor": "red",
        "collectLogs": False,
    }

    r = app_client.post("/api/device/", json=data, headers=headers)
    assert r.status_code == 201

    data = {
        "color": "red",
        "gravity": 1.001,
        "temperature": 42,
        "RSSI": -65,
    }
    r = app_client.post("/api/gravity/public", json=data)
    assert r.status_code == 200


def test_validation(app_client):
    pass
