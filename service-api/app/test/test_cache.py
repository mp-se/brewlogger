# SPDX-License-Identifier: GPL-3.0-or-later
# Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger

"""Tests for cache functions."""
from unittest.mock import patch, MagicMock
import pytest
import redis

from api.cache import (
    delete_key,
    find_key,
    write_key,
    read_key,
    exist_key,
)


def test_delete_key_with_pool():
    """Test delete_key when pool is available"""
    with patch("api.cache.pool", MagicMock()), \
         patch("api.cache.redis.Redis") as mock_redis_class:
        
        mock_redis_instance = MagicMock()
        mock_redis_class.return_value = mock_redis_instance
        
        delete_key("test_key")
        
        # Verify delete was called
        mock_redis_instance.delete.assert_called_once_with("test_key")


def test_delete_key_without_pool():
    """Test delete_key when pool is None"""
    with patch("api.cache.pool", None):
        # Should return early without error
        result = delete_key("test_key")
        assert result is None


def test_delete_key_connection_error():
    """Test delete_key handles connection errors"""
    with patch("api.cache.pool", MagicMock()), \
         patch("api.cache.redis.Redis") as mock_redis_class:
        
        mock_redis_instance = MagicMock()
        mock_redis_instance.delete.side_effect = redis.exceptions.ConnectionError("Connection failed")
        mock_redis_class.return_value = mock_redis_instance
        
        # Should handle error gracefully
        result = delete_key("test_key")
        assert result is None


def test_find_key_with_pool():
    """Test find_key when pool is available"""
    with patch("api.cache.pool", MagicMock()), \
         patch("api.cache.redis.Redis") as mock_redis_class:
        
        mock_redis_instance = MagicMock()
        mock_redis_instance.keys.return_value = [b"key1", b"key2"]
        mock_redis_class.return_value = mock_redis_instance
        
        result = find_key("test_*")
        
        assert result == [b"key1", b"key2"]
        mock_redis_instance.keys.assert_called_once_with("test_*")


def test_find_key_without_pool():
    """Test find_key when pool is None"""
    with patch("api.cache.pool", None):
        result = find_key("test_key")
        assert result == []


def test_find_key_connection_error():
    """Test find_key handles connection errors"""
    with patch("api.cache.pool", MagicMock()), \
         patch("api.cache.redis.Redis") as mock_redis_class:
        
        mock_redis_instance = MagicMock()
        mock_redis_instance.keys.side_effect = redis.exceptions.ConnectionError("Connection failed")
        mock_redis_class.return_value = mock_redis_instance
        
        result = find_key("test_*")
        assert result == []


def test_write_key_with_pool():
    """Test write_key when pool is available"""
    with patch("api.cache.pool", MagicMock()), \
         patch("api.cache.redis.Redis") as mock_redis_class:
        
        mock_redis_instance = MagicMock()
        mock_redis_class.return_value = mock_redis_instance
        
        result = write_key("test_key", "test_value", 60)
        
        assert result is True
        mock_redis_instance.set.assert_called_once_with(
            name="test_key", value="test_value", ex=60
        )


def test_write_key_without_pool():
    """Test write_key when pool is None"""
    with patch("api.cache.pool", None):
        result = write_key("test_key", "test_value", 60)
        assert result is True


def test_write_key_connection_error():
    """Test write_key handles connection errors"""
    with patch("api.cache.pool", MagicMock()), \
         patch("api.cache.redis.Redis") as mock_redis_class:
        
        mock_redis_instance = MagicMock()
        mock_redis_instance.set.side_effect = redis.exceptions.ConnectionError("Connection failed")
        mock_redis_class.return_value = mock_redis_instance
        
        result = write_key("test_key", "test_value", 60)
        assert result is False


def test_read_key_with_pool():
    """Test read_key when pool is available"""
    with patch("api.cache.pool", MagicMock()), \
         patch("api.cache.redis.Redis") as mock_redis_class:
        
        mock_redis_instance = MagicMock()
        mock_redis_instance.get.return_value = b"test_value"
        mock_redis_class.return_value = mock_redis_instance
        
        result = read_key("test_key")
        
        assert result == b"test_value"
        mock_redis_instance.get.assert_called_once_with(name="test_key")


def test_read_key_without_pool():
    """Test read_key when pool is None"""
    with patch("api.cache.pool", None):
        result = read_key("test_key")
        assert result is None


def test_read_key_connection_error():
    """Test read_key handles connection errors"""
    with patch("api.cache.pool", MagicMock()), \
         patch("api.cache.redis.Redis") as mock_redis_class:
        
        mock_redis_instance = MagicMock()
        mock_redis_instance.get.side_effect = redis.exceptions.ConnectionError("Connection failed")
        mock_redis_class.return_value = mock_redis_instance
        
        result = read_key("test_key")
        assert result is None


def test_exist_key_with_pool():
    """Test exist_key when pool is available"""
    with patch("api.cache.pool", MagicMock()), \
         patch("api.cache.redis.Redis") as mock_redis_class:
        
        mock_redis_instance = MagicMock()
        mock_redis_instance.exists.return_value = 1
        mock_redis_class.return_value = mock_redis_instance
        
        result = exist_key("test_key")
        
        assert result == 1
        mock_redis_instance.exists.assert_called_once_with("test_key")


def test_exist_key_without_pool():
    """Test exist_key when pool is None"""
    with patch("api.cache.pool", None):
        result = exist_key("test_key")
        assert result is False


def test_exist_key_connection_error():
    """Test exist_key handles connection errors"""
    with patch("api.cache.pool", MagicMock()), \
         patch("api.cache.redis.Redis") as mock_redis_class:
        
        mock_redis_instance = MagicMock()
        mock_redis_instance.exists.side_effect = redis.exceptions.ConnectionError("Connection failed")
        mock_redis_class.return_value = mock_redis_instance
        
        result = exist_key("test_key")
        assert result is False
