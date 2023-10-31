import httpx, logging
from json import JSONDecodeError
from typing import List, Optional
from fastapi import Depends
from fastapi.routing import APIRouter
from starlette.exceptions import HTTPException
from api.db import models, schemas
from api.services import DeviceService, get_device_service
from ..security import api_key_auth

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/device")

@router.get(
    "/",
    response_model=List[schemas.Device],
    dependencies=[Depends(api_key_auth)])
async def list_devices(
    devices_service: DeviceService = Depends(get_device_service),
) -> List[models.Device]:
    return devices_service.list()

@router.get(
    "/{device_id}",
    response_model=schemas.Device,
    responses={404: {"description": "Device not found"}},
    dependencies=[Depends(api_key_auth)])
async def get_device_by_id(
    device_id: int,
    devices_service: DeviceService = Depends(get_device_service)
) -> Optional[models.Device]:
    return devices_service.get(device_id)

@router.post(
    "/",
    response_model=schemas.Device,
    status_code=201,
    responses={409: {"description": "Conflict Error"}},
    dependencies=[Depends(api_key_auth)])
async def create_device(
    device: schemas.DeviceCreate,
    devices_service: DeviceService = Depends(get_device_service)
) -> models.Device:
    device_list = devices_service.search_chipId(device.chip_id)
    if len(device_list) > 0:
        raise HTTPException(status_code=409, detail="Conflict Error")
    logging.info("Creating device: %s", device)
    return devices_service.create(device)

@router.patch(
    "/{device_id}",
    response_model=schemas.Device,
    dependencies=[Depends(api_key_auth)])
async def update_device_by_id(
    device_id: int,
    device: schemas.DeviceUpdate,
    devices_service: DeviceService = Depends(get_device_service),
) -> Optional[models.Device]:
    return devices_service.update(device_id, device)

@router.delete(
    "/{device_id}",
    status_code=204,
    dependencies=[Depends(api_key_auth)])
async def delete_device_by_id(
    device_id: int,
    devices_service: DeviceService = Depends(get_device_service)
):
    devices_service.delete(device_id)

@router.post(
    "/proxy_fetch",
    status_code=200,
    dependencies=[Depends(api_key_auth)])
async def fetch_data_from_device(
    proxy_req: schemas.ProxyRequest
):
    try:
        async with httpx.AsyncClient() as client:
            if proxy_req.method == "post":      
                logging.info("Fetching data using post %s", proxy_req.url)
                res = await client.post(proxy_req.url, proxy_req.body)
            else:
                logging.info("Fetching data using get %s", proxy_req.url)
                res = await client.get(proxy_req.url)

            logging.info("Response received %s", res)

            if res.status_code != 200:
                raise HTTPException(status_code=res.status_code, detail="Response from endpoint.")

            json = res.json()
            logging.info( "Payload from external service: %s", json)
            return json
    except JSONDecodeError:
        logging.error("Unable to parse JSON response")
        raise HTTPException(
            status_code=400,
            detail=f"Unable to parse JSON from remote endpoint.")
    except httpx.ConnectError:
        logging.error("Unable to connect to device")
        raise HTTPException(
            status_code=400,
            detail=f"Unable to connect to remote endpoint (ConnectError).")
    except httpx.ConnectTimeout:
        logging.error("Unable to connect to device")
        raise HTTPException(
            status_code=400,
            detail=f"Unable to connect to remote endpoint (ConnectTimeout).")
    #except:
    #    logging.error("Unknown error occured when trying to fetch data from remote")
