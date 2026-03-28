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


def test_get_batch_prediction_with_gravity_data(app_client):
    """Test GET /api/batch/{batch_id}/prediction with gravity data in 24-hour window"""
    test_init(app_client)
    
    # Create a batch
    session = create_session()
    batch_service = BatchService(session)
    batch_data = BatchCreate(
        name="Prediction Test Batch",
        description="Test batch for prediction",
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
        fermentation_steps="[]",
    )
    batch = batch_service.create(batch_data)
    batch_id = batch.id
    
    # Create gravity service and add gravity data points
    gravity_service = GravityService(session)
    now = datetime.now()
    
    # Add 3 gravity readings within the 24-hour window
    for i in range(3):
        gravity_data = GravityCreate(
            batch_id=batch_id,
            temperature=20.0 + i,
            gravity=1.050 + (i * 0.005),
            velocity=0.1 * i,
            angle=45.0,
            battery=85.0,
            rssi=90.0,
            created=now - timedelta(hours=12-i),
            active=True,
        )
        gravity_service.create(gravity_data)
    
    session.close()
    
    # Query prediction endpoint with reference date 24 hours from now
    reference_date = (now + timedelta(hours=12)).isoformat()
    response = app_client.get(
        f"/api/batch/{batch_id}/prediction",
        params={"date": reference_date},
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Prediction Test Batch"
    assert data["fg"] == 1.010
    assert data["og"] == 1.080
    assert isinstance(data["gravity"], list)
    assert len(data["gravity"]) == 3
    
    # Verify gravity data points have correct fields
    for gravity in data["gravity"]:
        assert "gravity" in gravity
        assert "temperature" in gravity
        assert "velocity" in gravity
        assert "angle" in gravity
        assert "created" in gravity


def test_get_batch_prediction_invalid_batch_id(app_client):
    """Test GET /api/batch/{batch_id}/prediction with non-existent batch"""
    test_init(app_client)
    
    now = datetime.now()
    reference_date = now.isoformat()
    
    response = app_client.get(
        "/api/batch/9999/prediction",
        params={"date": reference_date},
        headers=headers
    )
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_get_batch_prediction_invalid_date_format(app_client):
    """Test GET /api/batch/{batch_id}/prediction with invalid date format"""
    test_init(app_client)
    
    # Create a batch first
    session = create_session()
    batch_service = BatchService(session)
    batch_data = BatchCreate(
        name="Test Batch",
        description="Test",
        chip_id_gravity="ABC123",
        chip_id_pressure="DEF456",
        active=True,
        tap_list=True,
        brew_date="2024-01-01",
        style="IPA",
        brewer="Brewer",
        abv=6.5,
        ebc=20,
        ibu=60,
        fg=1.010,
        og=1.080,
        brewfather_id="",
        fermentation_steps="[]",
    )
    batch = batch_service.create(batch_data)
    batch_id = batch.id
    session.close()
    
    response = app_client.get(
        f"/api/batch/{batch_id}/prediction",
        params={"date": "invalid-date"},
        headers=headers
    )
    
    assert response.status_code == 400
    assert "Invalid date format" in response.json()["detail"]


def test_get_batch_prediction_no_gravity_data(app_client):
    """Test GET /api/batch/{batch_id}/prediction with batch but no gravity data"""
    test_init(app_client)
    
    # Create a batch without gravity data
    session = create_session()
    batch_service = BatchService(session)
    batch_data = BatchCreate(
        name="Empty Batch",
        description="Test batch with no gravity",
        chip_id_gravity="ABC123",
        chip_id_pressure="DEF456",
        active=True,
        tap_list=True,
        brew_date="2024-01-01",
        style="IPA",
        brewer="Brewer",
        abv=6.5,
        ebc=20,
        ibu=60,
        fg=1.010,
        og=1.080,
        brewfather_id="",
        fermentation_steps="[]",
    )
    batch = batch_service.create(batch_data)
    batch_id = batch.id
    session.close()
    
    now = datetime.now()
    reference_date = now.isoformat()
    
    response = app_client.get(
        f"/api/batch/{batch_id}/prediction",
        params={"date": reference_date},
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Empty Batch"
    assert data["gravity"] is None or data["gravity"] == []


def test_get_batch_prediction_gravity_outside_window(app_client):
    """Test GET /api/batch/{batch_id}/prediction filters gravity data correctly"""
    test_init(app_client)
    
    # Create a batch
    session = create_session()
    batch_service = BatchService(session)
    batch_data = BatchCreate(
        name="Window Test Batch",
        description="Test gravity window filtering",
        chip_id_gravity="ABC123",
        chip_id_pressure="DEF456",
        active=True,
        tap_list=True,
        brew_date="2024-01-01",
        style="IPA",
        brewer="Brewer",
        abv=6.5,
        ebc=20,
        ibu=60,
        fg=1.010,
        og=1.080,
        brewfather_id="",
        fermentation_steps="[]",
    )
    batch = batch_service.create(batch_data)
    batch_id = batch.id
    
    # Create gravity service
    gravity_service = GravityService(session)
    now = datetime.now()
    
    # Add gravity reading WAY outside 24-hour window (30 days ago)
    old_gravity = GravityCreate(
        batch_id=batch_id,
        temperature=20.0,
        gravity=1.050,
        velocity=0.1,
        angle=45.0,
        battery=85.0,
        rssi=90.0,
        created=now - timedelta(days=30),
        active=True,
    )
    gravity_service.create(old_gravity)
    
    # Add gravity reading within 24-hour window
    recent_gravity = GravityCreate(
        batch_id=batch_id,
        temperature=21.0,
        gravity=1.045,
        velocity=0.2,
        angle=45.0,
        battery=85.0,
        rssi=90.0,
        created=now - timedelta(hours=12),
        active=True,
    )
    gravity_service.create(recent_gravity)
    
    session.close()
    
    # Query with reference date 24 hours from now
    reference_date = (now + timedelta(hours=12)).isoformat()
    response = app_client.get(
        f"/api/batch/{batch_id}/prediction",
        params={"date": reference_date},
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    # Should only return the recent gravity reading, not the old one
    assert len(data["gravity"]) == 1
    assert data["gravity"][0]["gravity"] == 1.045


def test_get_batch_prediction_default_current_date(app_client):
    """Test GET /api/batch/{batch_id}/prediction uses current date when not supplied"""
    test_init(app_client)
    
    # Create a batch
    session = create_session()
    batch_service = BatchService(session)
    batch_data = BatchCreate(
        name="Default Date Test Batch",
        description="Test default date parameter",
        chip_id_gravity="ABC123",
        chip_id_pressure="DEF456",
        active=True,
        tap_list=True,
        brew_date="2024-01-01",
        style="IPA",
        brewer="Brewer",
        abv=6.5,
        ebc=20,
        ibu=60,
        fg=1.010,
        og=1.080,
        brewfather_id="",
        fermentation_steps="[]",
    )
    batch = batch_service.create(batch_data)
    batch_id = batch.id
    
    # Create gravity service and add some gravity data within last 24 hours
    gravity_service = GravityService(session)
    now = datetime.now()
    
    # Add gravity reading 12 hours ago
    recent_gravity = GravityCreate(
        batch_id=batch_id,
        temperature=20.5,
        gravity=1.048,
        velocity=0.15,
        angle=45.0,
        battery=85.0,
        rssi=90.0,
        created=now - timedelta(hours=12),
        active=True,
    )
    gravity_service.create(recent_gravity)
    
    session.close()
    
    # Query prediction endpoint WITHOUT date parameter (should use current time)
    response = app_client.get(
        f"/api/batch/{batch_id}/prediction",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Default Date Test Batch"
    assert data["fg"] == 1.010
    assert data["og"] == 1.080
    assert isinstance(data["gravity"], list)
    # Should return the gravity reading from 12 hours ago
    assert len(data["gravity"]) == 1
    assert data["gravity"][0]["gravity"] == 1.048


def test_get_batch_prediction_filters_inactive_gravity(app_client):
    """Test GET /api/batch/{batch_id}/prediction filters out inactive gravity readings"""
    test_init(app_client)
    
    # Create a batch
    session = create_session()
    batch_service = BatchService(session)
    batch_data = BatchCreate(
        name="Inactive Filter Test Batch",
        description="Test filtering of inactive gravity",
        chip_id_gravity="ABC123",
        chip_id_pressure="DEF456",
        active=True,
        tap_list=True,
        brew_date="2024-01-01",
        style="IPA",
        brewer="Brewer",
        abv=6.5,
        ebc=20,
        ibu=60,
        fg=1.010,
        og=1.080,
        brewfather_id="",
        fermentation_steps="[]",
    )
    batch = batch_service.create(batch_data)
    batch_id = batch.id
    
    # Create gravity service
    gravity_service = GravityService(session)
    now = datetime.now()
    
    # Add 2 active gravity readings
    active_gravity_1 = GravityCreate(
        batch_id=batch_id,
        temperature=20.0,
        gravity=1.050,
        velocity=0.1,
        angle=45.0,
        battery=85.0,
        rssi=90.0,
        created=now - timedelta(hours=18),
        active=True,
    )
    gravity_service.create(active_gravity_1)
    
    active_gravity_2 = GravityCreate(
        batch_id=batch_id,
        temperature=20.5,
        gravity=1.045,
        velocity=0.15,
        angle=45.0,
        battery=85.0,
        rssi=90.0,
        created=now - timedelta(hours=6),
        active=True,
    )
    gravity_service.create(active_gravity_2)
    
    # Add 1 inactive gravity reading (should be filtered out)
    inactive_gravity = GravityCreate(
        batch_id=batch_id,
        temperature=19.5,
        gravity=1.055,
        velocity=0.05,
        angle=45.0,
        battery=85.0,
        rssi=90.0,
        created=now - timedelta(hours=12),
        active=False,
    )
    gravity_service.create(inactive_gravity)
    
    session.close()
    
    # Query prediction endpoint without date (uses current time)
    response = app_client.get(
        f"/api/batch/{batch_id}/prediction",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Inactive Filter Test Batch"
    # Should only return 2 active gravity readings, not the inactive one
    assert len(data["gravity"]) == 2
    
    # Verify the inactive reading (gravity=1.055) is NOT in the results
    gravity_values = [g["gravity"] for g in data["gravity"]]
    assert 1.050 in gravity_values
    assert 1.045 in gravity_values
    assert 1.055 not in gravity_values
