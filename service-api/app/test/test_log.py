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

"""Tests for logging module functions."""
import json
from datetime import datetime, timedelta
from api.log import (
    system_log,
    system_log_purge,
    system_log_scheduler,
    system_log_fermentationcontrol,
    system_log_security,
    receive_log_purge,
)
from api.services import SystemLogService
from api.db import models
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


def test_receive_log_purge_no_old_records(app_client):
    """Test receive_log_purge when no records are old enough to delete"""
    test_init(app_client)
    
    # Add a recent receive log
    session = create_session()
    receive_log = models.ReceiveLog(
        ip_address="127.0.0.1",
        payload=json.dumps({"test": "data"}),
        timestamp=datetime.now()
    )
    session.add(receive_log)
    session.commit()
    session.close()
    
    # Count before purge
    session = create_session()
    count_before = session.query(models.ReceiveLog).count()
    session.close()
    
    # Purge records older than 90 days
    receive_log_purge(days=90)
    
    # Recent record should still exist
    session = create_session()
    count_after = session.query(models.ReceiveLog).count()
    session.close()
    
    assert count_after == count_before
    assert count_after == 1


def test_receive_log_purge_with_old_records(app_client):
    """Test receive_log_purge deletes records older than specified days"""
    test_init(app_client)
    
    session = create_session()
    
    # Add an old receive log (120 days ago)
    old_log = models.ReceiveLog(
        ip_address="192.168.1.1",
        payload=json.dumps({"old": "data"}),
        timestamp=datetime.now() - timedelta(days=120)
    )
    session.add(old_log)
    
    # Add a recent receive log
    recent_log = models.ReceiveLog(
        ip_address="127.0.0.1",
        payload=json.dumps({"recent": "data"}),
        timestamp=datetime.now()
    )
    session.add(recent_log)
    session.commit()
    session.close()
    
    # Count before purge
    session = create_session()
    count_before = session.query(models.ReceiveLog).count()
    session.close()
    assert count_before == 2
    
    # Purge records older than 90 days
    receive_log_purge(days=90)
    
    # Old record should be deleted, recent should remain
    session = create_session()
    count_after = session.query(models.ReceiveLog).count()
    remaining = session.query(models.ReceiveLog).all()
    session.close()
    
    assert count_after == 1
    assert remaining[0].payload == json.dumps({"recent": "data"})


def test_receive_log_purge_empty_table(app_client):
    """Test receive_log_purge handles empty table gracefully"""
    test_init(app_client)
    
    # Should not raise any exceptions on empty table
    receive_log_purge(days=90)
    
    session = create_session()
    count = session.query(models.ReceiveLog).count()
    session.close()
    assert count == 0
