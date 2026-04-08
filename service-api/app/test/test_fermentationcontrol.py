# SPDX-License-Identifier: GPL-3.0-or-later
# Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger

"""Tests for fermentation control module."""
import pytest
from datetime import datetime, timedelta
from unittest.mock import patch, AsyncMock, MagicMock

from api.fermentationcontrol import fermentation_controller_run


@pytest.mark.asyncio
async def test_fermentation_controller_no_devices():
    """Test fermentation controller with no chamber controller devices."""
    with patch("api.fermentationcontrol.DeviceService") as mock_service_class:
        mock_service = MagicMock()
        mock_service.search_software.return_value = []
        mock_service_class.return_value = mock_service
        
        # Should not raise any exceptions
        await fermentation_controller_run(datetime.now())
        
        mock_service.search_software.assert_called_once_with("Chamber-Controller")


@pytest.mark.asyncio
async def test_fermentation_controller_device_no_steps():
    """Test fermentation controller with device but no fermentation steps."""
    with patch("api.fermentationcontrol.DeviceService") as mock_service_class:
        # Create mock device with no fermentation steps
        mock_device = MagicMock()
        mock_device.id = 1
        mock_device.url = "http://localhost:8080"
        mock_device.fermentation_step = []
        
        mock_service = MagicMock()
        mock_service.search_software.return_value = [mock_device]
        mock_service_class.return_value = mock_service
        
        await fermentation_controller_run(datetime.now())
        
        mock_service.search_software.assert_called_once_with("Chamber-Controller")


@pytest.mark.asyncio
async def test_fermentation_controller_step_not_active():
    """Test fermentation controller with step outside active date range."""
    with patch("api.fermentationcontrol.DeviceService") as mock_service_class:
        # Create mock step with dates in the past
        mock_step = MagicMock()
        mock_step.date = (datetime.now() - timedelta(days=10)).strftime("%Y-%m-%d")
        mock_step.days = 5  # Was active 10-5 days ago
        mock_step.order = 0
        mock_step.temp = 20.0
        
        mock_device = MagicMock()
        mock_device.id = 1
        mock_device.url = "http://localhost:8080"
        mock_device.fermentation_step = [mock_step]
        
        mock_service = MagicMock()
        mock_service.search_software.return_value = [mock_device]
        mock_service_class.return_value = mock_service
        
        await fermentation_controller_run(datetime.now())
        
        # Should not attempt to fetch chamber temps
        mock_service.search_software.assert_called_once()


@pytest.mark.asyncio
async def test_fermentation_controller_step_active_temp_match():
    """Test fermentation controller with active step and matching temperature."""
    with patch("api.fermentationcontrol.DeviceService") as mock_service_class, \
         patch("api.fermentationcontrol.chamberctrl_temps") as mock_temps:
        
        # Create mock step with today's date
        today = datetime.now()
        mock_step = MagicMock()
        mock_step.date = today.strftime("%Y-%m-%d")
        mock_step.days = 7
        mock_step.order = 0
        mock_step.temp = 20.0
        
        mock_device = MagicMock()
        mock_device.id = 1
        mock_device.url = "http://localhost:8080"
        mock_device.chip_id = "ABC123"
        mock_device.fermentation_step = [mock_step]
        
        mock_service = MagicMock()
        mock_service.search_software.return_value = [mock_device]
        mock_service_class.return_value = mock_service
        
        # Mock the temps response with matching temperature
        mock_temps.return_value = {"pid_fridge_target_temp": 20.0}
        
        await fermentation_controller_run(today)
        
        # Should fetch temps but not set new temp
        mock_temps.assert_called_once_with(1, "http://localhost:8080")


@pytest.mark.asyncio
async def test_fermentation_controller_step_active_temp_mismatch():
    """Test fermentation controller with active step and mismatched temperature."""
    with patch("api.fermentationcontrol.DeviceService") as mock_service_class, \
         patch("api.fermentationcontrol.chamberctrl_temps") as mock_temps, \
         patch("api.fermentationcontrol.chamberctrl_set_fridge_temp") as mock_set_temp, \
         patch("api.fermentationcontrol.system_log_fermentationcontrol") as mock_log:
        
        # Create mock step with today's date
        today = datetime.now()
        mock_step = MagicMock()
        mock_step.date = today.strftime("%Y-%m-%d")
        mock_step.days = 7
        mock_step.order = 0
        mock_step.temp = 20.0
        
        mock_device = MagicMock()
        mock_device.id = 1
        mock_device.url = "http://localhost:8080"
        mock_device.chip_id = "ABC123"
        mock_device.fermentation_step = [mock_step]
        
        mock_service = MagicMock()
        mock_service.search_software.return_value = [mock_device]
        mock_service_class.return_value = mock_service
        
        # Mock the temps response with different temperature
        mock_temps.return_value = {"pid_fridge_target_temp": 18.0}
        mock_set_temp.return_value = True
        
        await fermentation_controller_run(today)
        
        # Should fetch temps and set new temp
        mock_temps.assert_called_once_with(1, "http://localhost:8080")
        mock_set_temp.assert_called_once_with(1, "http://localhost:8080", 20.0, "ABC123")
        assert mock_log.call_count == 4
        # Check that the calls include temp-related logs
        call_args = [str(call) for call in mock_log.call_args_list]
        assert any("activated" in arg for arg in call_args), "Expected step activation log"
        assert any("20.0" in arg and "18.0" in arg for arg in call_args), "Expected temp change log"
        assert any("Successfully set" in arg for arg in call_args), "Expected success log"
        assert any("completed" in arg for arg in call_args), "Expected task summary"


