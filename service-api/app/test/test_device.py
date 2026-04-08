# SPDX-License-Identifier: GPL-3.0-or-later
# Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger

import json
from api.config import get_settings
from .conftest import truncate_database

headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}


def test_init(app_client):
    truncate_database()


def test_add(app_client):
    data = {
        "chipId": "000000",
        "chipFamily": "f2",
        "software": "Chamber-Controller",
        "mdns": "f4",
        "config": "",
        "url": "f6",
        "bleColor": "f7",
        "description": "f8",
        "collectLogs": False,
    }

    # Add new
    r = app_client.post("/api/device/", json=data, headers=headers)
    assert r.status_code == 201
    data1 = json.loads(r.text)
    assert data1["id"] == 1

    # Add new with duplicated chipId (duplicates of 000000 chipId is allowed)
    r = app_client.post("/api/device/", json=data, headers=headers)
    assert r.status_code == 201
    data1 = json.loads(r.text)
    assert data1["id"] == 2

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
    assert data["collectLogs"] == data2["collectLogs"]

    # Not using a number for index
    r2 = app_client.get("/api/device/hello", headers=headers)
    assert r2.status_code == 422


def test_list(app_client):
    r = app_client.get("/api/device/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 2


def test_update(app_client):
    data = {
        "chipId": "01234568",
        "chipFamily": "ff2",
        "software": "ff3",
        "mdns": "ff4",
        "config": "{ 'key': 'value' }",
        "url": "ff6",
        "bleColor": "ff7",
        "description": "ff8",
        "collectLogs": False,
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
    assert data["collectLogs"] == data2["collectLogs"]

    # Update missing entity
    r = app_client.patch("/api/device/10", json=data, headers=headers)
    assert r.status_code == 404


def test_search(app_client):
    # Do a search for devices with software
    r = app_client.get("/api/device/?software=Chamber-Controller", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1


def test_delete(app_client):
    # Delete
    r = app_client.delete("/api/device/1", headers=headers)
    assert r.status_code == 204

    # Check how many are stored
    r = app_client.get("/api/device", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1


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
        "collectLogs": False,
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
        "collectLogs": False,
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
        "collectLogs": False,
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
        "collectLogs": False,
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
        "collectLogs": False,
    }
    r = app_client.post("/api/device/", json=data, headers=headers)
    assert r.status_code == 422


def test_device_search_by_chipid(app_client):
    """Test searching devices by chipId"""
    truncate_database()  # Clear database first
    
    # Create devices
    device1 = {
        "chipId": "AAAAAA",
        "chipFamily": "f2",
        "software": "Controller",
        "mdns": "device1-mdns",
        "config": "",
        "url": "f6",
        "bleColor": "f7",
        "description": "Device 1",
        "collectLogs": False,
    }
    
    r = app_client.post("/api/device/", json=device1, headers=headers)
    assert r.status_code == 201
    
    # Search by chipId
    r = app_client.get("/api/device/?chipId=AAAAAA", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) == 1
    assert data[0]["chipId"] == "AAAAAA"


def test_device_search_by_software_and_mdns(app_client):
    """Test searching devices by multiple criteria"""
    truncate_database()  # Clear database first
    
    # Create a device to search for
    device = {
        "chipId": "CCCCCC",
        "chipFamily": "f2",
        "software": "Chamber-Controller",
        "mdns": "chamber-mdns",
        "config": "",
        "url": "f6",
        "bleColor": "f7",
        "description": "Test device",
        "collectLogs": False,
    }
    
    r = app_client.post("/api/device/", json=device, headers=headers)
    assert r.status_code == 201
    
    # Search for specific software and MDNS combination
    r = app_client.get("/api/device/?software=Chamber-Controller&mdns=chamber-mdns", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) >= 1


def test_device_search_by_blename(app_client):
    """Test searching devices by BLE name (bleColor)"""
    truncate_database()  # Clear database first
    
    # Create a device
    device = {
        "chipId": "DDDDDD",
        "chipFamily": "f2",
        "software": "Sensor",
        "mdns": "sensor-mdns",
        "config": "",
        "url": "f6",
        "bleColor": "custom-ble",
        "description": "Test",
        "collectLogs": False,
    }
    
    r = app_client.post("/api/device/", json=device, headers=headers)
    assert r.status_code == 201
    
    # Search by BLE color
    r = app_client.get("/api/device/?bleColor=custom-ble", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data) >= 1


def test_device_collect_logs_flag(app_client):
    """Test creating device with different collectLogs settings"""
    truncate_database()  # Clear database first
    
    # Create device with collectLogs = True
    device_with_logs = {
        "chipId": "EEEEEE",
        "chipFamily": "f2",
        "software": "Logger",
        "mdns": "logger-mdns",
        "config": "",
        "url": "f6",
        "bleColor": "f7",
        "description": "Device with logging",
        "collectLogs": True,
    }
    
    r = app_client.post("/api/device/", json=device_with_logs, headers=headers)
    assert r.status_code == 201
    res = json.loads(r.text)
    assert res["collectLogs"] == True
    
    # Create device with collectLogs = False
    device_no_logs = device_with_logs.copy()
    device_no_logs["chipId"] = "FFFFFF"
    device_no_logs["collectLogs"] = False
    device_no_logs["description"] = "Device without logging"
    
    r = app_client.post("/api/device/", json=device_no_logs, headers=headers)
    assert r.status_code == 201
    res = json.loads(r.text)
    assert res["collectLogs"] == False


def test_device_config_json(app_client):
    """Test creating device with complex config JSON"""
    truncate_database()  # Clear database first
    
    device_with_config = {
        "chipId": "GGGGGG",
        "chipFamily": "f2",
        "software": "Advanced",
        "mdns": "advanced-mdns",
        "config": '{"temperatureOffset": 2.5, "units": "celsius"}',
        "url": "http://192.168.1.100",
        "bleColor": "blue",
        "description": "Device with config",
        "collectLogs": False,
    }
    
    r = app_client.post("/api/device/", json=device_with_config, headers=headers)
    assert r.status_code == 201
    res = json.loads(r.text)
    assert res["config"] == '{"temperatureOffset": 2.5, "units": "celsius"}'
    
    # Verify by reading
    r = app_client.get(f"/api/device/{res['id']}", headers=headers)
    assert r.status_code == 200
    res2 = json.loads(r.text)
    assert res2["config"] == device_with_config["config"]


def test_device_update_url(app_client):
    """Test updating device URL"""
    truncate_database()  # Clear database first
    
    device = {
        "chipId": "HHHHHH",
        "chipFamily": "f2",
        "software": "WebController",
        "mdns": "web-mdns",
        "config": "",
        "url": "http://192.168.1.100",
        "bleColor": "green",
        "description": "Web device",
        "collectLogs": False,
    }
    
    r = app_client.post("/api/device/", json=device, headers=headers)
    assert r.status_code == 201
    device_id = json.loads(r.text)["id"]
    
    # Update URL
    update_data = {
        "chipId": "ignored",
        "chipFamily": "f2",
        "software": "WebController",
        "mdns": "web-mdns",
        "config": "",
        "url": "http://192.168.1.200",
        "bleColor": "green",
        "description": "Updated description",
        "collectLogs": True,
    }
    
    r = app_client.patch(f"/api/device/{device_id}", json=update_data, headers=headers)
    assert r.status_code == 200
    
    # Verify URL was updated
    r = app_client.get(f"/api/device/{device_id}", headers=headers)
    assert r.status_code == 200
    res = json.loads(r.text)
    assert res["url"] == "http://192.168.1.200"
    assert res["description"] == "Updated description"
    assert res["collectLogs"] == True
    # chipId should not change
    assert res["chipId"] == "HHHHHH"

def test_device_proxy_fetch_post(app_client):
    """Test device proxy fetch with POST method."""
    from unittest.mock import patch, MagicMock, AsyncMock
    from .conftest import truncate_database
    truncate_database()
    
    with patch("api.routers.device.httpx.AsyncClient") as mock_client_class:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"data": "test"}
        
        mock_client = AsyncMock()
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        proxy_data = {
            "method": "post",
            "url": "http://localhost:8080/test",
            "header": "",
            "body": "test_body",
        }
        
        r = app_client.post("/api/device/proxy_fetch/", json=proxy_data, headers=headers)
        assert r.status_code == 200
        assert json.loads(r.text) == {"data": "test"}


def test_device_proxy_fetch_put(app_client):
    """Test device proxy fetch with PUT method."""
    from unittest.mock import patch, MagicMock, AsyncMock
    from .conftest import truncate_database
    truncate_database()
    
    with patch("api.routers.device.httpx.AsyncClient") as mock_client_class:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"updated": True}
        
        mock_client = AsyncMock()
        mock_client.put = AsyncMock(return_value=mock_response)
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        proxy_data = {
            "method": "put",
            "url": "http://localhost:8080/test",
            "header": "",
            "body": "test_body",
        }
        
        r = app_client.post("/api/device/proxy_fetch/", json=proxy_data, headers=headers)
        assert r.status_code == 200
        assert json.loads(r.text) == {"updated": True}


def test_device_proxy_fetch_delete(app_client):
    """Test device proxy fetch with DELETE method."""
    from unittest.mock import patch, MagicMock, AsyncMock
    from .conftest import truncate_database
    truncate_database()
    
    with patch("api.routers.device.httpx.AsyncClient") as mock_client_class:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"deleted": True}
        
        mock_client = AsyncMock()
        mock_client.delete = AsyncMock(return_value=mock_response)
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        proxy_data = {
            "method": "delete",
            "url": "http://localhost:8080/test",
            "header": "",
            "body": "",
        }
        
        r = app_client.post("/api/device/proxy_fetch/", json=proxy_data, headers=headers)
        assert r.status_code == 200


