import logging
from datetime import datetime
from json.decoder import JSONDecodeError
from typing import List, Optional
from fastapi import Depends, Request
from fastapi.routing import APIRouter
from starlette.exceptions import HTTPException
from api.db import models, schemas
from api.services import GravityService, get_gravity_service, BatchService, get_batch_service, DeviceService, get_device_service
from ..security import api_key_auth

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/gravity")

@router.get(
    "/",
    response_model=List[schemas.Gravity],
    dependencies=[Depends(api_key_auth)])
async def list_gravities(
    chipId: str = "*",
    gravity_service: GravityService = Depends(get_gravity_service),
) -> List[models.Gravity]:
    logger.info("Endpoint GET /api/gravity/?chipId=%s", chipId)
    if chipId != "*":
        return gravity_service.search(chipId)

    return gravity_service.list()


@router.get(
    "/{gravity_id}",
    response_model=schemas.Gravity,
    responses={404: {"description": "Gravity not found"}},
    dependencies=[Depends(api_key_auth)])
async def get_gravity_by_id(
    gravity_id: int,
    gravity_service: GravityService = Depends(get_gravity_service)
) -> Optional[models.Gravity]:
    logger.info("Endpoint GET /api/gravity/%d", gravity_id)
    return gravity_service.get(gravity_id)


@router.post(
    "/",
    response_model=schemas.Gravity,
    status_code=201,
    responses={409: {"description": "Conflict Error"}},
    dependencies=[Depends(api_key_auth)])
async def create_gravity(
    gravity: schemas.GravityCreate,
    gravity_service: GravityService = Depends(get_gravity_service)
) -> models.Gravity:
    logger.info("Endpoint POST /api/gravity/")
    if gravity.created is None:
        gravity.created = datetime.now()
        logger.info("Added timestamp to gravity record %s", gravity.created)
    return gravity_service.create(gravity)

@router.post(
    "/list/",
    response_model=List[schemas.Gravity],
    status_code=201,
    responses={409: {"description": "Conflict Error"}},
    dependencies=[Depends(api_key_auth)])
async def create_gravity_list(
    gravity_list: List[schemas.GravityCreate],
    gravity_service: GravityService = Depends(get_gravity_service)
) -> List[models.Gravity]:
    logger.info("Endpoint GET /api/gravity/list/")
    return gravity_service.createList(gravity_list)

@router.patch(
    "/{gravity_id}",
    response_model=schemas.Gravity,
    dependencies=[Depends(api_key_auth)])
async def update_gravity_by_id(
    gravity_id: int,
    gravity: schemas.GravityUpdate,
    gravity_service: GravityService = Depends(get_gravity_service),
) -> Optional[models.Gravity]:
    logger.info("Endpoint PATCH /api/gravity/%d", gravity_id)
    return gravity_service.update(gravity_id, gravity)


@router.delete(
    "/{gravity_id}",
    status_code=204,
    dependencies=[Depends(api_key_auth)])
async def delete_gravity_by_id(
    gravity_id: int,
    gravity_service: GravityService = Depends(get_gravity_service)
):
    logger.info("Endpoint DELETE /api/gravity/%d", gravity_id)
    gravity_service.delete(gravity_id)


@router.post(
    "/public",
    status_code=200)
async def create_gravity_using_ispindel_format(
    request: Request,
    gravity_service: GravityService = Depends(get_gravity_service),
    batch_service: BatchService = Depends(get_batch_service),
    device_service: DeviceService = Depends(get_device_service)
):
    logger.info("Endpoint POST /api/gravity/public")

    try:
        json = await request.json()

        # This means the post is in TILT format so we need to look up the correct device and add the missing data.
        if "color" in json:
            logger.info("Detected tilt post, searching for device id for %s", json["color"])

            deviceList = device_service.search_ble_color(json["color"])         
            if len(deviceList) == 0:
                raise HTTPException(status_code=404, detail="Device with color not found")

            json["ID"] = deviceList[0].chip_id
            json["temp_units"] = 'F'
            json["angle"] = 0
            json["battery"] = 0

        # Extensions from Gravitymon
        corr_gravity = 0
        gravity_units = "SG"
        run_time = 0

        if "corr-gravity" in json:
            corr_gravity = json["corr-gravity"]
        if "gravity-unit" in json:
            gravity_units = json["gravity-unit"]
        if "run-time" in json:
            run_time = json["run-time"]

        # Check if there is an active batch
        batchList = batch_service.search_chipId_active(json["ID"], True)

        if len(batchList) == 0:
            batch = schemas.BatchCreate(
                name = "Batch for " + json["ID"],
                chipId = json["ID"],
                description = "Automatically created",
                brewDate = datetime.today().strftime("%Y-%m-%d"),
                style = "",
                brewer = "",
                brewfatherId = "",
                active = True,
                abv = 0.0,
                ebc = 0.0,
                ibu = 0.0
            )
            batch_service.create(batch)
            batchList = batch_service.search_chipId_active(json["ID"], True)

        if len(batchList) == 0:
            raise HTTPException(status_code=409, detail="No batch found")

        # Check if there is an device
        deviceList = device_service.search_chipId(json["ID"])

        if len(deviceList) == 0:
            device = schemas.DeviceCreate(
                chipId = json["ID"],
                chipFamily = "",
                software = "",
                mdns = "",
                config = "",
                bleColor = "",
                url = "http://",
            )
            device_service.create(device)

        gravity = schemas.GravityCreate(
            temperature = json["temperature"],
            gravity = json["gravity"],
            angle = json["angle"],
            battery = json["battery"],
            rssi = json["RSSI"],
            corr_gravity = corr_gravity,
            run_time = run_time,
            batch_id = batchList[0].id,
            created = datetime.now()
        )

        if json["temp_units"] == 'F':
            gravity.temperature = (gravity.temperature-32) * 5 / 9 # °C = (°F − 32) x 5/9

        if gravity_units == 'P':
            gravity.gravity = 1 + (gravity.gravity / (258.6 - ((gravity.gravity/258.2) * 227.1))) # SG = 1+ (plato / (258.6 – ((plato/258.2) *227.1)))

        return gravity_service.create(gravity)

    except JSONDecodeError:
        raise HTTPException(status_code=409, detail="Unable to parse request")
