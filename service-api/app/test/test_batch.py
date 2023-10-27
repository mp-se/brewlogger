import json

from sqlalchemy import text

from api.db.session import engine
from api.config import get_settings

headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}

def test_init(app_client):
    r = app_client.delete("/test/cleardb", headers=headers)
    assert r.status_code == 204

def test_add(app_client):
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
    data1 = json.loads(r.text)
    assert data1["id"] == 1
    assert data1["name"] == data["name"]
    assert data1["chipId"] == data["chipId"]
    assert data1["active"] == data["active"]
    assert data1["description"] == data["description"]
    assert data1["brewDate"] == data["brewDate"]
    assert data1["style"] == data["style"]
    assert data1["brewer"] == data["brewer"]
    assert data1["abv"] == data["abv"]
    assert data1["ebc"] == data["ebc"]
    assert data1["ibu"] == data["ibu"]
    assert data1["brewfatherId"] == data["brewfatherId"]

    # Read data and check values
    r2 = app_client.get("/batch/1", headers=headers)
    assert r2.status_code == 200
    data2 = json.loads(r.text)
    assert data["name"] == data2["name"]

    # Not using a number for index
    r2 = app_client.get("/batch/hello", headers=headers)
    assert r2.status_code == 422

def test_list(app_client):
    r = app_client.get("/batch", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1

def test_update(app_client):
    data = {
        "name": "ff1",
        "chipId": "012345",
        "description": "ff3",
        "brewDate": "ff4",
        "style": "ff5",
        "brewer": "ff6",
        "brewfatherId": "ff7",
        "active": True,
        "abv": 1.1,
        "ebc": 1.2,
        "ibu": 1.3,
    }

    # Update existing entity
    r = app_client.patch("/batch/1", json=data, headers=headers)
    assert r.status_code == 200

    # Read the entity and validate data
    r2 = app_client.get("/batch/1", headers=headers)
    assert r2.status_code == 200
    data2 = json.loads(r.text)
    assert data["name"] == data2["name"]
    assert data["chipId"] == data2["chipId"]
    assert data["active"] == data2["active"]
    assert data["description"] == data2["description"]
    assert data["brewDate"] == data2["brewDate"]
    assert data["style"] == data2["style"]
    assert data["brewer"] == data2["brewer"]
    assert data["abv"] == data2["abv"]
    assert data["ebc"] == data2["ebc"]
    assert data["ibu"] == data2["ibu"]
    assert data["brewfatherId"] == data2["brewfatherId"]

    # Update missing entity
    r = app_client.patch("/batch/10", json=data, headers=headers)
    assert r.status_code == 404

def test_delete(app_client):
    # Delete
    r = app_client.delete("/batch/1", headers=headers)
    assert r.status_code == 204

    # Check how many are stored
    r = app_client.get("/batch", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 0

def test_query(app_client):
    test_init(app_client)

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

    # Update existing entity
    r = app_client.post("/batch", json=data, headers=headers)
    assert r.status_code == 201

    r = app_client.get("/batch?chipId=012345", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1

    r = app_client.get("/batch?chipId=chip1&active=false", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 0

    r = app_client.get("/batch?chipId=012345&active=true", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1

def test_validation(app_client):
    data = {
        "name": "f1",
        "chipId": "0123456",
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
    assert r.status_code == 422

    data = {
        "name": "01234567890123456789012345678901234567890",
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
    assert r.status_code == 422

    data = {
        "name": "f1",
        "chipId": "012345",
        "description": "01234567890123456789012345678901234567890",
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
    assert r.status_code == 422

    data = {
        "name": "f1",
        "chipId": "012345",
        "description": "f2",
        "brewDate": "012345678901234567890",
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
    assert r.status_code == 422

    data = {
        "name": "f1",
        "chipId": "012345",
        "description": "f2",
        "brewDate": "f3",
        "style": "012345678901234567890",
        "brewer": "f6",
        "brewfatherId": "f7",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
    }

    # Add new
    r = app_client.post("/batch", json=data, headers=headers)
    assert r.status_code == 422

    data = {
        "name": "f1",
        "chipId": "0123456",
        "description": "f2",
        "brewDate": "f3",
        "style": "f4",
        "brewer": "012345678901234567890",
        "brewfatherId": "f7",
        "active": True,
        "abv": 0.1,
        "ebc": 0.2,
        "ibu": 0.3,
    }

    # Add new
    r = app_client.post("/batch", json=data, headers=headers)
    assert r.status_code == 422
