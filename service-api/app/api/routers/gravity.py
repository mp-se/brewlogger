"""Gravity sensor API endpoints for managing fermentation gravity readings and device data."""
import logging
import json
from datetime import datetime
from json.decoder import JSONDecodeError
from typing import List, Optional, Union
from fastapi import Depends, Request, BackgroundTasks, Query
from fastapi.routing import APIRouter
from fastapi.responses import Response
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
from ..cache import exist_key, read_key, write_key
from ..ws import notify_clients

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/gravity")


@router.get(
    "/", response_model=List[schemas.Gravity], dependencies=[Depends(api_key_auth)]
)
async def list_gravities(
    batch_id: Optional[int] = Query(None, alias="batchId"),
    gravity_service: GravityService = Depends(get_gravity_service),
) -> List[models.Gravity]:
    """List gravity readings, optionally filtered by batch ID."""
    logger.info("Endpoint GET /api/gravity/?batch_id=%s", batch_id)
    if batch_id is not None:
        return gravity_service.search_by_batch_id(batch_id)

    return gravity_service.list()


@router.get(
    "/latest",
    response_model=List[schemas.GravityLatest],
    dependencies=[Depends(api_key_auth)],
)
async def get_latest_gravities(
    limit: int = 10,
    gravity_service: GravityService = Depends(get_gravity_service),
) -> List[dict]:
    """Get the most recent gravity readings with limit."""
    logger.info("Endpoint GET /api/gravity/latest?limit=%s", limit)
    return gravity_service.get_latest(limit)


@router.post("/public", status_code=200, response_class=Response)
async def create_gravity_using_ispindel_format(  # pylint: disable=too-many-locals,too-many-branches,too-many-statements,duplicate-code
    request: Request,
    background_tasks: BackgroundTasks,
    gravity_service: GravityService = Depends(get_gravity_service),
    batch_service: BatchService = Depends(get_batch_service),
    device_service: DeviceService = Depends(get_device_service),
):
    """Create gravity reading from iSpindel or Tilt format data."""
    logger.info("Endpoint POST /api/gravity/public")

    try:
        req_json = await request.json()

        logger.info("Payload: %s", req_json)

        # Post is in TILT format, look up the correct device and add missing data.
        if "color" in req_json:
            logger.info(
                "Detected tilt post, searching for device id for %s", req_json["color"]
            )

            device_list = device_service.search_ble_color(req_json["color"])
            if len(device_list) == 0:
                raise HTTPException(
                    status_code=404, detail="Device with color not found"
                )

            req_json["ID"] = device_list[0].chip_id
            req_json["temp_units"] = "F"
            req_json["angle"] = 0
            req_json["battery"] = 0

        # Extensions from Gravitymon - use None when not provided to support nullable fields
        corr_gravity = None
        gravity_units = "SG"
        run_time = None
        velocity = None

        if "corr-gravity" in req_json and req_json["corr-gravity"] is not None:
            corr_gravity = req_json["corr-gravity"]
        if "gravity-unit" in req_json and req_json["gravity-unit"] is not None:
            gravity_units = req_json["gravity-unit"]
        if "run-time" in req_json and req_json["run-time"] is not None:
            run_time = req_json["run-time"]
        if "velocity" in req_json and req_json["velocity"] is not None:
            velocity = req_json["velocity"]

        # Check if there is an active batch
        batch_list = batch_service.search_chip_id_active(req_json["ID"], True)

        if len(batch_list) == 0:
            batch = schemas.BatchCreate(
                name="Batch for " + req_json["ID"],
                chipIdGravity=req_json["ID"],
                chipIdPressure="",
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
                fermentation_steps="",
                tap_list=True,
            )
            batch = batch_service.create(batch)
            batch_list = batch_service.search_chip_id_active(req_json["ID"], True)
            background_tasks.add_task(notify_clients, "batch", "create", batch.id)

        if len(batch_list) == 0:
            raise HTTPException(status_code=409, detail="No batch found")

        # Check if there is an device
        device_list = device_service.search_chip_id(req_json["ID"])

        if len(device_list) == 0:
            device = schemas.DeviceCreate(
                chipId=req_json["ID"],
                chipFamily="",
                software="",
                mdns="",
                config="",
                bleColor="",
                url="",
                description="",
                collectLogs=False,
            )
            device = device_service.create(device)
            background_tasks.add_task(notify_clients, "device", "create", device.id)

        chamber_id = batch_list[0].fermentation_chamber

        logger.info(
            "Saving gravity request for batch %s", batch_list[0].id
        )

        # Extract temperature and validate it early
        temperature = req_json.get("temperature")
        # Treat temperature values less than -270 as null (below absolute zero, sensor error)
        if temperature is not None and temperature < -270:
            temperature = None

        # Convert temperature from Fahrenheit to Celsius if needed
        has_temp_unit = "temp_units" in req_json
        is_fahrenheit = has_temp_unit and req_json["temp_units"].upper() == "F"
        if temperature is not None and is_fahrenheit:
            temperature = float(
                f"{(temperature - 32) * 5 / 9:.2f}"
            )  # °C = (°F − 32) x 5/9

        gravity = schemas.GravityCreate(
            temperature=temperature,
            gravity=req_json["gravity"],
            velocity=velocity,
            angle=req_json["angle"],
            battery=req_json["battery"],
            rssi=req_json["RSSI"],
            corr_gravity=corr_gravity,
            run_time=run_time,
            batch_id=batch_list[0].id,
            created=datetime.now(),
            active=True,
        )

        # If there is a tagged chamber controller device lets use the value from that
        if chamber_id is not None and chamber_id > 1:
            key = "chamber_" + str(chamber_id) + "_beer_temp"
            if exist_key(key):
                beer_temp = read_key(key)
                gravity.beer_temperature = float(beer_temp)
            key = "chamber_" + str(chamber_id) + "_fridge_temp"
            if exist_key(key):
                chamber_temp = read_key(key)
                gravity.chamber_temperature = float(chamber_temp)

        if gravity_units.upper() == "P":
            gravity.gravity = float(
                f"{1 + (gravity.gravity / (258.6 - ((gravity.gravity / 258.2) * 227.1))):.4f}"
            )  # SG = 1+ (plato / (258.6 – ((plato/258.2) *227.1)))

        g = gravity_service.create(gravity)
        background_tasks.add_task(notify_clients, "batch", "update", g.batch_id)

        # Save the record in redis for background job to forward
        if len(device_list) > 0:
            key = "gravity_" + device_list[0].chip_id
            write_key(key, json.dumps(req_json), ttl=None)

        return Response(content="", status_code=200)

    except (KeyError, JSONDecodeError) as e:
        logging.error(e)
        raise HTTPException(status_code=422, detail="Unable to parse request") from e