def test_device_proxy_fetch_get(app_client):
    """Test device proxy fetch with GET method (default)."""
    from unittest.mock import patch, MagicMock, AsyncMock
    from .conftest import truncate_database
    truncate_database()
    
    with patch("api.routers.device.httpx.AsyncClient") as mock_client_class:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"result": "success"}
        
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        proxy_data = {
            "method": "get",
            "url": "http://localhost:8080/test",
            "header": "",
            "body": "",
        }
        
        r = app_client.post("/api/device/proxy_fetch/", json=proxy_data, headers=headers)
        assert r.status_code == 200
        assert json.loads(r.text) == {"result": "success"}


def test_device_proxy_fetch_with_header(app_client):
    """Test device proxy fetch with custom header."""
    from unittest.mock import patch, MagicMock, AsyncMock
    from .conftest import truncate_database
    truncate_database()
    
    with patch("api.routers.device.httpx.AsyncClient") as mock_client_class:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"authenticated": True}
        
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        proxy_data = {
            "method": "get",
            "url": "http://localhost:8080/test",
            "header": "Authorization: Bearer token123",
            "body": "",
        }
        
        r = app_client.post("/api/device/proxy_fetch/", json=proxy_data, headers=headers)
        assert r.status_code == 200
        
        # Verify header was passed to the client
        mock_client.get.assert_called_once()
        call_args = mock_client.get.call_args
        assert call_args[1]["headers"] == {"Authorization": "Bearer token123"}


