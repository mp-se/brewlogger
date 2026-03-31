import { describe, it, expect } from 'vitest'
import { FermentationStep } from '@/modules/classes'

describe('FermentationStep - Data Class', () => {
  describe('Constructor', () => {
    it('should create a FermentationStep with provided values', () => {
      const step = new FermentationStep(1, 'Pitch', 'Pitch', '2024-01-15', 10, 0)
      expect(step.order).toBe(1)
      expect(step.name).toBe('Pitch')
      expect(step.type).toBe('Pitch')
      expect(step.date).toBe('2024-01-15')
      expect(step.temp).toBe(10)
      expect(step.days).toBe(0)
    })

    it('should create a FermentationStep with undefined values', () => {
      const step = new FermentationStep(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      )
      expect(step.order).toBeUndefined()
      expect(step.name).toBe('')
      expect(step.type).toBeUndefined()
      expect(step.date).toBeUndefined()
      expect(step.temp).toBeUndefined()
      expect(step.days).toBeUndefined()
    })
  })

  describe('fromJson - Static Method', () => {
    it('should create FermentationStep from JSON object', () => {
      const json = {
        order: 2,
        name: 'Ramp',
        type: 'Ramp',
        date: '2024-01-16',
        temp: 18,
        days: 1
      }
      const step = FermentationStep.fromJson(json)
      expect(step.order).toBe(2)
      expect(step.name).toBe('Ramp')
      expect(step.type).toBe('Ramp')
      expect(step.date).toBe('2024-01-16')
      expect(step.temp).toBe(18)
      expect(step.days).toBe(1)
    })

    it('should handle missing fields in JSON', () => {
      const json = { order: 1, name: 'Test' }
      const step = FermentationStep.fromJson(json)
      expect(step.order).toBe(1)
      expect(step.name).toBe('Test')
      expect(step.type).toBeUndefined()
      expect(step.date).toBeUndefined()
    })
  })

  describe('listFromJson - Static Method', () => {
    it('should create array of FermentationSteps from JSON array', () => {
      const jsonList = [
        { order: 1, name: 'Pitch', type: 'Pitch', date: '2024-01-15', temp: 10, days: 0 },
        { order: 2, name: 'Ramp', type: 'Ramp', date: '2024-01-15', temp: 18, days: 1 }
      ]
      const steps = FermentationStep.listFromJson(jsonList, false)
      expect(steps).toHaveLength(2)
      expect(steps[0].name).toBe('Pitch')
      expect(steps[1].name).toBe('Ramp')
    })

    it('should update dates when updateDates is true', () => {
      const jsonList = [
        { order: 1, name: 'Pitch', type: 'Pitch', date: '2024-01-15', temp: 10, days: 2 },
        { order: 2, name: 'Ramp', type: 'Ramp', date: '2024-01-15', temp: 18, days: 3 },
        { order: 3, name: 'Chill', type: 'Chill', date: '2024-01-15', temp: 4, days: 0 }
      ]

      const steps = FermentationStep.listFromJson(jsonList, true)
      expect(steps).toHaveLength(3)

      // Verify dates are different and have progressed
      const date1 = new Date(steps[0].date)
      const date2 = new Date(steps[1].date)
      const date3 = new Date(steps[2].date)

      expect(date2.getTime()).toBeGreaterThan(date1.getTime())
      expect(date3.getTime()).toBeGreaterThan(date2.getTime())

      // Verify the day differences match
      expect((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)).toBe(2)
      expect((date3.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)).toBe(3)
    })

    it('should handle empty list', () => {
      const steps = FermentationStep.listFromJson([], false)
      expect(steps).toHaveLength(0)
    })
  })

  describe('listToJson - Static Method', () => {
    it('should serialize array of FermentationSteps to JSON with deviceId', () => {
      const steps = [
        new FermentationStep(1, 'Pitch', 'Pitch', '2024-01-15', 10, 0),
        new FermentationStep(2, 'Ramp', 'Ramp', '2024-01-16', 18, 1)
      ]
      const deviceId = 'device-123'
      const jsonList = FermentationStep.listToJson(steps, deviceId)

      expect(jsonList).toHaveLength(2)
      expect(jsonList[0].deviceId).toBe('device-123')
      expect(jsonList[0].name).toBe('Pitch')
      expect(jsonList[1].deviceId).toBe('device-123')
      expect(jsonList[1].name).toBe('Ramp')
    })

    it('should preserve all properties in serialization', () => {
      const step = new FermentationStep(1, 'Test', 'Test Type', '2024-01-15', 20, 5)
      const jsonList = FermentationStep.listToJson([step], 'dev-1')

      expect(jsonList[0]).toEqual({
        order: 1,
        name: 'Test',
        type: 'Test Type',
        date: '2024-01-15',
        temp: 20,
        days: 5,
        deviceId: 'dev-1'
      })
    })
  })

  describe('toJson - Instance Method', () => {
    it('should convert FermentationStep to JSON', () => {
      const step = new FermentationStep(1, 'Pitch', 'Pitch', '2024-01-15', 10, 0)
      const json = step.toJson()

      expect(json).toEqual({
        order: 1,
        name: 'Pitch',
        type: 'Pitch',
        date: '2024-01-15',
        temp: 10,
        days: 0
      })
    })

    it('should handle all data types in serialization', () => {
      const step = new FermentationStep(99, 'Complex Name', 'Complex Type', '2024-12-31', 25.5, 7)
      const json = step.toJson()

      expect(json.order).toBe(99)
      expect(json.name).toBe('Complex Name')
      expect(json.type).toBe('Complex Type')
      expect(json.date).toBe('2024-12-31')
      expect(json.temp).toBe(25.5)
      expect(json.days).toBe(7)
    })
  })

  describe('Property Getters and Setters', () => {
    it('should get and set order', () => {
      const step = new FermentationStep(1, 'Test', 'Type', '2024-01-15', 10, 1)
      step.order = 5
      expect(step.order).toBe(5)
    })

    it('should get and set name', () => {
      const step = new FermentationStep(1, 'Original', 'Type', '2024-01-15', 10, 1)
      step.name = 'Updated'
      expect(step.name).toBe('Updated')
    })

    it('should get and set type', () => {
      const step = new FermentationStep(1, 'Test', 'Original', '2024-01-15', 10, 1)
      step.type = 'NewType'
      expect(step.type).toBe('NewType')
    })

    it('should get and set date', () => {
      const step = new FermentationStep(1, 'Test', 'Type', '2024-01-15', 10, 1)
      step.date = '2024-02-20'
      expect(step.date).toBe('2024-02-20')
    })

    it('should get and set temp', () => {
      const step = new FermentationStep(1, 'Test', 'Type', '2024-01-15', 10, 1)
      step.temp = 22.5
      expect(step.temp).toBe(22.5)
    })

    it('should get and set days', () => {
      const step = new FermentationStep(1, 'Test', 'Type', '2024-01-15', 10, 1)
      step.days = 14
      expect(step.days).toBe(14)
    })
  })
})