@router.get(
    "/{gravity_id}",
    response_model=schemas.Gravity,
    responses={404: {"description": "Gravity not found"}},
    dependencies=[Depends(api_key_auth)],
)
async def get_gravity_by_id(
    gravity_id: int, gravity_service: GravityService = Depends(get_gravity_service)
) -> Optional[models.Gravity]:
    """Retrieve a specific gravity reading by ID."""
    logger.info("Endpoint GET /api/gravity/%s", gravity_id)
    return gravity_service.get(gravity_id)


@router.post(
    "/",
    response_model=Union[schemas.Gravity, List[schemas.Gravity]],
    status_code=201,
    responses={409: {"description": "Conflict Error"}},
    dependencies=[Depends(api_key_auth)],
)
async def create_gravity(
    gravity: Union[schemas.GravityCreate, List[schemas.GravityCreate]],
    background_tasks: BackgroundTasks,
    gravity_service: GravityService = Depends(get_gravity_service),
) -> Union[models.Gravity, List[models.Gravity]]:
    """Create one or multiple gravity readings in a single request."""
    logger.info("Endpoint POST /api/gravity/")

    # Handle single gravity reading
    if isinstance(gravity, schemas.GravityCreate):
        if gravity.created is None:
            gravity.created = datetime.now()
            logger.info("Added timestamp to gravity record %s", gravity.created)
        result = gravity_service.create(gravity)
        background_tasks.add_task(notify_clients, "batch", "update", result.batch_id)
        return result

    # Handle multiple gravity readings
    for g in gravity:
        if g.created is None:
            g.created = datetime.now()
    logger.info("Added timestamp to gravity records")
    result = gravity_service.create_list(gravity)
    background_tasks.add_task(notify_clients, "batch", "update", result[0].batch_id)
    return result


@router.patch(
    "/{gravity_id}",
    response_model=schemas.Gravity,
    dependencies=[Depends(api_key_auth)],
)
async def update_gravity_by_id(
    gravity_id: int,
    gravity: schemas.GravityUpdate,
    background_tasks: BackgroundTasks,
    gravity_service: GravityService = Depends(get_gravity_service),
) -> Optional[models.Gravity]:
    """Update a gravity reading by ID."""
    logger.info("Endpoint PATCH /api/gravity/%s", gravity_id)
    gravity = gravity_service.update(gravity_id, gravity)
    background_tasks.add_task(notify_clients, "batch", "update", gravity.batch_id)
    return gravity


@router.delete("/{gravity_id}", status_code=204, dependencies=[Depends(api_key_auth)])
async def delete_gravity_by_id(
    gravity_id: int,
    background_tasks: BackgroundTasks,
    gravity_service: GravityService = Depends(get_gravity_service),
):
    """Delete a gravity reading by ID."""
    logger.info("Endpoint DELETE /api/gravity/%s", gravity_id)
    gravity = gravity_service.get(gravity_id)
    if not gravity:
        raise HTTPException(status_code=404, detail="Gravity not found")
    background_tasks.add_task(notify_clients, "batch", "update", gravity.batch_id)
    gravity_service.delete(gravity_id)
