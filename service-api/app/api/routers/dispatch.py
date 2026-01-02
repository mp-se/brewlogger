"""Request dispatching endpoints for forwarding requests to remote brewery devices."""
import logging
from json import JSONDecodeError

import httpx
from fastapi import Request, Response
from fastapi.routing import APIRouter
from starlette.exceptions import HTTPException

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/dispatch")

@router.post("/public", status_code=200, response_class=Response)
async def dispatch_post_to_correct_endpoint(request: Request):
    """Forward gravity and pressure data to appropriate endpoints."""
    logger.info("Endpoint POST /dispatch/public")
    try:
        j = await request.json()

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
