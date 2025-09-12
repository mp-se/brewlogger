import asyncio
import logging
import json
import requests
import time
import os
import redis
from uuid import UUID

from construct import Array, Byte, Const, Int8sl, Int16ub, Int32ub, Float32b, Struct
from construct.core import ConstError

from bleak import BleakScanner, BleakClient
from bleak.backends.device import BLEDevice
from bleak.backends.scanner import AdvertisementData

logger = logging.getLogger(__file__)

# Write the following keys to redis to share the current status
# ble_<chipid>_last : <update time>
# ble_<chipid>_type : tilt/gravitymon/pressuremon/rapt/rapt2

skip_push = False
endpoint_gravity = "http://" + os.getenv("API_HOST") + "/api/gravity/public"
endpoint_pressure = "http://" + os.getenv("API_HOST") + "/api/gravity/public"
headers = {
    "Content-Type": "application/json",
}

minium_interval = 0
pool = None

def writeKey(key, value):
    if pool is None:
        return True

    ttl = 60*60*6 # 6 hours

    logger.info(f"Writing key {key} = {value} ttl:{ttl}.")
    try:
        r = redis.Redis(connection_pool=pool)
        r.set(name=key, value=str(value), ex=ttl)
        return True
    except redis.exceptions.ConnectionError as e:
        logger.error(f"Failed to connect with redis {e}.")
    return False

gravitymon_tilt_format = Struct(
    "type_length" / Const(b"\x02\x15"),
    "uuid" / Array(16, Byte),
    "major" / Int16ub,
    "minor" / Int16ub,
    "power" / Int8sl,
)

gravitymon_ibeacon_format = Struct(
    "type_length" / Const(b"\x03\x15"),
    "name" / Const(b"GRAVMON."),
    # "name" / Array(8, Byte),
    "chipid" / Int32ub,
    "angle" / Int16ub,
    "battery" / Int16ub,
    "gravity" / Int16ub,
    "temp" / Int16ub,
)

gravitymon_eddystone_format = Struct(
    "type_length" / Const(b"\x20\x00"),
    "battery" / Int16ub,
    "temp" / Int16ub,
    "gravity" / Int16ub,
    "angle" / Int16ub,
    "chipid" / Int32ub,
)

pressuremon_ibeacon_format = Struct(
    "type_length" / Const(b"\x03\x15"),
    "name" / Const(b"PRESMON."),
    # "name" / Array(8, Byte),
    "chipid" / Int32ub,
    "pressure" / Int16ub,
    "pressure1" / Int16ub,
    "battery" / Int16ub,
    "temp" / Int16ub,
)

pressuremon_eddystone_format = Struct(
    "type_length" / Const(b"\x20\x00"),
    "battery" / Int16ub,
    "temp" / Int16ub,
    "pressure" / Int16ub,
    "pressure1" / Int16ub,
    "chipid" / Int32ub,
)

chamber_ibeacon_format = Struct(
    "type_length" / Const(b"\x03\x15"),
    "name" / Const(b"CHAMBER."),
    # "name" / Array(8, Byte),
    "chipid" / Int32ub,
    "chamberTemp" / Int16ub,
    "beerTemp" / Int16ub,
)

rapt_v1_ibeacon_format = Struct(
    "tag" / Const(b"PT\x01"),
    "mac" / Array(6, Byte),
    "temp" / Int16ub,
    "gravity" / Float32b,    # float
    "x" / Int16ub,
    "y" / Int16ub,
    "z" / Int16ub,
    "battery" / Int16ub
)

