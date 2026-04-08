# SPDX-License-Identifier: GPL-3.0-or-later
# Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger

import json
from datetime import datetime
from api.config import get_settings
from api.db import models
from api.db.session import create_session
from .conftest import truncate_database

headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}


def test_init(app_client):
    """Initialize database for receive log tests"""
    truncate_database()


def test_receive_logs_requires_auth(app_client):
    """Test that GET /api/system/receive requires authentication"""
    test_init(app_client)
    
    # Try with invalid API key
    bad_headers = {
        "Authorization": "Bearer invalid_key",
        "Content-Type": "application/json",
    }
    r = app_client.get("/api/system/receive", headers=bad_headers)
    assert r.status_code == 401


def test_receive_logs_empty(app_client):
    """Test GET /api/system/receive returns empty list when no records exist"""
    test_init(app_client)
    
    r = app_client.get("/api/system/receive", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 0
    assert data["skip"] == 0
    assert data["limit"] == 50
    assert data["data"] == []


def test_receive_logs_with_single_record(app_client):
    """Test GET /api/system/receive returns single record"""
    test_init(app_client)
    
    # Insert a test record directly into the database
    session = create_session()
    log = models.ReceiveLog(
        ip_address="192.168.1.100",
        payload='{"test": "data"}',
        timestamp=datetime.now()
    )
    session.add(log)
    session.commit()
    session.close()
    
    r = app_client.get("/api/system/receive", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 1
    assert len(data["data"]) == 1
    assert data["data"][0]["ipAddress"] == "192.168.1.100"
    assert data["data"][0]["payload"] == '{"test": "data"}'


def test_receive_logs_pagination_skip(app_client):
    """Test pagination with skip parameter"""
    test_init(app_client)
    
    # Insert 5 test records
    session = create_session()
    for i in range(5):
        log = models.ReceiveLog(
            ip_address=f"192.168.1.{100 + i}",
            payload=f'{{"index": {i}}}',
            timestamp=datetime.now()
        )
        session.add(log)
    session.commit()
    session.close()
    
    # Get with skip=2
    r = app_client.get("/api/system/receive?skip=2&limit=2", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 5
    assert data["skip"] == 2
    assert data["limit"] == 2
    assert len(data["data"]) == 2


def test_receive_logs_pagination_limit(app_client):
    """Test pagination with limit parameter"""
    test_init(app_client)
    
    # Insert 10 test records
    session = create_session()
    for i in range(10):
        log = models.ReceiveLog(
            ip_address=f"192.168.1.{100 + i}",
            payload=f'{{"index": {i}}}',
            timestamp=datetime.now()
        )
        session.add(log)
    session.commit()
    session.close()
    
    # Get with limit=3
    r = app_client.get("/api/system/receive?limit=3", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 10
    assert data["skip"] == 0
    assert data["limit"] == 3
    assert len(data["data"]) == 3


def test_receive_logs_default_limit(app_client):
    """Test that default limit is 50"""
    test_init(app_client)
    
    # Insert 60 test records
    session = create_session()
    for i in range(60):
        log = models.ReceiveLog(
            ip_address=f"192.168.1.{100 + (i % 254)}",
            payload=f'{{"index": {i}}}',
            timestamp=datetime.now()
        )
        session.add(log)
    session.commit()
    session.close()
    
    # Get without limit specified
    r = app_client.get("/api/system/receive", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 60
    assert data["limit"] == 50
    assert len(data["data"]) == 50


def test_receive_logs_max_limit(app_client):
    """Test that limit cannot exceed 500"""
    test_init(app_client)
    
    # Try with limit > 500
    r = app_client.get("/api/system/receive?limit=600", headers=headers)
    assert r.status_code == 422  # Validation error


def test_receive_logs_ordering(app_client):
    """Test that records are ordered by timestamp descending"""
    test_init(app_client)
    
    # Insert records with different timestamps
    session = create_session()
    from datetime import timedelta
    now = datetime.now()
    
    for i in range(3):
        log = models.ReceiveLog(
            ip_address=f"192.168.1.{100 + i}",
            payload=f'{{"index": {i}}}',
            timestamp=now - timedelta(minutes=i)  # First is newest, last is oldest
        )
        session.add(log)
    session.commit()
    session.close()
    
    r = app_client.get("/api/system/receive", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert len(data["data"]) == 3
    # Verify ordering - newest first
    assert data["data"][0]["payload"] == '{"index": 0}'
    assert data["data"][1]["payload"] == '{"index": 1}'
    assert data["data"][2]["payload"] == '{"index": 2}'


def test_receive_logs_ip_address_formats(app_client):
    """Test that various IP address formats are stored correctly"""
    test_init(app_client)
    
    session = create_session()
    # Test IPv4
    log1 = models.ReceiveLog(
        ip_address="192.168.1.1",
        payload='{"type": "ipv4"}',
        timestamp=datetime.now()
    )
    # Test IPv6
    log2 = models.ReceiveLog(
        ip_address="2001:0db8:85a3:0000:0000:8a2e:0370:7334",
        payload='{"type": "ipv6"}',
        timestamp=datetime.now()
    )
    session.add(log1)
    session.add(log2)
    session.commit()
    session.close()
    
    r = app_client.get("/api/system/receive?limit=10", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 2
    ip_addresses = [record["ipAddress"] for record in data["data"]]
    assert "192.168.1.1" in ip_addresses
    assert "2001:0db8:85a3:0000:0000:8a2e:0370:7334" in ip_addresses
