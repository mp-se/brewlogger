import json
from api.config import get_settings
from api.utils import load_settings
from .conftest import truncate_database

headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}


def test_init(app_client):
    """Initialize database for setting tests"""
    truncate_database()
    # Ensure the default settings record is created
    load_settings()


def test_get_config_requires_auth(app_client):
    """Test that GET /api/config/ requires authentication"""
    test_init(app_client)
    
    # Try with invalid API key
    bad_headers = {
        "Authorization": "Bearer invalid_key",
        "Content-Type": "application/json",
    }
    r = app_client.get("/api/config/", headers=bad_headers)
    assert r.status_code == 401


def test_patch_config_requires_auth(app_client):
    """Test that PATCH /api/config/{id} requires authentication"""
    test_init(app_client)
    
    bad_headers = {
        "Authorization": "Bearer invalid_key",
        "Content-Type": "application/json",
    }
    
    update_data = {
        "temperatureFormat": "F",
        "pressureFormat": "ps",
        "gravityFormat": "P",
        "volumeFormat": "L",
        "gravityForwardUrl": "",
        "darkMode": True,
        "version": "1.0.0",
    }
    
    r = app_client.patch("/api/config/1", json=update_data, headers=bad_headers)
    assert r.status_code == 401


def test_get_config_successful(app_client):
    """Test successful GET of the single config record"""
    test_init(app_client)
    
    # With valid auth, should return the single BrewLogger config
    r = app_client.get("/api/config/", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, dict)
    assert "id" in data or "version" in data  # Verify it's a config object


def test_patch_config_successful(app_client):
    """Test successful PATCH of the single config record"""
    test_init(app_client)
    
    # Patch the config with valid auth
    update_data = {
        "temperatureFormat": "C",
        "pressureFormat": "bar",
        "gravityFormat": "SG",
        "volumeFormat": "mL",
        "gravityForwardUrl": "http://example.com",
        "darkMode": False,
        "version": "1.0.0",
    }
    
    r = app_client.patch("/api/config/1", json=update_data, headers=headers)
    # Should succeed with 200 or 204
    assert r.status_code in [200, 204]






