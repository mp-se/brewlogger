"""Tests for WebSocket manager functionality."""
import asyncio
import pytest
from unittest.mock import AsyncMock, MagicMock
from api.ws import WsConnectionManager, ws_manager, notify_clients
from .conftest import truncate_database


def test_init(app_client):
    """Initialize database for ws tests"""
    truncate_database()


@pytest.mark.asyncio
async def test_ws_connection_manager_init():
    """Test WebSocket connection manager initialization"""
    manager = WsConnectionManager()
    assert manager.active_connections == []


@pytest.mark.asyncio
async def test_ws_connect():
    """Test connecting a WebSocket"""
    test_init(None)
    manager = WsConnectionManager()
    
    # Mock WebSocket
    mock_ws = AsyncMock()
    
    await manager.connect(mock_ws)
    
    assert len(manager.active_connections) == 1
    assert manager.active_connections[0] == mock_ws
    mock_ws.accept.assert_called_once()


@pytest.mark.asyncio
async def test_ws_disconnect():
    """Test disconnecting a WebSocket"""
    manager = WsConnectionManager()
    
    mock_ws = AsyncMock()
    await manager.connect(mock_ws)
    assert len(manager.active_connections) == 1
    
    manager.disconnect(mock_ws)
    assert len(manager.active_connections) == 0


@pytest.mark.asyncio
async def test_ws_broadcast():
    """Test broadcasting message to all connections"""
    manager = WsConnectionManager()
    
    # Create mock WebSockets
    mock_ws1 = AsyncMock()
    mock_ws2 = AsyncMock()
    
    await manager.connect(mock_ws1)
    await manager.connect(mock_ws2)
    
    # Broadcast message
    await manager.broadcast("test message")
    
    # Verify both received the message
    mock_ws1.send_text.assert_called_once_with("test message")
    mock_ws2.send_text.assert_called_once_with("test message")


@pytest.mark.asyncio
async def test_ws_broadcast_empty():
    """Test broadcasting with no connections"""
    manager = WsConnectionManager()
    
    # Should not raise error
    await manager.broadcast("test message")
    assert len(manager.active_connections) == 0


@pytest.mark.asyncio
async def test_notify_clients():
    """Test the notify_clients function"""
    # This function calls ws_manager.broadcast
    # We'll test it to ensure it doesn't raise errors
    # The actual WebSocket broadcast is mocked through ws_manager
    
    # Just verify it runs without error (no active connections)
    await notify_clients("batch", "update", 1)