@pytest.mark.asyncio
async def test_fermentation_controller_step_active_no_temps():
    """Test fermentation controller with active step but unable to fetch temps."""
    with patch("api.fermentationcontrol.DeviceService") as mock_service_class, \
         patch("api.fermentationcontrol.chamberctrl_temps") as mock_temps:
        
        # Create mock step with today's date
        today = datetime.now()
        mock_step = MagicMock()
        mock_step.date = today.strftime("%Y-%m-%d")
        mock_step.days = 7
        mock_step.order = 0
        mock_step.temp = 20.0
        
        mock_device = MagicMock()
        mock_device.id = 1
        mock_device.url = "http://localhost:8080"
        mock_device.chip_id = "ABC123"
        mock_device.fermentation_step = [mock_step]
        
        mock_service = MagicMock()
        mock_service.search_software.return_value = [mock_device]
        mock_service_class.return_value = mock_service
        
        # Mock the temps to return None (unable to connect)
        mock_temps.return_value = None
        
        await fermentation_controller_run(today)
        
        # Should attempt to fetch temps but handle None gracefully
        mock_temps.assert_called_once_with(1, "http://localhost:8080")


@pytest.mark.asyncio
async def test_fermentation_controller_multiple_devices():
    """Test fermentation controller with multiple devices."""
    with patch("api.fermentationcontrol.DeviceService") as mock_service_class, \
         patch("api.fermentationcontrol.chamberctrl_temps") as mock_temps:
        
        today = datetime.now()
        
        # Create first mock device with active step
        mock_step1 = MagicMock()
        mock_step1.date = today.strftime("%Y-%m-%d")
        mock_step1.days = 7
        mock_step1.order = 0
        mock_step1.temp = 20.0
        
        mock_device1 = MagicMock()
        mock_device1.id = 1
        mock_device1.url = "http://localhost:8080"
        mock_device1.chip_id = "ABC123"
        mock_device1.fermentation_step = [mock_step1]
        
        # Create second mock device with no active steps
        mock_device2 = MagicMock()
        mock_device2.id = 2
        mock_device2.url = "http://localhost:8081"
        mock_device2.fermentation_step = []
        
        mock_service = MagicMock()
        mock_service.search_software.return_value = [mock_device1, mock_device2]
        mock_service_class.return_value = mock_service
        
        mock_temps.return_value = {"pid_fridge_target_temp": 20.0}
        
        await fermentation_controller_run(today)
        
        # Should process both devices, but only fetch temps for first
        mock_temps.assert_called_once_with(1, "http://localhost:8080")


@pytest.mark.asyncio
async def test_fermentation_controller_multiple_steps():
    """Test fermentation controller with device having multiple steps."""
    with patch("api.fermentationcontrol.DeviceService") as mock_service_class, \
         patch("api.fermentationcontrol.chamberctrl_temps") as mock_temps, \
         patch("api.fermentationcontrol.chamberctrl_set_fridge_temp") as mock_set_temp:
        
        today = datetime.now()
        
        # Create first step (not active)
        mock_step1 = MagicMock()
        mock_step1.date = (today - timedelta(days=5)).strftime("%Y-%m-%d")
        mock_step1.days = 2
        mock_step1.order = 0
        mock_step1.temp = 25.0
        
        # Create second step (active)
        mock_step2 = MagicMock()
        mock_step2.date = today.strftime("%Y-%m-%d")
        mock_step2.days = 7
        mock_step2.order = 1
        mock_step2.temp = 20.0
        
        mock_device = MagicMock()
        mock_device.id = 1
        mock_device.url = "http://localhost:8080"
        mock_device.chip_id = "ABC123"
        mock_device.fermentation_step = [mock_step1, mock_step2]
        
        mock_service = MagicMock()
        mock_service.search_software.return_value = [mock_device]
        mock_service_class.return_value = mock_service
        
        mock_temps.return_value = {"pid_fridge_target_temp": 18.0}
        
        await fermentation_controller_run(today)
        
        # Should only process the active step
        mock_temps.assert_called_once_with(1, "http://localhost:8080")
        mock_set_temp.assert_called_once_with(1, "http://localhost:8080", 20.0, "ABC123")


@pytest.mark.asyncio
async def test_fermentation_controller_step_boundary_date():
    """Test fermentation controller at step boundary dates."""
    with patch("api.fermentationcontrol.DeviceService") as mock_service_class, \
         patch("api.fermentationcontrol.chamberctrl_temps") as mock_temps:
        
        today = datetime.now()
        
        # Create step that starts today and lasts 7 days
        mock_step = MagicMock()
        mock_step.date = today.strftime("%Y-%m-%d")
        mock_step.days = 7
        mock_step.order = 0
        mock_step.temp = 20.0
        
        mock_device = MagicMock()
        mock_device.id = 1
        mock_device.url = "http://localhost:8080"
        mock_device.chip_id = "ABC123"
        mock_device.fermentation_step = [mock_step]
        
        mock_service = MagicMock()
        mock_service.search_software.return_value = [mock_device]
        mock_service_class.return_value = mock_service
        
        mock_temps.return_value = {"pid_fridge_target_temp": 20.0}
        
        # Test at start date
        await fermentation_controller_run(today)
        assert mock_temps.call_count == 1
        
        # Test at end date (6 days later, since days=7 means indices 0-6)
        end_date = today + timedelta(days=6)
        await fermentation_controller_run(end_date)
        assert mock_temps.call_count == 2
        
        # Test one day after end date (should not match)
        mock_temps.reset_mock()
        after_end = today + timedelta(days=7)
        await fermentation_controller_run(after_end)
        assert mock_temps.call_count == 0
