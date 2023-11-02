import logging
from datetime import datetime
from json.decoder import JSONDecodeError
from typing import List, Optional
from fastapi import Depends, Request
from fastapi.routing import APIRouter
from starlette.exceptions import HTTPException
from api.db import models, schemas
from api.services import PressureService, get_pressure_service, BatchService, get_batch_service, DeviceService, get_device_service
from ..security import api_key_auth

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/pressure")

@router.get(
    "/",
    response_model=List[schemas.Pressure],
    dependencies=[Depends(api_key_auth)])
async def list_pressures(
    chipId: str = "*",
    pressure_service: PressureService = Depends(get_pressure_service),
) -> List[models.Pressure]:
    if chipId != "*":
        return pressure_service.search(chipId)

    return pressure_service.list()


@router.get(
    "/{pressure_id}",
    response_model=schemas.Pressure,
    responses={404: {"description": "Pressure not found"}},
    dependencies=[Depends(api_key_auth)])
async def get_pressure_by_id(
    pressure_id: int,
    pressure_service: PressureService = Depends(get_pressure_service)
) -> Optional[models.Pressure]:
    return pressure_service.get(pressure_id)


@router.post(
    "/",
    response_model=schemas.Pressure,
    status_code=201,
    responses={409: {"description": "Conflict Error"}},
    dependencies=[Depends(api_key_auth)])
async def create_pressure(
    pressure: schemas.PressureCreate,
    pressure_service: PressureService = Depends(get_pressure_service)
) -> models.Pressure:
    logging.info("Processing item")
    if pressure.created is None:
        pressure.created = datetime.now()
        logging.info("Added timestamp to pressure record %s", pressure.created)
    return pressure_service.create(pressure)

@router.post(
    "/list/",
    response_model=List[schemas.Pressure],
    status_code=201,
    responses={409: {"description": "Conflict Error"}},
    dependencies=[Depends(api_key_auth)])
async def create_pressure_list(
    pressure_list: List[schemas.PressureCreate],
    pressure_service: PressureService = Depends(get_pressure_service)
) -> List[models.Pressure]:
    logging.info("Processing list")

    res = []
    for pressure in pressure_list:
        res.append(pressure_service.create(pressure))
    return res

@router.patch(
    "/{pressure_id}",
    response_model=schemas.Pressure,
    dependencies=[Depends(api_key_auth)])
async def update_pressure_by_id(
    pressure_id: int,
    pressure: schemas.PressureUpdate,
    pressure_service: PressureService = Depends(get_pressure_service),
) -> Optional[models.Pressure]:
    return pressure_service.update(pressure_id, pressure)


@router.delete(
    "/{pressure_id}",
    status_code=204,
    dependencies=[Depends(api_key_auth)])
async def delete_pressure_by_id(
    pressure_id: int,
    pressure_service: PressureService = Depends(get_pressure_service)
):
    pressure_service.delete(pressure_id)


@router.post(
    "/public",
    status_code=200)
async def create_pressure_using_json(
    request: Request,
    pressure_service: PressureService = Depends(get_pressure_service),
    batch_service: BatchService = Depends(get_batch_service),
    device_service: DeviceService = Depends(get_device_service)
):   
    try:
        json = await request.json()

        # Check if there is an active batch
        batchList = batch_service.search_chipId_active(json["chipId"], True)

        if len(batchList) == 0:
            batch = schemas.BatchCreate(
                name = "Batch for " + json["chipId"],
                chipId = json["chipId"],
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
            batchList = batch_service.search_chipId_active(json["chipId"], True)

        if len(batchList) == 0:
            raise HTTPException(status_code=409, detail="No batch found")

        # Check if there is an device registered
        deviceList = device_service.search_chipId(json["chipId"])

        if len(deviceList) == 0:
            device = schemas.DeviceCreate(
                chipId = json["chipId"],
                chipFamily = "",
                software = "",
                mdns = "",
                config = "",
                url = "http://" + request.client.host
            )
            device_service.create(device)

        """ Example payload 
        {
            "name": "name",
            "token": "token",
            "interval": 1,
            "chipId": "012345",
            "temperature": 0,
            "temp_format": "C",
            "pressure": 1.05,
            "press_format": "hpa",
            "battery": 3.85,
            "rssi": -76.2,
            "runTime": 1.0,
        }    
        """

        pressure = schemas.PressureCreate(
            temperature = json["temperature"],
            pressure = json["pressure"],
            battery = json["battery"],
            rssi = json["rssi"],
            run_time = json["runTime"],
            batch_id = batchList[0].id,
            created = datetime.now()
        )

        if json["temp_format"] == 'F':
            pressure.temperature = (pressure.temperature-32) * 5 / 9 # °C = (°F − 32) x 5/9

        return pressure_service.create(pressure)

    except JSONDecodeError:
        raise HTTPException(status_code=409, detail="Unable to parse request")
