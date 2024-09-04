import string
import random
import logging
from functools import lru_cache
from pydantic_settings import BaseSettings
from starlette.config import Config

logger = logging.getLogger(__name__)
config = Config()


def generate_api_key(key_length):
    characters = string.ascii_letters + string.digits
    api_key = "".join(random.choice(characters) for _ in range(key_length))
    return api_key


class Settings(BaseSettings):
    version: str = "0.5.0"
    app_name: str = "BrewLogger API"
    database_url: str = config(
        "DATABASE_URL", cast=str, default="sqlite:///./brewlogger.sqlite"
    )
    api_key: str = config("API_KEY", cast=str, default="")
    api_key_enabled: bool = config("API_KEY_ENABLED", cast=bool, default=True)
    brewfather_api_key: str = config("BREWFATHER_API_KEY", cast=str, default="")
    brewfather_user_key: str = config("BREWFATHER_USER_KEY", cast=str, default="")

    if api_key == "":
        api_key = generate_api_key(20)

    logger.info("db_url: %s", database_url)
    logger.info("api_key: %s", api_key)
    logger.info("api_key_enabled: %s", api_key_enabled)
    logger.info("brewfather_api_key: %s", brewfather_api_key)
    logger.info("brewfather_user_key: %s", brewfather_user_key)


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    return settings
