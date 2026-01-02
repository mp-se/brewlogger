"""Tests for scheduler module."""
import pytest
import json
from datetime import datetime
from unittest.mock import patch, AsyncMock, MagicMock
import httpx

from api.scheduler import (
    scheduler_shutdown,
    task_fetch_chamberctrl_temps,
    task_forward_gravity,
    task_fermentation_control,
    task_check_database,
    scheduler_setup,
)


def test_scheduler_shutdown():
    """Test scheduler shutdown function."""
    with patch("api.scheduler.scheduler") as mock_scheduler:
        scheduler_shutdown()
        mock_scheduler.shutdown.assert_called_once()


@pytest.mark.asyncio
async def test_task_fetch_chamberctrl_temps_no_devices():
    """Test task_fetch_chamberctrl_temps with no devices."""
    with patch("api.scheduler.DeviceService") as mock_service_class:
        mock_service = MagicMock()
        mock_service.search_software.return_value = []
        mock_service_class.return_value = mock_service
        
        await task_fetch_chamberctrl_temps()
        
        mock_service.search_software.assert_called_once_with("Chamber-Controller")


@pytest.mark.asyncio
async def test_task_fetch_chamberctrl_temps_empty_url():
    """Test task_fetch_chamberctrl_temps with empty device URL."""
    with patch("api.scheduler.DeviceService") as mock_service_class:
        mock_device = MagicMock()
        mock_device.id = 1
        mock_device.url = ""  # Empty URL
        
        mock_service = MagicMock()
        mock_service.search_software.return_value = [mock_device]
        mock_service_class.return_value = mock_service
        
        await task_fetch_chamberctrl_temps()
        
        # Should not attempt to fetch if URL is empty
        mock_service.search_software.assert_called_once()


@pytest.mark.asyncio
async def test_task_fetch_chamberctrl_temps_success():
    """Test task_fetch_chamberctrl_temps successfully fetching temperatures."""
    with patch("api.scheduler.DeviceService") as mock_service_class, \
         patch("api.scheduler.chamberctrl_temps") as mock_temps, \
         patch("api.scheduler.write_key") as mock_write:
        
        mock_device = MagicMock()
        mock_device.id = 1
        mock_device.url = "http://localhost:8080"
        
        mock_service = MagicMock()
        mock_service.search_software.return_value = [mock_device]
        mock_service_class.return_value = mock_service
        
        mock_temps.return_value = {
            "pid_beer_temp": 19.5,
            "pid_fridge_temp": 18.0,
        }
        
        await task_fetch_chamberctrl_temps()
        
        mock_temps.assert_called_once_with("http://localhost:8080")
        assert mock_write.call_count == 2
        
        # Verify cache keys were written
        calls = mock_write.call_args_list
        assert calls[0][0][0] == "chamber_1_beer_temp"
        assert calls[1][0][0] == "chamber_1_fridge_temp"


@pytest.mark.asyncio
async def test_task_fetch_chamberctrl_temps_none_response():
    """Test task_fetch_chamberctrl_temps when device returns None."""
    with patch("api.scheduler.DeviceService") as mock_service_class, \
         patch("api.scheduler.chamberctrl_temps") as mock_temps, \
         patch("api.scheduler.write_key") as mock_write:
        
        mock_device = MagicMock()
        mock_device.id = 1
        mock_device.url = "http://localhost:8080"
        
        mock_service = MagicMock()
        mock_service.search_software.return_value = [mock_device]
        mock_service_class.return_value = mock_service
        
        mock_temps.return_value = None  # Unable to connect
        
        await task_fetch_chamberctrl_temps()
        
        # Should not write cache keys if temps are None
        mock_write.assert_not_called()


@pytest.mark.asyncio
async def test_task_forward_gravity_empty_url():
    """Test task_forward_gravity with empty forward URL."""
    with patch("api.scheduler.BrewLoggerService") as mock_service_class:
        mock_settings = MagicMock()
        mock_settings.gravity_forward_url = ""  # Empty URL
        
        mock_service = MagicMock()
        mock_service.list.return_value = [mock_settings]
        mock_service_class.return_value = mock_service
        
        await task_forward_gravity()
        
        # Should return early without doing anything
        mock_service_class.assert_called_once()


@pytest.mark.asyncio
async def test_task_forward_gravity_no_data():
    """Test task_forward_gravity with no gravity data to forward."""
    with patch("api.scheduler.BrewLoggerService") as mock_service_class, \
         patch("api.scheduler.find_key") as mock_find:
        
        mock_settings = MagicMock()
        mock_settings.gravity_forward_url = "http://brewfather.app/test"
        mock_settings.gravity_format = "SG"
        
        mock_service = MagicMock()
        mock_service.list.return_value = [mock_settings]
        mock_service_class.return_value = mock_service
        
        mock_find.return_value = []  # No gravity data
        
        await task_forward_gravity()
        
        mock_find.assert_called_once_with("gravity_*")


