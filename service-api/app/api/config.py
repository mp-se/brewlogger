from functools import lru_cache
from pydantic_settings import BaseSettings
from starlette.config import Config
from fastapi.templating import Jinja2Templates
import logging

logger = logging.getLogger(__name__)
config = Config()

class Settings(BaseSettings):
    app_name: str = "BrewLogger API"
    database_url: str = config("DATABASE_URL", cast=str, default="sqlite:///./brewlogger.sqlite")
    api_key: str = config("API_KEY", cast=str, default="MySecretKey")
    api_key_enabled: bool = config("API_KEY_ENABLED", cast=bool, default=True)
    test_endpoints_enabled: bool = config("TEST_ENDPOINTS_ENABLED", cast=bool, default=True)
    javascript_debug_enabled: bool = False
    version: str = "0.2.0"
    brewfather_api_key: str = config("BREWFATHER_API_KEY", cast=str, default="")
    brewfather_user_key: str = config("BREWFATHER_USER_KEY", cast=str, default="")

    logger.info("db_url: %s", database_url)
    logger.info("api_key: %s", api_key)
    logger.info("api_key_enabled: %s", api_key_enabled)
    logger.info("test_endpoints_enabled: %s", test_endpoints_enabled)
    logger.info("javascript_debug_enabled: %s", javascript_debug_enabled)
    logger.info("brewfather_api_key: %s", brewfather_api_key)
    logger.info("brewfather_user_key: %s", brewfather_user_key)

@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    return settings

@lru_cache
def get_template() -> Jinja2Templates:
    template = Jinja2Templates(directory="template")
    return template