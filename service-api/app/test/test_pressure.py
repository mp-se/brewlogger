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
    # Test listing all pressures
    r = app_client.get("/api/pressure/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1
    
    # Test listing pressures by batchId
    r = app_client.get("/api/pressure/?batchId=1", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1
    assert data[0]["batchId"] == 1
    
    # Test listing pressures with non-existent batchId
    r = app_client.get("/api/pressure/?batchId=999", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 0


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
    assert res["pressure1"] is None  # Returns None when not provided
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
    assert res["pressure1"] is None  # Stays None when None
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
    assert res["pressure1"] is None  # Stays None when None
    assert res["battery"] == 3.85


def test_validation(app_client):
    pass


def test_list_by_batchid(app_client):
    """Test listing pressures filtered by batchId"""
    truncate_database()
    
    # Create two batches
    batch1 = {
        "name": "batch1",
        "chipIdGravity": "",
        "chipIdPressure": "AAAAAA",
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
    batch2["chipIdPressure"] = "BBBBBB"
    
    r = app_client.post("/api/batch/", json=batch1, headers=headers)
    assert r.status_code == 201
    batch1_id = json.loads(r.text)["id"]
    
    r = app_client.post("/api/batch/", json=batch2, headers=headers)
    assert r.status_code == 201
    batch2_id = json.loads(r.text)["id"]
    
    # Add pressures to batch 1
    pressure_data = {
        "batchId": batch1_id,
        "temperature": 20.0,
        "pressure": 1.050,
        "pressure1": 1.050,
        "battery": 3.8,
        "rssi": -76,
        "runTime": 0.8,
        "active": True,
    }
    
    for i in range(3):
        r = app_client.post("/api/pressure/", json=pressure_data, headers=headers)
        assert r.status_code == 201
    
    # Add pressures to batch 2
    pressure_data["batchId"] = batch2_id
    for i in range(2):
        r = app_client.post("/api/pressure/", json=pressure_data, headers=headers)
        assert r.status_code == 201
    
    # List all pressures
    r = app_client.get("/api/pressure/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 5
    
    # Filter by batch 1 (should get 3)
    r = app_client.get(f"/api/pressure/?batchId={batch1_id}", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 3
    assert all(p["batchId"] == batch1_id for p in data)
    
    # Filter by batch 2 (should get 2)
    r = app_client.get(f"/api/pressure/?batchId={batch2_id}", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 2
    assert all(p["batchId"] == batch2_id for p in data)


def test_latest(app_client):
    """Test getting the latest pressure measurements"""
    test_init(app_client)
    
    # Add 5 pressure records
    data = {
        "batchId": 1,
        "temperature": 20.0,
        "pressure": 1.0,
        "pressure1": 0.0,
        "battery": 3.5,
        "rssi": -70.0,
        "runTime": 1.0,
        "active": True,
    }
    
    for i in range(5):
        data["temperature"] = 20.0 + i
        data["pressure"] = 1.0 + i * 0.1
        r = app_client.post("/api/pressure/", json=data, headers=headers)
        assert r.status_code == 201
    
    # Get latest 3
    r = app_client.get("/api/pressure/latest?limit=3", headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert len(res) == 3
    # Should be ordered newest first (descending by created)
    assert res[0]["pressure"] == 1.4  # Last added (i=4, 1.0 + 4*0.1)
    assert res[1]["pressure"] == 1.3  # i=3
    assert res[2]["pressure"] == 1.2  # i=2
    
    # Verify batch metadata is included
    assert res[0]["batchName"] == "f1"
    assert res[0]["chipIdPressure"] == "EEEEEE"
    
    # Get latest 10 (default)
    r = app_client.get("/api/pressure/latest", headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert len(res) == 5  # Only 5 records exist
    
    # Get latest 1
    r = app_client.get("/api/pressure/latest?limit=1", headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert len(res) == 1
    assert res[0]["pressure"] == 1.4  # Most recent
    assert res[0]["batchName"] == "f1"
    assert res[0]["chipIdPressure"] == "EEEEEE"


def test_nullable_pressure_fields_in_create(app_client):
    """Test that nullable pressure fields (temperature, pressure1, battery) can be None when creating"""
    truncate_database()
    
    # Create batch
    batch_data = {
        "name": "test_batch",
        "chipIdGravity": "",
        "chipIdPressure": "AAAAAA",
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
    
    # Test 1: Create pressure with null temperature
    pressure_data = {
        "batchId": 1,
        "temperature": None,
        "pressure": 1.050,
        "pressure1": 1.050,
        "battery": 3.8,
        "rssi": -75,
        "runTime": 0.8,
        "active": True,
    }
    r = app_client.post("/api/pressure/", json=pressure_data, headers=headers)
    assert r.status_code == 201
    res = json.loads(r.text)
    assert res["temperature"] is None
    assert res["pressure"] == 1.050
    
    # Test 2: Create pressure with null pressure1
    pressure_data = {
        "batchId": 1,
        "temperature": 20.0,
        "pressure": 1.050,
        "pressure1": None,
        "battery": 3.8,
        "rssi": -75,
        "runTime": 0.8,
        "active": True,
    }
    r = app_client.post("/api/pressure/", json=pressure_data, headers=headers)
    assert r.status_code == 201
    res = json.loads(r.text)
    assert res["pressure1"] is None
    assert res["pressure"] == 1.050
    
    # Test 3: Create pressure with null battery
    pressure_data = {
        "batchId": 1,
        "temperature": 20.0,
        "pressure": 1.050,
        "pressure1": 1.050,
        "battery": None,
        "rssi": -75,
        "runTime": 0.8,
        "active": True,
    }
    r = app_client.post("/api/pressure/", json=pressure_data, headers=headers)
    assert r.status_code == 201
    res = json.loads(r.text)
    assert res["battery"] is None
    assert res["pressure"] == 1.050
    
    # Test 4: Create pressure with all nullable fields as None (except pressure which is required)
    pressure_data = {
        "batchId": 1,
        "temperature": None,
        "pressure": 1.050,
        "pressure1": None,
        "battery": None,
        "rssi": -75,
        "runTime": 0.8,
        "active": True,
    }
    r = app_client.post("/api/pressure/", json=pressure_data, headers=headers)
    assert r.status_code == 201
    res = json.loads(r.text)
    assert res["temperature"] is None
    assert res["pressure1"] is None
    assert res["battery"] is None
    assert res["pressure"] == 1.050
    assert res["rssi"] == -75
    
    # Verify all 4 records were created
    r = app_client.get("/api/pressure/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 4


def test_nullable_pressure_fields_in_update(app_client):
    """Test that nullable pressure fields can be updated to None"""
    truncate_database()
    
    # Create batch and initial pressure
    batch_data = {
        "name": "test_batch",
        "chipIdGravity": "",
        "chipIdPressure": "AAAAAA",
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
    
    pressure_data = {
        "batchId": 1,
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
    pressure_id = json.loads(r.text)["id"]
    
    # Update temperature to None
    update_data = {
        "temperature": None,
        "pressure": 1.050,
        "pressure1": 1.050,
        "battery": 3.8,
        "rssi": -75,
        "runTime": 0.8,
        "active": True,
    }
    r = app_client.patch(f"/api/pressure/{pressure_id}", json=update_data, headers=headers)
    assert r.status_code == 200
    
    # Verify update
    r = app_client.get(f"/api/pressure/{pressure_id}", headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["temperature"] is None
    assert res["pressure"] == 1.050
    
    # Update pressure1 to None
    update_data["pressure1"] = None
    r = app_client.patch(f"/api/pressure/{pressure_id}", json=update_data, headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["pressure1"] is None
    
    # Update battery to None
    update_data["battery"] = None
    r = app_client.patch(f"/api/pressure/{pressure_id}", json=update_data, headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["battery"] is None


def test_nullable_pressure_fields_in_latest(app_client):
    """Test that /latest endpoint handles nullable pressure fields correctly"""
    truncate_database()
    
    # Create batch
    batch_data = {
        "name": "test_batch",
        "chipIdGravity": "",
        "chipIdPressure": "AAAAAA",
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
    
    # Create pressure with nullable fields (pressure is required, so use a value)
    pressure_data = {
        "batchId": 1,
        "temperature": None,
        "pressure": 1.050,
        "pressure1": None,
        "battery": None,
        "rssi": -75,
        "runTime": 0.8,
        "active": True,
    }
    r = app_client.post("/api/pressure/", json=pressure_data, headers=headers)
    assert r.status_code == 201
    
    # Verify /latest endpoint returns the data with nulls
    r = app_client.get("/api/pressure/latest?limit=1", headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert len(res) == 1
    assert res[0]["temperature"] is None
    assert res[0]["pressure"] == 1.050
    assert res[0]["pressure1"] is None
    assert res[0]["battery"] is None
    assert res[0]["rssi"] == -75
    assert res[0]["batchName"] == "test_batch"


def test_all_nullable_pressure_fields_together(app_client):
    """Test creating and updating pressure with all nullable fields as None"""
    truncate_database()
    
    # Create batch
    batch_data = {
        "name": "test_batch",
        "chipIdGravity": "",
        "chipIdPressure": "AAAAAA",
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
    
    # Create pressure with all nullable fields as None (pressure is required)
    pressure_data = {
        "batchId": 1,
        "temperature": None,
        "pressure": 1.050,
        "pressure1": None,
        "battery": None,
        "rssi": -75,
        "runTime": None,
        "active": True,
    }
    r = app_client.post("/api/pressure/", json=pressure_data, headers=headers)
    assert r.status_code == 201
    res = json.loads(r.text)
    assert res["temperature"] is None
    assert res["pressure"] == 1.050
    assert res["pressure1"] is None
    assert res["battery"] is None
    assert res["runTime"] is None
    assert res["rssi"] == -75
    assert res["active"] == True
    pressure_id = res["id"]
    
    # Verify GET returns the same
    r = app_client.get(f"/api/pressure/{pressure_id}", headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["temperature"] is None
    assert res["pressure"] == 1.050
    assert res["pressure1"] is None
    assert res["battery"] is None
    assert res["runTime"] is None
    
    # Update all nullable fields with actual values
    update_data = {
        "temperature": 20.5,
        "pressure": 1.052,
        "pressure1": 1.051,
        "battery": 3.9,
        "rssi": -70,
        "runTime": 1.5,
        "active": True,
    }
    r = app_client.patch(f"/api/pressure/{pressure_id}", json=update_data, headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["temperature"] == 20.5
    assert res["pressure"] == 1.052
    assert res["pressure1"] == 1.051
    assert res["battery"] == 3.9
    assert res["runTime"] == 1.5
