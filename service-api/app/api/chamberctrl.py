import logging
import httpx
import json
from json import JSONDecodeError
from .log import system_log_fermentationcontrol

logger = logging.getLogger(__name__)


async def chamberctrl_temps(url):
    timeout = httpx.Timeout(10.0, connect=10.0, read=10.0)
    headers = {
        "Content-Type": "application/json",
    }

    if url != "http://" and url != "https://" and url != "":
        if not url.endswith("/"):
            url += "/"

        url += "api/temps"

        try:
            logger.info(f"Fetching temps from chamber controller device {url}")
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.get(url, headers=headers)

                if res.status_code == 200:
                    json = res.json()
                    logger.info(f"JSON response received {json}")
                    return json
                else:
                    system_log_fermentationcontrol(
                        f"Http response {res.status_code} from chamber controller device {url}",
                        res.status_code,
                    )
                    logger.error(
                        f"Got response {res.status_code} from chamber controller device at {url}"
                    )

        except JSONDecodeError:
            system_log_fermentationcontrol(
                f"Failed to parse temps from chamber controller {url}, JSONDecodeError", 0
            )
            logger.error(f"Unable to parse JSON response {url}")
        except httpx.ReadTimeout:
            system_log_fermentationcontrol(
                f"Failed to connect with chamber controller {url}, ReadTimeout", 0
            )
            logger.error(f"Unable to connect to device {url}")
        except httpx.ConnectError:
            system_log_fermentationcontrol(
                f"Failed to connect with chamber controller {url}, ConnectError", 0
            )
            logger.error(f"Unable to read from device {url}")
        except httpx.ConnectTimeout:
            system_log_fermentationcontrol(
                f"Failed to connect with chamber controller {url}, ConnectTimeout", 0
            )
            logger.error(f"Unable to connect to device {url}")
    else:
        system_log_fermentationcontrol(
            "chamber controller device has no defined URL, unable to fetch temperatures", 0
        )
        logger.error("chamber controller device has no defined url, unable to fetch temperatures.")

    return None


async def chamberctrl_set_fridge_temp(url, temp, chipid):
    logger.info(f"Set fridge temperature {url}, {temp}, {chipid}")

    timeout = httpx.Timeout(10.0, connect=10.0, read=10.0)
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + chipid
    }

    if url != "http://" and url != "https://" and url != "":
        if not url.endswith("/"):
            url += "/"

        url += "api/mode"

        try:
            logger.info(f"Setting target fridge temperature on {url} to {temp}")

            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.put(
                    url,
                    data=json.dumps({"new_mode": "f", "new_temperature": temp}),
                    headers=headers,
                )

                if res.status_code == 200:
                    return True
                else:
                    system_log_fermentationcontrol(
                        f"Http response {res.status_code} from chamber controller device {url}",
                        res.status_code,
                    )
                    logger.error(
                        f"Got response {res.status_code} from chamber controller device at {url}"
                    )

        except JSONDecodeError:
            system_log_fermentationcontrol(
                f"Failed to parse temps from chamber controller {url}, JSONDecodeError", 0
            )
            logger.error(f"Unable to parse JSON response {url}")
        except httpx.ReadTimeout:
            system_log_fermentationcontrol(
                f"Failed to connect with chamber controller {url}, ReadTimeout", 0
            )
            logger.error(f"Unable to connect to device {url}")
        except httpx.ConnectError:
            system_log_fermentationcontrol(
                f"Failed to connect with chamber controller {url}, ConnectTimeout", 0
            )
            logger.error(f"Unable to read from device {url}")
        except httpx.ConnectTimeout:
            system_log_fermentationcontrol(
                f"Failed to connect with chamber controller {url}, ConnectTimeout", 0
            )
            logger.error(f"Unable to connect to device {url}")
    else:
        system_log_fermentationcontrol(
            "Chamber controller device has no defined URL, unable to fetch temperatures", 0
        )
        logger.error("Chamber controller device has no defined url, unable to fetch temperatures.")

    return False
