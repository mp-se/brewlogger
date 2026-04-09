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

"""Batch management API endpoints for creating, updating, and managing brewing batches."""
import logging
from typing import List, Optional
from fastapi import Depends, BackgroundTasks, Query
from fastapi.routing import APIRouter
from starlette.exceptions import HTTPException
from api.db import models, schemas
from api.services import BatchService, get_batch_service
from ..security import api_key_auth
from ..ws import notify_clients
from ..log import system_log, LogLevel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/batch")


@router.get(
    "/",
    response_model=List[schemas.BatchList],
    dependencies=[Depends(api_key_auth)],
)
async def list_batches(
    chip_id: Optional[str] = Query(None, alias="chipId"),
    active: Optional[bool] = Query(None),
    batch_service: BatchService = Depends(get_batch_service),
) -> List[schemas.BatchList]:
    """List all batches with optional filtering by chip ID and active status."""
    logger.info("Endpoint GET /api/batch/?chip_id=%s&active=%s", chip_id, active)

    batches = batch_service.list_filtered(chip_id=chip_id, active=active)

    # Enrich batches with counts and last pour data
    for batch in batches:
        batch.gravity_count = len(batch.gravity) if batch.gravity else 0
        batch.pressure_count = len(batch.pressure) if batch.pressure else 0
        batch.pour_count = len(batch.pour) if batch.pour else 0

        last_pour_volume = None
        last_pour_max_volume = None
        if batch.pour:
            active_pours = [p for p in batch.pour if p.active]
            if active_pours:
                active_pours.sort(key=lambda x: x.created, reverse=True)
                last_pour_volume = active_pours[0].volume
                last_pour_max_volume = active_pours[0].max_volume

        batch.last_pour_volume = last_pour_volume
        batch.last_pour_max_volume = last_pour_max_volume

    return batches


@router.get(
    "/taplist",
    response_model=List[schemas.TapListBatch],
)
async def get_tap_list(
    batch_service: BatchService = Depends(get_batch_service),
) -> List[models.Batch]:
    """Get list of batches configured for tap list display."""
    logger.info("Endpoint GET /api/batch/taplist")
    tap_list = []
    for b in batch_service.search_tap_list():
        tap = schemas.TapListBatch(
            name=b.name,
            brewDate=b.brew_date,
            style=b.style,
            abv=b.abv,
            ebc=b.ebc,
            ibu=b.ibu,
            id=b.id,
            brewfatherId=b.brewfather_id,
        )
        tap_list.append(tap)
    return tap_list


@router.get(
    "/{batch_id}",
    response_model=schemas.Batch,
    responses={404: {"description": "Batch not found"}},
    dependencies=[Depends(api_key_auth)],
)
async def get_batch_by_id(
    batch_id: int, batch_service: BatchService = Depends(get_batch_service)
) -> Optional[models.Batch]:
    """Retrieve a specific batch by ID."""
    logger.info("Endpoint GET /api/batch/%d", batch_id)
    batch = batch_service.get(batch_id)
    if batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch


@router.get(
    "/{batch_id}/dashboard",
    response_model=schemas.BatchDashboard,
    responses={404: {"description": "Batch not found"}},
    dependencies=[Depends(api_key_auth)],
)
async def get_batch_dashboard_by_id(
    batch_id: int, batch_service: BatchService = Depends(get_batch_service)
) -> Optional[models.Batch]:
    """Get dashboard view for a specific batch."""
    logger.info("Endpoint GET /api/batch/%d/dashboard", batch_id)

    b = batch_service.get(batch_id)
    if b is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    if b.active:
        dash = schemas.BatchDashboard(
            id=b.id,
            name=b.name,
            chip_id_gravity=b.chip_id_gravity,
            chip_id_pressure=b.chip_id_pressure,
            active=b.active,
            prediction_hours_left=b.prediction_hours_left,
            prediction_at_timestamp=b.prediction_at_timestamp,
        )

        # Add gravity
        dash.gravity = []

        b.gravity = list(filter(lambda x: x.active, b.gravity))
        b.gravity.sort(key=lambda x: x.created, reverse=False)

        # Just return the first and last reading
        if len(b.gravity) > 1:
            dash.gravity.append(b.gravity[0])
        if len(b.gravity) > 2:
            dash.gravity.append(b.gravity[len(b.gravity) - 1])

        # Add pressure
        dash.pressure = []

        b.pressure = list(filter(lambda x: x.active, b.pressure))
        b.pressure.sort(key=lambda x: x.created, reverse=False)

        # Just return the first and last reading
        if len(b.pressure) > 1:
            dash.pressure.append(b.pressure[0])
        if len(b.pressure) > 2:
            dash.pressure.append(b.pressure[len(b.pressure) - 1])

        # Add pour
        dash.pour = []

        b.pour = list(filter(lambda x: x.active, b.pour))
        b.pour.sort(key=lambda x: x.created, reverse=False)

        # Just return the first and last reading
        if len(b.pour) > 1:
            dash.pour.append(b.pour[0])
        if len(b.pour) > 2:
            dash.pour.append(b.pour[len(b.pour) - 1])

        return dash

    raise HTTPException(status_code=404, detail="Batch not found or not active batch.")


@router.post(
    "/",
    response_model=schemas.Batch,
    status_code=201,
    responses={409: {"description": "Conflict Error"}},
    dependencies=[Depends(api_key_auth)],
)
async def create_batch(
    batch: schemas.BatchCreate,
    background_tasks: BackgroundTasks,
    batch_service: BatchService = Depends(get_batch_service),
) -> models.Batch:
    """Create a new batch."""
    logger.info("Endpoint POST /api/batch/")
    batch = batch_service.create(batch)
    system_log("batch", f"Batch created: {batch.name}", error_code=0, log_level=LogLevel.INFO)
    background_tasks.add_task(notify_clients, "batch", "create", batch.id)
    return batch


@router.patch(
    "/{batch_id}", response_model=schemas.Batch, dependencies=[Depends(api_key_auth)]
)
async def update_batch_by_id(
    batch_id: int,
    batch: schemas.BatchUpdate,
    background_tasks: BackgroundTasks,
    batch_service: BatchService = Depends(get_batch_service),
) -> Optional[models.Batch]:
    """Update a batch by ID."""
    logger.info("Endpoint PATCH /api/batch/%d", batch_id)
    updated_batch = batch_service.update(batch_id, batch)
    if updated_batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    system_log("batch", f"Batch {updated_batch.name} updated", error_code=0, log_level=LogLevel.INFO)
    background_tasks.add_task(notify_clients, "batch", "update", batch_id)
    return updated_batch


@router.delete("/{batch_id}", status_code=204, dependencies=[Depends(api_key_auth)])
async def delete_batch_by_id(
    batch_id: int,
    background_tasks: BackgroundTasks,
    batch_service: BatchService = Depends(get_batch_service),
):
    """Delete a batch by ID."""
    logger.info("Endpoint DELETE /api/batch/%d", batch_id)
    batch = batch_service.get(batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    system_log("batch", f"Batch {batch.name} deleted", error_code=0, log_level=LogLevel.INFO)
    batch_service.delete(batch_id)
    background_tasks.add_task(notify_clients, "batch", "delete", batch_id)

