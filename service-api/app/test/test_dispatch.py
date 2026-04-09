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
from unittest.mock import AsyncMock, patch

from api.config import get_settings
from .conftest import truncate_database

headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}


def test_init(app_client):
    truncate_database()


def test_dispatch_invalid_json(app_client):
    """Test that dispatch endpoint handles invalid JSON"""
    test_init(app_client)
    
    # Send malformed JSON
    r = app_client.post(
        "/api/dispatch/public",
        content="not valid json",
        headers={"Content-Type": "application/json"}
    )
    assert r.status_code == 422


def test_dispatch_missing_required_field(app_client):
    """Test that dispatch endpoint rejects data without gravity or pressure"""
    test_init(app_client)
    
    # No gravity or pressure field
    r = app_client.post("/api/dispatch/public", json={"some_field": "value"})
    assert r.status_code == 400
    data = json.loads(r.text)
    assert "Format not recognized" in data.get("detail", "")


def test_dispatch_empty_object(app_client):
    """Test that dispatch endpoint rejects empty object"""
    test_init(app_client)
    
    r = app_client.post("/api/dispatch/public", json={})
    assert r.status_code == 400


@patch("api.routers.dispatch.httpx.AsyncClient")
def test_dispatch_gravity_forward_success(mock_client, app_client):
    """Test successful forwarding of gravity data to brew_api"""
    test_init(app_client)
    
    # Mock the AsyncClient and response
    mock_response = AsyncMock()
    mock_response.content = b'{"status": "received"}'
    
    mock_async_client = AsyncMock()
    mock_async_client.post = AsyncMock(return_value=mock_response)
    mock_async_client.__aenter__ = AsyncMock(return_value=mock_async_client)
    mock_async_client.__aexit__ = AsyncMock(return_value=None)
    
    mock_client.return_value = mock_async_client
    
    # Send gravity data
    payload = {"gravity": 1.055, "angle": 45, "temperature": 68}
    r = app_client.post("/api/dispatch/public", json=payload)
    
    # Verify the response
    assert r.status_code == 200
    # Verify httpx was called with correct parameters
    mock_async_client.post.assert_called_once_with(
        "http://brew_api:80/api/gravity/public",
        json=payload
    )


@patch("api.routers.dispatch.httpx.AsyncClient")
def test_dispatch_pressure_forward_success(mock_client, app_client):
    """Test successful forwarding of pressure data to brew_api"""
    test_init(app_client)
    
    # Mock the AsyncClient and response
    mock_response = AsyncMock()
    mock_response.content = b'{"status": "received"}'
    
    mock_async_client = AsyncMock()
    mock_async_client.post = AsyncMock(return_value=mock_response)
    mock_async_client.__aenter__ = AsyncMock(return_value=mock_async_client)
    mock_async_client.__aexit__ = AsyncMock(return_value=None)
    
    mock_client.return_value = mock_async_client
    
    # Send pressure data
    payload = {"pressure": 15.5, "temperature": 68}
    r = app_client.post("/api/dispatch/public", json=payload)
    
    # Verify the response
    assert r.status_code == 200
    # Verify httpx was called with correct parameters
    mock_async_client.post.assert_called_once_with(
        "http://brew_api:80/api/pressure/public",
        json=payload
    )