rapt_v2_ibeacon_format = Struct(
    "tag" / Const(b"PT\x02"),
    "velocity_valid" / Byte,
    "velocity" / Float32b,
    "temp" / Int16ub,
    "gravity" / Float32b,
    "x" / Int16ub,
    "y" / Int16ub,
    "z" / Int16ub,
    "battery" / Int16ub
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
# Dict of pressuremon devices (ID: time)
pressuremons = {}


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


async def parse_gravitymon(device: BLEDevice, advertisement_data: AdvertisementData):
    global gravitymons

    try:
        apple_data = advertisement_data.manufacturer_data[0x004C]
        ibeacon = gravitymon_ibeacon_format.parse(apple_data)
        chipId = hex(ibeacon.chipid)[2:]

        logger.info(f"Parsing gravitymon ibeacon: {device}")

        data = {
            "name": "",
            "ID": chipId,
            "token": "",
            "interval": 0,
            "battery": ibeacon.battery / 1000,
            "gravity": ibeacon.gravity / 10000,
            "angle": ibeacon.angle / 100,
            "temperature": ibeacon.temp / 1000,
            "temp_units": "C",
            "RSSI": 0,
        }
        logger.info(f"Gravitymon data received: {json.dumps(data)} {device.address}")

        now = time.time()

        writeKey(f"ble_{chipId}_last", int(now))
        writeKey(f"ble_{chipId}_gravity", float(ibeacon.gravity / 10000))
        writeKey(f"ble_{chipId}_temp", float(ibeacon.temp / 1000))
        writeKey(f"ble_{chipId}_type", "gravitymon")

        logger.debug(
            f"Found gravitymon device, checking if time has expired, min={minium_interval}s"
        )

        if (
            abs(gravitymons.get(data["ID"], now - minium_interval * 2) - now)
            > minium_interval
        ):
            gravitymons[data["ID"]] = now
            logger.info(f"Gravitymon data received: {json.dumps(data)}")
            if not skip_push:
                try:
                    logger.info("Posting gravitymon data.")
                    r = requests.post(endpoint_gravity, json=data, headers=headers)
                    logger.info(f"Response {r}.")
                except Exception as e:
                    logger.error(f"Failed to post gravitymon data, Error: {e}")
    except KeyError:
        pass
    except ConstError:
        pass
    

def parse_gravitymon_eddystone(device: BLEDevice, advertisement_data: AdvertisementData):
    global gravitymons

    try:
        uuid = advertisement_data.service_uuids[0]
        data = advertisement_data.service_data.get(uuid)
        eddy = gravitymon_eddystone_format.parse(data)
        chipId = hex(eddy.chipid)[2:]

        logger.info(f"Parsing gravitymon eddystone: {device}")

        data = {
            "name": "",
            "ID": chipId,
            "token": "",
            "interval": 0,
            "battery": eddy.battery / 1000,
            "gravity": eddy.gravity / 10000,
            "angle": eddy.angle / 100,
            "temperature": eddy.temp / 1000,
            "temp_units": "C",
            "RSSI": 0,
        }
        logger.info(f"Gravitymon data received: {json.dumps(data)} {device.address}")

        now = time.time()

        writeKey(f"ble_{chipId}_last", int(now))
        writeKey(f"ble_{chipId}_gravity", float(eddy.gravity / 10000))
        writeKey(f"ble_{chipId}_temp", float(eddy.temp / 1000))
        writeKey(f"ble_{chipId}_type", "gravitymon")

        logger.debug(
            f"Found gravitymon device, checking if time has expired, min={minium_interval}s"
        )

        if (
            abs(gravitymons.get(data["ID"], now - minium_interval * 2) - now)
            > minium_interval
        ):
            gravitymons[data["ID"]] = now
            logger.info(f"Gravitymon data received: {json.dumps(data)}")
            if not skip_push:
                try:
                    logger.info("Posting gravitymon data.")
                    r = requests.post(endpoint_gravity, json=data, headers=headers)
                    logger.info(f"Response {r}.")
                except Exception as e:
                    logger.error(f"Failed to post gravitymon data, Error: {e}")
    except KeyError:
        pass
    except ConstError:
        pass

async def parse_pressuremon(device: BLEDevice, advertisement_data: AdvertisementData):
    global gravitymons

    try:
        apple_data = advertisement_data.manufacturer_data[0x004C]
        ibeacon = pressuremon_ibeacon_format.parse(apple_data)
        chipId = hex(ibeacon.chipid)[2:]

        logger.info(f"Parsing pressuremon ibeacon: {device}")

        data = {
            "name": "",
            "ID": chipId,
            "token": "",
            "interval": 0,
            "battery": ibeacon.battery / 1000,
            "pressure": ibeacon.pressure / 100,
            "pressure1": ibeacon.pressure1 / 100,
            "temperature": ibeacon.temp / 1000,
            "pressure-unit": "PSI",
            "temperature-unit": "C",
            "RSSI": 0,
        }

        if(ibeacon.pressure == 0xffff):
            data["pressure"] = 0
        if(ibeacon.pressure1 == 0xffff):
            data["pressure1"] = 0

        logger.info(f"Pressuremon data received: {json.dumps(data)} {device.address}")

        now = time.time()

        writeKey(f"ble_{chipId}_last", int(now))
        writeKey(f"ble_{chipId}_pressure", float(ibeacon.pressure / 100))
        writeKey(f"ble_{chipId}_temp", float(ibeacon.temp / 1000))
        writeKey(f"ble_{chipId}_type", "pressuremon")

        logger.debug(
            f"Found pressuremon device, checking if time has expired, min={minium_interval}s"
        )

        if (
            abs(pressuremons.get(data["ID"], now - minium_interval * 2) - now)
            > minium_interval
        ):
            pressuremons[data["ID"]] = now
            logger.info(f"Pressuremon data received: {json.dumps(data)}")
            if not skip_push:
                try:
                    logger.info("Posting pressuremon data.")
                    r = requests.post(endpoint_pressure, json=data, headers=headers)
                    logger.info(f"Response {r}.")
                except Exception as e:
                    logger.error(f"Failed to post pressuremon data, Error: {e}")
    except KeyError:
        pass
    except ConstError:
        pass

async def parse_chamber(device: BLEDevice, advertisement_data: AdvertisementData):
    try:
        apple_data = advertisement_data.manufacturer_data[0x004C]
        ibeacon = chamber_ibeacon_format.parse(apple_data)
        chipId = hex(ibeacon.chipid)[2:]
        logger.info(f"Parsing chamber ibeacon: {device}")

        data = {
            "ID": chipId,
            "chamber-temp": float(ibeacon.chamberTemp / 1000),
            "beer-temp": float(ibeacon.beerTemp / 1000),
            "temperature-unit": "C",
        }

        logger.info(f"Chamber data received: {json.dumps(data)} {device.address}")

        now = time.time()

        writeKey(f"ble_{chipId}_last", int(now))
        writeKey(f"ble_{chipId}_chambertemp", float(ibeacon.chamberTemp / 1000))
        writeKey(f"ble_{chipId}_beertemp", float(ibeacon.beerTemp / 1000))
        writeKey(f"ble_{chipId}_type", "chamber")

    except KeyError:
        pass
    except ConstError:
        pass

def parse_pressuremon_eddystone(device: BLEDevice, advertisement_data: AdvertisementData):
    global pressuremons

    try:
        uuid = advertisement_data.service_uuids[0]
        data = advertisement_data.service_data.get(uuid)
        eddy = pressuremon_eddystone_format.parse(data)
        chipId = hex(eddy.chipid)[2:]
        
        logger.info(f"Parsing pressuremon eddystone: {device}")

        data = {
            "name": "",
            "ID": chipId,
            "token": "",
            "interval": 0,
            "battery": eddy.battery / 1000,
            "pressure": eddy.pressure / 100,
            "pressure1": eddy.pressure1 / 100,
            "temperature": eddy.eddy / 1000,
            "pressure-unit": "PSI",
            "temperature-unit": "C",
            "RSSI": 0,
        }
        logger.info(f"Pressuremmon data received: {json.dumps(data)} {device.address}")

        now = time.time()

        writeKey(f"ble_{chipId}_last", int(now))
        writeKey(f"ble_{chipId}_pressure", float(eddy.pressure / 1000))
        writeKey(f"ble_{chipId}_temp", float(eddy.eddy / 1000))
        writeKey(f"ble_{chipId}_type", "pressuremon")

        logger.debug(
            f"Found pressuremon device, checking if time has expired, min={minium_interval}s"
        )

        if (
            abs(pressuremons.get(data["ID"], now - minium_interval * 2) - now)
            > minium_interval
        ):
            pressuremons[data["ID"]] = now
            logger.info(f"Pressuremon data received: {json.dumps(data)}")
            if not skip_push:
                try:
                    logger.info("Posting pressuremon data.")
                    r = requests.post(endpoint_pressure, json=data, headers=headers)
                    logger.info(f"Response {r}.")
                except Exception as e:
                    logger.error(f"Failed to post pressuremon data, Error: {e}")
    except KeyError:
        pass
    except ConstError:
        pass


def parse_gravitymon_tilt(advertisement_data: AdvertisementData):
    try:
        apple_data = advertisement_data.manufacturer_data[0x004C]
        ibeacon = gravitymon_tilt_format.parse(apple_data)
        uuid = UUID(bytes=bytes(ibeacon.uuid))
        tilt = first(x for x in tilts if x.uuid == uuid)

        if tilt is not None:
            logger.debug(
                f"Found tilt device, checking if time has expired, min={minium_interval}s"
            )

            if ibeacon.minor > 5000: # Check if the data is related to TILT PRO (higher resolution)
                tempF = ibeacon.major / 10
                gravitySG = ibeacon.minor / 10000
            else:
                tempF = ibeacon.major
                gravitySG = ibeacon.minor / 1000

            now = time.time()

            writeKey(f"ble_{tilt.color}_last", int(now))
            writeKey(f"ble_{tilt.color}_gravity", float(gravitySG))
            writeKey(f"ble_{tilt.color}_temp", float(tempF))
            writeKey(f"ble_{tilt.color}_type", "tilt")

            if abs(tilt.time - now) > minium_interval:
                tilt.time = now

                data = {
                    "color": tilt.color,
                    "gravity": gravitySG,
                    "temperature": tempF,
                    "RSSI": advertisement_data.rssi,
                }

                logger.info(f"Tilt data received: {json.dumps(data)}")
                if not skip_push:
                    try:
                        logger.info("Posting tilt data.")
                        r = requests.post(endpoint_gravity, json=data, headers=headers)
                        logger.info(f"Response {r}.")
                    except Exception as e:
                        logger.error(f"Failed to post tilt data, Error: {e}")
    except KeyError:
        pass
    except ConstError:
        pass

def parse_rapt_v1(device: BLEDevice, advertisement_data: AdvertisementData):
    try:
        apple_data = advertisement_data.manufacturer_data[0x4152]
        ibeacon = rapt_v1_ibeacon_format.parse(apple_data)

        data = {
            "temperature": ibeacon.temp / 128 - 273.15,
            "gravity": ibeacon.gravity / 1000,
            "mac": ":".join(f"{b:02x}" for b in ibeacon.mac),
            "x": ibeacon.x / 16,
            "y": ibeacon.y / 16,
            "z": ibeacon.z / 16,
            "battery": ibeacon.battery / 256,
            "rssi": advertisement_data.rssi,
        }
        logger.info(f"Tilt data received: {json.dumps(data)}")

        now = time.time()

        writeKey(f"ble_{device.address}_last", int(now))
        writeKey(f"ble_{device.address}_gravity", float(ibeacon.gravity / 1000))
        writeKey(f"ble_{device.address}_temp", float(ibeacon.temp / 128 - 273.15))
        writeKey(f"ble_{device.address}_type", "rapt")

    except KeyError:
        pass
    except ConstError:
        pass

def parse_rapt_v2(device: BLEDevice, advertisement_data: AdvertisementData):
    try:
        apple_data = advertisement_data.manufacturer_data[0x4152]
        ibeacon = rapt_v2_ibeacon_format.parse(apple_data)

        data = {
            "temperature": ibeacon.temp / 128 - 273.15,
            "velocity_valid": ibeacon.velocity_valid == 1,
            "velocity": ibeacon.velocity,
            "gravity": ibeacon.gravity / 1000,
            "x": ibeacon.x / 16,
            "y": ibeacon.y / 16,
            "z": ibeacon.z / 16,
            "battery": ibeacon.battery / 256,
            "rssi": advertisement_data.rssi,
        }
        logger.info(f"Tilt data received: {json.dumps(data)}")

        now = time.time()

        writeKey(f"ble_{device.address}_last", int(now))
        writeKey(f"ble_{device.address}_gravity", float(ibeacon.gravity / 1000))
        writeKey(f"ble_{device.address}_temp", float(ibeacon.temp / 128 - 273.15))
        writeKey(f"ble_{device.address}_type", "rapt2")

    except KeyError:
        pass
    except ConstError:
        pass

async def device_found(device: BLEDevice, advertisement_data: AdvertisementData):
    # logger.info(f"Found: {device.name} {advertisement_data.service_uuids}")

    if device.name == "gravitymon" and any(
        "0000feaa-" in s for s in advertisement_data.service_uuids
    ):
        parse_gravitymon_eddystone(device=device, advertisement_data=advertisement_data)
    elif device.name == "pressuremon" and any(
        "0000feaa-" in s for s in advertisement_data.service_uuids
    ):
        parse_pressuremon_eddystone(device=device, advertisement_data=advertisement_data)
    else:
        # Try the other formats and see what matches
        await parse_gravitymon(device=device, advertisement_data=advertisement_data)
        await parse_pressuremon(device=device, advertisement_data=advertisement_data)
        await parse_chamber(device=device, advertisement_data=advertisement_data)
        parse_gravitymon_tilt(advertisement_data=advertisement_data)
        parse_rapt_v1(device=device, advertisement_data=advertisement_data)
        parse_rapt_v2(device=device, advertisement_data=advertisement_data)


async def main():
    global minium_interval
    global pool

    redis_host = os.getenv("REDIS_HOST")

    if redis_host is None:
        logger.warning("No REDIS_HOST env variable, not sharing status...")
    else:
        logger.info(f"Using redis {redis_host}")
        pool = redis.ConnectionPool(host=redis_host, port=6379, db=0)

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)-15s %(name)-8s %(levelname)s: %(message)s",
    )

    t = os.getenv("MIN_INTERVAL")
    minium_interval = 5 * 60  # seconds
    if t is not None:
        minium_interval = int(t)
    logger.info(f"Minium interval = {minium_interval}, reporting to {endpoint_gravity} + {endpoint_pressure}")

    init()
    scanner = BleakScanner(detection_callback=device_found, scanning_mode="active")

    logger.info("Scanning for tilt/gravitymon/pressuremon BLE devices...")
    while True:
        await scanner.start()
        await asyncio.sleep(0.1)
        await scanner.stop()


asyncio.run(main())
logger.info("Exit from scanner")
