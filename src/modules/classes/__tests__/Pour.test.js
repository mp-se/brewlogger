import { describe, it, expect } from 'vitest'
import { Pour } from '@/modules/classes'

describe('Pour - Data Class', () => {
  describe('Constructor', () => {
    it('should create a Pour with default values', () => {
      const pour = new Pour()
      expect(pour.id).toBe(0)
      expect(pour.pour).toBe(0.0)
      expect(pour.volume).toBe(0.0)
      expect(pour.maxVolume).toBe(0.0)
      expect(pour.created).toBe('')
      expect(pour.batchId).toBe(0)
      expect(pour.active).toBe(true)
    })

    it('should create a Pour with provided values', () => {
      const pour = new Pour(1, 5.5, 250.0, 500.0, '2024-01-15T10:30:00Z', 5, true)
      expect(pour.id).toBe(1)
      expect(pour.pour).toBe(5.5)
      expect(pour.volume).toBe(250.0)
      expect(pour.maxVolume).toBe(500.0)
      expect(pour.created).toBe('2024-01-15T10:30:00Z')
      expect(pour.batchId).toBe(5)
      expect(pour.active).toBe(true)
    })

    it('should handle inactive pours', () => {
      const pour = new Pour(1, 5.5, 250.0, 500.0, '2024-01-15', 5, false)
      expect(pour.active).toBe(false)
    })
  })

  describe('fromJson - Static Method', () => {
    it('should create Pour from JSON object', () => {
      const json = {
        id: 10,
        pour: 3.5,
        volume: 175.0,
        maxVolume: 500.0,
        created: '2024-01-15T10:30:00Z',
        batchId: 5,
        active: true
      }
      const pour = Pour.fromJson(json)
      expect(pour.id).toBe(10)
      expect(pour.pour).toBe(3.5)
      expect(pour.volume).toBe(175.0)
      expect(pour.maxVolume).toBe(500.0)
      expect(pour.created).toBe('2024-01-15T10:30:00Z')
      expect(pour.batchId).toBe(5)
      expect(pour.active).toBe(true)
    })

    it('should handle missing fields', () => {
      const json = { id: 1, volume: 250.0, created: '2024-01-15' }
      const pour = Pour.fromJson(json)
      expect(pour.id).toBe(1)
      expect(pour.volume).toBe(250.0)
      expect(pour.pour).toBe(0)
    })
  })

  describe('toJson - Instance Method', () => {
    it('should convert Pour to JSON with all fields', () => {
      const pour = new Pour(1, 5.5, 250.0, 500.0, '2024-01-15T10:30:00Z', 5, true)
      const json = pour.toJson()

      expect(json.pour).toBe(5.5)
      expect(json.volume).toBe(250.0)
      expect(json.maxVolume).toBe(500.0)
      expect(json.created).toBe('2024-01-15T10:30:00Z')
      expect(json.batchId).toBe(5)
      expect(json.active).toBe(true)
    })

    it('should not include id in JSON', () => {
      const pour = new Pour(999, 5.5, 250.0, 500.0, '2024-01-15', 5)
      const json = pour.toJson()
      expect(json.id).toBeUndefined()
    })

    it('should include batchId in JSON', () => {
      const pour = new Pour(1, 5.5, 250.0, 500.0, '2024-01-15', 3, true)
      const json = pour.toJson()
      expect(json.batchId).toBe(3)
    })
  })

  describe('Property Getters and Setters', () => {
    it('should get and set all properties', () => {
      const pour = new Pour()
      pour.id = 10
      pour.pour = 7.5
      pour.volume = 375.0
      pour.maxVolume = 750.0
      pour.created = '2024-01-15T10:30:00Z'
      pour.batchId = 3
      pour.active = false

      expect(pour.id).toBe(10)
      expect(pour.pour).toBe(7.5)
      expect(pour.volume).toBe(375.0)
      expect(pour.maxVolume).toBe(750.0)
      expect(pour.created).toBe('2024-01-15T10:30:00Z')
      expect(pour.batchId).toBe(3)
      expect(pour.active).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero values', () => {
      const pour = new Pour(1, 0, 0, 0, '2024-01-15', 5)
      expect(pour.pour).toBe(0)
      expect(pour.volume).toBe(0)
      expect(pour.maxVolume).toBe(0)
    })

    it('should handle volume equal to maxVolume', () => {
      const pour = new Pour(1, 10, 500.0, 500.0, '2024-01-15', 5)
      expect(pour.volume).toBe(500.0)
      expect(pour.maxVolume).toBe(500.0)
    })

    it('should handle volume greater than maxVolume', () => {
      // This might be an edge case but should be allowed
      const pour = new Pour(1, 15, 600.0, 500.0, '2024-01-15', 5)
      expect(pour.volume).toBe(600.0)
      expect(pour.maxVolume).toBe(500.0)
    })

    it('should handle large decimal values', () => {
      const pour = new Pour(1, 12.345, 618.75, 999.999, '2024-01-15', 5)
      expect(pour.pour).toBe(12.345)
      expect(pour.volume).toBe(618.75)
      expect(pour.maxVolume).toBe(999.999)
    })
  })
})
