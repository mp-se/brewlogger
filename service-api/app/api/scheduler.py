"""Background job scheduler for periodic tasks like syncing Brewfather data and cleaning logs."""
import json
import logging
from datetime import datetime

from fastapi import FastAPI
import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from api.db.session import create_session
from api.services import BrewLoggerService, DeviceService

from .config import get_settings
from .cache import write_key, find_key, read_key, delete_key
from .chamberctrl import chamberctrl_temps
from .fermentationcontrol import fermentation_controller_run
from .log import system_log_scheduler, system_log_purge, receive_log_purge

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()
headers = {
    "Authorization": "Bearer " + get_settings().api_key,
    "Content-Type": "application/json",
}


def scheduler_shutdown():
    """Gracefully shutdown the background job scheduler."""
    logger.info("Shutting down scheduler")
    scheduler.shutdown()


async def task_fetch_chamberctrl_temps():
    """Fetch current temperatures from chamber controller devices."""
    logger.info("Task: fetch_chamberctrl_temps is running at %s", datetime.now())

    devices = DeviceService(create_session()).search_software("Chamber-Controller")
    for device in devices:
        logger.info("Processing chamber controller device %s, %s", device.id, device.url)
        url = device.url

        if url != "":
            res = await chamberctrl_temps(url)
            if res is not None:
                logger.info(
                    'Chamber controller temps, beer=%s, chamber=%s',
                    res["pid_beer_temp"], res["pid_fridge_temp"]
                )
                key = "chamber_" + str(device.id) + "_beer_temp"
                write_key(key, res["pid_beer_temp"], ttl=300)
                key = "chamber_" + str(device.id) + "_fridge_temp"
                write_key(key, res["pid_fridge_temp"], ttl=300)


async def task_forward_gravity():
    """Forward gravity data to configured external URL."""
    logger.info("Task: task_forward_gravity is running at %s", datetime.now())

    settings = BrewLoggerService(create_session()).list()[0]

    if settings.gravity_forward_url == "":
        return  # Nothing to do

    url = settings.gravity_forward_url
    keys = find_key("gravity_*")
    for k in keys:
        value = read_key(k).decode()

        try:
            value = json.loads(value)

            # If using brewfather, requires [SG] in name if that is the gravity unit used.
            if (
                settings.gravity_format == "SG"
                and value["name"].find("[SG]") == -1
                and url.find(".brewfather.") >= 0
            ):
                value["name"] = value["name"] + "[SG]"

            logger.info("Task: Processing %s with value %s forwarding to %s", k, value, url)

            timeout = httpx.Timeout(10.0, connect=10.0, read=10.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                logger.info("Request using get %s", url)
                res = await client.post(url, headers=headers, data=json.dumps(value))
                logger.info("Reqeust to %s returned code %s", url, res.status_code)
                delete_key(k)

        except httpx.ReadTimeout:
            system_log_scheduler(f"Failed to forward gravity to {url}, ReadTimeout", 0)
            logger.error("Unable to connect to device %s", url)
        except httpx.ConnectError:
            system_log_scheduler(f"Failed to forward gravity to {url}, ConnectError", 0)
            logger.error("Unable to read from device %s", url)
        except httpx.ConnectTimeout:
            system_log_scheduler(
                f"Failed to forward gravity to {url}, ConnectTimeout", 0
            )
            logger.error("Unable to connect to device %s", url)
        except httpx.RequestError as e:
            system_log_scheduler(
                f"Failed to forward gravity to {url}, Uknown error {e}", 0
            )
            logger.error("Unknown exception %s", e)


async def task_fermentation_control():
    """Run fermentation control logic for active batches."""
    logger.info("Task: task_fermentation_control is running at %s", datetime.now())
    await fermentation_controller_run(datetime.now())


async def task_check_database():
    """Check database health and purge old records."""
    logger.info("Task: task_check_database is running at %s", datetime.now())
    system_log_purge(days=90)
    receive_log_purge(days=90)


def scheduler_setup(application: FastAPI):  # pylint: disable=unused-argument
    """Initialize and configure background job scheduler with tasks."""
    logger.info("Setting up scheduler")

    if get_settings().scheduler_enabled:
        # Setting up task to fetch chamber controller temperatures and store these in redis cache
        scheduler.add_job(
            task_fetch_chamberctrl_temps, "interval", minutes=5, max_instances=1
        )

        # Setting up task to forward gravity data to remove endpoint from redis cache
        scheduler.add_job(task_forward_gravity, "interval", minutes=15, max_instances=1)

        # Setting up task to scan for mdns data
        scheduler.add_job(task_check_database, "interval", hours=6, max_instances=1)

        # Setting up task to run fermentation control
        scheduler.add_job(
            task_fermentation_control, "interval", minutes=5, max_instances=1
        )
    else:
        logger.warning("Scheduler disabled in configuration")

    scheduler.start()
