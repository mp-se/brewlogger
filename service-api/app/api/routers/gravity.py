import logging
import json
from datetime import datetime
from json.decoder import JSONDecodeError
from typing import List, Optional
from fastapi import Depends, Request
from fastapi.routing import APIRouter
from starlette.exceptions import HTTPException
from api.db import models, schemas
from api.services import (
    GravityService,
    get_gravity_service,
    BatchService,
    get_batch_service,
    DeviceService,
    get_device_service,
)
from ..security import api_key_auth
from ..cache import existKey, readKey, writeKey
from ..poly import create_formula

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/gravity")


@router.get(
    "/", response_model=List[schemas.Gravity], dependencies=[Depends(api_key_auth)]
)
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
    dependencies=[Depends(api_key_auth)],
)
async def get_gravity_by_id(
    gravity_id: int, gravity_service: GravityService = Depends(get_gravity_service)
) -> Optional[models.Gravity]:
    logger.info("Endpoint GET /api/gravity/%d", gravity_id)
    return gravity_service.get(gravity_id)


@router.post(
    "/",
    response_model=schemas.Gravity,
    status_code=201,
    responses={409: {"description": "Conflict Error"}},
    dependencies=[Depends(api_key_auth)],
)
async def create_gravity(
    gravity: schemas.GravityCreate,
    gravity_service: GravityService = Depends(get_gravity_service),
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
    dependencies=[Depends(api_key_auth)],
)
async def create_gravity_list(
    gravity_list: List[schemas.GravityCreate],
    gravity_service: GravityService = Depends(get_gravity_service),
) -> List[models.Gravity]:
    logger.info("Endpoint GET /api/gravity/list/")
    return gravity_service.createList(gravity_list)


@router.patch(
    "/{gravity_id}",
    response_model=schemas.Gravity,
    dependencies=[Depends(api_key_auth)],
)
async def update_gravity_by_id(
    gravity_id: int,
    gravity: schemas.GravityUpdate,
    gravity_service: GravityService = Depends(get_gravity_service),
) -> Optional[models.Gravity]:
    logger.info("Endpoint PATCH /api/gravity/%d", gravity_id)
    return gravity_service.update(gravity_id, gravity)


@router.delete("/{gravity_id}", status_code=204, dependencies=[Depends(api_key_auth)])
async def delete_gravity_by_id(
    gravity_id: int, gravity_service: GravityService = Depends(get_gravity_service)
):
    logger.info("Endpoint DELETE /api/gravity/%d", gravity_id)
    gravity_service.delete(gravity_id)


@router.post("/public", status_code=200)
async def create_gravity_using_ispindel_format(
    request: Request,
    gravity_service: GravityService = Depends(get_gravity_service),
    batch_service: BatchService = Depends(get_batch_service),
    device_service: DeviceService = Depends(get_device_service),
):
    logger.info("Endpoint POST /api/gravity/public")

    try:
        req_json = await request.json()

        # This means the post is in TILT format so we need to look up the correct device and add the missing data.
        if "color" in req_json:
            logger.info(
                "Detected tilt post, searching for device id for %s", req_json["color"]
            )

            deviceList = device_service.search_ble_color(req_json["color"])
            if len(deviceList) == 0:
                raise HTTPException(
                    status_code=404, detail="Device with color not found"
                )

            req_json["ID"] = deviceList[0].chip_id
            req_json["temp_units"] = "F"
            req_json["angle"] = 0
            req_json["battery"] = 0

        # Extensions from Gravitymon
        corr_gravity = 0
        gravity_units = "SG"
        run_time = 0

        if "corr-gravity" in req_json:
            corr_gravity = req_json["corr-gravity"]
        if "gravity-unit" in req_json:
            gravity_units = req_json["gravity-unit"]
        if "run-time" in req_json:
            run_time = req_json["run-time"]

        # Check if there is an active batch
        batchList = batch_service.search_chipId_active(req_json["ID"], True)

        if len(batchList) == 0:
            batch = schemas.BatchCreate(
                name="Batch for " + req_json["ID"],
                chipId=req_json["ID"],
                description="Automatically created",
                brewDate=datetime.today().strftime("%Y-%m-%d"),
                style="",
                brewer="",
                brewfatherId="",
                active=True,
                abv=0.0,
                ebc=0.0,
                ibu=0.0,
                # fermentation_chamber=None, # This is optional and should be assigned in UI
                # fermentation_steps=None, # This is optional and should be assigned in UI
            )
            batch_service.create(batch)
            batchList = batch_service.search_chipId_active(req_json["ID"], True)

        if len(batchList) == 0:
            raise HTTPException(status_code=409, detail="No batch found")

        # Check if there is an device
        deviceList = device_service.search_chipId(req_json["ID"])

        if len(deviceList) == 0:
            device = schemas.DeviceCreate(
                chipId=req_json["ID"],
                chipFamily="",
                software="",
                mdns="",
                config="",
                bleColor="",
                url="",
                description="",
                gravityFormula="",
                gravityPoly="",
                fermentation_steps="",
            )
            device_service.create(device)

        chamberId = batchList[0].fermentation_chamber

        logger.info(
            f"Saving gravity request for batch {batchList[0].id}",
        )

        gravity = schemas.GravityCreate(
            temperature=req_json["temperature"],
            gravity=req_json["gravity"],
            angle=req_json["angle"],
            battery=req_json["battery"],                
            rssi=req_json["RSSI"],
            corr_gravity=corr_gravity,
            run_time=run_time,
            batch_id=batchList[0].id,
            created=datetime.now(),
            active=True,
        )

        # If there is a tagged brewpi device lets use the value from that
        if chamberId is not None and chamberId > 1:
            key = "brewpi_" + str(chamberId) + "_beer_temp"
            if existKey(key):
                beerTemp = readKey(key)
                gravity.beer_temperature = float(beerTemp)
            key = "brewpi_" + str(chamberId) + "_fridge_temp"
            if existKey(key):
                chamberTemp = readKey(key)
                gravity.chamber_temperature = float(chamberTemp)

        if req_json["temp_units"] == "F":
            gravity.temperature = (
                (gravity.temperature - 32) * 5 / 9
            )  # °C = (°F − 32) x 5/9

        if gravity_units == "P":
            gravity.gravity = 1 + (
                gravity.gravity / (258.6 - ((gravity.gravity / 258.2) * 227.1))
            )  # SG = 1+ (plato / (258.6 – ((plato/258.2) *227.1)))

        g = gravity_service.create(gravity)

        # Save the record in redis for background job to forward
        if len(deviceList) > 0:
            key = "gravity_" + deviceList[0].chip_id
            writeKey(key, json.dumps(req_json), ttl=None)

        return g

    except KeyError as e:
        logging.error(e)
        raise HTTPException(status_code=422, detail="Unable to parse request")

    except JSONDecodeError as e:
        logging.error(e)
        raise HTTPException(status_code=422, detail="Unable to parse request")

@router.post(
    "/calculate/",
    response_model=schemas.Formula,
    status_code=200,
    dependencies=[Depends(api_key_auth)],
)
async def create_gravity_formula(
    point_list: List[schemas.FormulaPoint],
):
    logger.info("Endpoint GET /api/gravity/calculate/")

    if(len(point_list)<2):
        raise HTTPException(status_code=400, detail="Too few values to calculate formula")

    poly1 = create_formula(1, point_list)
    poly2 = create_formula(2, point_list)
    poly3 = create_formula(3, point_list)
    poly4 = create_formula(4, point_list)
    return schemas.Formula(poly1=poly1, poly2=poly2, poly3=poly3, poly4=poly4)
