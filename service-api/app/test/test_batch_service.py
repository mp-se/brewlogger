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


import json
from datetime import datetime, timedelta
from api.db import models
from api.services.batch import BatchService
from api.services.gravity import GravityService
from .conftest import truncate_database, create_session

headers = {
    "Authorization": "Bearer test_key",
    "Content-Type": "application/json",
}

def test_batch_prediction_logic(app_client):
    """Test the core prediction logic in BatchService.update_prediction."""
    truncate_database()
    session = create_session()
    batch_service = BatchService(session)
    gravity_service = GravityService(session)

    # 1. Create a batch
    batch = models.Batch(
        name="Prediction Test",
        chip_id_gravity="PRED01",
        chip_id_pressure="",
        active=True,
        tap_list=False,
        brew_date="2024-01-01",
        style="IPA",
        brewer="Tester",
        abv=5.0,
        ebc=20.0,
        ibu=40.0,
        og=1.060,
        fg=1.010,
        brewfather_id="",
        fermentation_steps="[]",
        description="Testing prediction logic",
    )
    session.add(batch)
    session.commit()
    batch_id = batch.id

    # 2. Add some gravity points over the last 24h
    now = datetime.now()
    points = []
    # Point 24h ago
    p1 = models.Gravity(
        batch_id=batch_id,
        gravity=1.055,
        temperature=20.0,
        angle=45.0,
        battery=4.0,
        rssi=-60,
        active=True,
        created=now - timedelta(hours=24)
    )
    # Point 6h ago (for velocity_6h)
    p2 = models.Gravity(
        batch_id=batch_id,
        gravity=1.030,
        temperature=21.0,
        angle=40.0,
        battery=4.0,
        rssi=-60,
        active=True,
        created=now - timedelta(hours=6)
    )
    # Point now
    p3 = models.Gravity(
        batch_id=batch_id,
        gravity=1.020,
        temperature=22.0,
        angle=35.0,
        battery=4.0,
        rssi=-60,
        active=True,
        created=now
    )
    session.add_all([p1, p2, p3])
    session.commit()

    # 3. Trigger prediction
    batch_service.update_prediction(batch_id)

    # 4. Verify prediction was updated
    session.refresh(batch)
    assert batch.prediction_hours_left > 0
    assert batch.prediction_at_timestamp is not None
    assert isinstance(batch.prediction_at_timestamp, datetime)

    session.close()

def test_batch_prediction_not_enough_data(app_client):
    """Test prediction skips when not enough data is available."""
    truncate_database()
    session = create_session()
    batch_service = BatchService(session)

    batch = models.Batch(
        name="Low Data Test",
        chip_id_gravity="LOW001",
        chip_id_pressure="",
        description="test",
        active=True,
        tap_list=False,
        brew_date="2024-01-01",
        style="IPA",
        brewer="test",
        og=1.060,
        fg=1.010,
        brewfather_id="",
        fermentation_steps="[]",
    )
    session.add(batch)
    session.commit()
    batch_id = batch.id

    # Only one point
    p1 = models.Gravity(
        batch_id=batch_id,
        gravity=1.050,
        temperature=20.0,
        angle=45.0,
        battery=4.0,
        rssi=-60,
        active=True,
        created=datetime.now()
    )
    session.add(p1)
    session.commit()

    batch_service.update_prediction(batch_id)
    session.refresh(batch)
    assert batch.prediction_hours_left == 0.0
    assert batch.prediction_at_timestamp is None
    session.close()

def test_batch_service_search_functions(app_client):
    """Test various search functions in BatchService to increase coverage."""
    truncate_database()
    session = create_session()
    batch_service = BatchService(session)

    # Create multiple batches with different properties
    b1 = models.Batch(name="Active 1", chip_id_gravity="GRAV01", chip_id_pressure="", active=True, tap_list=True, brew_date="D1", style="S1", brewer="B1", brewfather_id="BF1", description="D1", fermentation_steps="[]")
    b2 = models.Batch(name="Active 2", chip_id_gravity="GRAV02", chip_id_pressure="", active=True, tap_list=False, brew_date="D2", style="S2", brewer="B2", brewfather_id="BF2", description="D2", fermentation_steps="[]")
    b3 = models.Batch(name="Inactive", chip_id_gravity="GRAV01", chip_id_pressure="", active=False, tap_list=True, brew_date="D3", style="S3", brewer="B3", brewfather_id="BF3", description="D3", fermentation_steps="[]")
    
    session.add_all([b1, b2, b3])
    session.commit()

    # Test search_chip_id
    res = batch_service.search_chip_id("GRAV01")
    assert len(res) == 2
    
    # Test search_tap_list
    res = batch_service.search_tap_list()
    assert len(res) == 2
    
    # Test search_active
    res = batch_service.search_active(True)
    assert len(res) == 2
    res = batch_service.search_active(False)
    assert len(res) == 1

    # Test search_chip_id_active
    res = batch_service.search_chip_id_active("GRAV01", True)
    assert len(res) == 1
    assert res[0].name == "Active 1"

    # Test list_filtered with different combinations
    # Both chip_id and active
    res = batch_service.list_filtered(chip_id="GRAV01", active=True)
    assert len(res) == 1
    # Only chip_id
    res = batch_service.list_filtered(chip_id="GRAV01")
    assert len(res) == 2
    # Only active
    res = batch_service.list_filtered(active=False)
    assert len(res) == 1
    # None
    res = batch_service.list_filtered()
    assert len(res) == 3

    # Test search_brewfather_id
    res = batch_service.search_brewfather_id("BF1")
    assert len(res) == 1
    assert res[0].name == "Active 1"

    session.close()
