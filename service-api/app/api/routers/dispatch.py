import logging
import httpx
from json import JSONDecodeError
from fastapi.routing import APIRouter
from fastapi import Request, Response
from starlette.exceptions import HTTPException

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/dispatch")

@router.post("/public", status_code=200, response_class=Response)
async def pressmon_test_post(request: Request):
    logger.info("Endpoint POST /dispatch/public")
    try:
        j = await request.json()

        if "gravity" in j:
            logger.info("Detected gravitymon data")

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://brew_api:80/api/gravity/public",
                    json=j             )
                
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

    except KeyError as e:
        logging.error(e)
        raise HTTPException(status_code=422, detail="Unable to parse request")
    except JSONDecodeError as e:
        logging.error(e)
        raise HTTPException(status_code=422, detail="Unable to parse request")

    return Response(status_code=400, detail="Format not recognized")
