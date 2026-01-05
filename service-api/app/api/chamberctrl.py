"""Chamber controller integration for temperature and control management."""
import json
import logging
from json import JSONDecodeError
from typing import Optional, Any

import httpx

from .log import system_log_fermentationcontrol

logger = logging.getLogger(__name__)


async def chamberctrl_temps(url: str) -> Optional[dict[str, Any]]:
    """Fetch current temperature readings from chamber controller device.
    
    Args:
        url: The base URL of the chamber controller device
    
    Returns:
        Dictionary containing temperature data if successful, None if error or invalid URL
    """
    timeout = httpx.Timeout(10.0, connect=10.0, read=10.0)
    headers = {
        "Content-Type": "application/json",
    }

    if url not in ("http://", "https://", ""):
        if not url.endswith("/"):
            url += "/"

        url += "api/temps"

        try:
            logger.info("Fetching temps from chamber controller device %s", url)
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.get(url, headers=headers)

                if res.status_code == 200:
                    json_data = res.json()
                    logger.info("JSON response received %s", json_data)
                    return json_data
                system_log_fermentationcontrol(
                    f"Http response {res.status_code} from chamber controller device {url}",
                    res.status_code,
                )
                logger.error(
                    "Got response %s from chamber controller device at %s", res.status_code, url
                )

        except JSONDecodeError:
            system_log_fermentationcontrol(
                f"Failed to parse temps from chamber controller {url}, JSONDecodeError",
                0,
            )
            logger.error("Unable to parse JSON response %s", url)
        except httpx.ReadTimeout:
            system_log_fermentationcontrol(
                f"Failed to connect with chamber controller {url}, ReadTimeout", 0
            )
            logger.error("Unable to connect to device %s", url)
        except httpx.ConnectError:
            system_log_fermentationcontrol(
                f"Failed to connect with chamber controller {url}, ConnectError", 0
            )
            logger.error("Unable to read from device %s", url)
        except httpx.ConnectTimeout:
            system_log_fermentationcontrol(
                f"Failed to connect with chamber controller {url}, ConnectTimeout", 0
            )
            logger.error("Unable to connect to device %s", url)
    else:
        system_log_fermentationcontrol(
            "chamber controller device has no defined URL, unable to fetch temperatures",
            0,
        )
        logger.error(
            "chamber controller device has no defined url, unable to fetch temperatures."
        )

    return None


async def chamberctrl_set_fridge_temp(url: str, temp: float, chipid: str) -> bool:
    """Set target fridge temperature on chamber controller device.
    
    Args:
        url: The base URL of the chamber controller device
        temp: Target temperature in Celsius
        chipid: Chip ID for authorization header
    
    Returns:
        True if successful, False if error or invalid URL
    """
    logger.info("Set fridge temperature %s, %s, %s", url, temp, chipid)

    timeout = httpx.Timeout(10.0, connect=10.0, read=10.0)
    headers = {"Content-Type": "application/json", "Authorization": "Bearer " + chipid}

    if url not in ("http://", "https://", ""):
        if not url.endswith("/"):
            url += "/"

        url += "api/mode"

        try:
            logger.info("Setting target fridge temperature on %s to %s", url, temp)

            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.put(
                    url,
                    data=json.dumps({"new_mode": "f", "new_temperature": temp}),
                    headers=headers,
                )

                if res.status_code == 200:
                    system_log_fermentationcontrol(
                        f"Successfully set fridge temperature on device {url} to {temp}°C", 100
                    )
                    return True
                system_log_fermentationcontrol(
                    f"Http response {res.status_code} from chamber controller device {url}",
                    res.status_code,
                )
                logger.error(
                    "Got response %s from chamber controller device at %s", res.status_code, url
                )

        except JSONDecodeError:
            system_log_fermentationcontrol(
                f"Failed to parse temps from chamber controller {url}, JSONDecodeError",
                0,
            )
            logger.error("Unable to parse JSON response %s", url)
        except httpx.ReadTimeout:
            system_log_fermentationcontrol(
                f"Failed to connect with chamber controller {url}, ReadTimeout", 0
            )
            logger.error("Unable to connect to device %s", url)
        except httpx.ConnectError:
            system_log_fermentationcontrol(
                f"Failed to connect with chamber controller {url}, ConnectTimeout", 0
            )
            logger.error("Unable to read from device %s", url)
        except httpx.ConnectTimeout:
            system_log_fermentationcontrol(
                f"Failed to connect with chamber controller {url}, ConnectTimeout", 0
            )
            logger.error("Unable to connect to device %s", url)
    else:
        system_log_fermentationcontrol(
            "Chamber controller device has no defined URL, unable to fetch temperatures",
            0,
        )
        logger.error(
            "Chamber controller device has no defined url, unable to fetch temperatures."
        )

    return False
