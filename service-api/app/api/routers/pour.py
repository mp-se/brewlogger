import logging
from datetime import datetime
from typing import List, Optional
from fastapi import Depends
from fastapi.routing import APIRouter
from api.db import models, schemas
from api.services import PourService, get_pour_service
from ..security import api_key_auth

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/pour")


@router.get(
    "/", response_model=List[schemas.Pour], dependencies=[Depends(api_key_auth)]
)
async def list_pours(
    chipId: str = "*",
    pour_service: PourService = Depends(get_pour_service),
) -> List[models.Pour]:
    logger.info("Endpoint GET /api/pour/?chipId=%s", chipId)
    if chipId != "*":
        return pour_service.search(chipId)
    return pour_service.list()


@router.get(
    "/{pour_id}",
    response_model=schemas.Pour,
    responses={404: {"description": "Gravity not found"}},
    dependencies=[Depends(api_key_auth)],
)
async def get_pour_by_id(
    pour_id: int, pour_service: PourService = Depends(get_pour_service)
) -> Optional[models.Pour]:
    logger.info("Endpoint GET /api/pour/%d", pour_id)
    return pour_service.get(pour_id)


@router.post(
    "/",
    response_model=schemas.Pour,
    status_code=201,
    responses={409: {"description": "Conflict Error"}},
    dependencies=[Depends(api_key_auth)],
)
async def create_pour(
    pour: schemas.PourCreate, pour_service: PourService = Depends(get_pour_service)
) -> models.Pour:
    logger.info("Endpoint POST /api/pour/")
    if pour.created is None:
        pour.created = datetime.now()
        logger.info("Added timestamp to pour record %s", pour.created)
    return pour_service.create(pour)


@router.patch(
    "/{pour_id}", response_model=schemas.Pour, dependencies=[Depends(api_key_auth)]
)
async def update_pour_by_id(
    pour_id: int,
    gravity: schemas.PourUpdate,
    pour_service: PourService = Depends(get_pour_service),
) -> Optional[models.Pour]:
    logger.info("Endpoint PATCH /api/pour/%d", pour_id)
    return pour_service.update(pour_id, gravity)


@router.delete("/{pour_id}", status_code=204, dependencies=[Depends(api_key_auth)])
async def delete_pour_by_id(
    pour_id: int, pour_service: PourService = Depends(get_pour_service)
):
    logger.info("Endpoint DELETE /api/pour/%d", pour_id)
    pour_service.delete(pour_id)
