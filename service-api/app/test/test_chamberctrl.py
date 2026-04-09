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

"""Tests for chamber controller integration."""
import json
from unittest.mock import patch, AsyncMock, MagicMock
import pytest
import httpx

from api.chamberctrl import chamberctrl_temps, chamberctrl_set_fridge_temp


@pytest.mark.asyncio
async def test_chamberctrl_temps_success():
    """Test successful temperature fetch from chamber controller"""
    test_url = "http://localhost:8080"
    expected_response = {"temp": 20.5, "humidity": 65}
    
    with patch("api.chamberctrl.httpx.AsyncClient") as mock_client_class:
        # response.json() is synchronous in httpx, not async
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = expected_response
        
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        result = await chamberctrl_temps(1, test_url)
        
        assert result == expected_response


@pytest.mark.asyncio
async def test_chamberctrl_temps_with_trailing_slash():
    """Test temperature fetch with URL that already has trailing slash"""
    test_url = "http://localhost:8080/"
    expected_response = {"temp": 20.5}
    
    with patch("api.chamberctrl.httpx.AsyncClient") as mock_client_class:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = expected_response
        
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        result = await chamberctrl_temps(1, test_url)
        
        assert result == expected_response


@pytest.mark.asyncio
async def test_chamberctrl_temps_empty_url():
    """Test temperature fetch with empty URL"""
    test_url = ""
    
    with patch("api.chamberctrl.system_log_fermentationcontrol") as mock_log:
        result = await chamberctrl_temps(1, test_url)
        
        assert result is None
        mock_log.assert_called_once()


@pytest.mark.asyncio
async def test_chamberctrl_temps_protocol_only_url():
    """Test temperature fetch with protocol-only URL"""
    test_url = "http://"
    
    with patch("api.chamberctrl.system_log_fermentationcontrol") as mock_log:
        result = await chamberctrl_temps(1, test_url)
        
        assert result is None


@pytest.mark.asyncio
async def test_chamberctrl_temps_http_error():
    """Test temperature fetch with HTTP error response"""
    test_url = "http://localhost:8080"
    
    with patch("api.chamberctrl.httpx.AsyncClient") as mock_client_class, \
         patch("api.chamberctrl.system_log_fermentationcontrol") as mock_log:
        
        mock_response = MagicMock()
        mock_response.status_code = 500
        
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        result = await chamberctrl_temps(1, test_url)
        
        assert result is None
        mock_log.assert_called_once()


@pytest.mark.asyncio
async def test_chamberctrl_temps_json_decode_error():
    """Test temperature fetch with JSON decode error"""
    test_url = "http://localhost:8080"
    
    with patch("api.chamberctrl.httpx.AsyncClient") as mock_client_class, \
         patch("api.chamberctrl.system_log_fermentationcontrol") as mock_log:
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.side_effect = json.JSONDecodeError("Invalid JSON", "", 0)
        
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        result = await chamberctrl_temps(1, test_url)
        
        assert result is None
        mock_log.assert_called_once()


@pytest.mark.asyncio
async def test_chamberctrl_temps_read_timeout():
    """Test temperature fetch with read timeout"""
    test_url = "http://localhost:8080"
    
    with patch("api.chamberctrl.httpx.AsyncClient") as mock_client_class, \
         patch("api.chamberctrl.system_log_fermentationcontrol") as mock_log:
        
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(side_effect=httpx.ReadTimeout("Timeout"))
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        result = await chamberctrl_temps(1, test_url)
        
        assert result is None
        mock_log.assert_called_once()


@pytest.mark.asyncio
async def test_chamberctrl_temps_connect_error():
    """Test temperature fetch with connect error"""
    test_url = "http://localhost:8080"
    
    with patch("api.chamberctrl.httpx.AsyncClient") as mock_client_class, \
         patch("api.chamberctrl.system_log_fermentationcontrol") as mock_log:
        
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(side_effect=httpx.ConnectError("Connection refused"))
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        result = await chamberctrl_temps(1, test_url)
        
        assert result is None
        mock_log.assert_called_once()


@pytest.mark.asyncio
async def test_chamberctrl_temps_connect_timeout():
    """Test temperature fetch with connect timeout"""
    test_url = "http://localhost:8080"
    
    with patch("api.chamberctrl.httpx.AsyncClient") as mock_client_class, \
         patch("api.chamberctrl.system_log_fermentationcontrol") as mock_log:
        
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(side_effect=httpx.ConnectTimeout("Timeout"))
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        result = await chamberctrl_temps(1, test_url)
        
        assert result is None
        mock_log.assert_called_once()