def test_device_proxy_fetch_text_response(app_client):
    """Test device proxy fetch with non-JSON response."""
    from unittest.mock import patch, MagicMock, AsyncMock
    from .conftest import truncate_database
    truncate_database()
    
    with patch("api.routers.device.httpx.AsyncClient") as mock_client_class:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.side_effect = ValueError("Not JSON")
        mock_response.text = "plain text response"
        
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        proxy_data = {
            "method": "get",
            "url": "http://localhost:8080/test",
            "header": "",
            "body": "",
        }
        
        r = app_client.post("/api/device/proxy_fetch/", json=proxy_data, headers=headers)
        assert r.status_code == 200
        assert r.text == '"plain text response"'


def test_device_proxy_fetch_http_error(app_client):
    """Test device proxy fetch with HTTP error response."""
    from unittest.mock import patch, MagicMock, AsyncMock
    from .conftest import truncate_database
    truncate_database()
    
    with patch("api.routers.device.httpx.AsyncClient") as mock_client_class:
        mock_response = MagicMock()
        mock_response.status_code = 500
        
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        proxy_data = {
            "method": "get",
            "url": "http://localhost:8080/test",
            "header": "",
            "body": "",
        }
        
        r = app_client.post("/api/device/proxy_fetch/", json=proxy_data, headers=headers)
        assert r.status_code == 500


