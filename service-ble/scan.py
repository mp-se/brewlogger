import asyncio
import logging
import json
import requests
import time
import os
from uuid import UUID

from construct import Array, Byte, Const, Int8sl, Int16ub, Int32ub, Struct
from construct.core import ConstError

from bleak import BleakScanner, BleakClient
from bleak.backends.device import BLEDevice
from bleak.backends.scanner import AdvertisementData

logger = logging.getLogger("tilt")


endpoint = "http://" + os.getenv("API_URL") + "/api/gravity/public"
headers = {
    "Content-Type": "application/json",
}

minium_interval = 0

ibeacon_format = Struct(
    "type_length" / Const(b"\x02\x15"),
    "uuid" / Array(16, Byte),
    "major" / Int16ub,
    "minor" / Int16ub,
    "power" / Int8sl,
)

eddystone_format = Struct(
    "type_length" / Const(b"\x20\x00"),
    "battery" / Int16ub,
    "temp" / Int16ub,
    "gravity" / Int16ub,
    "angle" / Int16ub,
    "chipid" / Int32ub,
)


class tilt:
    def __init__(self, color, uuid, time):
        self.color = color
        self.uuid = uuid
        self.time = time


# List of tilts (class tilt)
tilts = []
# Dict of gravitymon devices (ID: time)
gravitymons = {}


def init():
    tilts.append(
        tilt(
            "red",
            UUID("A495BB10-C5B1-4B44-B512-1370F02D74DE"),
            time.time() - minium_interval,
        )
    )
    tilts.append(
        tilt(
            "green",
            UUID("A495BB20-C5B1-4B44-B512-1370F02D74DE"),
            time.time() - minium_interval,
        )
    )
    tilts.append(
        tilt(
            "black",
            UUID("A495BB30-C5B1-4B44-B512-1370F02D74DE"),
            time.time() - minium_interval,
        )
    )
    tilts.append(
        tilt(
            "purple",
            UUID("A495BB40-C5B1-4B44-B512-1370F02D74DE"),
            time.time() - minium_interval,
        )
    )
    tilts.append(
        tilt(
            "orange",
            UUID("A495BB50-C5B1-4B44-B512-1370F02D74DE"),
            time.time() - minium_interval,
        )
    )
    tilts.append(
        tilt(
            "blue",
            UUID("A495BB60-C5B1-4B44-B512-1370F02D74DE"),
            time.time() - minium_interval,
        )
    )
    tilts.append(
        tilt(
            "yellow",
            UUID("A495BB70-C5B1-4B44-B512-1370F02D74DE"),
            time.time() - minium_interval,
        )
    )
    tilts.append(
        tilt(
            "pink",
            UUID("A495BB80-C5B1-4B44-B512-1370F02D74DE"),
            time.time() - minium_interval,
        )
    )


def contains(list, filter):
    for x in list:
        if filter(x):
            return True
    return False


def first(iterable, default=None):
    for item in iterable:
        return item
    return default


async def parse_gravitymon(device: BLEDevice):
    global gravitymons

    try:
        async with BleakClient(device) as client:
            for service in client.services:
                if service.uuid.startswith("0000180a-"):
                    for char in service.characteristics:
                        if "read" in char.properties and char.uuid.startswith(
                            "00002ac4-"
                        ):
                            try:
                                value = await client.read_gatt_char(char.uuid)
                                data = json.loads(value.decode())
                                logger.info("Data received: %s", json.dumps(data))
                                await client.disconnect()

                                now = time.time()
                                logger.debug(
                                    f"Found gravitymon device, checking if time has expired, min={minium_interval}s"
                                )

                                if (
                                    abs(
                                        gravitymons.get(
                                            data["ID"], now - minium_interval * 2
                                        )
                                        - now
                                    )
                                    > minium_interval
                                ):
                                    gravitymons[data["ID"]] = now
                                    try:
                                        logger.info("Posting data.")
                                        r = requests.post(
                                            endpoint, json=data, headers=headers
                                        )
                                        logger.info(f"Response {r}.")
                                    except Exception as e:
                                        logger.error(
                                            f"Failed to post data, Error: {e}"
                                        )

                            except Exception as e:
                                logger.error(f"Failed to read data, Error: {e}")
            await client.disconnect()
    except Exception:
        pass


