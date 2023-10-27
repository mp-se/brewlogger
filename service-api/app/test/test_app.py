def test_health(app_client):
    r = app_client.get("/health")
    assert r.status_code == 200
