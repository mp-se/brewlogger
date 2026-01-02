"""WebSocket connection manager for broadcasting real-time events to connected clients."""
import logging
import json
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class WsConnectionManager:
    """Manage WebSocket connections for broadcasting real-time events."""
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        """Unregister a WebSocket connection."""
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        """Broadcast a message to all connected WebSocket clients."""
        for connection in self.active_connections:
            await connection.send_text(message)


ws_manager = WsConnectionManager()


async def notify_clients(table, method, record_id):
    """Notify all connected clients of a data change event."""
    try:
        await ws_manager.broadcast(
            json.dumps({"method": method, "table": table, "id": record_id})
        )
    except (RuntimeError, TypeError) as e:
        logger.error("Failed to notify clients %s", e)
