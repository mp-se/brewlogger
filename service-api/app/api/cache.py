"""Redis cache management for storing temporary data and session information."""
import logging
import redis
from .config import get_settings

logger = logging.getLogger(__name__)

logger.info(
    "Creating connection pool to redis using redis://%s:6379.", get_settings().redis_host
)

pool = None

if get_settings().cache_enabled:
    pool = redis.ConnectionPool(host=get_settings().redis_host, port=6379, db=0)


def delete_key(key):
    """Delete a key from the Redis cache."""
    if pool is None:
        return

    logger.info("Removing %s.", key)
    try:
        r = redis.Redis(connection_pool=pool)
        r.delete(key)
    except redis.exceptions.ConnectionError as e:
        logger.error("Failed to connect with redis %s.", e)
    return


def find_key(key):
    """Find keys in Redis cache matching the given pattern."""
    if pool is None:
        return []

    logger.info("Searching key %s.", key)
    try:
        r = redis.Redis(connection_pool=pool)
        return r.keys(key)
    except redis.exceptions.ConnectionError as e:
        logger.error("Failed to connect with redis %s.", e)
    return []


def write_key(key, value, ttl):
    """Write a key-value pair to Redis cache with optional TTL."""
    if pool is None:
        return True

    logger.info("Writing key %s = %s ttl:%s.", key, value, ttl)
    try:
        r = redis.Redis(connection_pool=pool)
        r.set(name=key, value=str(value), ex=ttl)
        return True
    except redis.exceptions.ConnectionError as e:
        logger.error("Failed to connect with redis %s.", e)
    return False


def read_key(key):
    """Read a value from Redis cache by key."""
    if pool is None:
        return None

    logger.info("Reading key %s.", key)
    try:
        r = redis.Redis(connection_pool=pool)
        return r.get(name=key)
    except redis.exceptions.ConnectionError as e:
        logger.error("Failed to connect with redis %s.", e)

    return None


def exist_key(key):
    """Check if a key exists in Redis cache."""
    if pool is None:
        return False

    logger.info("Check key %s.", key)
    try:
        r = redis.Redis(connection_pool=pool)
        return r.exists(key)
    except redis.exceptions.ConnectionError as e:
        logger.error("Failed to connect with redis %s.", e)

    return False
