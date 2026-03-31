import { describe, it, expect } from 'vitest'
import { Gravity } from '@/modules/classes'

describe('Gravity - Data Class', () => {
  describe('Constructor', () => {
    it('should create a Gravity with default values', () => {
      const gravity = new Gravity()
      expect(gravity.id).toBe(0)
      expect(gravity.temperature).toBeNull()
      expect(gravity.gravity).toBe(0.0)
      expect(gravity.velocity).toBeNull()
      expect(gravity.angle).toBe(0.0)
      expect(gravity.battery).toBe(0.0)
      expect(gravity.rssi).toBe(0)
      expect(gravity.corrGravity).toBeNull()
      expect(gravity.runTime).toBeNull()
      expect(gravity.created).toBe('')
      expect(gravity.batchId).toBe(0)
      expect(gravity.active).toBe(true)
      expect(gravity.chamberTemperature).toBeNull()
      expect(gravity.beerTemperature).toBeNull()
    })

    it('should create a Gravity with provided values', () => {
      const gravity = new Gravity(
        1,
        20.5,
        1.05,
        0.5,
        85.0,
        3.2,
        -65,
        1.048,
        86400,
        '2024-01-15T10:30:00Z',
        5,
        true,
        18.0,
        20.5
      )
      expect(gravity.id).toBe(1)
      expect(gravity.temperature).toBe(20.5)
      expect(gravity.gravity).toBe(1.05)
      expect(gravity.velocity).toBe(0.5)
      expect(gravity.angle).toBe(85.0)
      expect(gravity.battery).toBe(3.2)
      expect(gravity.rssi).toBe(-65)
      expect(gravity.corrGravity).toBe(1.048)
      expect(gravity.runTime).toBe(86400)
      expect(gravity.created).toBe('2024-01-15T10:30:00Z')
      expect(gravity.batchId).toBe(5)
      expect(gravity.active).toBe(true)
      expect(gravity.chamberTemperature).toBe(18.0)
      expect(gravity.beerTemperature).toBe(20.5)
    })

    it('should handle null values for optional fields', () => {
      const gravity = new Gravity(
        1,
        null,
        1.05,
        null,
        0,
        0,
        0,
        null,
        null,
        '2024-01-15',
        5,
        true,
        null,
        null
      )
      expect(gravity.temperature).toBeNull()
      expect(gravity.velocity).toBeNull()
      expect(gravity.corrGravity).toBeNull()
      expect(gravity.runTime).toBeNull()
      expect(gravity.chamberTemperature).toBeNull()
      expect(gravity.beerTemperature).toBeNull()
    })
  })

  describe('fromJson - Static Method', () => {
    it('should create Gravity from JSON object', () => {
      const json = {
        id: 10,
        temperature: 22.0,
        gravity: 1.045,
        velocity: 0.3,
        angle: 80.0,
        battery: 3.5,
        rssi: -70,
        corrGravity: 1.043,
        runTime: 172800,
        created: '2024-01-15T10:30:00Z',
        batchId: 5,
        active: true,
        chamberTemperature: 18.5,
        beerTemperature: 20.0
      }
      const gravity = Gravity.fromJson(json)
      expect(gravity.id).toBe(10)
      expect(gravity.temperature).toBe(22.0)
      expect(gravity.gravity).toBe(1.045)
      expect(gravity.batchId).toBe(5)
      expect(gravity.chamberTemperature).toBe(18.5)
    })

    it('should handle missing fields', () => {
      const json = { id: 1, gravity: 1.05, created: '2024-01-15' }
      const gravity = Gravity.fromJson(json)
      expect(gravity.id).toBe(1)
      expect(gravity.gravity).toBe(1.05)
      expect(gravity.temperature).toBeNull()
    })
  })

  describe('toJson - Instance Method', () => {
    it('should convert Gravity to JSON with all fields', () => {
      const gravity = new Gravity(
        1,
        20.5,
        1.05,
        0.5,
        85.0,
        3.2,
        -65,
        1.048,
        86400,
        '2024-01-15T10:30:00Z',
        5,
        true,
        18.0,
        20.5
      )
      const json = gravity.toJson()

      expect(json.temperature).toBe(20.5)
      expect(json.gravity).toBe(1.05)
      expect(json.velocity).toBe(0.5)
      expect(json.angle).toBe(85.0)
      expect(json.battery).toBe(3.2)
      expect(json.rssi).toBe(-65)
      expect(json.corrGravity).toBe(1.048)
      expect(json.runTime).toBe(86400)
      expect(json.created).toBe('2024-01-15T10:30:00Z')
      expect(json.active).toBe(true)
      expect(json.chamberTemperature).toBe(18.0)
      expect(json.beerTemperature).toBe(20.5)
    })

    it('should not include id or batchId in JSON', () => {
      const gravity = new Gravity(999, 20, 1.05, 0.5, 85, 3.2, -65, 1.048, 86400, '2024-01-15', 5)
      const json = gravity.toJson()
      expect(json.id).toBeUndefined()
      expect(json.batchId).toBeUndefined()
    })

    it('should exclude null optional fields from JSON', () => {
      const gravity = new Gravity(
        1,
        20,
        1.05,
        0.5,
        85,
        3.2,
        -65,
        null,
        86400,
        '2024-01-15',
        5,
        true,
        null,
        null
      )
      const json = gravity.toJson()
      expect(json.chamberTemperature).toBeUndefined()
      expect(json.beerTemperature).toBeUndefined()
    })

    it('should include optional fields when not null', () => {
      const gravity = new Gravity(
        1,
        20,
        1.05,
        0.5,
        85,
        3.2,
        -65,
        1.048,
        86400,
        '2024-01-15',
        5,
        true,
        18.0,
        20.5
      )
      const json = gravity.toJson()
      expect(json.chamberTemperature).toBe(18.0)
      expect(json.beerTemperature).toBe(20.5)
    })
  })

  describe('Property Getters and Setters', () => {
    it('should get and set numeric properties', () => {
      const gravity = new Gravity()
      gravity.id = 10
      gravity.gravity = 1.055
      gravity.angle = 90.0
      gravity.battery = 2.8
      gravity.rssi = -50

      expect(gravity.id).toBe(10)
      expect(gravity.gravity).toBe(1.055)
      expect(gravity.angle).toBe(90.0)
      expect(gravity.battery).toBe(2.8)
      expect(gravity.rssi).toBe(-50)
    })

    it('should get and set nullable properties', () => {
      const gravity = new Gravity()
      gravity.temperature = 25.0
      gravity.velocity = 1.5
      gravity.corrGravity = 1.052
      gravity.chamberTemperature = 19.0
      gravity.beerTemperature = 21.0

      expect(gravity.temperature).toBe(25.0)
      expect(gravity.velocity).toBe(1.5)
      expect(gravity.corrGravity).toBe(1.052)
      expect(gravity.chamberTemperature).toBe(19.0)
      expect(gravity.beerTemperature).toBe(21.0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very high gravity values', () => {
      const gravity = new Gravity(1, 20, 1.15, 0.5, 85, 3.2, -65, 1.148)
      expect(gravity.gravity).toBe(1.15)
      expect(gravity.corrGravity).toBe(1.148)
    })

    it('should handle negative RSSI values', () => {
      const gravity = new Gravity(1, 20, 1.05, 0.5, 85, 3.2, -100)
      expect(gravity.rssi).toBe(-100)
    })

    it('should handle zero and boundary values', () => {
      const gravity = new Gravity(1, 0, 1.0, 0, 0, 0, 0)
      expect(gravity.temperature).toBe(0)
      expect(gravity.gravity).toBe(1.0)
      expect(gravity.velocity).toBe(0)
      expect(gravity.angle).toBe(0)
    })
  })
})
