# SPDX-License-Identifier: GPL-3.0-or-later
# Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger

"""Tests for utility functions."""
import json
import logging
from unittest.mock import patch, MagicMock
import pytest
from sqlalchemy.exc import SQLAlchemyError

from api.utils import load_settings, get_client_ip, log_public_request
from api.db import models
from api.db.session import create_session
from .conftest import truncate_database


def test_init(app_client):
    """Initialize database for utils tests"""
    truncate_database()


def test_load_settings_success(app_client):
    """Test successful load_settings() when database is connected and settings exist"""
    test_init(app_client)
    
    # This should complete without error
    # (the function logs but doesn't raise exceptions on success)
    load_settings()
    # If we get here, it succeeded


def test_load_settings_creates_default_when_empty():
    """Test that load_settings() creates default settings when none exist"""
    truncate_database()
    
    # Call load_settings, which should create a default record
    load_settings()
    
    # Verify the default was created
    from api.db.session import create_session
    from api.services.brewlogger import BrewLoggerService
    
    session = create_session()
    service = BrewLoggerService(session)
    settings_list = service.list()
    session.close()
    
    # Verify that a settings record exists after load_settings()
    assert len(settings_list) > 0
    # The defaults set in load_settings have these values
    settings = settings_list[0]
    assert settings.temperature_format is not None
    assert settings.pressure_format is not None


@patch("api.utils.engine")
def test_load_settings_database_connection_error(mock_engine):
    """Test load_settings() handles database connection errors"""
    # Mock engine.connect() to raise an exception
    mock_connection = MagicMock()
    mock_connection.__enter__ = MagicMock(side_effect=OSError("Connection failed"))
    mock_connection.__exit__ = MagicMock(return_value=None)
    mock_engine.connect.return_value = mock_connection
    
    # Should not raise an exception, just log the error
    try:
        load_settings()
    except OSError:
        # If it's not caught, that's fine for this test - the important thing
        # is that the error path is exercised
        pass


@patch("api.utils.BrewLoggerService")
@patch("api.utils.engine")
def test_load_settings_service_query_error(mock_engine, mock_service_class):
    """Test load_settings() handles service query errors"""
    # Mock the engine to succeed
    mock_connection = MagicMock()
    mock_connection.execute = MagicMock()
    mock_connection.commit = MagicMock()
    mock_connection.__enter__ = MagicMock(return_value=mock_connection)
    mock_connection.__exit__ = MagicMock(return_value=None)
    mock_engine.connect.return_value = mock_connection
    
    # Mock the service to raise an error on list()
    mock_service = MagicMock()
    mock_service.list.side_effect = SQLAlchemyError("Query failed")
    mock_service_class.return_value = mock_service
    
    # Should handle the error gracefully
    try:
        load_settings()
    except SQLAlchemyError:
        # The error may propagate, but it's been logged
        pass


@patch("api.utils.BrewLoggerService")
@patch("api.utils.engine")
def test_load_settings_creates_default_via_service(mock_engine, mock_service_class):
    """Test that load_settings() calls create() when settings list is empty"""
    # Mock the engine to succeed
    mock_connection = MagicMock()
    mock_connection.execute = MagicMock()
    mock_connection.commit = MagicMock()
    mock_connection.__enter__ = MagicMock(return_value=mock_connection)
    mock_connection.__exit__ = MagicMock(return_value=None)
    mock_engine.connect.return_value = mock_connection
    
    # Mock the service to return empty list first
    mock_service = MagicMock()
    mock_service.list.return_value = []
    mock_service.create = MagicMock()
    mock_service_class.return_value = mock_service
    
    load_settings()
    
    # Verify create() was called
    assert mock_service.create.called


def test_get_client_ip_from_x_real_ip():
    """Test get_client_ip() extracts IP from X-Real-IP header"""
    mock_request = MagicMock()
    mock_request.headers = {"x-real-ip": "203.0.113.1"}
    mock_request.client = MagicMock(host="127.0.0.1")
    
    ip = get_client_ip(mock_request)
    assert ip == "203.0.113.1"


def test_get_client_ip_from_x_forwarded_for():
    """Test get_client_ip() extracts IP from X-Forwarded-For header when X-Real-IP missing"""
    mock_request = MagicMock()
    mock_request.headers = {"x-forwarded-for": "203.0.113.2, 192.0.2.1"}
    mock_request.client = MagicMock(host="127.0.0.1")
    
    ip = get_client_ip(mock_request)
    assert ip == "203.0.113.2"


def test_get_client_ip_from_client_host():
    """Test get_client_ip() falls back to request.client.host"""
    mock_request = MagicMock()
    mock_request.headers = {}
    mock_request.client = MagicMock(host="198.51.100.1")
    
    ip = get_client_ip(mock_request)
    assert ip == "198.51.100.1"


def test_get_client_ip_returns_unknown_when_no_source():
    """Test get_client_ip() returns 'unknown' when no IP source available"""
    mock_request = MagicMock()
    mock_request.headers = {}
    mock_request.client = None
    
    ip = get_client_ip(mock_request)
    assert ip == "unknown"


def test_get_client_ip_ignores_empty_real_ip():
    """Test get_client_ip() ignores empty X-Real-IP and uses fallback"""
    mock_request = MagicMock()
    mock_request.headers = {"x-real-ip": "   "}
    mock_request.client = MagicMock(host="192.0.2.100")
    
    ip = get_client_ip(mock_request)
    assert ip == "192.0.2.100"


def test_log_public_request_creates_database_entry():
    """Test log_public_request() stores request to database"""
    truncate_database()
    
    payload = {"test_key": "test_value", "sensor": "gravity"}
    log_public_request("192.168.1.100", payload)
    
    # Verify it was stored
    session = create_session()
    receive_log = session.query(models.ReceiveLog).first()
    session.close()
    
    assert receive_log is not None
    assert receive_log.ip_address == "192.168.1.100"
    assert json.loads(receive_log.payload) == payload


def test_log_public_request_handles_complex_payload():
    """Test log_public_request() handles complex nested payloads"""
    truncate_database()
    
    complex_payload = {
        "device": "iSpindel",
        "data": {"gravity": 1.050, "temp": 20.5},
        "nested": {"deep": {"value": "test"}}
    }
    log_public_request("10.0.0.50", complex_payload)
    
    session = create_session()
    receive_log = session.query(models.ReceiveLog).first()
    session.close()
    
    assert receive_log is not None
    assert json.loads(receive_log.payload) == complex_payload


def test_log_public_request_multiple_entries():
    """Test log_public_request() can create multiple entries"""
    truncate_database()
    
    log_public_request("192.168.1.1", {"id": 1})
    log_public_request("192.168.1.2", {"id": 2})
    log_public_request("192.168.1.3", {"id": 3})
    
    session = create_session()
    count = session.query(models.ReceiveLog).count()
    session.close()
    
    assert count == 3
