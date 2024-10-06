import json
import pytest
import asyncio
from datetime import datetime
from api.config import get_settings
from .conftest import truncate_database
from api.db import models, schemas
from api.fermentation_control import fermentation_controller_run

headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}

pytest_plugins = ('pytest_asyncio',)

def test_init(app_client):
    truncate_database()

    data = {
        "chipId": "000000",
        "chipFamily": "f2",
        "software": "Brewpi",
        "mdns": "f4",
        "config": "",
        "url": "http://test.home.arpa",
        "bleColor": "f7",
        "description": "f8",
        "gravityFormula": "",
        "gravityPoly": "",
    }

    # Add new
    r = app_client.post("/api/device/", json=data, headers=headers)
    assert r.status_code == 201


def test_add(app_client):
    data = [
        {
            "order": 0,
            "name": "",
            "type": "Primary",
            "date": "2024-10-05",
            "temp": 12,
            "days": 2,
            "deviceId": 1
        },
        {
            "order": 1,
            "name": "",
            "type": "Secondary",
            "date": "2024-10-08",
            "temp": 2,
            "days": 4,
            "deviceId": 1
        }]

    # Add new
    r = app_client.post("/api/device/1/step", json=data, headers=headers)
    assert r.status_code == 201

    r = app_client.post("/api/device/1/step", json=data, headers=headers)
    assert r.status_code == 409

    r = app_client.get("/api/device/1", headers=headers)
    assert r.status_code == 200
    data1 = json.loads(r.text)
    assert data1["fermentationStep"][0]["order"] == 0


@pytest.mark.asyncio
async def test_controller():
    pass
    #await fermentation_controller_run(datetime.now())


def test_delete(app_client):
    r = app_client.delete("/api/device/1/step", headers=headers)
    assert r.status_code == 204
