from fastapi.testclient import TestClient
import pytest
from api.app import create_app

@pytest.fixture()
def app_client():
    app = create_app()
    yield TestClient(app)
