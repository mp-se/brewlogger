import logging
import httpx
from json import JSONDecodeError
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from .config import get_settings
from .cache import writeKey

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()
schedulerRunning = False
headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}


def scheduler_shutdown():
    logger.info("Shutting down scheduler")
    scheduler.shutdown()


async def fetch_brewpi_temps(device):
    print(device)
    logger.info(f"Processing brewpi device {device['id']}, {device['url']}")
    url = device["url"]

    if url != "http://" and url != "https://" and url != "":
        if not url.endswith("/"):
            url += "/"

        url += "api/temps/"

        try:
            timeout = httpx.Timeout(10.0, connect=10.0, read=10.0)

            headers = {
                "Content-Type": "application/json",
            }

            logger.info(f"Fetching temps from brewpi device {url}")
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.get(url, headers=headers)

                if res.status_code == 200:
                    json = res.json()
                    logger.info(f"JSON response received {json}")

                    key = "brewpi_" + str(device["id"]) + "_beer_temp"
                    writeKey(key, json["BeerTemp"])
                    key = "brewpi_" + str(device["id"]) + "_fridge_temp"
                    writeKey(key, json["FridgeTemp"])
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
            f"brewpi device {device['id']} has no defined url, unable to find temperatures."
        )


async def task_fetch_brewpi_temps():
    logger.info(f"Task: fetch_brewpi_temps is running at {datetime.now()} running={schedulerRunning}")

    # Avoid having multple paralell executions
    if schedulerRunning:
        return

    schedulerRunning = True

    try:
        timeout = httpx.Timeout(10.0, connect=10.0, read=10.0)
        url = get_settings().self_url + "/api/device/?software=Brewpi"
        async with httpx.AsyncClient(timeout=timeout) as client:
            logger.info("Request using get %s", url)
            res = await client.get(url, headers=headers)
            logger.info(f"Reqeust to {url} returned code {res.status_code}")

            for d in res.json():
                await fetch_brewpi_temps(d)

    except httpx.ReadTimeout:
        logger.error(f"Unable to connect to device {url}")
    except httpx.ConnectError:
        logger.error(f"Unable to read from device {url}")
    except httpx.ConnectTimeout:
        logger.error(f"Unable to connect to device {url}")
    except Exception as e:
        logger.error(f"Unknown error {e}")

    schedulerRunning = False


def scheduler_setup(app):
    global app_client
    logger.info("Setting up scheduler")
    app_client = app

    # Setting up task to fetch brewpi temperatures and store these in redis cache
    trigger = CronTrigger(second=0)
    scheduler.add_job(task_fetch_brewpi_temps, trigger)
    scheduler.start()
