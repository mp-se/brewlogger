import logging
import json
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class WsConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


ws_manager = WsConnectionManager()


async def notifyClients(table, method, record_id):
    try:
        await ws_manager.broadcast(
            json.dumps({"method": method, "table": table, "id": record_id})
        )
    except Exception as e:
        logger.error(f"Failed to notify clients {e}")
