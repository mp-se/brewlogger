import logging
import redis
from .config import get_settings

logger = logging.getLogger(__name__)

logger.info(
    f"Creating connection pool to redis using redis://{get_settings().redis_host}:6379."
)

pool = None

if get_settings().cache_enabled:
    pool = redis.ConnectionPool(host=get_settings().redis_host, port=6379, db=0)


def deleteKey(key):
    if pool is None:
        return

    logger.info(f"Removing {key}.")
    try:
        r = redis.Redis(connection_pool=pool)
        r.delete(key)
    except redis.exceptions.ConnectionError as e:
        logger.error(f"Failed to connect with redis {e}.")
    return


def findKey(key):
    if pool is None:
        return []

    logger.info(f"Searching key {key}.")
    try:
        r = redis.Redis(connection_pool=pool)
        return r.keys(key)
    except redis.exceptions.ConnectionError as e:
        logger.error(f"Failed to connect with redis {e}.")
    return []


def writeKey(key, value, ttl):
    if pool is None:
        return True

    logger.info(f"Writing key {key} = {value} ttl:{ttl}.")
    try:
        r = redis.Redis(connection_pool=pool)
        r.set(name=key, value=str(value), ex=ttl)
        return True
    except redis.exceptions.ConnectionError as e:
        logger.error(f"Failed to connect with redis {e}.")
    return False


def readKey(key):
    if pool is None:
        return None

    logger.info(f"Reading key {key}.")
    try:
        r = redis.Redis(connection_pool=pool)
        return r.get(name=key)
    except redis.exceptions.ConnectionError as e:
        logger.error(f"Failed to connect with redis {e}.")

    return None


def existKey(key):
    if pool is None:
        return False

    logger.info(f"Check key {key}.")
    try:
        r = redis.Redis(connection_pool=pool)
        return r.exists(key)
    except redis.exceptions.ConnectionError as e:
        logger.error(f"Failed to connect with redis {e}.")

    return False
