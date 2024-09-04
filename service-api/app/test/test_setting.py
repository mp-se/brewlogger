from api.config import get_settings

headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}


def test_read(app_client):
    pass


def test_write(app_client):
    pass
