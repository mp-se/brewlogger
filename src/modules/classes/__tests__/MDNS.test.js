import { describe, it, expect } from 'vitest'
import { MDNS } from '@/modules/classes'

describe('MDNS - Data Class', () => {
  describe('Constructor', () => {
    it('should create an MDNS service with provided values', () => {
      const mdns = new MDNS('gravitymon.local', 'gravitymon', '_http._tcp.local.')
      expect(mdns.host).toBe('gravitymon.local')
      expect(mdns.name).toBe('gravitymon')
      expect(mdns.type).toBe('_http._tcp.local.')
    })

    it('should create an MDNS service with undefined values', () => {
      const mdns = new MDNS(undefined, undefined, undefined)
      expect(mdns.host).toBeUndefined()
      expect(mdns.name).toBeUndefined()
      expect(mdns.type).toBeUndefined()
    })

    it('should create an MDNS service with partial values', () => {
      const mdns = new MDNS('example.local', undefined, '_http._tcp.local.')
      expect(mdns.host).toBe('example.local')
      expect(mdns.name).toBeUndefined()
      expect(mdns.type).toBe('_http._tcp.local.')
    })
  })

  describe('fromJson - Static Method', () => {
    it('should create MDNS from JSON object', () => {
      const json = {
        host: 'brewmonitor.local',
        name: 'brewmonitor',
        type: '_http._tcp.local.'
      }
      const mdns = MDNS.fromJson(json)
      expect(mdns.host).toBe('brewmonitor.local')
      expect(mdns.name).toBe('brewmonitor')
      expect(mdns.type).toBe('_http._tcp.local.')
    })

    it('should handle missing fields in JSON', () => {
      const json = { host: 'device.local' }
      const mdns = MDNS.fromJson(json)
      expect(mdns.host).toBe('device.local')
      expect(mdns.name).toBeUndefined()
      expect(mdns.type).toBeUndefined()
    })

    it('should handle empty JSON object', () => {
      const json = {}
      const mdns = MDNS.fromJson(json)
      expect(mdns.host).toBeUndefined()
      expect(mdns.name).toBeUndefined()
      expect(mdns.type).toBeUndefined()
    })

    it('should create multiple MDNS instances from different JSON objects', () => {
      const json1 = { host: 'device1.local', name: 'device1', type: '_http._tcp.local.' }
      const json2 = { host: 'device2.local', name: 'device2', type: '_http._tcp.local.' }

      const mdns1 = MDNS.fromJson(json1)
      const mdns2 = MDNS.fromJson(json2)

      expect(mdns1.host).toBe('device1.local')
      expect(mdns2.host).toBe('device2.local')
      expect(mdns1.name).not.toBe(mdns2.name)
    })
  })

  describe('toJson - Instance Method', () => {
    it('should convert MDNS to JSON', () => {
      const mdns = new MDNS('sensor.local', 'sensor', '_http._tcp.local.')
      const json = mdns.toJson()

      expect(json).toEqual({
        host: 'sensor.local',
        name: 'sensor',
        type: '_http._tcp.local.'
      })
    })

    it('should serialize with undefined values', () => {
      const mdns = new MDNS(undefined, 'test', undefined)
      const json = mdns.toJson()

      expect(json).toEqual({
        host: undefined,
        name: 'test',
        type: undefined
      })
    })

    it('should round-trip through JSON serialization', () => {
      const original = new MDNS('gravity.local', 'gravity', '_http._tcp.local.')
      const json = original.toJson()
      const restored = MDNS.fromJson(json)

      expect(restored.host).toBe(original.host)
      expect(restored.name).toBe(original.name)
      expect(restored.type).toBe(original.type)
    })

    it('should handle special characters in hostname', () => {
      const mdns = new MDNS('brew-monitor-01.local', 'brew-monitor-01', '_http._tcp.local.')
      const json = mdns.toJson()

      expect(json.host).toBe('brew-monitor-01.local')
      expect(json.name).toBe('brew-monitor-01')
    })
  })

  describe('Property Getters and Setters', () => {
    it('should get and set host', () => {
      const mdns = new MDNS('original.local', 'name', 'type')
      mdns.host = 'updated.local'
      expect(mdns.host).toBe('updated.local')
    })

    it('should get and set name', () => {
      const mdns = new MDNS('host.local', 'original', 'type')
      mdns.name = 'updated'
      expect(mdns.name).toBe('updated')
    })

    it('should get and set type', () => {
      const mdns = new MDNS('host.local', 'name', '_original._tcp.local.')
      mdns.type = '_http._tcp.local.'
      expect(mdns.type).toBe('_http._tcp.local.')
    })

    it('should allow setting all properties independently', () => {
      const mdns = new MDNS('device.local', 'device', '_http._tcp.local.')
      mdns.host = 'new-device.local'
      mdns.name = 'new-device'
      mdns.type = '_ssh._tcp.local.'

      expect(mdns.host).toBe('new-device.local')
      expect(mdns.name).toBe('new-device')
      expect(mdns.type).toBe('_ssh._tcp.local.')
    })

    it('should handle string values of different lengths', () => {
      const mdns = new MDNS('x', 'y', 'z')
      expect(mdns.host).toBe('x')
      expect(mdns.name).toBe('y')
      expect(mdns.type).toBe('z')

      mdns.host = 'very-long-device-name-with-many-characters.local'
      expect(mdns.host).toBe('very-long-device-name-with-many-characters.local')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      const mdns = new MDNS('', '', '')
      expect(mdns.host).toBe('')
      expect(mdns.name).toBe('')
      expect(mdns.type).toBe('')
    })

    it('should handle null values assigned after construction', () => {
      const mdns = new MDNS('device.local', 'device', '_http._tcp.local.')
      mdns.host = null
      mdns.name = null
      mdns.type = null

      expect(mdns.host).toBeNull()
      expect(mdns.name).toBeNull()
      expect(mdns.type).toBeNull()
    })

    it('should preserve data type consistency', () => {
      const mdns = new MDNS('host.local', 'name', 'type')
      const json = mdns.toJson()

      expect(typeof json.host).toBe('string')
      expect(typeof json.name).toBe('string')
      expect(typeof json.type).toBe('string')
    })
  })
})
