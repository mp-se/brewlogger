import json
from api.config import get_settings
from .conftest import truncate_database

headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}


def test_init(app_client):
    """Initialize database for setting tests"""
    truncate_database()


def test_unauthorized_access(app_client):
    """Test that GET /api/config/ requires authentication"""
    test_init(app_client)
    
    # Try with invalid API key
    bad_headers = {
        "Authorization": "Bearer invalid_key",
        "Content-Type": "application/json",
    }
    r = app_client.get("/api/config/", headers=bad_headers)
    assert r.status_code == 401  # Unauthorized, not 403


def test_update_nonexistent_config(app_client):
    """Test updating a config that doesn't exist"""
    test_init(app_client)
    
    update_data = {
        "temperatureFormat": "F",
        "pressureFormat": "ps",  # max 3 chars
        "gravityFormat": "P",    # max 2 chars
        "volumeFormat": "L",     # max 2 chars
        "version": "1.0.0",
        "gravityForwardUrl": "",
        "darkMode": True,
    }
    
    r = app_client.patch(f"/api/config/999", json=update_data, headers=headers)
    # Should return 404 since config doesn't exist
    assert r.status_code == 404




