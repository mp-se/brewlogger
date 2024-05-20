import httpx, logging
from datetime import datetime
from json import JSONDecodeError
from typing import List, Optional
from fastapi import Depends
from fastapi.routing import APIRouter
from starlette.exceptions import HTTPException
from api.db import models, schemas
from api.services import BatchService, get_batch_service
from ..security import api_key_auth
from ..config import get_settings

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
    logger.info("Endpoint GET /api/batch/?chipId=%s&active=%s", chipId, active)

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
    logger.info("Endpoint GET /api/batch/%d", batch_id)
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
    logger.info("Endpoint POST /api/batch/")
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
    logger.info("Endpoint PATCH /api/batch/%d", batch_id)
    return batch_service.update(batch_id, batch)


@router.delete(
    "/{batch_id}",
    status_code=204,
    dependencies=[Depends(api_key_auth)])
async def delete_batch_by_id(
    batch_id: int,
    batch_service: BatchService = Depends(get_batch_service)):
    logger.info("Endpoint DELETE /api/batch/%d", batch_id)
    batch_service.delete(batch_id)

@router.get(
    "/brewfather/",
    response_model=List[schemas.Batch],
    dependencies=[Depends(api_key_auth)])
async def get_batches_from_brewfather(
    batch_service: BatchService = Depends(get_batch_service)
) -> List[models.Batch]:
    logger.info("Endpoint GET /api/batch/brewfather/")

    try:
        async with httpx.AsyncClient() as client:
            url = "https://api.brewfather.app/v2/batches"
            data = { "include": "name,recipe.name,recipe.style.type,brewer,brewDate,estimatedColor,estimatedIbu,measuredAbv", "complete": False, "status": "Completed", "limit": 100 }
            res = await client.get(url=url, params=data, auth=(get_settings().brewfather_user_key, get_settings().brewfather_api_key))
            json = res.json()

            for batch in json:
                logger.info("Processing response from brewfather API #%d", batch["batchNo"])
                logger.info(batch)

                batch_list = batch_service.search_brewfatherId(batch["_id"])

                if len(batch_list) == 0:
                    logger.info("Creating batch for brewfather #%d", batch["batchNo"])
                    newBatch = schemas.BatchCreate(
                        name = batch["name"],
                        chipId = "000000",
                        description = "Imported from brewfather",
                        brewDate = datetime.fromtimestamp(batch["brewDate"]/1000.0).strftime("%Y-%m-%d"),
                        style = "",
                        brewer = batch["brewer"],
                        brewfatherId = batch["_id"],
                        active = True,
                        abv = 0,
                        ebc = 0,
                        ibu = 0,
                    )

                    if "style" in batch["recipe"] and batch["recipe"]["style"]["type"] != None:
                      newBatch.style = batch["recipe"]["style"]["type"]
                    if "measuredAbv" in batch:
                      newBatch.abv = batch["measuredAbv"]
                    if "estimatedColor" in batch:
                      newBatch.ebc = batch["estimatedColor"]
                    if "estimatedIbu" in batch:
                      newBatch.ibu = batch["estimatedIbu"]

                    batch_service.create(newBatch)
                else:
                    logger.info("Updating batch for brewfather #%d", batch["batchNo"])

                    updBatch = schemas.BatchUpdate(
                        name = batch["name"],
                        chipId = batch_list[0].chip_id,
                        description = batch_list[0].description,
                        brewDate = datetime.fromtimestamp(batch["brewDate"]/1000.0).strftime("%Y-%m-%d"),
                        style = batch_list[0].style,
                        brewer = batch["brewer"],
                        brewfatherId = batch["_id"],
                        active = batch_list[0].active,
                        abv = batch_list[0].abv,
                        ebc = batch_list[0].ebc,
                        ibu = batch_list[0].ibu,
                    )

                    if "style" in batch["recipe"]:
                      updBatch.style = batch["recipe"]["style"]["type"]
                    if "measuredAbv" in batch:
                      updBatch.abv = batch["measuredAbv"]
                    if "estimatedColor" in batch:
                      updBatch.ebc = batch["estimatedColor"]
                    if "estimatedIbu" in batch:
                      updBatch.ibu = batch["estimatedIbu"]

                    batch_service.update(batch_list[0].id, updBatch)

    except JSONDecodeError:
        logger.error("Unable to parse JSON response")
        raise HTTPException(
            status_code=400,
            detail=f"Unable to parse JSON from remote endpoint.")
    except httpx.ConnectError:
        logger.error("Unable to connect to device")
        raise HTTPException(
            status_code=400,
            detail=f"Unable to connect to remote endpoint.")

    return batch_service.list()
