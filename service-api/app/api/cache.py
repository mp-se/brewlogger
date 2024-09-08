import logging
import redis
from .config import get_settings

logger = logging.getLogger(__name__)
ttl = 60 * 5 # 5 minutes

logger.info(f"Creating connection pool to redis using redis://{get_settings().redis_url}:6379.")
pool = redis.ConnectionPool(host=get_settings().redis_url, port=6379, db=0)

def writeKey(key, value):
    logger.info(f"Writing key {key} = {value} ttl:{ttl}s.")
    try:
        r = redis.Redis(connection_pool=pool)
        r.set(name=key, value=str(value), ex=ttl)
        return True
    except redis.exceptions.ConnectionError as e:
        logger.error(f"Failed to connect with redis {e}.")
    return False

def readKey(key):
    logger.info(f"Reading key {key}.")
    try:
        r = redis.Redis(connection_pool=pool)
        return r.get(name=key)    
    except redis.exceptions.ConnectionError as e:
        logger.error(f"Failed to connect with redis {e}.")

    return None

def existKey(key):
    logger.info(f"Check key {key}.")
    try:
        r = redis.Redis(connection_pool=pool)
        return r.exists(key)    
    except redis.exceptions.ConnectionError as e:
        logger.error(f"Failed to connect with redis {e}.")

    return False