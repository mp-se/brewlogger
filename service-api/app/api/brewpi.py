import logging
import httpx
import json
from json import JSONDecodeError
from .config import get_settings

logger = logging.getLogger(__name__)

async def brewpi_temps(url):
    timeout = httpx.Timeout(10.0, connect=10.0, read=10.0)
    headers = {
        "Content-Type": "application/json",
    }

    if url != "http://" and url != "https://" and url != "":
        if not url.endswith("/"):
            url += "/"

        url += "api/temps/"

        try:
            logger.info(f"Fetching temps from brewpi device {url}")
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.get(url, headers=headers)

                if res.status_code == 200:
                    json = res.json()
                    logger.info(f"JSON response received {json}")
                    return json
                else:
                    logger.error(
                        f"Got response {res.status_code} from Brewpi device at {url}"
                    )

        except JSONDecodeError:
            logger.error(f"Unable to parse JSON response {url}")
        except httpx.ReadTimeout:
            logger.error(f"Unable to connect to device {url}")
        except httpx.ConnectError:
            logger.error(f"Unable to read from device {url}")
        except httpx.ConnectTimeout:
            logger.error(f"Unable to connect to device {url}")
    else:
        logger.error(
            f"brewpi device has no defined url, unable to fetch temperatures."
        )

    return None


async def brewpi_set_fridge_temp(url, temp):
    timeout = httpx.Timeout(10.0, connect=10.0, read=10.0)
    headers = {
        "Content-Type": "application/json",
    }

    if url != "http://" and url != "https://" and url != "":
        if not url.endswith("/"):
            url += "/"

        url += "api/mode/"

        try:
            logger.info(f"Setting target fridge temperature on {url} to {temp}")
            
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.put(url, data=json.dumps({ "mode": 'f', "setPoint": temp }), headers=headers)

                if res.status_code == 200:
                    return True
                else:
                    logger.error(
                        f"Got response {res.status_code} from Brewpi device at {url}"
                    )

        except JSONDecodeError:
            logger.error(f"Unable to parse JSON response {url}")
        except httpx.ReadTimeout:
            logger.error(f"Unable to connect to device {url}")
        except httpx.ConnectError:
            logger.error(f"Unable to read from device {url}")
        except httpx.ConnectTimeout:
            logger.error(f"Unable to connect to device {url}")
    else:
        logger.error(
            f"brewpi device has no defined url, unable to fetch temperatures."
        )

    return False
