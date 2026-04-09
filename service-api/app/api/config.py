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

"""Configuration management and settings for BrewLogger API application."""
import string
import random
import logging
from functools import lru_cache
from pydantic_settings import BaseSettings
from starlette.config import Config

logger = logging.getLogger(__name__)
config = Config()


def generate_api_key(key_length):
    """Generate a random API key of specified length."""
    characters = string.ascii_letters + string.digits
    api_key = "".join(random.choice(characters) for _ in range(key_length))
    return api_key


class Settings(BaseSettings):
    """Application settings and configuration parameters."""
    version: str = "1.0.0"
    app_name: str = "BrewLogger API"
    database_url: str = config(
        "DATABASE_URL", cast=str, default="sqlite:///./brewlogger.sqlite"
    )
    redis_host: str = config("REDIS_HOST", cast=str, default="localhost")
    api_key: str = config("API_KEY", cast=str, default="")
    api_key_enabled: bool = config("API_KEY_ENABLED", cast=bool, default=True)
    scheduler_enabled: bool = config("SCHEDULER_ENABLED", cast=bool, default=True)
    cache_enabled: bool = config("CACHE_ENABLED", cast=bool, default=True)
    brewfather_api_key: str = config("BREWFATHER_API_KEY", cast=str, default="")
    brewfather_user_key: str = config("BREWFATHER_USER_KEY", cast=str, default="")

    if api_key == "":
        api_key = generate_api_key(20)

    logger.info("db_url: %s", database_url)
    logger.info("redis_host: %s", redis_host)
    logger.info("api_key: %s", api_key)
    logger.info("api_key_enabled: %s", api_key_enabled)
    logger.info("scheduler_enabled: %s", scheduler_enabled)
    logger.info("cache_enabled: %s", cache_enabled)
    logger.info("brewfather_api_key: %s", brewfather_api_key)
    logger.info("brewfather_user_key: %s", brewfather_user_key)


@lru_cache
def get_settings() -> Settings:
    """Get or create cached application settings instance."""
    settings = Settings()
    return settings
