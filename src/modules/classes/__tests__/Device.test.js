import { describe, it, expect } from 'vitest'
import { Device } from '@/modules/classes'

describe('Device - Data Class', () => {
  describe('Constructor', () => {
    it('should create a Device with default values', () => {
      const device = new Device()
      expect(device.id).toBe(0)
      expect(device.chipId).toBe('')
      expect(device.chipFamily).toBe('')
      expect(device.software).toBe('')
      expect(device.mdns).toBe('')
      expect(device.config).toBe('')
      expect(device.bleColor).toBe('')
      expect(device.description).toBe('')
      expect(device.url).toBe('')
      expect(device.collectLogs).toBe(false)
    })

    it('should create a Device with provided values', () => {
      const device = new Device(
        1,
        'chip123',
        'ESP32',
        'Gravitymon',
        'gravitymon.local',
        'config-string',
        '#FF5733',
        'http://192.168.1.100',
        'Main Device',
        true
      )
      expect(device.id).toBe(1)
      expect(device.chipId).toBe('chip123')
      expect(device.chipFamily).toBe('ESP32')
      expect(device.software).toBe('Gravitymon')
      expect(device.mdns).toBe('gravitymon.local')
      expect(device.config).toBe('config-string')
      expect(device.bleColor).toBe('#FF5733')
      expect(device.url).toBe('http://192.168.1.100')
      expect(device.description).toBe('Main Device')
      expect(device.collectLogs).toBe(true)
    })

    it('should clean up invalid URLs', () => {
      const device1 = new Device(1, 'chip', 'ESP32', 'Gravitymon', 'mdns', 'config', 'color', 'http://')
      expect(device1.url).toBe('')

      const device2 = new Device(1, 'chip', 'ESP32', 'Gravitymon', 'mdns', 'config', 'color', 'https://')
      expect(device2.url).toBe('')
    })

    it('should keep valid URLs', () => {
      const device = new Device(1, 'chip', 'ESP32', 'Gravitymon', 'mdns', 'config', 'color', 'http://192.168.1.100:8080')
      expect(device.url).toBe('http://192.168.1.100:8080')
    })
  })

  describe('compare - Static Method', () => {
    it('should return true for identical devices', () => {
      const device1 = new Device(1, 'chip1', 'ESP32', 'Gravitymon', 'mdns', 'config', 'color', 'http://192.168.1.100', 'Device 1', false)
      const device2 = new Device(999, 'chip1', 'ESP32', 'Gravitymon', 'mdns', 'config', 'color', 'http://192.168.1.100', 'Device 1', false)
      expect(Device.compare(device1, device2)).toBe(true)
    })

    it('should return false when chipId differs', () => {
      const device1 = new Device(1, 'chip1', 'ESP32', 'Gravitymon')
      const device2 = new Device(1, 'chip2', 'ESP32', 'Gravitymon')
      expect(Device.compare(device1, device2)).toBe(false)
    })

    it('should return false when software differs', () => {
      const device1 = new Device(1, 'chip1', 'ESP32', 'Gravitymon')
      const device2 = new Device(1, 'chip1', 'ESP32', 'Pressuremon')
      expect(Device.compare(device1, device2)).toBe(false)
    })

    it('should return false when URL differs', () => {
      const device1 = new Device(1, 'chip1', 'ESP32', 'Gravitymon', 'mdns', 'config', 'color', 'http://192.168.1.100')
      const device2 = new Device(1, 'chip1', 'ESP32', 'Gravitymon', 'mdns', 'config', 'color', 'http://192.168.1.101')
      expect(Device.compare(device1, device2)).toBe(false)
    })
  })

  describe('fromJson - Static Method', () => {
    it('should create Device from JSON object', () => {
      const json = {
        id: 5,
        chipId: 'chip-abc',
        chipFamily: 'ESP32C3',
        software: 'Kegmon',
        mdns: 'kegmon.local',
        config: 'config-data',
        bleColor: '#00FF00',
        url: 'https://example.com',
        description: 'Test Device',
        collectLogs: true
      }
      const device = Device.fromJson(json)
      expect(device.id).toBe(5)
      expect(device.chipId).toBe('chip-abc')
      expect(device.chipFamily).toBe('ESP32C3')
      expect(device.software).toBe('Kegmon')
      expect(device.mdns).toBe('kegmon.local')
      expect(device.description).toBe('Test Device')
      expect(device.collectLogs).toBe(true)
    })

    it('should handle missing optional fields in JSON', () => {
      const json = {
        chipId: 'chip1'
      }
      const device = Device.fromJson(json)
      expect(device.chipId).toBe('chip1')
      expect(device.software).toBe('')
    })
  })

  describe('toJson - Instance Method', () => {
    it('should convert Device to JSON', () => {
      const device = new Device(5, 'chip1', 'ESP32', 'Gravitymon', 'mdns', 'config', '#FF0000', 'http://example.com', 'Device', true)
      const json = device.toJson()
      
      expect(json.chipId).toBe('chip1')
      expect(json.chipFamily).toBe('ESP32')
      expect(json.software).toBe('Gravitymon')
      expect(json.mdns).toBe('mdns')
      expect(json.config).toBe('config')
      expect(json.bleColor).toBe('#FF0000')
      expect(json.url).toBe('http://example.com')
      expect(json.description).toBe('Device')
      expect(json.collectLogs).toBe(true)
      expect(json.fermentationSteps).toEqual([])
    })

    it('should not include id in JSON output', () => {
      const device = new Device(999, 'chip1')
      const json = device.toJson()
      expect(json.id).toBeUndefined()
    })
  })

  describe('Property Getters and Setters', () => {
    it('should get and set all properties', () => {
      const device = new Device()
      device.id = 10
      device.chipId = 'new-chip'
      device.software = 'Pressuremon'
      device.mdns = 'pressure.local'
      device.url = 'http://192.168.1.200'
      device.description = 'Updated Device'
      device.collectLogs = true

      expect(device.id).toBe(10)
      expect(device.chipId).toBe('new-chip')
      expect(device.software).toBe('Pressuremon')
      expect(device.mdns).toBe('pressure.local')
      expect(device.url).toBe('http://192.168.1.200')
      expect(device.description).toBe('Updated Device')
      expect(device.collectLogs).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty strings for all properties', () => {
      const device = new Device(1, '', '', '', '', '', '', '', '', false)
      expect(device.chipId).toBe('')
      expect(device.software).toBe('')
    })

    it('should handle special characters in description', () => {
      const device = new Device(1, 'chip', 'ESP32', 'Gravitymon', 'mdns', 'config', 'color', 'url', 'Device with @#$%^&*()', false)
      expect(device.description).toBe('Device with @#$%^&*()')
    })
  })
})
