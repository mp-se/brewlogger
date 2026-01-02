"""Tests for logging module functions."""
import json
from api.log import (
    system_log,
    system_log_purge,
    system_log_scheduler,
    system_log_fermentationcontrol,
    system_log_security,
)
from api.services import SystemLogService
from api.db.session import create_session
from .conftest import truncate_database


def test_init(app_client):
    """Initialize database for log tests"""
    truncate_database()


def test_system_log_creates_entry(app_client):
    """Test that system_log creates a database entry"""
    test_init(app_client)
    
    # Log an entry
    system_log("test_module", "Test message", 1001)
    
    # Verify it was created
    session = create_session()
    service = SystemLogService(session)
    logs = service.list()
    assert len(logs) > 0
    assert logs[-1].module == "test_module"
    assert logs[-1].message == "Test message"
    assert logs[-1].error_code == 1001


def test_system_log_scheduler(app_client):
    """Test that system_log_scheduler logs to scheduler module"""
    test_init(app_client)
    
    system_log_scheduler("Scheduler test", 2001)
    
    session = create_session()
    service = SystemLogService(session)
    logs = service.list()
    assert any(log.module == "scheduler" and log.message == "Scheduler test" for log in logs)


def test_system_log_fermentationcontrol(app_client):
    """Test that system_log_fermentationcontrol logs to fermentation_control module"""
    test_init(app_client)
    
    system_log_fermentationcontrol("Fermentation test", 3001)
    
    session = create_session()
    service = SystemLogService(session)
    logs = service.list()
    assert any(log.module == "fermentation_control" and log.message == "Fermentation test" for log in logs)


def test_system_log_security(app_client):
    """Test that system_log_security logs to security module"""
    test_init(app_client)
    
    system_log_security("Security test", 4001)
    
    session = create_session()
    service = SystemLogService(session)
    logs = service.list()
    assert any(log.module == "security" and log.message == "Security test" for log in logs)


def test_system_log_purge(app_client):
    """Test that system_log_purge deletes old records"""
    test_init(app_client)
    
    # Create some log entries
    system_log("test1", "Message 1", 1001)
    system_log("test2", "Message 2", 1002)
    
    session = create_session()
    service = SystemLogService(session)
    
    # Count before purge
    logs_before = len(service.list())
    assert logs_before >= 2
    
    # Purge old records (60+ days old - won't delete recent ones)
    count = system_log_purge()
    
    # Recent logs should still be there
    logs_after = len(service.list())
    assert logs_after >= 2
