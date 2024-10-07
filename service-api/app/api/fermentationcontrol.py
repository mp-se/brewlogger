import logging
from datetime import datetime, timedelta
from api.db.session import create_session
from api.services import DeviceService
from .brewpi import brewpi_temps, brewpi_set_fridge_temp
from .log import system_log_fermentationcontrol

logger = logging.getLogger(__name__)


async def fermentation_controller_run(curr_date):
    curr_date = datetime(curr_date.year, curr_date.month, curr_date.day)
    logger.info(f"Fermentation controller checking profile for date {curr_date}")

    devices = DeviceService(create_session()).search_software("Brewpi")

    for device in devices:
        logger.info(f"Processing brewpi device {device.id}, {device.url}")

        for step in device.fermentation_step:
            first_date = datetime.strptime(step.date, "%Y-%m-%d")
            last_date = first_date + timedelta(days=step.days - 1)

            if curr_date >= first_date and curr_date <= last_date:
                logger.info(
                    f"Found step that is active; {step.order} => {first_date} - {last_date}, Temp: {step.temp}"
                )

                # Check the current temperature of the brewpi controller.
                url = device.url
                res = await brewpi_temps(url)
                if res is not None:
                    # Set target temperature of the brewpi controller
                    if res["FridgeSet"] != step.temp:
                        system_log_fermentationcontrol(f"Assigning Brewpi device at {url} a new Fridge temperature of {step.temp}, old setting {res['FridgeSet']}", 0)

                        logger.info(
                            f"Setting new target temperature to {step.temp}, current {res['FridgeSet']}"
                        )
                        await brewpi_set_fridge_temp(url, step.temp)