@pytest.mark.asyncio
async def test_task_forward_gravity_success():
    """Test task_forward_gravity successfully forwarding data."""
    with patch("api.scheduler.BrewLoggerService") as mock_service_class, \
         patch("api.scheduler.find_key") as mock_find, \
         patch("api.scheduler.read_key") as mock_read, \
         patch("api.scheduler.delete_key") as mock_delete, \
         patch("api.scheduler.httpx.AsyncClient") as mock_client_class:
        
        mock_settings = MagicMock()
        mock_settings.gravity_forward_url = "http://example.com/gravity"
        mock_settings.gravity_format = "Plato"
        
        mock_service = MagicMock()
        mock_service.list.return_value = [mock_settings]
        mock_service_class.return_value = mock_service
        
        # Mock gravity data in cache
        gravity_data = {"name": "Test", "gravity": 1.050}
        mock_find.return_value = ["gravity_1"]
        mock_read.return_value = json.dumps(gravity_data).encode()
        
        # Mock HTTP response
        mock_response = MagicMock()
        mock_response.status_code = 200
        
        mock_client = AsyncMock()
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        await task_forward_gravity()
        
        # Verify POST was called with correct data
        mock_client.post.assert_called_once()
        call_args = mock_client.post.call_args
        assert call_args[0][0] == "http://example.com/gravity"
        
        # Verify cache key was deleted after successful forward
        mock_delete.assert_called_once_with("gravity_1")


@pytest.mark.asyncio
async def test_task_forward_gravity_brewfather_sg_format():
    """Test task_forward_gravity adds [SG] suffix for Brewfather SG format."""
    with patch("api.scheduler.BrewLoggerService") as mock_service_class, \
         patch("api.scheduler.find_key") as mock_find, \
         patch("api.scheduler.read_key") as mock_read, \
         patch("api.scheduler.delete_key") as mock_delete, \
         patch("api.scheduler.httpx.AsyncClient") as mock_client_class:
        
        mock_settings = MagicMock()
        mock_settings.gravity_forward_url = "http://api.brewfather.app/test"
        mock_settings.gravity_format = "SG"
        
        mock_service = MagicMock()
        mock_service.list.return_value = [mock_settings]
        mock_service_class.return_value = mock_service
        
        # Mock gravity data without [SG] suffix
        gravity_data = {"name": "MyBatch", "gravity": 1.050}
        mock_find.return_value = ["gravity_1"]
        mock_read.return_value = json.dumps(gravity_data).encode()
        
        # Mock HTTP response
        mock_response = MagicMock()
        mock_response.status_code = 200
        
        mock_client = AsyncMock()
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        await task_forward_gravity()
        
        # Verify [SG] was added to name
        call_args = mock_client.post.call_args
        data_str = call_args[1]["data"]
        data = json.loads(data_str)
        assert "[SG]" in data["name"]


@pytest.mark.asyncio
async def test_task_forward_gravity_read_timeout():
    """Test task_forward_gravity handling read timeout."""
    with patch("api.scheduler.BrewLoggerService") as mock_service_class, \
         patch("api.scheduler.find_key") as mock_find, \
         patch("api.scheduler.read_key") as mock_read, \
         patch("api.scheduler.delete_key") as mock_delete, \
         patch("api.scheduler.system_log_scheduler") as mock_log, \
         patch("api.scheduler.httpx.AsyncClient") as mock_client_class:
        
        mock_settings = MagicMock()
        mock_settings.gravity_forward_url = "http://example.com/gravity"
        mock_settings.gravity_format = "Plato"
        
        mock_service = MagicMock()
        mock_service.list.return_value = [mock_settings]
        mock_service_class.return_value = mock_service
        
        gravity_data = {"name": "Test", "gravity": 1.050}
        mock_find.return_value = ["gravity_1"]
        mock_read.return_value = json.dumps(gravity_data).encode()
        
        # Mock timeout exception
        mock_client = AsyncMock()
        mock_client.post = AsyncMock(side_effect=httpx.ReadTimeout("Timeout"))
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        await task_forward_gravity()
        
        # Should log error but not delete cache key
        mock_log.assert_called_once()
        mock_delete.assert_not_called()


@pytest.mark.asyncio
async def test_task_forward_gravity_connect_error():
    """Test task_forward_gravity handling connect error."""
    with patch("api.scheduler.BrewLoggerService") as mock_service_class, \
         patch("api.scheduler.find_key") as mock_find, \
         patch("api.scheduler.read_key") as mock_read, \
         patch("api.scheduler.delete_key") as mock_delete, \
         patch("api.scheduler.system_log_scheduler") as mock_log, \
         patch("api.scheduler.httpx.AsyncClient") as mock_client_class:
        
        mock_settings = MagicMock()
        mock_settings.gravity_forward_url = "http://example.com/gravity"
        mock_settings.gravity_format = "Plato"
        
        mock_service = MagicMock()
        mock_service.list.return_value = [mock_settings]
        mock_service_class.return_value = mock_service
        
        gravity_data = {"name": "Test", "gravity": 1.050}
        mock_find.return_value = ["gravity_1"]
        mock_read.return_value = json.dumps(gravity_data).encode()
        
        # Mock connection error
        mock_client = AsyncMock()
        mock_client.post = AsyncMock(side_effect=httpx.ConnectError("Connection refused"))
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        await task_forward_gravity()
        
        # Should log error
        mock_log.assert_called_once()


