import json
from api.db.session import engine
from sqlalchemy import text
from api.config import get_settings

headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}

def test_init(app_client):
    r = app_client.delete("/test/cleardb", headers=headers)
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
    r = app_client.post("/batch", json=data, headers=headers)
    assert r.status_code == 201


def test_add(app_client):
    data = {
        "pour": 0.1,
        "volume": 0.2,
        "batchId": 1
    }

    # Add new
    r = app_client.post("/pour/", json=data, headers=headers)
    assert r.status_code == 201
    data1 = json.loads(r.text)
    assert data1["id"] == 1

    # Read data and check values
    r2 = app_client.get("/pour/1", headers=headers)
    assert r2.status_code == 200
    data2 = json.loads(r.text)
    assert data["pour"] == data2["pour"]
    assert data["volume"] == data2["volume"]

    # Not using a number for index
    r2 = app_client.get("/pour/hello", headers=headers)
    assert r2.status_code == 422

def test_list(app_client):
    r = app_client.get("/pour", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1

def test_update(app_client):
    data = {
        "pour": 1.1,
        "volume": 1.2,
        "batchId": 1
    }

    # Update existing entity
    r = app_client.patch("/pour/1", json=data, headers=headers)
    assert r.status_code == 200

def test_delete(app_client):
    # Delete
    r = app_client.delete("/pour/1", headers=headers)
    assert r.status_code == 204

    # Check how many are stored
    r = app_client.get("/pour", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 0
