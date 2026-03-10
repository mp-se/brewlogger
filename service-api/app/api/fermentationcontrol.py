"""Fermentation control logic for managing temperature profiles and chamber controller devices."""
import logging
from datetime import datetime, timedelta

from api.db.session import create_session
from api.services import DeviceService

from .chamberctrl import chamberctrl_temps, chamberctrl_set_fridge_temp
from .log import system_log_fermentationcontrol, LogLevel

logger = logging.getLogger(__name__)


async def fermentation_controller_run(curr_date: datetime) -> None:
    """Check and update fermentation profiles for active fermentation steps.
    
    Args:
        curr_date: Current date to check against fermentation step dates
    """
    curr_date = datetime(curr_date.year, curr_date.month, curr_date.day)
    logger.info("Fermentation controller checking profile for date %s", curr_date)

    devices = DeviceService(create_session()).search_software("Chamber-Controller")
    
    if not devices:
        return

    active_steps_count = 0
    temp_changes_count = 0

    for device in devices:
        logger.info("Processing chamber controller device %s, %s", device.id, device.url)
        
        if not device.fermentation_step:
            continue

        for step in device.fermentation_step:
            first_date = datetime.strptime(step.date, "%Y-%m-%d")
            last_date = first_date + timedelta(days=step.days - 1)

            if first_date <= curr_date <= last_date:
                active_steps_count += 1
                logger.info(
                    "Found step that is active; %s => %s - %s, Temp: %s",
                    step.order, first_date, last_date, step.temp
                )
                
                # Log fermentation step activation (only on first day)
                if curr_date == first_date:
                    system_log_fermentationcontrol(
                        f"Device {device.id}: Fermentation step {step.order} activated: {step.temp}°C "
                        f"for {step.days} days ({first_date.date()} to {last_date.date()})",
                        error_code=0, log_level=LogLevel.INFO
                    )

                # Check the current temperature of the chamber controller.
                url = device.url
                res = await chamberctrl_temps(device.id, url)
                if res is not None:
                    # Set target temperature of the chamber controller
                    if res["pid_fridge_target_temp"] != step.temp:
                        old_temp = res['pid_fridge_target_temp']
                        msg = (
                            f"Device {device.id}: Assigning new fridge temperature of {step.temp}°C, "
                            f"old setting {old_temp}°C"
                        )
                        system_log_fermentationcontrol(msg, error_code=0, log_level=LogLevel.WARNING)

                        logger.info(
                            "Setting new target temperature to %s, current %s",
                            step.temp, res['pid_fridge_target_temp']
                        )
                        success = await chamberctrl_set_fridge_temp(
                            device.id, url, step.temp, device.chip_id
                        )
                        
                        if success:
                            system_log_fermentationcontrol(
                                f"Device {device.id}: Successfully set chamber controller to {step.temp}°C (was {old_temp}°C)",
                                error_code=0, log_level=LogLevel.INFO
                            )
                            temp_changes_count += 1
            
            # Log fermentation step completion (on last day when step ends)
            elif curr_date == last_date + timedelta(days=1):
                system_log_fermentationcontrol(
                    f"Device {device.id}: Fermentation step {step.order} completed (ended {last_date.date()})",
                    error_code=0, log_level=LogLevel.INFO
                )
    
    # Summary log for task completion
    if active_steps_count > 0:
        system_log_fermentationcontrol(
            f"Fermentation control task completed: {active_steps_count} active step(s), "
            f"{temp_changes_count} temperature change(s) applied",
            error_code=0, log_level=LogLevel.INFO
        )
