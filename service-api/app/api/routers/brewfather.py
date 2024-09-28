import httpx
import logging
from datetime import datetime
from json import JSONDecodeError
from typing import List
from fastapi import Depends
from fastapi.routing import APIRouter
from starlette.exceptions import HTTPException
from api.db import schemas
from ..security import api_key_auth
from ..config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/brewfather")


@router.get(
    "/batch/",
    response_model=List[schemas.BrewfatherBatch],
    dependencies=[Depends(api_key_auth)],
)
async def get_batches_from_brewfather():
    logger.info("Endpoint GET /api/brewfather/batch/")

    batches = list()

    if get_settings().brewfather_user_key == '' or get_settings().brewfather_api_key == '':
        raise HTTPException(
            status_code=400, detail="Brewfather keys are not defined, unable to fetch data."
        )

    try:
        async with httpx.AsyncClient() as client:
            url = "https://api.brewfather.app/v2/batches"
            data = {
                "include": "name,recipe.name,recipe.style.type,brewer,brewDate,estimatedColor,estimatedIbu,measuredAbv",
                "complete": False,
                "status": "Completed",
                "limit": 100,
            }
            res = await client.get(
                url=url,
                params=data,
                auth=(
                    get_settings().brewfather_user_key,
                    get_settings().brewfather_api_key,
                ),
            )
            json = res.json()

            for batch in json:
                logger.info(
                    "Processing response from brewfather API #%d", batch["batchNo"]
                )
                logger.info(batch)

                abv = 0
                ebc = 0
                ibu = 0
                style = ""

                if ("style" in batch["recipe"] and batch["recipe"]["style"]["type"] is not None):
                    style = batch["recipe"]["style"]["type"]
                if "measuredAbv" in batch:
                    abv = batch["measuredAbv"]
                if "estimatedColor" in batch:
                    ebc = batch["estimatedColor"]
                if "estimatedIbu" in batch:
                    ibu = batch["estimatedIbu"]

                batches.append(schemas.BrewfatherBatch(
                    name=batch["name"],
                    brewDate=datetime.fromtimestamp(batch["brewDate"] / 1000.0).strftime("%Y-%m-%d"),
                    style=style,
                    brewer=batch["brewer"],
                    abv=abv,
                    ebc=ebc,
                    ibu=ibu,
                    brewfatherId=batch["_id"],
                ))

    except JSONDecodeError:
        logger.error("Unable to parse JSON response")
        raise HTTPException(
            status_code=400, detail="Unable to parse JSON from remote endpoint."
        )
    except httpx.ConnectError:
        logger.error("Unable to connect to device")
        raise HTTPException(
            status_code=400, detail="Unable to connect to remote endpoint."
        )

    return batches


"""
# This will fetch all batches in brewfather and create a copy in brewlogger.. will create duplicates if logging has already started
@router.get(
    "/brewfather/",
    response_model=List[schemas.Batch],
    dependencies=[Depends(api_key_auth)],
)
async def get_batches_from_brewfather(
    batch_service: BatchService = Depends(get_batch_service),
) -> List[models.Batch]:
    logger.info("Endpoint GET /api/batch/brewfather/")

    try:
        async with httpx.AsyncClient() as client:
            url = "https://api.brewfather.app/v2/batches"
            data = {
                "include": "name,recipe.name,recipe.style.type,brewer,brewDate,estimatedColor,estimatedIbu,measuredAbv",
                "complete": False,
                "status": "Completed",
                "limit": 100,
            }
            res = await client.get(
                url=url,
                params=data,
                auth=(
                    get_settings().brewfather_user_key,
                    get_settings().brewfather_api_key,
                ),
            )
            json = res.json()

            for batch in json:
                logger.info(
                    "Processing response from brewfather API #%d", batch["batchNo"]
                )
                logger.info(batch)

                batch_list = batch_service.search_brewfatherId(batch["_id"])

                if len(batch_list) == 0:
                    logger.info("Creating batch for brewfather #%d", batch["batchNo"])
                    newBatch = schemas.BatchCreate(
                        name=batch["name"],
                        chipId="000000",
                        description="Imported from brewfather",
                        brewDate=datetime.fromtimestamp(
                            batch["brewDate"] / 1000.0
                        ).strftime("%Y-%m-%d"),
                        style="",
                        brewer=batch["brewer"],
                        brewfatherId=batch["_id"],
                        active=True,
                        abv=0,
                        ebc=0,
                        ibu=0,
                        fermentation_chamber=None,
                    )

                    if (
                        "style" in batch["recipe"]
                        and batch["recipe"]["style"]["type"] is not None
                    ):
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
                        name=batch["name"],
                        chipId=batch_list[0].chip_id,
                        description=batch_list[0].description,
                        brewDate=datetime.fromtimestamp(
                            batch["brewDate"] / 1000.0
                        ).strftime("%Y-%m-%d"),
                        style=batch_list[0].style,
                        brewer=batch["brewer"],
                        brewfatherId=batch["_id"],
                        active=batch_list[0].active,
                        abv=batch_list[0].abv,
                        ebc=batch_list[0].ebc,
                        ibu=batch_list[0].ibu,
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
            status_code=400, detail="Unable to parse JSON from remote endpoint."
        )
    except httpx.ConnectError:
        logger.error("Unable to connect to device")
        raise HTTPException(
            status_code=400, detail="Unable to connect to remote endpoint."
        )

    return batch_service.list()
"""
