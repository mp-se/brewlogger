import logging
from typing import List, Optional
from fastapi import Depends
from fastapi.routing import APIRouter
from api.db import models, schemas
from api.services import BatchService, get_batch_service
from ..security import api_key_auth

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/batch")

@router.get(
    "/",
    response_model=List[schemas.Batch],
    dependencies=[Depends(api_key_auth)])
async def list_batches(
    chipId: str = "*",
    active: str = "*",
    batch_service: BatchService = Depends(get_batch_service)
) -> List[models.Batch]:
    logging.info("Using filters chipid=%s and active=%s", chipId, active)

    if chipId != "*": # ChipId + Active flas
        if active == "True" or active == "true":
            return batch_service.search_chipId_active(chipId, True)
        elif active == "False" or active == "false":
            return batch_service.search_chipId_active(chipId, False)
        return batch_service.search_chipId(chipId)
    elif active != "*": # Active flag only
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
    dependencies=[Depends(api_key_auth)])
async def get_batch_by_id(
    batch_id: int,
    batch_service: BatchService = Depends(get_batch_service)
) -> Optional[models.Batch]:
    return batch_service.get(batch_id)


@router.post(
    "/",
    response_model=schemas.Batch,
    status_code=201,
    responses={409: {"description": "Conflict Error"}},
    dependencies=[Depends(api_key_auth)])
async def create_batch(
    batch: schemas.BatchCreate,
    batch_service: BatchService = Depends(get_batch_service)
) -> models.Batch:
    return batch_service.create(batch)


@router.patch(
    "/{batch_id}",
    response_model=schemas.Batch,
    dependencies=[Depends(api_key_auth)])
async def update_batch_by_id(
    batch_id: int,
    batch: schemas.BatchUpdate,
    batch_service: BatchService = Depends(get_batch_service)
) -> Optional[models.Batch]:
    return batch_service.update(batch_id, batch)


@router.delete(
    "/{batch_id}",
    status_code=204,
    dependencies=[Depends(api_key_auth)])
async def delete_batch_by_id(
    batch_id: int,
    batch_service: BatchService = Depends(get_batch_service)):
    batch_service.delete(batch_id)

