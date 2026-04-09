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