@pytest.mark.asyncio
async def test_chamberctrl_set_fridge_temp_success():
    """Test successful fridge temperature setting"""
    test_url = "http://localhost:8080"
    test_temp = 18.5
    test_chipid = "ABC123"
    
    with patch("api.chamberctrl.httpx.AsyncClient") as mock_client_class:
        mock_response = MagicMock()
        mock_response.status_code = 200
        
        mock_client = AsyncMock()
        mock_client.put = AsyncMock(return_value=mock_response)
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        result = await chamberctrl_set_fridge_temp(1, test_url, test_temp, test_chipid)
        
        assert result is True


@pytest.mark.asyncio
async def test_chamberctrl_set_fridge_temp_with_trailing_slash():
    """Test fridge temperature setting with URL that has trailing slash"""
    test_url = "http://localhost:8080/"
    test_temp = 18.5
    test_chipid = "ABC123"
    
    with patch("api.chamberctrl.httpx.AsyncClient") as mock_client_class:
        mock_response = MagicMock()
        mock_response.status_code = 200
        
        mock_client = AsyncMock()
        mock_client.put = AsyncMock(return_value=mock_response)
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        result = await chamberctrl_set_fridge_temp(1, test_url, test_temp, test_chipid)
        
        assert result is True


@pytest.mark.asyncio
async def test_chamberctrl_set_fridge_temp_empty_url():
    """Test fridge temperature setting with empty URL"""
    test_url = ""
    test_temp = 18.5
    test_chipid = "ABC123"
    
    with patch("api.chamberctrl.system_log_fermentationcontrol") as mock_log:
        result = await chamberctrl_set_fridge_temp(1, test_url, test_temp, test_chipid)
        
        assert result is False
        mock_log.assert_called_once()


@pytest.mark.asyncio
async def test_chamberctrl_set_fridge_temp_http_error():
    """Test fridge temperature setting with HTTP error"""
    test_url = "http://localhost:8080"
    test_temp = 18.5
    test_chipid = "ABC123"
    
    with patch("api.chamberctrl.httpx.AsyncClient") as mock_client_class, \
         patch("api.chamberctrl.system_log_fermentationcontrol") as mock_log:
        
        mock_response = MagicMock()
        mock_response.status_code = 500
        
        mock_client = AsyncMock()
        mock_client.put = AsyncMock(return_value=mock_response)
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        result = await chamberctrl_set_fridge_temp(1, test_url, test_temp, test_chipid)
        
        assert result is False
        mock_log.assert_called_once()


@pytest.mark.asyncio
async def test_chamberctrl_set_fridge_temp_read_timeout():
    """Test fridge temperature setting with read timeout"""
    test_url = "http://localhost:8080"
    test_temp = 18.5
    test_chipid = "ABC123"
    
    with patch("api.chamberctrl.httpx.AsyncClient") as mock_client_class, \
         patch("api.chamberctrl.system_log_fermentationcontrol") as mock_log:
        
        mock_client = AsyncMock()
        mock_client.put = AsyncMock(side_effect=httpx.ReadTimeout("Timeout"))
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        result = await chamberctrl_set_fridge_temp(1, test_url, test_temp, test_chipid)
        
        assert result is False


@pytest.mark.asyncio
async def test_chamberctrl_set_fridge_temp_connect_error():
    """Test fridge temperature setting with connect error"""
    test_url = "http://localhost:8080"
    test_temp = 18.5
    test_chipid = "ABC123"
    
    with patch("api.chamberctrl.httpx.AsyncClient") as mock_client_class, \
         patch("api.chamberctrl.system_log_fermentationcontrol") as mock_log:
        
        mock_client = AsyncMock()
        mock_client.put = AsyncMock(side_effect=httpx.ConnectError("Connection refused"))
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        result = await chamberctrl_set_fridge_temp(1, test_url, test_temp, test_chipid)
        
        assert result is False


@pytest.mark.asyncio
async def test_chamberctrl_set_fridge_temp_connect_timeout():
    """Test fridge temperature setting with connect timeout"""
    test_url = "http://localhost:8080"
    test_temp = 18.5
    test_chipid = "ABC123"
    
    with patch("api.chamberctrl.httpx.AsyncClient") as mock_client_class, \
         patch("api.chamberctrl.system_log_fermentationcontrol") as mock_log:
        
        mock_client = AsyncMock()
        mock_client.put = AsyncMock(side_effect=httpx.ConnectTimeout("Timeout"))
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        result = await chamberctrl_set_fridge_temp(1, test_url, test_temp, test_chipid)
        
        assert result is False
