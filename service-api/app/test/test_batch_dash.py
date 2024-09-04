import json

from sqlalchemy import text

from api.db.session import engine
from api.config import get_settings

headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}

def test_add(app_client):
    
    data = {
        "name": "name",
        "ID": "AAAAAA",
        "token": "token",
        "interval": 1,
        "temperature": 20.2,
        "temp_units": "C",
        "gravity": 1.05,
        "angle": 34.45,
        "battery": 3.85,
        "RSSI": -76.2,
    }

    # Add new    
    r = app_client.post("/api/gravity/public", json=data, headers=headers)
    assert r.status_code == 200
    r = app_client.post("/api/gravity/public", json=data, headers=headers)
    assert r.status_code == 200
    r = app_client.post("/api/gravity/public", json=data, headers=headers)
    assert r.status_code == 200
    r = app_client.post("/api/gravity/public", json=data, headers=headers)
    assert r.status_code == 200
    r = app_client.post("/api/gravity/public", json=data, headers=headers)
    assert r.status_code == 200
    r = app_client.post("/api/gravity/public", json=data, headers=headers)
    assert r.status_code == 200

def test_list(app_client):
    return
    r = app_client.get("/api/batch/1/dashboard", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    print(data)
    assert False

    return
    r = app_client.get("/api/batch/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1
    print(data)
    assert False

