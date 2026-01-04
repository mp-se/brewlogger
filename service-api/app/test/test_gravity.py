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
        "velocity": 0.1,
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
    assert data["velocity"] == data2["velocity"]
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
    # Test listing all gravities
    r = app_client.get("/api/gravity/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1
    
    # Test listing gravities by batchId
    r = app_client.get("/api/gravity/?batchId=1", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1
    assert data[0]["batchId"] == 1
    
    # Test listing gravities with non-existent batchId
    r = app_client.get("/api/gravity/?batchId=999", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 0


def test_update(app_client):
    data = {
        "temperature": 1.2,
        "gravity": 1.3,
        "velocity": 1.1,
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
    assert data["velocity"] == data2["velocity"]
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


def test_create_multiple_gravities(app_client):
    """Test creating multiple gravity readings in a single request."""
    truncate_database()
    
    # First create a batch for the gravity readings
    batch_data = {
        "name": "test_batch_multi",
        "chipIdGravity": "BBBBBB",
        "chipIdPressure": "",
        "description": "test",
        "brewDate": "2025-01-01",
        "style": "IPA",
        "brewer": "Test",
        "brewfatherId": "",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": False,
    }
    
    batch_response = app_client.post("/api/batch/", json=batch_data, headers=headers)
    assert batch_response.status_code == 201
    batch_id = json.loads(batch_response.text)["id"]
    
    # Now create multiple gravity readings
    data = [
        {
            "batchId": batch_id,
            "temperature": 0.2,
            "gravity": 0.3,
            "velocity": 0.1,
            "angle": 0.4,
            "battery": 0.5,
            "rssi": 0.6,
            "corrGravity": 0.7,
            "runTime": 0.8,
            "active": True,
            "chamberTemperature": 0,
            "beerTemperature": 0,
            "fermentationSteps": "",
        },
        {
            "batchId": batch_id,
            "temperature": 0.5,
            "gravity": 0.6,
            "velocity": 0.2,
            "angle": 0.5,
            "battery": 0.6,
            "rssi": 0.7,
            "corrGravity": 0.8,
            "runTime": 0.9,
            "active": True,
            "chamberTemperature": 1,
            "beerTemperature": 1,
            "fermentationSteps": "",
        }
    ]

    # Add multiple gravities
    r = app_client.post("/api/gravity/", json=data, headers=headers)
    assert r.status_code == 201
    response = json.loads(r.text)
    assert isinstance(response, list)
    assert len(response) == 2
    assert response[0]["temperature"] == 0.2
    assert response[1]["temperature"] == 0.5


def test_gravity_batch(app_client):
    test_init(app_client)
    
    data = {
        "batchId": 1,
        "temperature": 0.2,
        "gravity": 0.3,
        "velocity": 0.1,
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
        "velocity": 0.1,
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
        "velocity": 0.1,
        "angle": 34.45,
        "battery": 3.85,
        "RSSI": -76.2,
    }
    r = app_client.post("/api/gravity/public", json=data)
    assert r.status_code == 200

    # Check relation to batch and validate stored values
    r = app_client.get("/api/batch/?chipId=AAAAA1", headers=headers)
    assert r.status_code == 200
    data2 = json.loads(r.text)
    print(data2)
    assert len(data2) == 1
    assert data2[0]["gravityCount"] == 1
    batch_id = data2[0]["id"]
    
    # Get the batch details which includes gravity records
    r = app_client.get(f"/api/batch/{batch_id}", headers=headers)
    assert r.status_code == 200
    batch_detail = json.loads(r.text)
    assert len(batch_detail["gravity"]) == 1
    gravity = batch_detail["gravity"][0]
    assert gravity["gravity"] == 1.05
    assert gravity["velocity"] == 0.1
    assert gravity["angle"] == 34.45
    assert gravity["battery"] == 3.85
    assert gravity["rssi"] == -76.2
    assert gravity["temperature"] == 20.2

    data["ID"] = "AAAAA2"
    r = app_client.post("/api/gravity/public", json=data)
    assert r.status_code == 200

    # Check relation to batch
    r = app_client.get("/api/batch/?chipId=AAAAA2", headers=headers)
    assert r.status_code == 200
    data2 = json.loads(r.text)
    assert len(data2) == 1

    data = {
        "name": "name",
        "ID": "AAAAAA",
        "token": "token",
        "interval": 1,
        "temperature": 56.2,
        "temp_units": "F",
        "gravity": 5,
        "velocity": 5.1,
        "angle": 34.45,
        "gravity_units": "P",
        "battery": 3.85,
        "RSSI": -76.2,
    }
    r = app_client.post("/api/gravity/public", json=data)
    assert r.status_code == 200
 

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


def test_public_with_none_values(app_client):
    """Test that optional fields with None values are handled correctly"""
    truncate_database()
    
    # Test with corr-gravity as None - should not crash
    gravity_data = {
        "name": "test",
        "ID": "ZZZZZ1",
        "token": "token",
        "interval": 1,
        "temperature": 20.2,
        "temp_units": "C",
        "gravity": 1.05,
        "velocity": None,
        "angle": 34.45,
        "gravity_units": "SG",
        "battery": 3.85,
        "RSSI": -76.2,
        "corr-gravity": None,
        "run-time": None,
    }
    r = app_client.post("/api/gravity/public", json=gravity_data)
    assert r.status_code == 200
    
    # Verify the first gravity reading was stored
    r = app_client.get("/api/gravity/latest?limit=1", headers=headers)
    assert r.status_code == 200
    gravities = json.loads(r.text)
    assert len(gravities) > 0
    assert gravities[0]["gravity"] == 1.05
    assert gravities[0]["temperature"] == 20.2
    assert gravities[0]["battery"] == 3.85
    
    # Test with all optional extension fields as None
    gravity_data = {
        "name": "test",
        "ID": "ZZZZZ2",
        "token": "token",
        "interval": 1,
        "temperature": 22.5,
        "temp_units": "C",
        "gravity": 1.08,
        "angle": 40.0,
        "battery": 3.5,
        "RSSI": -80.0,
        "corr-gravity": None,
        "gravity-unit": None,
        "run-time": None,
        "velocity": None,
    }
    r = app_client.post("/api/gravity/public", json=gravity_data)
    assert r.status_code == 200
    
    # Verify the second gravity reading was stored
    r = app_client.get("/api/gravity/latest?limit=1", headers=headers)
    assert r.status_code == 200
    gravities = json.loads(r.text)
    assert len(gravities) > 0
    assert gravities[0]["gravity"] == 1.08
    assert gravities[0]["temperature"] == 22.5
    assert gravities[0]["battery"] == 3.5


def test_validation(app_client):
    pass


def test_list_by_batchid(app_client):
    """Test listing gravities filtered by batchId"""
    truncate_database()
    
    # Create two batches
    batch1 = {
        "name": "batch1",
        "chipIdGravity": "AAAAAA",
        "chipIdPressure": "",
        "description": "batch1",
        "brewDate": "2024-01-01",
        "style": "IPA",
        "brewer": "test",
        "brewfatherId": "",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }
    
    batch2 = batch1.copy()
    batch2["name"] = "batch2"
    batch2["chipIdGravity"] = "BBBBBB"
    
    r = app_client.post("/api/batch/", json=batch1, headers=headers)
    assert r.status_code == 201
    batch1_id = json.loads(r.text)["id"]
    
    r = app_client.post("/api/batch/", json=batch2, headers=headers)
    assert r.status_code == 201
    batch2_id = json.loads(r.text)["id"]
    
    # Add gravities to batch 1
    gravity_data = {
        "batchId": batch1_id,
        "temperature": 20.0,
        "gravity": 1.050,
        "velocity": 0.1,
        "angle": 0.4,
        "battery": 3.8,
        "rssi": -76,
        "corrGravity": 1.050,
        "runTime": 0.8,
        "active": True,
    }
    
    for i in range(3):
        r = app_client.post("/api/gravity/", json=gravity_data, headers=headers)
        assert r.status_code == 201
    
    # Add gravities to batch 2
    gravity_data["batchId"] = batch2_id
    for i in range(2):
        r = app_client.post("/api/gravity/", json=gravity_data, headers=headers)
        assert r.status_code == 201
    
    # List all gravities
    r = app_client.get("/api/gravity/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 5
    
    # Filter by batch 1 (should get 3)
    r = app_client.get(f"/api/gravity/?batchId={batch1_id}", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 3
    assert all(g["batchId"] == batch1_id for g in data)
    
    # Filter by batch 2 (should get 2)
    r = app_client.get(f"/api/gravity/?batchId={batch2_id}", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 2
    assert all(g["batchId"] == batch2_id for g in data)


def test_latest(app_client):
    """Test getting the latest gravity measurements"""
    test_init(app_client)
    
    # Add 5 gravity records
    data = {
        "batchId": 1,
        "temperature": 0.2,
        "gravity": 0.3,
        "velocity": 0.1,
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
    
    for i in range(5):
        data["temperature"] = 0.2 + i
        data["gravity"] = 0.3 + i
        r = app_client.post("/api/gravity/", json=data, headers=headers)
        assert r.status_code == 201
    
    # Get latest 3
    r = app_client.get("/api/gravity/latest?limit=3", headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert len(res) == 3
    # Should be ordered newest first (descending by created)
    assert res[0]["gravity"] == 4.3  # Last added (i=4, 0.3 + 4)
    assert res[1]["gravity"] == 3.3  # i=3
    assert res[2]["gravity"] == 2.3  # i=2
    
    # Verify batch metadata is included
    assert res[0]["batchName"] == "f1"
    assert res[0]["chipIdGravity"] == "AAAAAA"
    
    # Get latest 10 (default)
    r = app_client.get("/api/gravity/latest", headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert len(res) == 5  # Only 5 records exist
    
    # Get latest 1
    r = app_client.get("/api/gravity/latest?limit=1", headers=headers)
    assert r.status_code == 200


def test_nullable_gravity_fields_in_create(app_client):
    """Test that nullable gravity fields (temperature, velocity, corr_gravity) can be None when creating"""
    truncate_database()
    
    # Create batch
    batch_data = {
        "name": "test_batch",
        "chipIdGravity": "AAAAAA",
        "chipIdPressure": "",
        "description": "test",
        "brewDate": "2024-01-01",
        "style": "IPA",
        "brewer": "test",
        "brewfatherId": "",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }
    r = app_client.post("/api/batch/", json=batch_data, headers=headers)
    assert r.status_code == 201
    
    # Test 1: Create gravity with null temperature
    gravity_data = {
        "batchId": 1,
        "temperature": None,
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
    res = json.loads(r.text)
    assert res["temperature"] is None
    assert res["gravity"] == 1.050
    
    # Test 2: Create gravity with null velocity
    gravity_data = {
        "batchId": 1,
        "temperature": 20.0,
        "gravity": 1.052,
        "velocity": None,
        "angle": 46.0,
        "battery": 3.8,
        "rssi": -75,
        "corrGravity": 1.052,
        "runTime": 0.8,
        "active": True,
    }
    r = app_client.post("/api/gravity/", json=gravity_data, headers=headers)
    assert r.status_code == 201
    res = json.loads(r.text)
    assert res["velocity"] is None
    assert res["gravity"] == 1.052
    
    # Test 3: Create gravity with null corr_gravity
    gravity_data = {
        "batchId": 1,
        "temperature": 21.0,
        "gravity": 1.054,
        "velocity": 0.2,
        "angle": 47.0,
        "battery": 3.8,
        "rssi": -75,
        "corrGravity": None,
        "runTime": 0.8,
        "active": True,
    }
    r = app_client.post("/api/gravity/", json=gravity_data, headers=headers)
    assert r.status_code == 201
    res = json.loads(r.text)
    assert res["corrGravity"] is None
    assert res["gravity"] == 1.054
    
    # Test 4: Create gravity with all nullable fields as None
    gravity_data = {
        "batchId": 1,
        "temperature": None,
        "gravity": 1.056,
        "velocity": None,
        "angle": 48.0,
        "battery": 3.8,
        "rssi": -75,
        "corrGravity": None,
        "runTime": 0.8,
        "active": True,
    }
    r = app_client.post("/api/gravity/", json=gravity_data, headers=headers)
    assert r.status_code == 201
    res = json.loads(r.text)
    assert res["temperature"] is None
    assert res["velocity"] is None
    assert res["corrGravity"] is None
    assert res["gravity"] == 1.056
    
    # Verify all 4 records were created
    r = app_client.get("/api/gravity/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 4


def test_nullable_gravity_fields_in_update(app_client):
    """Test that nullable gravity fields can be updated to None"""
    truncate_database()
    
    # Create batch and initial gravity
    batch_data = {
        "name": "test_batch",
        "chipIdGravity": "AAAAAA",
        "chipIdPressure": "",
        "description": "test",
        "brewDate": "2024-01-01",
        "style": "IPA",
        "brewer": "test",
        "brewfatherId": "",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }
    r = app_client.post("/api/batch/", json=batch_data, headers=headers)
    assert r.status_code == 201
    
    gravity_data = {
        "batchId": 1,
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
    gravity_id = json.loads(r.text)["id"]
    
    # Update temperature to None
    update_data = {
        "temperature": None,
        "gravity": 1.050,
        "velocity": 0.1,
        "angle": 45.0,
        "battery": 3.8,
        "rssi": -75,
        "corrGravity": 1.050,
        "runTime": 0.8,
        "active": True,
    }
    r = app_client.patch(f"/api/gravity/{gravity_id}", json=update_data, headers=headers)
    assert r.status_code == 200
    
    # Verify update
    r = app_client.get(f"/api/gravity/{gravity_id}", headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["temperature"] is None
    assert res["gravity"] == 1.050
    assert res["velocity"] == 0.1


def test_nullable_gravity_fields_in_latest(app_client):
    """Test that /latest endpoint handles nullable fields correctly"""
    truncate_database()
    
    # Create batch
    batch_data = {
        "name": "test_batch",
        "chipIdGravity": "AAAAAA",
        "chipIdPressure": "",
        "description": "test",
        "brewDate": "2024-01-01",
        "style": "IPA",
        "brewer": "test",
        "brewfatherId": "",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }
    r = app_client.post("/api/batch/", json=batch_data, headers=headers)
    assert r.status_code == 201
    
    # Create gravity with nullable fields
    gravity_data = {
        "batchId": 1,
        "temperature": None,
        "gravity": 1.050,
        "velocity": None,
        "angle": 45.0,
        "battery": 3.8,
        "rssi": -75,
        "corrGravity": None,
        "runTime": 0.8,
        "active": True,
    }
    r = app_client.post("/api/gravity/", json=gravity_data, headers=headers)
    assert r.status_code == 201
    
    # Verify /latest endpoint returns the data with nulls
    r = app_client.get("/api/gravity/latest?limit=1", headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert len(res) == 1
    assert res[0]["temperature"] is None
    assert res[0]["velocity"] is None
    assert res[0]["corrGravity"] is None
    assert res[0]["gravity"] == 1.050
    assert res[0]["batchName"] == "test_batch"


def test_nullable_chamber_and_beer_temperature(app_client):
    """Test that chamber_temperature and beer_temperature can be None"""
    truncate_database()
    
    # Create batch
    batch_data = {
        "name": "test_batch",
        "chipIdGravity": "AAAAAA",
        "chipIdPressure": "",
        "description": "test",
        "brewDate": "2024-01-01",
        "style": "IPA",
        "brewer": "test",
        "brewfatherId": "",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }
    r = app_client.post("/api/batch/", json=batch_data, headers=headers)
    assert r.status_code == 201
    
    # Test 1: Create gravity with null chamber_temperature and beer_temperature
    gravity_data = {
        "batchId": 1,
        "temperature": 20.0,
        "gravity": 1.050,
        "velocity": 0.1,
        "angle": 45.0,
        "battery": 3.8,
        "rssi": -75,
        "corrGravity": 1.050,
        "runTime": 0.8,
        "active": True,
        "chamberTemperature": None,
        "beerTemperature": None,
    }
    r = app_client.post("/api/gravity/", json=gravity_data, headers=headers)
    assert r.status_code == 201
    res = json.loads(r.text)
    assert res["chamberTemperature"] is None
    assert res["beerTemperature"] is None
    assert res["gravity"] == 1.050
    gravity_id = res["id"]
    
    # Test 2: Update to add chamber and beer temperatures
    update_data = {
        "temperature": 20.0,
        "gravity": 1.050,
        "velocity": 0.1,
        "angle": 45.0,
        "battery": 3.8,
        "rssi": -75,
        "corrGravity": 1.050,
        "runTime": 0.8,
        "active": True,
        "chamberTemperature": 18.5,
        "beerTemperature": 19.2,
    }
    r = app_client.patch(f"/api/gravity/{gravity_id}", json=update_data, headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["chamberTemperature"] == 18.5
    assert res["beerTemperature"] == 19.2
    
    # Test 3: Update back to None
    update_data["chamberTemperature"] = None
    update_data["beerTemperature"] = None
    r = app_client.patch(f"/api/gravity/{gravity_id}", json=update_data, headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["chamberTemperature"] is None
    assert res["beerTemperature"] is None


def test_nullable_run_time(app_client):
    """Test that run_time can be None"""
    truncate_database()
    
    # Create batch
    batch_data = {
        "name": "test_batch",
        "chipIdGravity": "AAAAAA",
        "chipIdPressure": "",
        "description": "test",
        "brewDate": "2024-01-01",
        "style": "IPA",
        "brewer": "test",
        "brewfatherId": "",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }
    r = app_client.post("/api/batch/", json=batch_data, headers=headers)
    assert r.status_code == 201
    
    # Create gravity with null run_time
    gravity_data = {
        "batchId": 1,
        "temperature": 20.0,
        "gravity": 1.050,
        "velocity": 0.1,
        "angle": 45.0,
        "battery": 3.8,
        "rssi": -75,
        "corrGravity": 1.050,
        "runTime": None,
        "active": True,
    }
    r = app_client.post("/api/gravity/", json=gravity_data, headers=headers)
    assert r.status_code == 201
    res = json.loads(r.text)
    assert res["runTime"] is None
    assert res["gravity"] == 1.050
    gravity_id = res["id"]
    
    # Update run_time with a value
    update_data = {
        "temperature": 20.0,
        "gravity": 1.050,
        "velocity": 0.1,
        "angle": 45.0,
        "battery": 3.8,
        "rssi": -75,
        "corrGravity": 1.050,
        "runTime": 2.5,
        "active": True,
    }
    r = app_client.patch(f"/api/gravity/{gravity_id}", json=update_data, headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["runTime"] == 2.5
    
    # Update back to None
    update_data["runTime"] = None
    r = app_client.patch(f"/api/gravity/{gravity_id}", json=update_data, headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["runTime"] is None


def test_all_nullable_fields_together(app_client):
    """Test creating and updating gravity with all nullable fields as None"""
    truncate_database()
    
    # Create batch
    batch_data = {
        "name": "test_batch",
        "chipIdGravity": "AAAAAA",
        "chipIdPressure": "",
        "description": "test",
        "brewDate": "2024-01-01",
        "style": "IPA",
        "brewer": "test",
        "brewfatherId": "",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
        "fermentationChamber": 0,
        "fermentationSteps": "",
        "tapList": True,
    }
    r = app_client.post("/api/batch/", json=batch_data, headers=headers)
    assert r.status_code == 201
    
    # Create gravity with ALL nullable fields as None
    gravity_data = {
        "batchId": 1,
        "temperature": None,
        "gravity": 1.050,
        "velocity": None,
        "angle": 45.0,
        "battery": 3.8,
        "rssi": -75,
        "corrGravity": None,
        "runTime": None,
        "active": True,
        "chamberTemperature": None,
        "beerTemperature": None,
    }
    r = app_client.post("/api/gravity/", json=gravity_data, headers=headers)
    assert r.status_code == 201
    res = json.loads(r.text)
    assert res["temperature"] is None
    assert res["velocity"] is None
    assert res["corrGravity"] is None
    assert res["runTime"] is None
    assert res["chamberTemperature"] is None
    assert res["beerTemperature"] is None
    assert res["gravity"] == 1.050
    assert res["angle"] == 45.0
    assert res["battery"] == 3.8
    gravity_id = res["id"]
    
    # Verify GET returns the same
    r = app_client.get(f"/api/gravity/{gravity_id}", headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["temperature"] is None
    assert res["velocity"] is None
    assert res["corrGravity"] is None
    assert res["runTime"] is None
    assert res["chamberTemperature"] is None
    assert res["beerTemperature"] is None
    
    # Update all nullable fields with actual values
    update_data = {
        "temperature": 20.5,
        "gravity": 1.052,
        "velocity": 0.2,
        "angle": 46.0,
        "battery": 3.9,
        "rssi": -70,
        "corrGravity": 1.051,
        "runTime": 1.5,
        "active": True,
        "chamberTemperature": 18.0,
        "beerTemperature": 19.5,
    }
    r = app_client.patch(f"/api/gravity/{gravity_id}", json=update_data, headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["temperature"] == 20.5
    assert res["velocity"] == 0.2
    assert res["corrGravity"] == 1.051
    assert res["runTime"] == 1.5
    assert res["chamberTemperature"] == 18.0
    assert res["beerTemperature"] == 19.5
