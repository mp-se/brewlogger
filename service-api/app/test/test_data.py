import json, time
from api.db.session import engine
from sqlalchemy import text
from api.config import get_settings

timeDelay = False # Will wait a few seconds when adding data so that time stamps will differ.

headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}

def test_init(app_client):
    r = app_client.delete("/test/cleardb", headers=headers)
    assert r.status_code == 204

def test_load_1(app_client):
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

    r = app_client.post("/batch", json=data, headers=headers)
    assert r.status_code == 201
    r = app_client.post("/batch", json=data, headers=headers)
    assert r.status_code == 201
    r = app_client.post("/batch", json=data, headers=headers)
    assert r.status_code == 201

def test_load_2(app_client):
    data = {
        "chipId": "012345",
        "name": "test",
        "batchId": 1,
        "token": "",
        "interval": 1,
        "temperature": 16,
        "tempUnits": "C",
        "gravity": 1.030,
        "angle": 30,
        "battery": 3.81,
        "rssi": -72,
        "corrGravity": 0,
        "gravityUnits": "SG",
        "runTime": 1.2,
        "created": "2012-12-10 14:17:19",
    }

    r = app_client.post("/gravity/", json=data, headers=headers)
    assert r.status_code == 201
    if timeDelay: time.sleep(2)
    data["gravity"] = 1.027
    data["temperature"] = 15
    r = app_client.post("/gravity/", json=data, headers=headers)
    assert r.status_code == 201
    if timeDelay: time.sleep(2)
    data["gravity"] = 1.022
    data["temperature"] = 15
    r = app_client.post("/gravity/", json=data, headers=headers)
    assert r.status_code == 201
    if timeDelay: time.sleep(2)
    data["gravity"] = 1.015
    data["temperature"] = 14
    r = app_client.post("/gravity/", json=data, headers=headers)
    assert r.status_code == 201

    #r = app_client.get("/batch/1", headers=headers)
    #assert r.status_code == 200
    #data2 = json.loads(r.text)
    #print( data2 )
    #assert True == False


def test_load_3(app_client):
    data = {
        "chipId": "012345",
        "chipFamily": "f2",
        "software": "f3",
        "mdns": "f4",
    }

    r = app_client.post("/device", json=data, headers=headers)
    assert r.status_code == 201
    r = app_client.post("/device", json=data, headers=headers)
    assert r.status_code == 201
    r = app_client.post("/device", json=data, headers=headers)
    assert r.status_code == 201

def test_load_3(app_client):
    data = {
        "pour": 1.1,
        "volume": 1.2,
        "batchId": 1
    }

    r = app_client.post("/pour/", json=data, headers=headers)
    assert r.status_code == 201
    r = app_client.post("/pour/", json=data, headers=headers)
    assert r.status_code == 201
    r = app_client.post("/pour/", json=data, headers=headers)
    assert r.status_code == 201
