"""API key authentication and security management for BrewLogger API."""
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .config import get_settings
from .log import system_log_security

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)


def api_key_auth(api_key: str = Depends(oauth2_scheme)) -> None:
    """Validate API key for endpoint authentication.
    
    Args:
        api_key: The API key from the request header
    
    Raises:
        HTTPException: If API key is invalid and key validation is enabled
    """
    settings = get_settings()
    if settings.api_key_enabled:
        logger.info("Validating access token")
        if api_key != settings.api_key:
            system_log_security("Invalid token ***** in request", 401)
            logger.error("Api-key is not valid: %s", api_key)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Access forbidden"
            )
    else:
        logger.info("Access token validation is disabled configuration")
