# BrewLogger
# Copyright (c) 2021-2026 Magnus
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Alternatively, this software may be used under the terms of a
# commercial license. See LICENSE_COMMERCIAL for details.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
#

import json
import pytest
from api.config import get_settings
from .conftest import truncate_database

headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}

pytest_plugins = ("pytest_asyncio",)


def test_init(app_client):
    truncate_database()

    data = {
        "chipId": "000000",
        "chipFamily": "f2",
        "software": "Chamber-Controller",
        "mdns": "f4",
        "config": "",
        "url": "http://test.home.arpa",
        "bleColor": "f7",
        "description": "f8",
        "collectLogs": False,
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
            "deviceId": 1,
        },
        {
            "order": 1,
            "name": "",
            "type": "Secondary",
            "date": "2024-10-08",
            "temp": 2,
            "days": 4,
            "deviceId": 1,
        },
    ]

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
    # await fermentation_controller_run(datetime.now())


def test_delete(app_client):
    r = app_client.delete("/api/device/1/step", headers=headers)
    assert r.status_code == 204
