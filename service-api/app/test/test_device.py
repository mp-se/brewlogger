import json
from api.config import get_settings


headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}


def test_add(app_client):
    data = {
        "chipId": "CCCCCC",
        "chipFamily": "f2",
        "software": "f3",
        "mdns": "f4",
        "config": "f5",
        "url": "f6",
        "bleColor": "f7",
        "description": "f8",
    }

    # Add new
    r = app_client.post("/api/device/", json=data, headers=headers)
    assert r.status_code == 201
    data1 = json.loads(r.text)
    assert data1["id"] == 1

    # Read data and check values
    r2 = app_client.get("/api/device/1", headers=headers)
    assert r2.status_code == 200
    data2 = json.loads(r.text)
    assert data["chipId"] == data2["chipId"]
    assert data["chipFamily"] == data2["chipFamily"]
    assert data["software"] == data2["software"]
    assert data["mdns"] == data2["mdns"]
    assert data["config"] == data2["config"]
    assert data["url"] == data2["url"]
    assert data["bleColor"] == data2["bleColor"]
    assert data["description"] == data2["description"]

    # Not using a number for index
    r2 = app_client.get("/api/device/hello", headers=headers)
    assert r2.status_code == 422


def test_list(app_client):
    r = app_client.get("/api/device/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1


def test_update(app_client):
    data = {
        "chipId": "01234568",
        "chipFamily": "ff2",
        "software": "ff3",
        "mdns": "ff4",
        "config": "ff5",
        "url": "ff6",
        "bleColor": "ff7",
        "description": "ff8",
    }

    # Update existing
    r = app_client.patch("/api/device/1", json=data, headers=headers)
    assert r.status_code == 200

    # Read  and validate data
    r2 = app_client.get("/api/device/1", headers=headers)
    assert r2.status_code == 200
    data2 = json.loads(r.text)
    assert (
        data["chipId"] != data2["chipId"]
    )  # This should not be updated, can only be set at create
    assert data["chipFamily"] == data2["chipFamily"]
    assert data["software"] == data2["software"]
    assert data["mdns"] == data2["mdns"]
    assert data["config"] == data2["config"]
    assert data["url"] == data2["url"]
    assert data["bleColor"] == data2["bleColor"]
    assert data["description"] == data2["description"]

    # Update missing entity
    r = app_client.patch("/api/device/10", json=data, headers=headers)
    assert r.status_code == 404


def test_delete(app_client):
    # Delete
    r = app_client.delete("/api/device/1", headers=headers)
    assert r.status_code == 204

    # Check how many are stored
    r = app_client.get("/api/device", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 0


""" async def test_proxy(app_client):
    data = {
        "url": "http://localhost:8000/test/get",
        "method": "get",
        "body": "string"
    }
    async with httpx.AsyncClient() as client:
        res = await client.post("/api/device/proxy_fetch", json=data, headers=headers)
        assert res.status_code == 200 """


def test_validation(app_client):
    data = {
        "chipId": "012345678",
        "chipFamily": "",
        "software": "",
        "mdns": "",
        "config": "",
        "url": "",
        "bleColor": "",
        "description": "",
    }
    r = app_client.post("/api/device/", json=data, headers=headers)
    assert r.status_code == 422

    data = {
        "chipId": "012345678",
        "chipFamily": "01234567890",
        "software": "",
        "mdns": "",
        "config": "",
        "url": "",
        "bleColor": "",
        "description": "",
    }
    r = app_client.post("/api/device/", json=data, headers=headers)
    assert r.status_code == 422

    data = {
        "chipId": "012345678",
        "chipFamily": "",
        "software": "0123456789012345678900123456789012345678901",
        "mdns": "",
        "config": "",
        "url": "",
        "bleColor": "",
        "description": "",
    }
    r = app_client.post("/api/device/", json=data, headers=headers)
    assert r.status_code == 422

    data = {
        "chipId": "012345678",
        "chipFamily": "",
        "software": "",
        "mdns": "0123456789012345678900123456789012345678901",
        "config": "",
        "url": "",
        "bleColor": "",
        "description": "",
    }
    r = app_client.post("/api/device/", json=data, headers=headers)
    assert r.status_code == 422

    data = {
        "chipId": "012345678",
        "chipFamily": "",
        "software": "",
        "mdns": "",
        "config": "",
        "url": "012345678901234567890012345678901234567890123456789012345678901234567890123456789012345678901",
        "bleColor": "",
        "description": "",
    }
    r = app_client.post("/api/device/", json=data, headers=headers)
    assert r.status_code == 422
