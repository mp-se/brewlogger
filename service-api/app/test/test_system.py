# SPDX-License-Identifier: GPL-3.0-or-later
# Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger

import json
from datetime import datetime
from api.config import get_settings
from .conftest import truncate_database

headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}


def test_init(app_client):
    truncate_database()


def test_self_test_endpoint(app_client):
    """Test the self-test endpoint"""
    test_init(app_client)
    
    r = app_client.get("/api/system/self_test/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    
    # Verify response structure
    assert "databaseConnection" in data
    assert "redisConnection" in data
    assert "backgroundJobs" in data
    assert "log" in data
    assert "ble" in data
    
    # Check types
    assert isinstance(data["databaseConnection"], bool)
    assert isinstance(data["redisConnection"], bool)
    assert isinstance(data["backgroundJobs"], list)
    assert isinstance(data["log"], list)
    assert isinstance(data["ble"], list)


def test_scheduler_status_endpoint(app_client):
    """Test the scheduler status endpoint"""
    test_init(app_client)
    
    r = app_client.get("/api/system/scheduler/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    
    # Should be a list of jobs
    assert isinstance(data, list)


def test_system_log_get_all(app_client):
    """Test getting all system logs"""
    test_init(app_client)
    
    r = app_client.get("/api/system/log/", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    
    # Should be a paginated response
    assert isinstance(data, dict)
    assert "data" in data
    assert "total" in data
    assert "skip" in data
    assert "limit" in data
    assert isinstance(data["data"], list)


def test_system_log_get_by_id_not_found(app_client):
    """Test getting system log by ID that doesn't exist"""
    test_init(app_client)
    
    r = app_client.get("/api/system/log/999999", headers=headers)
    assert r.status_code == 404


def test_system_log_add(app_client):
    """Test adding a system log entry"""
    test_init(app_client)
    
    log_data = {
        "message": "Test system log message",
        "module": "test_module",
        "errorCode": 0,
        "logLevel": 1,
        "timestamp": datetime.now().isoformat(),
    }
    
    r = app_client.post("/api/system/log/", json=log_data, headers=headers)
    assert r.status_code == 201
    data = json.loads(r.text)
    
    # Verify response contains ID
    assert "id" in data
    assert data["message"] == "Test system log message"
    assert data["module"] == "test_module"


def test_system_log_add_different_levels(app_client):
    """Test adding system logs with different log levels"""
    test_init(app_client)
    
    levels = [0, 1, 2, 3, 4]  # Different severity levels
    
    for level in levels:
        log_data = {
            "message": f"Test level {level} message",
            "module": "test_module",
            "errorCode": level,
            "logLevel": level,
            "timestamp": datetime.now().isoformat(),
        }
        
        r = app_client.post("/api/system/log/", json=log_data, headers=headers)
        assert r.status_code == 201
        data = json.loads(r.text)
        assert data["logLevel"] == level


def test_system_log_add_different_modules(app_client):
    """Test adding system logs from different modules"""
    test_init(app_client)
    
    modules = ["api", "scheduler", "cache", "ws", "device"]
    
    for module in modules:
        log_data = {
            "message": f"Log from {module}",
            "module": module,
            "errorCode": 0,
            "logLevel": 1,
            "timestamp": datetime.now().isoformat(),
        }
        
        r = app_client.post("/api/system/log/", json=log_data, headers=headers)
        assert r.status_code == 201
        data = json.loads(r.text)
        assert data["module"] == module


def test_system_log_with_limit(app_client):
    """Test getting system logs with limit parameter"""
    test_init(app_client)
    
    # Add multiple logs
    for i in range(5):
        log_data = {
            "message": f"Test message {i}",
            "module": "test",
            "errorCode": 0,
            "logLevel": 1,
            "timestamp": datetime.now().isoformat(),
        }
        r = app_client.post("/api/system/log/", json=log_data, headers=headers)
        assert r.status_code == 201
    
    # Get with limit=2
    r = app_client.get("/api/system/log/?limit=2", headers=headers)
    assert r.status_code == 200
    data = json.loads(r.text)
    assert len(data["data"]) <= 2
    assert data["limit"] == 2


def test_system_mdns_post(app_client):
    """Test posting MDNS entry"""
    test_init(app_client)
    
    mdns_data = {
        "name": "test_device",
        "type": "_http._tcp",
        "host": "192.168.1.100",
    }
    
    r = app_client.post("/api/system/mdns", json=mdns_data, headers=headers)
    assert r.status_code == 201

