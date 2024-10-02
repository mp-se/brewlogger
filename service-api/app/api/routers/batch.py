import logging
from typing import List, Optional
from fastapi import Depends, BackgroundTasks
from fastapi.routing import APIRouter
from starlette.exceptions import HTTPException
from api.db import models, schemas
from api.services import BatchService, get_batch_service
from ..security import api_key_auth
from ..ws import notifyClients

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/batch")


@router.get(
    "/", response_model=List[schemas.Batch], dependencies=[Depends(api_key_auth)]
)
async def list_batches(
    chipId: str = "*",
    active: str = "*",
    batch_service: BatchService = Depends(get_batch_service),
) -> List[models.Batch]:
    logger.info(f"Endpoint GET /api/batch/?chipId={chipId}&active={active}")
    if chipId != "*":  # ChipId + Active flas
        if active == "True" or active == "true":
            return batch_service.search_chipId_active(chipId, True)
        elif active == "False" or active == "false":
            return batch_service.search_chipId_active(chipId, False)
        return batch_service.search_chipId(chipId)
    elif active != "*":  # Active flag only
        if active == "True" or active == "true":
            return batch_service.search_active(True)
        elif active == "False" or active == "false":
            return batch_service.search_active(False)
    # return all records
    return batch_service.list()


@router.get(
    "/{batch_id}",
    response_model=schemas.Batch,
    responses={404: {"description": "Batch not found"}},
    dependencies=[Depends(api_key_auth)],
)
async def get_batch_by_id(
    batch_id: int, batch_service: BatchService = Depends(get_batch_service)
) -> Optional[models.Batch]:
    logger.info("Endpoint GET /api/batch/%d", batch_id)
    return batch_service.get(batch_id)


@router.get(
    "/{batch_id}/dashboard",
    response_model=schemas.BatchDashboard,
    responses={404: {"description": "Batch not found"}},
    dependencies=[Depends(api_key_auth)],
)
async def get_batch_dashboard_by_id(
    batch_id: int, 
    batch_service: BatchService = Depends(get_batch_service)
) -> Optional[models.Batch]:
    logger.info("Endpoint GET /api/batch/%d/dashboard", batch_id)

    b = batch_service.get(batch_id)
    if b.active:
        dash = schemas.BatchDashboard(
            id=b.id, name=b.name, chip_id=b.chip_id, active=b.active
        )
        dash.gravity = []

        b.gravity = list(filter(lambda x: x.active, b.gravity))
        b.gravity.sort(key=lambda x: x.created, reverse=False)

        # Just return the first and last reading
        if len(b.gravity) > 1:
            dash.gravity.append(b.gravity[0])
        if len(b.gravity) > 2:
            dash.gravity.append(b.gravity[len(b.gravity) - 1])
        return dash

    raise HTTPException(status_code=404, detail="Batch not found or not active batch.")
    return None


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
    batch_service: BatchService = Depends(get_batch_service)
) -> models.Batch:
    logger.info("Endpoint POST /api/batch/")
    batch = batch_service.create(batch)
    background_tasks.add_task(notifyClients, "batch", "create", batch.id)
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
    logger.info("Endpoint PATCH /api/batch/%d", batch_id)
    background_tasks.add_task(notifyClients, "batch", "update", batch_id)
    return batch_service.update(batch_id, batch)


@router.delete("/{batch_id}", status_code=204, dependencies=[Depends(api_key_auth)])
async def delete_batch_by_id(
    batch_id: int, 
    background_tasks: BackgroundTasks,
    batch_service: BatchService = Depends(get_batch_service)
):
    logger.info("Endpoint DELETE /api/batch/%d", batch_id)
    batch_service.delete(batch_id)
    background_tasks.add_task(notifyClients, "batch", "delete", batch_id)
