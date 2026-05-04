# BrewLogger
# Copyright (c) 2021-2026 Magnus
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Alternatively, this software may be used under the terms of a
# commercial license. See LICENSE_COMMERCIAL for details.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
#

"""Fermentation control logic for managing temperature profiles and chamber controller devices."""
import logging
from datetime import datetime, timedelta

from api.db.session import create_session
from api.services import DeviceService

from .chamberctrl import chamberctrl_temps, chamberctrl_set_mode
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

        last_step = max(device.fermentation_step, key=lambda s: s.order)

        for step in device.fermentation_step:
            first_date = datetime.strptime(step.date, "%Y-%m-%d")
            last_date = first_date + timedelta(days=step.days - 1)
            url = device.url

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

                res = await chamberctrl_temps(device.id, url)
                current_temp = res["pid_fridge_target_temp"] if res is not None else "unknown"
                logger.info(
                    "Setting %s temperature to %s (current %s)",
                    step.control, step.temp, current_temp
                )
                system_log_fermentationcontrol(
                    f"Device {device.id}: Setting {step.control} temperature to {step.temp}°C (current {current_temp}°C)",
                    error_code=0, log_level=LogLevel.INFO
                )
                success = await chamberctrl_set_mode(
                    device.id, url, step.temp, device.chip_id, step.control
                )
                if success:
                    system_log_fermentationcontrol(
                        f"Device {device.id}: Successfully set {step.control} temperature to {step.temp}°C",
                        error_code=0, log_level=LogLevel.INFO
                    )
                    temp_changes_count += 1
            
            elif curr_date == last_date + timedelta(days=1):
                system_log_fermentationcontrol(
                    f"Device {device.id}: Fermentation step {step.order} completed (ended {last_date.date()})",
                    error_code=0, log_level=LogLevel.INFO
                )

                if step.order == last_step.order:
                    logger.info(
                        "Restoring fridge settings as before fermentation control started."
                    )

                    success = await chamberctrl_set_mode(
                        device.id, url, step.temp, device.chip_id, "restore"
                    )
                    if success:
                        system_log_fermentationcontrol(
                            f"Device {device.id}: Successfully restored fridge control after final step {step.order}",
                            error_code=0, log_level=LogLevel.INFO
                        )

    # Summary log for task completion
    if active_steps_count > 0:
        system_log_fermentationcontrol(
            f"Fermentation control task completed: {active_steps_count} active step(s), "
            f"{temp_changes_count} temperature change(s) applied",
            error_code=0, log_level=LogLevel.INFO
        )
