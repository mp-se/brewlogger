import logging
from json.decoder import JSONDecodeError
from datetime import datetime
from typing import List, Optional
from fastapi import Depends, Request
from fastapi.routing import APIRouter
from starlette.exceptions import HTTPException
from api.db import models, schemas
from api.services import PourService, get_pour_service, BatchService, get_batch_service
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
    logger.info(f"Endpoint GET /api/pour/?chipId={chipId}")
    if chipId != "*":
        return pour_service.search(chipId)
    return pour_service.list()


@router.get(
    "/{pour_id}",
    response_model=schemas.Pour,
    responses={404: {"description": "Pour not found"}},
    dependencies=[Depends(api_key_auth)],
)
async def get_pour_by_id(
    pour_id: int, pour_service: PourService = Depends(get_pour_service)
) -> Optional[models.Pour]:
    logger.info(f"Endpoint GET /api/pour/{pour_id}")
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
        logger.info(f"Added timestamp to pour record {pour.created}")
    return pour_service.create(pour)


@router.post(
    "/list/",
    response_model=List[schemas.Pour],
    status_code=201,
    responses={409: {"description": "Conflict Error"}},
    dependencies=[Depends(api_key_auth)],
)
async def create_pour_list(
    pour_list: List[schemas.PourCreate],
    pour_service: PourService = Depends(get_pour_service),
) -> List[models.Pour]:
    logger.info("Endpoint POST /api/pour/list/")
    return pour_service.createList(pour_list)


@router.patch(
    "/{pour_id}", response_model=schemas.Pour, dependencies=[Depends(api_key_auth)]
)
async def update_pour_by_id(
    pour_id: int,
    gravity: schemas.PourUpdate,
    pour_service: PourService = Depends(get_pour_service),
) -> Optional[models.Pour]:
    logger.info(f"Endpoint PATCH /api/pour/{pour_id}")
    return pour_service.update(pour_id, gravity)


@router.delete("/{pour_id}", status_code=204, dependencies=[Depends(api_key_auth)])
async def delete_pour_by_id(
    pour_id: int, pour_service: PourService = Depends(get_pour_service)
):
    logger.info(f"Endpoint DELETE /api/pour/{pour_id}")
    pour_service.delete(pour_id)


@router.post("/public", status_code=200)
async def create_pour_using_kegmon_format(
    request: Request,
    pour_service: PourService = Depends(get_pour_service),
    batch_service: BatchService = Depends(get_batch_service),
):
    logger.info("Endpoint POST /api/pour/public")

    try:
        req_json = await request.json()

        pour = 0
        volume = 0
        maxVolume = 0

        if "pour" in req_json:
            logger.info(
                "Detected pour information searching for batch for %s", req_json["id"]
            )
            pour = req_json["pour"]

        if "volume" in req_json:
            logger.info(
                "Detected volume information searching for batch for %s", req_json["id"]
            )
            volume = req_json["volume"]

        if "maxVolume" in req_json:
            logger.info(
                "Detected maxVolume information searching for batch for %s", req_json["id"]
            )
            maxVolume = req_json["maxVolume"]

        # Check if there is an active batch
        batch = batch_service.get(int(req_json["id"]))

        pour = schemas.PourCreate(
            pour=pour,
            volume=volume,
            maxVolume=maxVolume,
            batch_id=batch.id,
            created=datetime.now(),
            active=True,
        )

        return pour_service.create(pour)

    except KeyError as e:
        logging.error(e)
        raise HTTPException(status_code=422, detail="Unable to parse request")

    except JSONDecodeError as e:
        logging.error(e)
        raise HTTPException(status_code=422, detail="Unable to parse request")
