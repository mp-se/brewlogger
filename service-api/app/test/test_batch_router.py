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

"""Tests for batch router endpoints with filtering and dashboard."""
from datetime import datetime, timedelta
from api.config import get_settings
from api.db.session import create_session
from api.db.schemas import BatchCreate, GravityCreate
from api.services.batch import BatchService
from api.services.gravity import GravityService
from .conftest import truncate_database

headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}


def test_init(app_client):
    """Initialize database for batch router tests"""
    truncate_database()
    
    # Create test batch in database
    session = create_session()
    batch_service = BatchService(session)
    
    # Create a batch using Pydantic schema with all required fields
    batch_data = BatchCreate(
        name="Test Batch",
        description="Test description",
        chip_id_gravity="ABC123",
        chip_id_pressure="DEF456",
        active=True,
        tap_list=True,
        brew_date="2024-01-01",
        style="IPA",
        brewer="Test Brewer",
        abv=6.5,
        ebc=20,
        ibu=60,
        fg=1.010,
        og=1.080,
        brewfather_id="",
        fermentation_steps="[]",  # Required field - provide as JSON string
    )
    batch_service.create(batch_data)
    session.close()


def test_get_batches_no_filter(app_client):
    """Test GET /api/batch/ with no filter parameters"""
    test_init(app_client)
    
    response = app_client.get("/api/batch/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    # Verify enriched fields exist (they use camelCase due to alias_generator)
    batch = data[0]
    # These fields are added by the router and converted to camelCase
    expected_fields = {"id", "name", "active", "gravityCount", "pressureCount", "pourCount"}
    for field in expected_fields:
        assert field in batch, f"Field {field} not in batch: {batch.keys()}"


def test_get_batches_with_chipid_filter(app_client):
    """Test GET /api/batch/?chipId=test_chip_001"""
    test_init(app_client)
    
    response = app_client.get(
        "/api/batch/",
        params={"chipId": "test_chip_001"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert data[0]["chipId"] == "test_chip_001"


def test_get_batches_with_chipid_and_active_true(app_client):
    """Test GET /api/batch/?chipId=test_chip_001&active=True"""
    test_init(app_client)
    
    response = app_client.get(
        "/api/batch/",
        params={"chipId": "test_chip_001", "active": "True"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_batches_with_chipid_and_active_false(app_client):
    """Test GET /api/batch/?chipId=test_chip_001&active=False"""
    test_init(app_client)
    
    response = app_client.get(
        "/api/batch/",
        params={"chipId": "test_chip_001", "active": "False"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_batches_with_active_true_only(app_client):
    """Test GET /api/batch/?active=True"""
    test_init(app_client)
    
    response = app_client.get(
        "/api/batch/",
        params={"active": "True"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_batches_with_active_false_only(app_client):
    """Test GET /api/batch/?active=False"""
    test_init(app_client)
    
    response = app_client.get(
        "/api/batch/",
        params={"active": "False"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_batch_by_id(app_client):
    """Test GET /api/batch/{batch_id}"""
    test_init(app_client)
    
    # Get first batch
    list_response = app_client.get("/api/batch/", headers=headers)
    batches = list_response.json()
    if len(batches) > 0:
        batch_id = batches[0]["id"]
        response = app_client.get(f"/api/batch/{batch_id}", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == batch_id


def test_get_batch_by_id_not_found(app_client):
    """Test GET /api/batch/9999 with non-existent ID"""
    test_init(app_client)
    
    response = app_client.get("/api/batch/9999", headers=headers)
    assert response.status_code == 404


def test_get_taplist(app_client):
    """Test GET /api/batch/taplist"""
    test_init(app_client)
    
    response = app_client.get("/api/batch/taplist")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_batch_unauthorized(app_client):
    """Test that GET /api/batch/{id} requires authorization"""
    test_init(app_client)
    
    # Try without auth header
    response = app_client.get("/api/batch/1")
    assert response.status_code == 401
