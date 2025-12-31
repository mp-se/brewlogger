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
        "chipIdGravity": "DDDDDD",
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
    # Test listing all pours
    r = app_client.get("/api/pour/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1
    
    # Test listing pours by batchId
    r = app_client.get("/api/pour/?batchId=1", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1
    assert data[0]["batchId"] == 1
    
    # Test listing pours with non-existent batchId
    r = app_client.get("/api/pour/?batchId=999", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 0


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


def test_public_with_none_values(app_client):
    """Test that optional fields with None values are handled correctly"""
    test_init(app_client)
    
    # Test with pour as None
    data = {"pour": None, "volume": 1.5, "maxVolume": 4.0, "id": "1"}
    r = app_client.post("/api/pour/public", json=data)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["pour"] == 0
    assert res["volume"] == 1.5
    assert res["maxVolume"] == 4.0
    
    # Test with volume as None
    data = {"pour": 0.5, "volume": None, "maxVolume": 4.0, "id": "1"}
    r = app_client.post("/api/pour/public", json=data)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["pour"] == 0.5
    assert res["volume"] == 0
    assert res["maxVolume"] == 4.0
    
    # Test with maxVolume as None
    data = {"pour": 0.5, "volume": 1.5, "maxVolume": None, "id": "1"}
    r = app_client.post("/api/pour/public", json=data)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["pour"] == 0.5
    assert res["volume"] == 1.5
    assert res["maxVolume"] == 0
    
    # Test with all optional fields as None
    data = {"pour": None, "volume": None, "maxVolume": None, "id": "1"}
    r = app_client.post("/api/pour/public", json=data)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["pour"] == 0
    assert res["volume"] == 0
    assert res["maxVolume"] == 0


def test_public(app_client):
    data = {"pour": 0.1, "id": "1"}

    # Add new
    r = app_client.post("/api/pour/public", json=data, headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)

    r2 = app_client.get(f"/api/pour/{res['id']}", headers=headers)
    assert r2.status_code == 200
    data2 = json.loads(r.text)
    assert data["pour"] == data2["pour"]
    assert data2["active"] is True

    data = {"pour": 0.1, "id": "2"}

    # Add new
    r = app_client.post("/api/pour/public", json=data, headers=headers)
    assert r.status_code == 404

    data = {"volume": 0.1, "maxVolume": 1, "id": "1"}

    # Add new
    r = app_client.post("/api/pour/public", json=data, headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)

    r2 = app_client.get(f"/api/pour/{res['id']}", headers=headers)
    assert r2.status_code == 200
    data2 = json.loads(r.text)
    assert data["volume"] == data2["volume"]
    assert data["maxVolume"] == data2["maxVolume"]

    data = {"pour": 0.1, "volume": 10, "maxVolume": 20, "id": "1"}

    # Add new
    r = app_client.post("/api/pour/public", json=data, headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)

    r2 = app_client.get(f"/api/pour/{res['id']}", headers=headers)
    assert r2.status_code == 200
    data2 = json.loads(r.text)
    assert data["pour"] == data2["pour"]
    assert data["volume"] == data2["volume"]
    assert data["maxVolume"] == data2["maxVolume"]


def test_list_by_batchid(app_client):
    """Test listing pours filtered by batchId"""
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
    
    # Add pours to batch 1
    pour_data = {
        "pour": 0.5,
        "volume": 2.0,
        "maxVolume": 10.0,
        "batchId": batch1_id,
        "active": True,
    }
    
    for i in range(3):
        r = app_client.post("/api/pour/", json=pour_data, headers=headers)
        assert r.status_code == 201
    
    # Add pours to batch 2
    pour_data["batchId"] = batch2_id
    for i in range(2):
        r = app_client.post("/api/pour/", json=pour_data, headers=headers)
        assert r.status_code == 201
    
    # List all pours
    r = app_client.get("/api/pour/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 5
    
    # Filter by batch 1 (should get 3)
    r = app_client.get(f"/api/pour/?batchId={batch1_id}", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 3
    assert all(p["batchId"] == batch1_id for p in data)
    
    # Filter by batch 2 (should get 2)
    r = app_client.get(f"/api/pour/?batchId={batch2_id}", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 2
    assert all(p["batchId"] == batch2_id for p in data)


def test_latest(app_client):
    """Test getting the latest pour measurements"""
    test_init(app_client)
    
    # Add 5 pour records
    data = {
        "pour": 0.1,
        "volume": 1.0,
        "maxVolume": 10.0,
        "batchId": 1,
        "active": True,
    }
    
    for i in range(5):
        data["pour"] = 0.1 + i * 0.05
        data["volume"] = 1.0 + i * 0.5
        r = app_client.post("/api/pour/", json=data, headers=headers)
        assert r.status_code == 201
    
    # Get latest 3
    r = app_client.get("/api/pour/latest?limit=3", headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert len(res) == 3
    # Should be ordered newest first (descending by created)
    assert res[0]["volume"] == 3.0  # Last added (4th record, 1.0 + 4*0.5)
    assert res[1]["volume"] == 2.5  # 3rd record
    assert res[2]["volume"] == 2.0  # 2nd record
    
    # Verify batch metadata is included
    assert res[0]["batchName"] == "f1"
    
    # Get latest 10 (default)
    r = app_client.get("/api/pour/latest", headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert len(res) == 5  # Only 5 records exist
    
    # Get latest 1
    r = app_client.get("/api/pour/latest?limit=1", headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert len(res) == 1
    assert res[0]["volume"] == 3.0  # Most recent
    assert res[0]["batchName"] == "f1"
