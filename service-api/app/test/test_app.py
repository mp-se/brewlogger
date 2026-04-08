# SPDX-License-Identifier: GPL-3.0-or-later
# Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger

def test_health(app_client):
    r = app_client.get("/health")
    assert r.status_code == 200
