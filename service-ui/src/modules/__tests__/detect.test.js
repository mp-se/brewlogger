// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect, vi } from 'vitest'
import { detectId, detectMdns, detectPlatform, detectSoftware } from '../detect'

// Mock the logger
vi.mock('../logger', () => ({
  logDebug: vi.fn()
}))

describe('detect.js - Device Detection', () => {
  describe('detectId', () => {
    it('should detect id from status object', () => {
      const status = { id: 'device-123' }
      const result = detectId(status)
      expect(result).toBe('device-123')
    })

    it('should return empty string when id is missing', () => {
      const status = { name: 'test' }
      const result = detectId(status)
      expect(result).toBe('')
    })

    it('should handle empty status object', () => {
      const status = {}
      const result = detectId(status)
      expect(result).toBe('')
    })

    it('should detect id even with other properties', () => {
      const status = { id: 'abc123', name: 'device', value: 42 }
      const result = detectId(status)
      expect(result).toBe('abc123')
    })
  })

  describe('detectMdns', () => {
    it('should detect mDNS from status object', () => {
      const status = { mdns: 'brewlogger.local' }
      const result = detectMdns(status)
      expect(result).toBe('brewlogger.local')
    })

    it('should return empty string when mDNS is missing', () => {
      const status = { name: 'test' }
      const result = detectMdns(status)
      expect(result).toBe('')
    })

    it('should handle empty status object', () => {
      const status = {}
      const result = detectMdns(status)
      expect(result).toBe('')
    })
  })

  describe('detectPlatform', () => {
    it('should detect and lowercase platform', () => {
      const status = { platform: 'ESP32 v1.0' }
      const result = detectPlatform(status)
      expect(result).toBe('esp32')
    })

    it('should return empty string when platform is missing', () => {
      const status = { name: 'test' }
      const result = detectPlatform(status)
      expect(result).toBe('')
    })

    it('should extract first word only', () => {
      const status = { platform: 'ESP32C3 WROOM Module' }
      const result = detectPlatform(status)
      expect(result).toBe('esp32c3')
    })

    it('should handle uppercase platform', () => {
      const status = { platform: 'ESP8266' }
      const result = detectPlatform(status)
      expect(result).toBe('esp8266')
    })
  })

  describe('detectSoftware', () => {
    it('should detect Kegmon software', () => {
      const status = { scale_raw1: 1000 }
      const result = detectSoftware(status)
      expect(result).toBe('Kegmon')
    })

    it('should detect Chamber Controller software', () => {
      const status = { pid_mode: 'auto' }
      const result = detectSoftware(status)
      expect(result).toBe('Chamber-Controller')
    })

    it('should detect Gravitymon Gateway software', () => {
      const status = { gravity_device: 'device-1' }
      const result = detectSoftware(status)
      expect(result).toBe('Gravitymon-Gateway')
    })

    it('should detect Gravitymon software', () => {
      const status = { gravity: 1.05 }
      const result = detectSoftware(status)
      expect(result).toBe('Gravitymon')
    })

    it('should detect Pressuremon software', () => {
      const status = { pressure: 20 }
      const result = detectSoftware(status)
      expect(result).toBe('Pressuremon')
    })

    it('should return empty string for unknown software', () => {
      const status = { unknown_property: 'value' }
      const result = detectSoftware(status)
      expect(result).toBe('')
    })

    it('should return empty string for empty status', () => {
      const status = {}
      const result = detectSoftware(status)
      expect(result).toBe('')
    })

    it('should prioritize in order: Kegmon > Chamber > Gateway > Gravitymon > Pressuremon', () => {
      // Multiple properties present - should match Kegmon first
      const status = {
        scale_raw1: 1000,
        pid_mode: 'auto',
        gravity: 1.05
      }
      const result = detectSoftware(status)
      expect(result).toBe('Kegmon')
    })

    it('should match Chamber over lower priority', () => {
      const status = {
        pid_mode: 'auto',
        gravity: 1.05,
        pressure: 20
      }
      const result = detectSoftware(status)
      expect(result).toBe('Chamber-Controller')
    })
  })
})
