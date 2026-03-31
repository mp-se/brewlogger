import { describe, it, expect } from 'vitest'
import { BrewfatherBatch } from '@/modules/classes'

describe('BrewfatherBatch - Data Class', () => {
  describe('Constructor', () => {
    it('should create a BrewfatherBatch with default values', () => {
      const batch = new BrewfatherBatch()
      expect(batch.brewfatherId).toBe('')
      expect(batch.name).toBe('')
      expect(batch.brewDate).toBe('')
      expect(batch.style).toBe('')
      expect(batch.brewer).toBe('')
      expect(batch.abv).toBe(0)
      expect(batch.ebc).toBe(0)
      expect(batch.ibu).toBe(0)
      expect(batch.fermentationSteps).toBe('')
    })

    it('should create a BrewfatherBatch with provided values', () => {
      const batch = new BrewfatherBatch(
        'bf-123',
        'IPA Premium',
        '2024-01-01',
        'IPA',
        'John Brewer',
        6.8,
        50,
        65,
        1.065,
        1.01,
        'step-data'
      )
      expect(batch.brewfatherId).toBe('bf-123')
      expect(batch.name).toBe('IPA Premium')
      expect(batch.brewDate).toBe('2024-01-01')
      expect(batch.style).toBe('IPA')
      expect(batch.brewer).toBe('John Brewer')
      expect(batch.abv).toBe(6.8)
      expect(batch.ebc).toBe(50)
      expect(batch.ibu).toBe(65)
      expect(batch.og).toBe(1.065)
      expect(batch.fg).toBe(1.01)
      expect(batch.fermentationSteps).toBe('step-data')
    })

    it('should handle partial initialization', () => {
      const batch = new BrewfatherBatch('bf-456', 'Stout')
      expect(batch.brewfatherId).toBe('bf-456')
      expect(batch.name).toBe('Stout')
      expect(batch.brewDate).toBe('')
      expect(batch.abv).toBe(0)
    })
  })

  describe('fromJson - Static Method', () => {
    it('should create BrewfatherBatch from JSON object', () => {
      const json = {
        brewfatherId: 'bf-789',
        name: 'Double IPA',
        brewDate: '2024-02-15',
        style: 'DIPA',
        brewer: 'Jane Smith',
        abv: 8.5,
        ebc: 65,
        ibu: 85,
        og: 1.075,
        fg: 1.01,
        fermentationSteps: 'fermentation-data'
      }
      const batch = BrewfatherBatch.fromJson(json)
      expect(batch.brewfatherId).toBe('bf-789')
      expect(batch.name).toBe('Double IPA')
      expect(batch.brewDate).toBe('2024-02-15')
      expect(batch.style).toBe('DIPA')
      expect(batch.brewer).toBe('Jane Smith')
      expect(batch.abv).toBe(8.5)
      expect(batch.ebc).toBe(65)
      expect(batch.ibu).toBe(85)
      expect(batch.og).toBe(1.075)
      expect(batch.fg).toBe(1.01)
      expect(batch.fermentationSteps).toBe('fermentation-data')
    })

    it('should handle minimal JSON object', () => {
      const json = { brewfatherId: 'bf-101' }
      const batch = BrewfatherBatch.fromJson(json)
      expect(batch.brewfatherId).toBe('bf-101')
      expect(batch.name).toBe('')
    })
  })

  describe('Property Getters and Setters', () => {
    it('should get and set all properties', () => {
      const batch = new BrewfatherBatch()
      batch.brewfatherId = 'bf-999'
      batch.name = 'Porter'
      batch.brewDate = '2024-03-01'
      batch.style = 'Porter'
      batch.brewer = 'Bob Brewer'
      batch.abv = 5.5
      batch.ebc = 40
      batch.ibu = 40
      batch.og = 1.055
      batch.fg = 1.012
      batch.fermentationSteps = 'porter-steps'

      expect(batch.brewfatherId).toBe('bf-999')
      expect(batch.name).toBe('Porter')
      expect(batch.brewDate).toBe('2024-03-01')
      expect(batch.style).toBe('Porter')
      expect(batch.brewer).toBe('Bob Brewer')
      expect(batch.abv).toBe(5.5)
      expect(batch.ebc).toBe(40)
      expect(batch.ibu).toBe(40)
      expect(batch.og).toBe(1.055)
      expect(batch.fg).toBe(1.012)
      expect(batch.fermentationSteps).toBe('porter-steps')
    })

    it('should be able to modify multiple times', () => {
      const batch = new BrewfatherBatch('bf-111', 'Lager')
      batch.abv = 5.0
      expect(batch.abv).toBe(5.0)
      batch.abv = 6.0
      expect(batch.abv).toBe(6.0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle special characters in names and descriptions', () => {
      const batch = new BrewfatherBatch(
        'bf-123',
        'Porter & Stout Mix™',
        '2024-01-01',
        'Specialty IPA/Porter'
      )
      expect(batch.name).toBe('Porter & Stout Mix™')
      expect(batch.style).toBe('Specialty IPA/Porter')
    })

    it('should handle very high ABV values', () => {
      const batch = new BrewfatherBatch(
        'bf-123',
        'Barley Wine',
        '2024-01-01',
        'Barley Wine',
        'Brewer',
        12.5,
        0,
        0,
        1.1,
        1.02
      )
      expect(batch.abv).toBe(12.5)
    })

    it('should handle zero values', () => {
      const batch = new BrewfatherBatch(
        'bf-123',
        'Test',
        '2024-01-01',
        'Test',
        'Test',
        0,
        0,
        0,
        0,
        0
      )
      expect(batch.abv).toBe(0)
      expect(batch.ebc).toBe(0)
      expect(batch.ibu).toBe(0)
      expect(batch.og).toBe(0)
      expect(batch.fg).toBe(0)
    })

    it('should handle empty brewfatherId', () => {
      const batch = new BrewfatherBatch('', 'Local Batch')
      expect(batch.brewfatherId).toBe('')
      expect(batch.name).toBe('Local Batch')
    })

    it('should initialize og and fg to 0 by default', () => {
      const batch = new BrewfatherBatch()
      expect(batch.og).toBe(0)
      expect(batch.fg).toBe(0)
    })

    it('should handle realistic gravity values for og and fg', () => {
      const batch = new BrewfatherBatch(
        'bf-456',
        'Session IPA',
        '2024-01-15',
        'IPA',
        'Brewer',
        5.2,
        35,
        50,
        1.045,
        1.008
      )
      expect(batch.og).toBe(1.045)
      expect(batch.fg).toBe(1.008)
      // Verify ABV and other properties also set correctly
      expect(batch.abv).toBe(5.2)
      expect(batch.ebc).toBe(35)
      expect(batch.ibu).toBe(50)
    })

    it('should handle JSON string in fermentationSteps', () => {
      const stepsJson = '{"step1": "mash", "step2": "sparge"}'
      const batch = new BrewfatherBatch(
        'bf-123',
        'Test',
        '2024-01-01',
        'Test',
        'Test',
        0,
        0,
        0,
        0,
        0,
        stepsJson
      )
      expect(batch.fermentationSteps).toBe(stepsJson)
    })
  })
})
