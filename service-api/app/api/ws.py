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

"""WebSocket connection manager for broadcasting real-time events to connected clients."""
import logging
import json
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class WsConnectionManager:
    """Manage WebSocket connections for broadcasting real-time events."""
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        """Accept and register a new WebSocket connection.
        
        Args:
            websocket: The WebSocket connection to register
        """
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        """Unregister a WebSocket connection.
        
        Args:
            websocket: The WebSocket connection to unregister
        """
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str) -> None:
        """Broadcast a message to all connected WebSocket clients.
        
        Args:
            message: JSON string message to send to all clients
        """
        for connection in self.active_connections:
            await connection.send_text(message)


ws_manager = WsConnectionManager()


async def notify_clients(table: str, method: str, record_id: int) -> None:
    """Notify all connected clients of a data change event.
    
    Args:
        table: The database table name that changed
        method: The operation type (create, update, delete)
        record_id: The ID of the affected record
    """
    try:
        await ws_manager.broadcast(
            json.dumps({"method": method, "table": table, "id": record_id})
        )
    except (RuntimeError, TypeError) as e:
        logger.error("Failed to notify clients %s", e)
