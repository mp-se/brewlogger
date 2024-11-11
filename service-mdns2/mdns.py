import asyncio
import logging
import time
import os
import redis
import json
from json import JSONDecodeError
from typing import Optional, cast

from zeroconf import DNSQuestionType, IPVersion, ServiceStateChange, Zeroconf
from zeroconf.asyncio import AsyncServiceBrowser, AsyncServiceInfo, AsyncZeroconf

ALL_SERVICES = [
    "_pressuremon._tcp.local.",
    "_gravitymon._tcp.local.",
    "_gravitymon-gateway._tcp.local.",
    "_kegmon._tcp.local.",
    "_brewpi._tcp.local.",
    "_chamberctl._tcp.local.",
    # "_http._tcp.local.",
    # "_espfwk._tcp.local."
    # "_airplay._tcp.local."
]

logger = logging.getLogger(__name__)
scan_result = []

# Configuration
redis_url = ""
redis_pool = None

async def scan_for_mdns(timeout):
    logger.info(f"Scanning for mdns devices, timout {timeout}")
    scan_result.clear()
    runner = AsyncDeviceScanner(timeout)
    await runner.async_run()
    logger.info(f"Scanning completed {scan_result}")
    return scan_result


def async_on_service_state_change(
    zeroconf: Zeroconf, service_type: str, name: str, state_change: ServiceStateChange
) -> None:
    logger.debug(f"Service {name} of type {service_type} state changed: {state_change}")
    asyncio.ensure_future(_async_show_service_info(zeroconf, service_type, name))


async def _async_show_service_info(
    zeroconf: Zeroconf, service_type: str, name: str
) -> None:
    info = AsyncServiceInfo(service_type, name)
    await info.async_request(zeroconf, 3000, question_type=DNSQuestionType.QU)
    logger.debug("Info from zeroconf.get_service_info: %r" % (info))
    if info:
        addresses = [
            "%s:%d" % (addr, cast(int, info.port)) for addr in info.parsed_addresses()
        ]
        type = info.type
        adresses = ", ".join(addresses)
        host = info.server
        logger.info(f"Endpoint: {type} {adresses} {host}")
        mdns = {"type": type, "host": str(adresses), "name": host.strip(".")}
        scan_result.append(mdns)


class AsyncDeviceScanner:
    def __init__(self, timeout) -> None:
        self.start = time.time()
        self.timeout = timeout
        self.aiobrowser: Optional[AsyncServiceBrowser] = None
        self.aiozc: Optional[AsyncZeroconf] = None

    async def async_run(self) -> None:
        self.aiozc = AsyncZeroconf(ip_version=IPVersion.V4Only)
        await self.aiozc.zeroconf.async_wait_for_start()
        logging.info(
            "\nBrowsing %s service(s), press Ctrl-C to exit...\n" % ALL_SERVICES
        )
        kwargs = {
            "handlers": [async_on_service_state_change],
            "question_type": DNSQuestionType.QU,
        }
        self.aiobrowser = AsyncServiceBrowser(
            self.aiozc.zeroconf, ALL_SERVICES, **kwargs
        )
        while (time.time() - self.start) < self.timeout:
            await asyncio.sleep(1)
        logging.info("Scanning completed, exiting.")
        await self.async_close()

    async def async_close(self) -> None:
        assert self.aiozc is not None
        assert self.aiobrowser is not None
        await self.aiobrowser.async_cancel()
        await self.aiozc.async_close()


def writeKey(key, value, ttl):
    if redis_pool is None:
        return True

    logger.info(f"Writing key {key} = {value} ttl:{ttl}.")
    try:
        r = redis.Redis(connection_pool=redis_pool)
        r.set(name=key, value=str(value), ex=ttl)
        return True
    except redis.exceptions.ConnectionError as e:
        logger.error(f"Failed to connect with redis {e}.")
    return False


async def task_scan_mdns():
    logger.info("Scanning for mdns devices")

    mdns_list = await scan_for_mdns(20)

    for mdns in mdns_list:
        try:
            key = mdns["host"] + mdns["type"]
            writeKey(key, json.dumps(mdns), ttl=900)
        except JSONDecodeError:
            logger.error(f"Unable to parse JSON response {mdns}")


async def main():
    while(True):
        await task_scan_mdns()

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)-15s %(name)-8s %(levelname)s: %(message)s",
    )

    redis_url = os.getenv("REDIS_URL")
    if redis_url is None:
        logger.error("No REDIS URL is defined, cannot start program")
        exit(-1)

    redis_pool = redis.ConnectionPool(host=redis_url, port=6379, db=0)
    asyncio.run(main())
