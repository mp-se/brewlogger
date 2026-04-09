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

import os
import pytest
import httpx
import json
from pathlib import Path

@pytest.fixture(scope="session")
def api_base_url():
    # Use localhost:8000 as defined in docker-compose.yaml
    return os.getenv("INTEGRATION_API_URL", "http://localhost:8000")

@pytest.fixture(scope="session")
def api_key():
    # Matches the key in docker-compose.yaml
    return "akljnv13bvi2vfo0b0bw789jlljsdf"

@pytest.fixture(scope="session")
def test_data_path():
    # Path to the data file in the workspace
    return Path("/Users/dev/brewlogger/service-api/app/test/resources/helles_batch_34.json")

@pytest.fixture
def client(api_base_url, api_key):
    # API_KEY_ENABLED=0 is set in compose, so we might not need it, 
    # but we'll include the header just in case it's toggled.
    headers = {"X-API-KEY": api_key}
    with httpx.Client(base_url=api_base_url, headers=headers, timeout=10.0) as client:
        yield client

@pytest.fixture(autouse=True)
def cleanup_after_test(client):
    """Cleanup newly created tests to avoid cluttering local DB."""
    # This is a placeholder since we'll detect created ID during test run
    created_batch_ids = []
    yield created_batch_ids
    
    for b_id in created_batch_ids:
        try:
            # We assume a delete endpoint exists or we skip cleanup if it doesn't
            client.delete(f"/api/batch/{b_id}")
        except Exception:
            pass