def parse_eddystone(device: BLEDevice, advertisement_data: AdvertisementData):
    global gravitymons

    try:
        uuid = advertisement_data.service_uuids[0]
        data = advertisement_data.service_data.get(uuid)
        eddy = eddystone_format.parse(data)

        data = {
            "name": "",
            "ID": hex(eddy.chipid)[2:],
            "token": "",
            "interval": 0,
            "battery": eddy.battery / 1000,
            "gravity": eddy.gravity / 10000,
            "angle": eddy.angle / 100,
            "temperature": eddy.temp / 1000,
            "temp_units": "C",
            "RSSI": 0,
        }
        logger.info(f"Data received: {json.dumps(data)} {device.address}")

        now = time.time()
        logger.debug(
            f"Found gravitymon device, checking if time has expired, min={minium_interval}s"
        )

        if (
            abs(gravitymons.get(data["ID"], now - minium_interval * 2) - now)
            > minium_interval
        ):
            gravitymons[data["ID"]] = now
            try:
                logger.info("Posting data.")
                r = requests.post(endpoint, json=data, headers=headers)
                logger.info(f"Response {r}.")
            except Exception as e:
                logger.error(f"Failed to post data, Error: {e}")

    except ConstError:
        pass


def parse_tilt(advertisement_data: AdvertisementData):
    try:
        apple_data = advertisement_data.manufacturer_data[0x004C]
        ibeacon = ibeacon_format.parse(apple_data)
        uuid = UUID(bytes=bytes(ibeacon.uuid))
        tilt = first(x for x in tilts if x.uuid == uuid)

        if tilt is not None:
            logger.debug(
                f"Found tilt device, checking if time has expired, min={minium_interval}s"
            )

            now = time.time()

            if abs(tilt.time - now) > minium_interval:
                tilt.time = now
                tempF = ibeacon.major
                gravitySG = ibeacon.minor / 1000

                data = {
                    "color": tilt.color,
                    "gravity": gravitySG,
                    "temperature": tempF,
                    "RSSI": advertisement_data.rssi,
                }

                logger.info(f"Data received: {json.dumps(data)}")

                try:
                    logger.info("Posting data.")
                    r = requests.post(endpoint, json=data, headers=headers)
                    logger.info(f"Response {r}.")
                except Exception as e:
                    logger.error(f"Failed to post data, Error: {e}")

    except KeyError:
        pass
    except ConstError:
        pass


async def device_found(device: BLEDevice, advertisement_data: AdvertisementData):
    if device.name == "gravitymon" and any(
        "0000feaa-" in s for s in advertisement_data.service_uuids
    ):
        parse_eddystone(device=device, advertisement_data=advertisement_data)
    elif device.name == "gravitymon":
        await parse_gravitymon(device=device)
    else:
        parse_tilt(advertisement_data=advertisement_data)


async def main():
    global minium_interval

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)-15s %(name)-8s %(levelname)s: %(message)s",
    )

    t = os.getenv("MIN_INTERVAL")
    minium_interval = 5 * 60  # seconds
    if t is not None:
        minium_interval = int(t)
    logger.info(f"Minium interval = {minium_interval}, reporting to {endpoint}")

    init()
    scanner = BleakScanner(detection_callback=device_found, scanning_mode="active")

    logger.info("Scanning for tilt/gravitymon BLE devices...")
    while True:
        await scanner.start()
        await asyncio.sleep(0.1)
        await scanner.stop()


asyncio.run(main())
logger.info("Exit from tilt scanner")
