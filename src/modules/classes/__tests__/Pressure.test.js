import { describe, it, expect } from 'vitest'
import { Pressure } from '@/modules/classes'

describe('Pressure - Data Class', () => {
  describe('Constructor', () => {
    it('should create a Pressure with default values', () => {
      const pressure = new Pressure()
      expect(pressure.id).toBe(0)
      expect(pressure.temperature).toBeNull()
      expect(pressure.pressure).toBe(0.0)
      expect(pressure.pressure1).toBeNull()
      expect(pressure.battery).toBeNull()
      expect(pressure.rssi).toBe(0)
      expect(pressure.runTime).toBeNull()
      expect(pressure.created).toBe('')
      expect(pressure.batchId).toBe(0)
      expect(pressure.active).toBe(true)
    })

    it('should create a Pressure with provided values', () => {
      const pressure = new Pressure(
        1,
        20.5,
        15.2,
        14.8,
        3.5,
        -70,
        86400,
        '2024-01-15T10:30:00Z',
        5,
        true
      )
      expect(pressure.id).toBe(1)
      expect(pressure.temperature).toBe(20.5)
      expect(pressure.pressure).toBe(15.2)
      expect(pressure.pressure1).toBe(14.8)
      expect(pressure.battery).toBe(3.5)
      expect(pressure.rssi).toBe(-70)
      expect(pressure.runTime).toBe(86400)
      expect(pressure.created).toBe('2024-01-15T10:30:00Z')
      expect(pressure.batchId).toBe(5)
      expect(pressure.active).toBe(true)
    })

    it('should handle null values for optional fields', () => {
      const pressure = new Pressure(1, null, 15.2, null, null, 0, null, '2024-01-15', 5)
      expect(pressure.temperature).toBeNull()
      expect(pressure.pressure1).toBeNull()
      expect(pressure.battery).toBeNull()
      expect(pressure.runTime).toBeNull()
    })
  })

  describe('fromJson - Static Method', () => {
    it('should create Pressure from JSON object', () => {
      const json = {
        id: 10,
        temperature: 22.0,
        pressure: 16.5,
        pressure1: 16.2,
        battery: 3.8,
        rssi: -65,
        runTime: 172800,
        created: '2024-01-15T10:30:00Z',
        batchId: 5,
        active: true
      }
      const pressure = Pressure.fromJson(json)
      expect(pressure.id).toBe(10)
      expect(pressure.temperature).toBe(22.0)
      expect(pressure.pressure).toBe(16.5)
      expect(pressure.pressure1).toBe(16.2)
      expect(pressure.battery).toBe(3.8)
      expect(pressure.rssi).toBe(-65)
      expect(pressure.runTime).toBe(172800)
      expect(pressure.batchId).toBe(5)
    })

    it('should handle missing fields', () => {
      const json = { id: 1, pressure: 15.0, created: '2024-01-15' }
      const pressure = Pressure.fromJson(json)
      expect(pressure.id).toBe(1)
      expect(pressure.pressure).toBe(15.0)
      expect(pressure.temperature).toBeNull()
    })
  })

  describe('toJson - Instance Method', () => {
    it('should convert Pressure to JSON with all fields', () => {
      const pressure = new Pressure(
        1,
        20.5,
        15.2,
        14.8,
        3.5,
        -70,
        86400,
        '2024-01-15T10:30:00Z',
        5,
        true
      )
      const json = pressure.toJson()

      expect(json.temperature).toBe(20.5)
      expect(json.pressure).toBe(15.2)
      expect(json.pressure1).toBe(14.8)
      expect(json.battery).toBe(3.5)
      expect(json.rssi).toBe(-70)
      expect(json.runTime).toBe(86400)
      expect(json.created).toBe('2024-01-15T10:30:00Z')
      expect(json.active).toBe(true)
    })

    it('should not include id or batchId in JSON', () => {
      const pressure = new Pressure(999, 20, 15.0, 14.8, 3.5, -70, 86400, '2024-01-15', 5)
      const json = pressure.toJson()
      expect(json.id).toBeUndefined()
      expect(json.batchId).toBeUndefined()
    })
  })

  describe('Property Getters and Setters', () => {
    it('should get and set all properties', () => {
      const pressure = new Pressure()
      pressure.id = 10
      pressure.temperature = 25.0
      pressure.pressure = 20.0
      pressure.pressure1 = 19.5
      pressure.battery = 3.2
      pressure.rssi = -55
      pressure.runTime = 100000
      pressure.created = '2024-01-15'
      pressure.batchId = 3
      pressure.active = false

      expect(pressure.id).toBe(10)
      expect(pressure.temperature).toBe(25.0)
      expect(pressure.pressure).toBe(20.0)
      expect(pressure.pressure1).toBe(19.5)
      expect(pressure.battery).toBe(3.2)
      expect(pressure.rssi).toBe(-55)
      expect(pressure.runTime).toBe(100000)
      expect(pressure.created).toBe('2024-01-15')
      expect(pressure.batchId).toBe(3)
      expect(pressure.active).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle high pressure values', () => {
      const pressure = new Pressure(1, 20, 50.0, 49.8)
      expect(pressure.pressure).toBe(50.0)
      expect(pressure.pressure1).toBe(49.8)
    })

    it('should handle negative RSSI values', () => {
      const pressure = new Pressure(1, 20, 15.0, 14.8, 3.5, -95)
      expect(pressure.rssi).toBe(-95)
    })

    it('should handle zero values', () => {
      const pressure = new Pressure(1, 0, 0, 0, 0, 0, 0)
      expect(pressure.temperature).toBe(0)
      expect(pressure.pressure).toBe(0)
      expect(pressure.pressure1).toBe(0)
      expect(pressure.battery).toBe(0)
    })

    it('should handle null battery', () => {
      const pressure = new Pressure(1, 20, 15.0, 14.8, null, -70)
      expect(pressure.battery).toBeNull()
    })
  })
})
