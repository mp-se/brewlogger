# SPDX-License-Identifier: GPL-3.0-or-later
# Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger

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
