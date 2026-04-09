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


def delete_key(key: str | bytes) -> None:
    """Delete a key from the Redis cache.
    
    Args:
        key: The key to delete from cache (str or bytes)
    """
    if pool is None:
        return

    logger.info("Removing %s.", key)
    try:
        r = redis.Redis(connection_pool=pool)
        r.delete(key)
    except redis.exceptions.ConnectionError as e:
        logger.error("Failed to connect with redis %s.", e)
    return


def find_key(key: str) -> list[bytes]:
    """Find keys in Redis cache matching the given pattern.
    
    Args:
        key: Pattern to search for (supports wildcards like *)
    
    Returns:
        List of matching keys as bytes, or empty list if none found or cache disabled
    """
    if pool is None:
        return []

    logger.info("Searching key %s.", key)
    try:
        r = redis.Redis(connection_pool=pool)
        return r.keys(key)
    except redis.exceptions.ConnectionError as e:
        logger.error("Failed to connect with redis %s.", e)
    return []


def write_key(key: str, value: str, ttl: int) -> bool:
    """Write a key-value pair to Redis cache with optional TTL.
    
    Args:
        key: The key to write
        value: The value to store (will be converted to string)
        ttl: Time to live in seconds
    
    Returns:
        True if successful, False if cache disabled or connection error
    """
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


def read_key(key: str | bytes) -> bytes | None:
    """Read a value from Redis cache by key.
    
    Args:
        key: The key to read (str or bytes)
    
    Returns:
        The value as bytes if found, None if key doesn't exist or cache disabled
    """
    if pool is None:
        return None

    logger.info("Reading key %s.", key)
    try:
        r = redis.Redis(connection_pool=pool)
        return r.get(name=key)
    except redis.exceptions.ConnectionError as e:
        logger.error("Failed to connect with redis %s.", e)

    return None


def exist_key(key: str | bytes) -> bool:
    """Check if a key exists in Redis cache.
    
    Args:
        key: The key to check (str or bytes)
    
    Returns:
        True if key exists, False if it doesn't exist or cache disabled
    """
    if pool is None:
        return False

    logger.info("Check key %s.", key)
    try:
        r = redis.Redis(connection_pool=pool)
        return r.exists(key)
    except redis.exceptions.ConnectionError as e:
        logger.error("Failed to connect with redis %s.", e)

    return False
