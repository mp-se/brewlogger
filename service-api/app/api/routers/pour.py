"""Pour event API endpoints for recording and managing beer pour operations."""
import logging
from json.decoder import JSONDecodeError
from datetime import datetime
from typing import List, Optional, Union
from fastapi import Depends, Request, BackgroundTasks, Query
from fastapi.responses import Response
from fastapi.routing import APIRouter
from starlette.exceptions import HTTPException
from api.db import models, schemas
from api.services import PourService, get_pour_service, BatchService, get_batch_service
from ..security import api_key_auth
from ..ws import notify_clients

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/pour")


@router.get(
    "/", response_model=List[schemas.Pour], dependencies=[Depends(api_key_auth)]
)
async def list_pours(
    batch_id: Optional[int] = Query(None, alias="batchId"),
    pour_service: PourService = Depends(get_pour_service),
) -> List[models.Pour]:
    """List pour events, optionally filtered by batch ID."""
    logger.info("Endpoint GET /api/pour/?batch_id=%s", batch_id)
    if batch_id is not None:
        return pour_service.search_by_batch_id(batch_id)
    return pour_service.list()


@router.get(
    "/latest",
    response_model=List[schemas.PourLatest],
    dependencies=[Depends(api_key_auth)],
)
async def get_latest_pours(
    limit: int = 10,
    pour_service: PourService = Depends(get_pour_service),
) -> List[dict]:
    """Get the most recent pour events with limit."""
    logger.info("Endpoint GET /api/pour/latest?limit=%s", limit)
    return pour_service.get_latest(limit)


@router.get(
    "/{pour_id}",
    response_model=schemas.Pour,
    responses={404: {"description": "Pour not found"}},
    dependencies=[Depends(api_key_auth)],
)
async def get_pour_by_id(
    pour_id: int, pour_service: PourService = Depends(get_pour_service)
) -> Optional[models.Pour]:
    """Retrieve a specific pour event by ID."""
    logger.info("Endpoint GET /api/pour/%s", pour_id)
    return pour_service.get(pour_id)


@router.post(
    "/",
    response_model=Union[schemas.Pour, List[schemas.Pour]],
    status_code=201,
    responses={409: {"description": "Conflict Error"}},
    dependencies=[Depends(api_key_auth)],
)
async def create_pour(
    pour: Union[schemas.PourCreate, List[schemas.PourCreate]],
    background_tasks: BackgroundTasks,
    pour_service: PourService = Depends(get_pour_service),
) -> Union[models.Pour, List[models.Pour]]:
    """Create one or multiple pour events in a single request."""
    logger.info("Endpoint POST /api/pour/")

    # Handle single pour event
    if isinstance(pour, schemas.PourCreate):
        if pour.created is None:
            pour.created = datetime.now()
            logger.info("Added timestamp to pour record %s", pour.created)
        result = pour_service.create(pour)
        background_tasks.add_task(notify_clients, "batch", "update", result.batch_id)
        return result

    # Handle multiple pour events
    for p in pour:
        if p.created is None:
            p.created = datetime.now()
    result = pour_service.create_list(pour)
    background_tasks.add_task(notify_clients, "batch", "update", result[0].batch_id)
    return result


@router.patch(
    "/{pour_id}", response_model=schemas.Pour, dependencies=[Depends(api_key_auth)]
)
async def update_pour_by_id(
    pour_id: int,
    gravity: schemas.PourUpdate,
    background_tasks: BackgroundTasks,
    pour_service: PourService = Depends(get_pour_service),
) -> Optional[models.Pour]:
    """Update a specific pour event by ID."""
    logger.info("Endpoint PATCH /api/pour/%s", pour_id)
    pour = pour_service.update(pour_id, gravity)
    background_tasks.add_task(notify_clients, "batch", "update", pour.batch_id)
    return pour


@router.delete("/{pour_id}", status_code=204, dependencies=[Depends(api_key_auth)])
async def delete_pour_by_id(
    pour_id: int,
    background_tasks: BackgroundTasks,
    pour_service: PourService = Depends(get_pour_service),
):
    """Delete a pour event by ID."""
    logger.info("Endpoint DELETE /api/pour/%s", pour_id)
    pour = pour_service.get(pour_id)
    if not pour:
        raise HTTPException(status_code=404, detail="Pour not found")
    background_tasks.add_task(notify_clients, "batch", "update", pour.batch_id)
    pour_service.delete(pour_id)


@router.post("/public", response_class=Response, status_code=200)
async def create_pour_using_kegmon_format(
    request: Request,
    background_tasks: BackgroundTasks,
    pour_service: PourService = Depends(get_pour_service),
    batch_service: BatchService = Depends(get_batch_service),
) -> Response:
    """Create a pour event from Kegmon format data."""
    logger.info("Endpoint POST /api/pour/public")

    try:
        req_json = await request.json()

        logger.info("Payload: %s", req_json)

        pour_val = 0
        volume_val = 0
        max_volume_val = 0

        if "pour" in req_json and req_json["pour"] is not None:
            pour_val = req_json["pour"]

        if "volume" in req_json and req_json["volume"] is not None:
            volume_val = req_json["volume"]

        if "maxVolume" in req_json and req_json["maxVolume"] is not None:
            max_volume_val = req_json["maxVolume"]

        # Check if there is an active batch
        batch = batch_service.get(int(req_json["id"]))

        pour_list = pour_service.search_by_batch_id(batch.id)
        pour_list.sort(key=lambda x: x.created, reverse=True)

        for p in pour_list:
            logging.info("%s %s", p.created, p.volume)

        # If we get a volume update and no pour, check if the value has changed
        if len(pour_list) > 0 and pour_val == 0:
            if pour_list[0].volume == volume_val:
                logging.info(
                    "Volume recevied in pour update has not changed, ignoring data."
                )
                return None

        pour = schemas.PourCreate(
            pour=pour_val,
            volume=volume_val,
            maxVolume=max_volume_val,
            batch_id=batch.id,
            created=datetime.now(),
            active=True,
        )

        pour = pour_service.create(pour)
        background_tasks.add_task(notify_clients, "batch", "update", pour.batch_id)
        return Response(content="", status_code=200)

    except (KeyError, JSONDecodeError) as e:
        logging.error(e)
        raise HTTPException(status_code=422, detail="Unable to parse request") from e
