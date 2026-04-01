import { describe, it, expect } from 'vitest'
import { Batch } from '@/modules/classes'

describe('Batch - Data Class', () => {
  describe('Constructor', () => {
    it('should create a Batch with default values', () => {
      const batch = new Batch()
      expect(batch.id).toBe(0)
      expect(batch.name).toBe('')
    })

    it('should create a Batch with provided values', () => {
      const batch = new Batch({
        id: 1,
        name: 'Test Batch',
        active: true,
        predictionHoursLeft: 12.5
      })
      expect(batch.id).toBe(1)
      expect(batch.name).toBe('Test Batch')
      expect(batch.predictionHoursLeft).toBe(12.5)
    })
  })

  describe('fromJson', () => {
    it('should create a Batch from JSON', () => {
      const json = { id: 1, name: 'JSON', active: 1, predictionHoursLeft: 5 }
      const batch = Batch.fromJson(json)
      expect(batch.name).toBe('JSON')
      expect(batch.predictionHoursLeft).toBe(5)
    })
  })
})
