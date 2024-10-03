import httpx
import logging
import json
from datetime import datetime
from json import JSONDecodeError
from typing import List
from fastapi import Depends
from fastapi.routing import APIRouter
from starlette.exceptions import HTTPException
from api.db import schemas, models
from ..security import api_key_auth
from ..config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/brewfather")

max_records = 100


@router.get(
    "/batch/",
    response_model=List[schemas.BrewfatherBatch],
    dependencies=[Depends(api_key_auth)],
) 
async def get_fermenting_batches_from_brewfather(
    planning: bool = False,
    brewing: bool = False,
    fermenting: bool = False,
    completed: bool = False,
    archived: bool = False,
) -> List[models.Batch]:
    logger.info(f"Endpoint GET /api/brewfather/batch/?planning={planning}&brewing={brewing}&fermenting={fermenting}&completed={completed}&archived={archived}")
    batches = list()

    if planning:
        batches += await fetchBatchList("Planning")

    if brewing:
        batches += await fetchBatchList("Brewing")

    if fermenting:
        batches += await fetchBatchList("Fermenting")

    if completed:
        batches += await fetchBatchList("Completed")

    if archived:
        batches += await fetchBatchList("Archived")

    return batches
    

async def fetchBatchList(status):
    batches = list()

    if get_settings().brewfather_user_key == '' or get_settings().brewfather_api_key == '':
        raise HTTPException(
            status_code=400, detail="Brewfather keys are not defined, unable to fetch data."
        )

    try:
        async with httpx.AsyncClient() as client:
            url = "https://api.brewfather.app/v2/batches"
            data = {
                "include": "recipe.abv,recipe.color,recipe.ibu,recipe.style.name,recipe.fermentation",
                "complete": False,
                "status": status,
                "limit": max_records,
            }
            res = await client.get(
                url=url,
                params=data,
                auth=(
                    get_settings().brewfather_user_key,
                    get_settings().brewfather_api_key,
                ),
            )
            batch_list = res.json()

            print( batch_list)

            for batch in batch_list:
                print(batch)

                logger.info(
                    "Processing response from brewfather API #%d", batch["batchNo"]
                )
                logger.info(batch)

                abv = 0
                ebc = 0
                ibu = 0
                style = ""
                name = batch["name"]
                steps = []

                """ Example response
                [
                    {
                        "_id": "ejriIST30hkmqSlzDGRQ8420eQyze1",
                        "batchNo": 78,
                        "brewDate": 1727474400000,
                        "brewer": "Magnus Persson",
                        "name": "Christmas Lager",
                        "recipe": {
                            "abv": 4.33,
                            "color": 14.7,
                            "fermentation": {
                                "_id": null,
                                "name": "Imported",
                                "steps": [
                                    {
                                        "actualTime": 1727474400000,
                                        "stepTemp": 12,
                                        "stepTime": 14,
                                        "type": "Primary"
                                    },
                                    {
                                        "actualTime": 1728684000000,
                                        "stepTemp": 2,
                                        "stepTime": 4,
                                        "type": "Secondary"
                                    },
                                    {
                                        "actualTime": 1729029600000,
                                        "stepTemp": 16,
                                        "stepTime": 14,
                                        "type": "Conditioning"
                                    }
                                ]
                            },
                            "ibu": 32.3,
                            "name": "71. Christmas Lager",
                            "style": {
                                "name": "American-Style Dark Lager"
                            }
                        },
                        "status": "Fermenting"
                    }
                ]               
                """

                if "recipe" in batch:
                    if ("style" in batch["recipe"] and "name" in batch["recipe"]["style"]):
                        style = batch["recipe"]["style"]["name"]
                    if ("name" in batch["recipe"]):
                        name = batch["recipe"]["name"]

                    if ("fermentation" in batch["recipe"]):
                        if ("steps" in batch["recipe"]["fermentation"]):
                            for step in batch["recipe"]["fermentation"]["steps"]:
                                # TODO: Fix ramp whatever that is...
                                steps.append( { "temp": step["stepTemp"], "days": step["stepTime"], "type": step["type"], "ramp": 0, "gravity": 0 } )

                if "abv" in batch["recipe"]:
                    abv = batch["recipe"]["abv"]
                if "color" in batch["recipe"]:
                    ebc = batch["recipe"]["color"]
                if "ibu" in batch["recipe"]:
                    ibu = batch["recipe"]["ibu"]

                batches.append(schemas.BrewfatherBatch(
                    name=name,
                    brewDate=datetime.fromtimestamp(batch["brewDate"] / 1000.0).strftime("%Y-%m-%d"),
                    style=style,
                    brewer=batch["brewer"],
                    abv=abv,
                    ebc=ebc,
                    ibu=ibu,
                    brewfatherId=batch["_id"],
                    fermentationSteps=json.dumps(steps)
                ))

    except JSONDecodeError:
        logger.error("Unable to parse JSON response")
        raise HTTPException(
            status_code=400, detail="Unable to parse JSON from brewfather."
        )
    except httpx.ConnectError:
        logger.error("Unable to connect to brewfather")
        raise HTTPException(
            status_code=400, detail="Unable to connect to brewfather."
        )

    return batches


@router.get(
    "/batch/{batch_id}",
    response_model=List[schemas.BrewfatherBatch],
    dependencies=[Depends(api_key_auth)],
)
async def get_completed_batches_from_brewfather(
    batch_id: str,
):
    logger.info(f"Endpoint GET /api/brewfather/batch/{batch_id}")

    batch = {}

    if get_settings().brewfather_user_key == '' or get_settings().brewfather_api_key == '':
        raise HTTPException(
            status_code=400, detail="Brewfather keys are not defined, unable to fetch data."
        )

    try:
        async with httpx.AsyncClient() as client:
            url = "https://api.brewfather.app/v2/batches/" + batch_id
            res = await client.get(
                url=url,
                auth=(
                    get_settings().brewfather_user_key,
                    get_settings().brewfather_api_key,
                ),
            )
            batch = res.json()

    except JSONDecodeError:
        logger.error("Unable to parse JSON response")
        raise HTTPException(
            status_code=400, detail="Unable to parse JSON from brewfather."
        )
    except httpx.ConnectError:
        logger.error("Unable to connect to brewfather")
        raise HTTPException(
            status_code=400, detail="Unable to connect to brewfather."
        )

    return batch
