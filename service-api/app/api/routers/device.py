import httpx, logging, json
from json import JSONDecodeError
from typing import List, Optional
from fastapi import Depends
from fastapi.routing import APIRouter
from fastapi.responses import Response
from starlette.exceptions import HTTPException
from api.db import models, schemas
from api.services import DeviceService, get_device_service
from ..security import api_key_auth
from ..mdns import scan_for_mdns

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/device")

@router.get(
    "/",
    response_model=List[schemas.Device],
    dependencies=[Depends(api_key_auth)])
async def list_devices(
    devices_service: DeviceService = Depends(get_device_service),
) -> List[models.Device]:
    logger.info("Endpoint GET /api/device/")
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
    logger.info("Endpoint GET /api/device/%d", device_id)
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
    logger.info("Endpoint POST /api/device/")
    device_list = devices_service.search_chipId(device.chip_id)
    if len(device_list) > 0:
        raise HTTPException(status_code=409, detail="Conflict Error")
    logger.info("Creating device: %s", device)
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
    logger.info("Endpoint PATCH /api/device/%d", device_id)
    return devices_service.update(device_id, device)

@router.delete(
    "/{device_id}",
    status_code=204,
    dependencies=[Depends(api_key_auth)])
async def delete_device_by_id(
    device_id: int,
    devices_service: DeviceService = Depends(get_device_service)
):
    logger.info("Endpoint DELETE /api/device/%d", device_id)
    devices_service.delete(device_id)

@router.post(
    "/proxy_fetch",
    status_code=200,
    dependencies=[Depends(api_key_auth)])
async def fetch_data_from_device(
    proxy_req: schemas.ProxyRequest
):
    logger.info("Endpoint POST /api/device/proxy_fetch")

    try:
        timeout = httpx.Timeout(10.0, connect=10.0, read=10.0)

        async with httpx.AsyncClient(timeout=timeout) as client:
            if proxy_req.method == "post":
                logger.info("Request using post %s", proxy_req.url)
                res = await client.post(proxy_req.url, data=proxy_req.body)
            elif proxy_req.method == "put":
                logger.info("Request using put %s", proxy_req.url)
                res = await client.put(proxy_req.url, data=proxy_req.body)
            elif proxy_req.method == "delete":
                logger.info("Request using delete %s", proxy_req.url)
                res = await client.delete(proxy_req.url)
            else:
                logger.info("Request using get %s", proxy_req.url)
                res = await client.get(proxy_req.url)

            logger.info("Response received %s", res)

            if res.status_code != 200:
                raise HTTPException(status_code=res.status_code, detail="Response from endpoint.")

            # if the data is not pure Json, return it as text
            try: 
                json = res.json() 
            except:
                json = res.text
            logger.info( "Payload from external service: %s", json)
            return json
    except JSONDecodeError:
        logger.error("Unable to parse JSON response")
        raise HTTPException(
            status_code=400,
            detail=f"Unable to parse JSON from remote endpoint.")
    except httpx.ReadTimeout:
        logger.error("Unable to connect to device")
        raise HTTPException(
            status_code=400,
            detail=f"Unable to connect to remote endpoint (ConnectError).")
    except httpx.ConnectError:
        logger.error("Unable to read from device")
        raise HTTPException(
            status_code=400,
            detail=f"Unable to connect to remote endpoint (ReadTimeout).")
    except httpx.ConnectTimeout:
        logger.error("Unable to connect to device")
        raise HTTPException(
            status_code=400,
            detail=f"Unable to connect to remote endpoint (ConnectTimeout).")
    #except:
    #    logger.error("Unknown error occured when trying to fetch data from remote")

@router.get(
    "/mdns/",
    status_code=200,
    dependencies=[Depends(api_key_auth)])
async def scan_for_mdns_devices():
    logger.info("Endpoint GET /api/device/mdns/")
    mdns = await scan_for_mdns(10)
    return Response(content=json.dumps(mdns), media_type="application/json")