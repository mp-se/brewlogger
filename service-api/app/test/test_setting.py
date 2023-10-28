import json
from api.db.session import engine
from sqlalchemy import text
from api.config import get_settings

headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}

def test_init(app_client):
    pass

def test_read(app_client):
    r = app_client.get("/api/setting/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert data["javascript_debug_enabled"] == False
    assert data["version"] != ""
    #assert data["test_endpoints_enabled"] == True
    #assert data["api_key_enabled"] == True

def test_write(app_client):
    data = {
        "javascript_debug_enabled": True,
    }

    r = app_client.patch("/api/setting/", json=data, headers=headers)
    assert r.status_code == 200
    data2 = json.loads(r.text)
    assert data["javascript_debug_enabled"] == True

    data = {
        "javascript_debug_enabled": False,
    }

    r = app_client.patch("/api/setting/", json=data, headers=headers)
    assert r.status_code == 200
    data2 = json.loads(r.text)
    assert data["javascript_debug_enabled"] == False