@pytest.mark.asyncio
async def test_task_forward_gravity_connect_timeout():
    """Test task_forward_gravity handling connect timeout."""
    with patch("api.scheduler.BrewLoggerService") as mock_service_class, \
         patch("api.scheduler.find_key") as mock_find, \
         patch("api.scheduler.read_key") as mock_read, \
         patch("api.scheduler.system_log_scheduler") as mock_log, \
         patch("api.scheduler.httpx.AsyncClient") as mock_client_class:
        
        mock_settings = MagicMock()
        mock_settings.gravity_forward_url = "http://example.com/gravity"
        mock_settings.gravity_format = "Plato"
        
        mock_service = MagicMock()
        mock_service.list.return_value = [mock_settings]
        mock_service_class.return_value = mock_service
        
        gravity_data = {"name": "Test", "gravity": 1.050}
        mock_find.return_value = ["gravity_1"]
        mock_read.return_value = json.dumps(gravity_data).encode()
        
        # Mock connection timeout
        mock_client = AsyncMock()
        mock_client.post = AsyncMock(side_effect=httpx.ConnectTimeout("Timeout"))
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        await task_forward_gravity()
        
        # Should log error
        mock_log.assert_called_once()


@pytest.mark.asyncio
async def test_task_forward_gravity_request_error():
    """Test task_forward_gravity handling generic request error."""
    with patch("api.scheduler.BrewLoggerService") as mock_service_class, \
         patch("api.scheduler.find_key") as mock_find, \
         patch("api.scheduler.read_key") as mock_read, \
         patch("api.scheduler.system_log_scheduler") as mock_log, \
         patch("api.scheduler.httpx.AsyncClient") as mock_client_class:
        
        mock_settings = MagicMock()
        mock_settings.gravity_forward_url = "http://example.com/gravity"
        mock_settings.gravity_format = "Plato"
        
        mock_service = MagicMock()
        mock_service.list.return_value = [mock_settings]
        mock_service_class.return_value = mock_service
        
        gravity_data = {"name": "Test", "gravity": 1.050}
        mock_find.return_value = ["gravity_1"]
        mock_read.return_value = json.dumps(gravity_data).encode()
        
        # Mock generic request error
        error = httpx.RequestError("Unknown error")
        mock_client = AsyncMock()
        mock_client.post = AsyncMock(side_effect=error)
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)
        
        mock_client_class.return_value = mock_client
        
        await task_forward_gravity()
        
        # Should log error
        mock_log.assert_called_once()


@pytest.mark.asyncio
async def test_task_fermentation_control():
    """Test task_fermentation_control calls fermentation controller."""
    with patch("api.scheduler.fermentation_controller_run") as mock_ferm_ctrl:
        await task_fermentation_control()
        
        mock_ferm_ctrl.assert_called_once()
        # Check that it was called with a datetime object
        call_args = mock_ferm_ctrl.call_args[0]
        assert isinstance(call_args[0], datetime)


@pytest.mark.asyncio
async def test_task_check_database():
    """Test task_check_database calls database purge."""
    with patch("api.scheduler.system_log_purge") as mock_purge:
        await task_check_database()
        
        mock_purge.assert_called_once()


def test_scheduler_setup_enabled():
    """Test scheduler setup with scheduler enabled."""
    with patch("api.scheduler.get_settings") as mock_settings, \
         patch("api.scheduler.scheduler") as mock_scheduler:
        
        config = MagicMock()
        config.scheduler_enabled = True
        mock_settings.return_value = config
        
        mock_app = MagicMock()
        
        scheduler_setup(mock_app)
        
        # Should add 4 jobs when enabled
        assert mock_scheduler.add_job.call_count == 4
        mock_scheduler.start.assert_called_once()


def test_scheduler_setup_disabled():
    """Test scheduler setup with scheduler disabled."""
    with patch("api.scheduler.get_settings") as mock_settings, \
         patch("api.scheduler.scheduler") as mock_scheduler:
        
        config = MagicMock()
        config.scheduler_enabled = False
        mock_settings.return_value = config
        
        mock_app = MagicMock()
        
        scheduler_setup(mock_app)
        
        # Should not add jobs when disabled
        mock_scheduler.add_job.assert_not_called()
        mock_scheduler.start.assert_called_once()
