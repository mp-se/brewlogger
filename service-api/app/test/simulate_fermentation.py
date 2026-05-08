#!/usr/bin/env python3
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

"""Simulation script for fermentation control.

Seeds the database with a real Chamber-Controller device (matching device 7)
and steps through each day of the fermentation profile at 20-second intervals,
calling fermentation_controller_run() and printing new system log entries.

Run from service-api/app/:
    python -m test.simulate_fermentation
"""

import asyncio
import logging
from datetime import datetime, timedelta

from sqlalchemy import text

from api.db.session import engine, create_session
from api.db import models
from api.log import LogLevel
from api.fermentationcontrol import fermentation_controller_run

logging.basicConfig(level=logging.WARNING)

STEP_INTERVAL_SECONDS = 5

DEVICE = {
    "chip_id": "f0ada0",
    "chip_family": "esp32",
    "software": "Chamber-Controller",
    "mdns": "chamberf0ada0",
    "config": "",
    "url": "http://192.168.1.151:80/",
    "description": "Fermentation fridge 1 (simulation)",
    "ble_color": "",
    "collect_logs": False,
}

FERMENTATION_STEPS = [
    {"order": 0, "date": "2026-05-04", "temp": 19.4, "days": 2,
     "name": "", "type": "Primary", "control": "fridge"},
    {"order": 1, "date": "2026-05-06", "temp": 18.3, "days": 2,
     "name": "", "type": "Secondary", "control": "fridge"},
    {"order": 2, "date": "2026-05-08", "temp": 10.2, "days": 2,
     "name": "", "type": "Conditioning", "control": "fridge"},
]

START_DATE = datetime.strptime(FERMENTATION_STEPS[0]["date"], "%Y-%m-%d")
# One day past the last step to trigger the restore path in fermentation_controller_run
_last = FERMENTATION_STEPS[-1]
END_DATE = datetime.strptime(_last["date"], "%Y-%m-%d") + timedelta(days=_last["days"])


def seed_database() -> int:
    """Wipe existing simulation data and insert a fresh device with steps. Returns device id."""
    with engine.connect() as con:
        con.execute(text("DELETE FROM fermentationstep"))
        con.execute(text("DELETE FROM device"))
        con.execute(text("DELETE FROM systemlog"))
        con.commit()

    session = create_session()

    device = models.Device(**DEVICE)
    session.add(device)
    session.flush()

    for s in FERMENTATION_STEPS:
        session.add(models.FermentationStep(device_id=device.id, **s))

    session.commit()
    device_id = device.id
    session.remove()
    return device_id


def fetch_new_logs(since_id: int) -> list:
    """Fetch new logs."""
    session = create_session()
    logs = (
        session.query(models.SystemLog)
        .filter(models.SystemLog.id > since_id)
        .order_by(models.SystemLog.id)
        .all()
    )
    session.remove()
    return logs


def last_log_id() -> int:
    """Last log id."""
    session = create_session()
    row = session.query(models.SystemLog).order_by(models.SystemLog.id.desc()).first()
    session.remove()
    return row.id if row else 0


async def main():
    """Main."""
    print("=== Fermentation Control Simulation ===")
    print(f"Seeding database with device and {len(FERMENTATION_STEPS)} fermentation steps...")
    device_id = seed_database()
    print(f"Device inserted with id={device_id}")
    print()

    current_date = START_DATE
    total_days = (END_DATE - START_DATE).days

    while current_date <= END_DATE:
        day_number = (current_date - START_DATE).days + 1
        print(f"--- Day {day_number}/{total_days + 1}  ({current_date.strftime('%Y-%m-%d')}) ---")

        log_cursor = last_log_id()
        await fermentation_controller_run(current_date)

        new_logs = fetch_new_logs(log_cursor)
        if new_logs:
            for log in new_logs:
                level_name = LogLevel(log.log_level).name
                print(f"  [{level_name}] {log.message}")
        else:
            print("  (no log entries — no active step or no change needed)")

        current_date += timedelta(days=1)

        if current_date <= END_DATE:
            print(f"  Waiting {STEP_INTERVAL_SECONDS}s before next day...")
            await asyncio.sleep(STEP_INTERVAL_SECONDS)

    print()
    print("=== Simulation complete ===")


if __name__ == "__main__":
    asyncio.run(main())
