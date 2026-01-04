"""Fermentation control logic for managing temperature profiles and chamber controller devices."""
import logging
from datetime import datetime, timedelta

from api.db.session import create_session
from api.services import DeviceService

from .chamberctrl import chamberctrl_temps, chamberctrl_set_fridge_temp
from .log import system_log_fermentationcontrol

logger = logging.getLogger(__name__)


async def fermentation_controller_run(curr_date: datetime) -> None:
    """Check and update fermentation profiles for active fermentation steps.
    
    Args:
        curr_date: Current date to check against fermentation step dates
    """
    curr_date = datetime(curr_date.year, curr_date.month, curr_date.day)
    logger.info("Fermentation controller checking profile for date %s", curr_date)

    devices = DeviceService(create_session()).search_software("Chamber-Controller")

    for device in devices:
        logger.info("Processing chamber controller device %s, %s", device.id, device.url)

        for step in device.fermentation_step:
            first_date = datetime.strptime(step.date, "%Y-%m-%d")
            last_date = first_date + timedelta(days=step.days - 1)

            if first_date <= curr_date <= last_date:
                logger.info(
                    "Found step that is active; %s => %s - %s, Temp: %s",
                    step.order, first_date, last_date, step.temp
                )

                # Check the current temperature of the chamber controller controller.
                url = device.url
                res = await chamberctrl_temps(url)
                if res is not None:
                    # Set target temperature of the chamber controller controller
                    if res["pid_fridge_target_temp"] != step.temp:
                        old_temp = res['pid_fridge_target_temp']
                        msg = (
                            f"Assigning chamber controller device at {url} a new "
                            f"Fridge temperature of {step.temp}, old setting {old_temp}"
                        )
                        system_log_fermentationcontrol(msg, 0)

                        logger.info(
                            "Setting new target temperature to %s, current %s",
                            step.temp, res['pid_fridge_target_temp']
                        )
                        await chamberctrl_set_fridge_temp(
                            url, step.temp, device.chip_id
                        )