def test_device_proxy_fetch_read_timeout(app_client):
    """Test device proxy fetch with read timeout."""
    from unittest.mock import patch, AsyncMock
    import httpx
    from .conftest import truncate_database
    truncate_database()
    
    with patch("api.routers.device.httpx.AsyncClient") as mock_client_class:
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(side_effect=httpx.ReadTimeout("Timeout"))
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        proxy_data = {
            "method": "get",
            "url": "http://localhost:8080/test",
            "header": "",
            "body": "",
        }
        
        r = app_client.post("/api/device/proxy_fetch/", json=proxy_data, headers=headers)
        assert r.status_code == 400
        assert "ConnectError" in r.text


def test_device_proxy_fetch_connect_error(app_client):
    """Test device proxy fetch with connect error."""
    from unittest.mock import patch, AsyncMock
    import httpx
    from .conftest import truncate_database
    truncate_database()
    
    with patch("api.routers.device.httpx.AsyncClient") as mock_client_class:
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(side_effect=httpx.ConnectError("Connection refused"))
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        proxy_data = {
            "method": "get",
            "url": "http://localhost:8080/test",
            "header": "",
            "body": "",
        }
        
        r = app_client.post("/api/device/proxy_fetch/", json=proxy_data, headers=headers)
        assert r.status_code == 400
        assert "ReadTimeout" in r.text


def test_device_proxy_fetch_connect_timeout(app_client):
    """Test device proxy fetch with connect timeout."""
    from unittest.mock import patch, AsyncMock
    import httpx
    from .conftest import truncate_database
    truncate_database()
    
    with patch("api.routers.device.httpx.AsyncClient") as mock_client_class:
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(side_effect=httpx.ConnectTimeout("Timeout"))
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        proxy_data = {
            "method": "get",
            "url": "http://localhost:8080/test",
            "header": "",
            "body": "",
        }
        
        r = app_client.post("/api/device/proxy_fetch/", json=proxy_data, headers=headers)
        assert r.status_code == 400
        assert "ConnectTimeout" in r.text


def test_device_mdns_scan(app_client):
    """Test mDNS device scanning."""
    from unittest.mock import patch
    from .conftest import truncate_database
    truncate_database()
    
    with patch("api.routers.device.find_key") as mock_find, \
         patch("api.routers.device.read_key") as mock_read:
        
        mock_find.return_value = ["device1.local.", "device2.local."]
        mock_read.side_effect = [
            b'{"name": "device1", "ip": "192.168.1.100"}',
            b'{"name": "device2", "ip": "192.168.1.101"}',
        ]
        
        r = app_client.get("/api/device/mdns/", headers=headers)
        assert r.status_code == 200
        
        data = json.loads(r.text)
        assert len(data) == 2
        assert data[0]["name"] == "device1"
        assert data[1]["ip"] == "192.168.1.101"


def test_device_create_fermentation_step(app_client):
    """Test creating fermentation steps for a device."""
    from .conftest import truncate_database
    truncate_database()
    
    # Create a device first
    device_data = {
        "chipId": "FFFFFF",
        "chipFamily": "ESP32",
        "name": "test_device",
        "url": "http://localhost:8080",
        "software": "iSpindel",
        "mdns": "test.local",
        "bleName": "test_ble",
        "bleColor": "ffffff",
        "description": "test device",
        "collectLogs": False,
    }
    
    r = app_client.post("/api/device/", json=device_data, headers=headers)
    assert r.status_code == 201
    device_id = json.loads(r.text)["id"]
    
    # Create fermentation steps with correct schema
    steps_data = [
        {
            "order": 0,
            "name": "Primary",
            "type": "Primary",
            "date": "2024-10-05",
            "temp": 20.0,
            "days": 7,
            "deviceId": device_id,
        },
        {
            "order": 1,
            "name": "Secondary",
            "type": "Secondary",
            "date": "2024-10-12",
            "temp": 18.0,
            "days": 14,
            "deviceId": device_id,
        },
    ]
    
    r = app_client.post(
        f"/api/device/{device_id}/step", json=steps_data, headers=headers
    )
    assert r.status_code == 201
    
    steps = json.loads(r.text)
    assert len(steps) == 2
    assert steps[0]["temp"] == 20.0


