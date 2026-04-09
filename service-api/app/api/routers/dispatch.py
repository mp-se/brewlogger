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

"""Request dispatching endpoints for forwarding requests to remote brewery devices."""
import logging
from json import JSONDecodeError

import httpx
from fastapi import Request, Response, BackgroundTasks
from fastapi.routing import APIRouter
from starlette.exceptions import HTTPException
from ..utils import log_public_request, get_client_ip

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/dispatch")

@router.post("/public", status_code=200, response_class=Response)
async def dispatch_post_to_correct_endpoint(
    request: Request, background_tasks: BackgroundTasks
) -> Response:
    """Forward gravity and pressure data to appropriate endpoints.
    
    Args:
        request: The incoming HTTP request with JSON body
        background_tasks: FastAPI background tasks for async logging
    
    Returns:
        Response object with result or error status
    """
    logger.info("Endpoint POST /dispatch/public")
    try:
        j = await request.json()

        # Get client IP address and log the request
        client_host = get_client_ip(request)
        background_tasks.add_task(log_public_request, client_host, j)

        if "gravity" in j:
            logger.info("Detected gravitymon data")

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://brew_api:80/api/gravity/public",
                    json=j)

                logger.info(response)
                return Response(content=response.content, status_code=200)

        if "pressure" in j:
            logger.info("Detected pressuremon data")
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://brew_api:80/api/pressure/public",
                    json=j             )

                logger.info(response)
                return Response(content=response.content, status_code=200)

    except (KeyError, JSONDecodeError) as e:
        logging.error(e)
        raise HTTPException(status_code=422, detail="Unable to parse request") from e

    raise HTTPException(status_code=400, detail="Format not recognized")
