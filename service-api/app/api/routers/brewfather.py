# BrewLogger
# Copyright (c) 2021-2026 Magnus
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Alternatively, this software may be used under the terms of a
# commercial license. See LICENSE_COMMERCIAL for details.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
#

"""Brewfather API integration endpoints for syncing batch data from Brewfather service."""
import json
import logging
from datetime import datetime
from json import JSONDecodeError
from typing import List

import httpx
from fastapi import Depends
from fastapi.routing import APIRouter
from starlette.exceptions import HTTPException

from api.db import schemas, models

from ..config import get_settings
from ..security import api_key_auth

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/brewfather")

MAX_RECORDS = 100


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
    """Fetch batches from Brewfather API filtered by status."""
    logger.info(
        "Endpoint GET /api/brewfather/batch/"
        "?planning=%s&brewing=%s&fermenting=%s&completed=%s&archived=%s",
        planning, brewing, fermenting, completed, archived
    )
    batches = []

    if planning:
        batches += await fetch_batch_list("Planning")

    if brewing:
        batches += await fetch_batch_list("Brewing")

    if fermenting:
        batches += await fetch_batch_list("Fermenting")

    if completed:
        batches += await fetch_batch_list("Completed")

    if archived:
        batches += await fetch_batch_list("Archived")

    return batches


async def fetch_batch_list(status: str) -> list[schemas.BrewfatherBatch]:  # pylint: disable=too-many-locals,too-many-branches
    """Fetch batch list from Brewfather API for a given status.
    
    Args:
        status: The batch status to filter by (e.g. 'Planning', 'Brewing', 'Complete')
    
    Returns:
        List of batches from Brewfather API
    
    Raises:
        HTTPException: If Brewfather credentials are not configured
    """
    batches = []

    if (
        get_settings().brewfather_user_key == ""
        or get_settings().brewfather_api_key == ""
    ):
        raise HTTPException(
            status_code=400,
            detail="Brewfather keys are not defined, unable to fetch data.",
        )

    try:
        async with httpx.AsyncClient() as client:
            url = "https://api.brewfather.app/v2/batches"
            recipe_fields = "recipe.abv,recipe.color,recipe.ibu,recipe.og,recipe.fg"
            include_fields = f"{recipe_fields},recipe.style.name,recipe.fermentation"
            data = {
                "include": include_fields,
                "complete": False,
                "status": status,
                "limit": MAX_RECORDS,
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

            print(batch_list)

            for batch in batch_list:
                print(batch)

                logger.info(
                    "Processing response from brewfather API #%d", batch["batchNo"]
                )
                logger.info(batch)

                abv = 0
                ebc = 0
                ibu = 0
                og = 0.0
                fg = 0.0
                style = ""
                name = batch["name"]
                steps = []

                # Example response
                # [
                #     {
                #         "_id": "ejriIST30hkmqSlzDGRQ8420eQyze1",
                #         "batchNo": 78,
                #         "brewDate": 1727474400000,
                #         "brewer": "Magnus Persson",
                #         "name": "Christmas Lager",
                #         "recipe": {
                #             "abv": 4.33,
                #             "color": 14.7,
                #             "fermentation": {
                #                 "_id": null,
                #                 "name": "Imported",
                #                 "steps": [
                #                     {
                #                         "actualTime": 1727474400000,
                #                         "stepTemp": 12,
                #                         "stepTime": 14,
                #                         "type": "Primary"
                #                     },
                #                     {
                #                         "actualTime": 1728684000000,
                #                         "stepTemp": 2,
                #                         "stepTime": 4,
                #                         "type": "Secondary"
                #                     },
                #                     {
                #                         "actualTime": 1729029600000,
                #                         "stepTemp": 16,
                #                         "stepTime": 14,
                #                         "type": "Conditioning"
                #                     }
                #                 ]
                #             },
                #             "ibu": 32.3,
                #             "name": "71. Christmas Lager",
                #             "style": {
                #                 "name": "American-Style Dark Lager"
                #             }
                #         },
                #         "status": "Fermenting"
                #     }
                # ]

                if "recipe" in batch:
                    if (
                        "style" in batch["recipe"]
                        and "name" in batch["recipe"]["style"]
                    ):
                        style = batch["recipe"]["style"]["name"]
                    if "name" in batch["recipe"]:
                        name = batch["recipe"]["name"]

                    if "fermentation" in batch["recipe"]:
                        if "steps" in batch["recipe"]["fermentation"]:
                            i = 0
                            for step in batch["recipe"]["fermentation"]["steps"]:
                                # Note! This should represent model.FermentationStep
                                steps.append(
                                    {
                                        "order": i,
                                        "date": "",
                                        "temp": step["stepTemp"],
                                        "days": step["stepTime"],
                                        "type": step["type"],
                                    }
                                )
                                i += 1

                if "abv" in batch["recipe"]:
                    abv = batch["recipe"]["abv"]
                if "color" in batch["recipe"]:
                    ebc = batch["recipe"]["color"]
                if "ibu" in batch["recipe"]:
                    ibu = batch["recipe"]["ibu"]
                if "og" in batch["recipe"]:
                    og = batch["recipe"]["og"]
                if "fg" in batch["recipe"]:
                    fg = batch["recipe"]["fg"]

                batches.append(
                    schemas.BrewfatherBatch(
                        name=name,
                        brewDate=datetime.fromtimestamp(
                            batch["brewDate"] / 1000.0
                        ).strftime("%Y-%m-%d"),
                        style=style,
                        brewer=batch["brewer"],
                        abv=abv,
                        ebc=ebc,
                        ibu=ibu,
                        fg=fg,
                        og=og,
                        brewfatherId=batch["_id"],
                        fermentationSteps=json.dumps(steps),
                    )
                )

    except JSONDecodeError as exc:
        logger.error("Unable to parse JSON response")
        raise HTTPException(
            status_code=400, detail="Unable to parse JSON from brewfather."
        ) from exc
    except httpx.ConnectError as exc:
        logger.error("Unable to connect to brewfather")
        raise HTTPException(status_code=400, detail="Unable to connect to brewfather.") from exc

    return batches


@router.get(
    "/batch/{batch_id}",
    response_model=List[schemas.BrewfatherBatch],
    dependencies=[Depends(api_key_auth)],
)
async def get_completed_batches_from_brewfather(
    batch_id: str,
):
    """Fetch a specific batch from Brewfather by batch ID."""
    logger.info("Endpoint GET /api/brewfather/batch/%s", batch_id)

    batch = {}

    if (
        get_settings().brewfather_user_key == ""
        or get_settings().brewfather_api_key == ""
    ):
        raise HTTPException(
            status_code=400,
            detail="Brewfather keys are not defined, unable to fetch data.",
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

    except JSONDecodeError as exc:
        logger.error("Unable to parse JSON response")
        raise HTTPException(
            status_code=400, detail="Unable to parse JSON from brewfather."
        ) from exc
    except httpx.ConnectError as exc:
        logger.error("Unable to connect to brewfather")
        raise HTTPException(status_code=400, detail="Unable to connect to brewfather.") from exc

    return batch