def test_device_create_fermentation_step_already_exists(app_client):
    """Test creating fermentation steps when they already exist."""
    from .conftest import truncate_database
    truncate_database()
    
    # Create a device
    device_data = {
        "chipId": "EEEEEE",
        "chipFamily": "ESP32",
        "name": "test_device",
        "url": "http://localhost:8080",
        "software": "iSpindel",
        "mdns": "test.local",
        "bleName": "test_ble",
        "bleColor": "ffffff",
        "description": "test device",
        "collectLogs": False,
    }
    
    r = app_client.post("/api/device/", json=device_data, headers=headers)
    device_id = json.loads(r.text)["id"]
    
    # Create fermentation steps with correct schema
    steps_data = [
        {
            "order": 0,
            "name": "Primary",
            "type": "Primary",
            "date": "2024-10-05",
            "temp": 20.0,
            "days": 7,
            "deviceId": device_id,
        },
    ]
    
    app_client.post(f"/api/device/{device_id}/step", json=steps_data, headers=headers)
    
    # Try to create again (should fail)
    r = app_client.post(
        f"/api/device/{device_id}/step", json=steps_data, headers=headers
    )
    assert r.status_code == 409


def test_device_delete_fermentation_steps(app_client):
    """Test deleting fermentation steps for a device."""
    from .conftest import truncate_database
    truncate_database()
    
    # Create a device
    device_data = {
        "chipId": "DDDDDD",
        "chipFamily": "ESP32",
        "name": "test_device",
        "url": "http://localhost:8080",
        "software": "iSpindel",
        "mdns": "test.local",
        "bleName": "test_ble",
        "bleColor": "ffffff",
        "description": "test device",
        "collectLogs": False,
    }
    
    r = app_client.post("/api/device/", json=device_data, headers=headers)
    device_id = json.loads(r.text)["id"]
    
    # Create fermentation steps with correct schema
    steps_data = [
        {
            "order": 0,
            "name": "Primary",
            "type": "Primary",
            "date": "2024-10-05",
            "temp": 20.0,
            "days": 7,
            "deviceId": device_id,
        },
    ]
    
    app_client.post(f"/api/device/{device_id}/step", json=steps_data, headers=headers)
    
    # Delete fermentation steps
    r = app_client.delete(f"/api/device/{device_id}/step", headers=headers)
    assert r.status_code == 204


def test_device_list_with_software_filter(app_client):
    """Test listing devices with software filter."""
    from .conftest import truncate_database
    truncate_database()
    
    # Create devices with different software
    device1 = {
        "chipId": "CCCCCC",
        "chipFamily": "ESP32",
        "name": "device1",
        "url": "http://localhost:8080",
        "software": "iSpindel",
        "mdns": "test.local",
        "bleName": "test_ble",
        "bleColor": "ffffff",
        "description": "test device",
        "collectLogs": False,
    }
    
    device2 = {
        "chipId": "BBBBBB",
        "chipFamily": "ESP32",
        "name": "device2",
        "url": "http://localhost:8081",
        "software": "Tilt",
        "mdns": "test2.local",
        "bleName": "test_ble2",
        "bleColor": "ffffff",
        "description": "test device 2",
        "collectLogs": False,
    }
    
    app_client.post("/api/device/", json=device1, headers=headers)
    app_client.post("/api/device/", json=device2, headers=headers)
    
    # List with filter
    r = app_client.get("/api/device/?software=iSpindel", headers=headers)
    assert r.status_code == 200
    
    devices = json.loads(r.text)
    assert len(devices) == 1
    assert devices[0]["software"] == "iSpindel"