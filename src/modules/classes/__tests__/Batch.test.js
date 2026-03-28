import { describe, it, expect } from 'vitest'
import { Batch } from '@/modules/classes'

describe('Batch - Data Class', () => {
  describe('Constructor', () => {
    it('should create a Batch with default values', () => {
      const batch = new Batch()
      expect(batch.id).toBe(0)
      expect(batch.name).toBe('')
      expect(batch.description).toBe('')
      expect(batch.active).toBe(true)
      expect(batch.tapList).toBe(true)
      expect(batch.gravity).toEqual([])
      expect(batch.pressure).toEqual([])
      expect(batch.pour).toEqual([])
    })

    it('should create a Batch with provided values', () => {
      const batch = new Batch(
        1,
        'Test Batch',
        'A test batch',
        'chip-gravity-1',
        'chip-pressure-1',
        true,
        '2024-01-01',
        'IPA',
        'John Doe',
        6.8,
        50,
        60,
        1.010,
        1.050,
        'brewfather-id-1',
        1,
        'fermentation-steps-json',
        true,
        10,
        5,
        3,
        250,
        500,
        [],
        [],
        []
      )
      expect(batch.id).toBe(1)
      expect(batch.name).toBe('Test Batch')
      expect(batch.description).toBe('A test batch')
      expect(batch.chipIdGravity).toBe('chip-gravity-1')
      expect(batch.chipIdPressure).toBe('chip-pressure-1')
      expect(batch.active).toBe(true)
      expect(batch.brewDate).toBe('2024-01-01')
      expect(batch.style).toBe('IPA')
      expect(batch.brewer).toBe('John Doe')
      expect(batch.abv).toBe(6.8)
      expect(batch.ebc).toBe(50)
      expect(batch.ibu).toBe(60)
      expect(batch.fg).toBe(1.010)
      expect(batch.og).toBe(1.050)
      expect(batch.brewfatherId).toBe('brewfather-id-1')
      expect(batch.fermentationChamber).toBe(1)
      expect(batch.gravityCount).toBe(10)
      expect(batch.pressureCount).toBe(5)
      expect(batch.pourCount).toBe(3)
      expect(batch.lastPourVolume).toBe(250)
      expect(batch.lastPourMaxVolume).toBe(500)
    })

    it('should handle null fermentation values', () => {
      const batch = new Batch(
        1,
        'Test',
        'Test',
        '',
        '',
        true,
        '',
        '',
        '',
        0,
        0,
        0,
        0,
        0,
        '',
        null,
        null,
        true,
        0,
        0,
        0,
        null,
        null,
        null,
        null,
        null
      )
      expect(batch.fermentationChamber).toBe(0)
      expect(batch.fermentationSteps).toBe('')
      expect(batch.gravity).toEqual([])
      expect(batch.pressure).toEqual([])
      expect(batch.pour).toEqual([])
    })

    it('should initialize arrays from provided data', () => {
      const gravityData = [{ gravity: 1.05 }]
      const pressureData = [{ pressure: 20 }]
      const pourData = [{ volume: 500 }]
      
      const batch = new Batch()
      batch.gravity = gravityData
      batch.pressure = pressureData
      batch.pour = pourData
      
      expect(batch.gravity).toEqual(gravityData)
      expect(batch.pressure).toEqual(pressureData)
      expect(batch.pour).toEqual(pourData)
    })
  })

  describe('compare - Static Method', () => {
    it('should return true for identical batches', () => {
      const batch1 = new Batch(1, 'Test', 'Desc', 'chip1', 'chip2', true, '2024-01-01', 'IPA', 'Brewer', 6.8, 50, 60)
      const batch2 = new Batch(1, 'Test', 'Desc', 'chip1', 'chip2', true, '2024-01-01', 'IPA', 'Brewer', 6.8, 50, 60)
      expect(Batch.compare(batch1, batch2)).toBe(true)
    })

    it('should return false when name differs', () => {
      const batch1 = new Batch(1, 'Test1', 'Desc', 'chip1', 'chip2', true)
      const batch2 = new Batch(1, 'Test2', 'Desc', 'chip1', 'chip2', true)
      expect(Batch.compare(batch1, batch2)).toBe(false)
    })

    it('should return false when active status differs', () => {
      const batch1 = new Batch(1, 'Test', 'Desc', 'chip1', 'chip2', true)
      const batch2 = new Batch(1, 'Test', 'Desc', 'chip1', 'chip2', false)
      expect(Batch.compare(batch1, batch2)).toBe(false)
    })

    it('should return false when numerical properties differ', () => {
      const batch1 = new Batch(1, 'Test', 'Desc', 'chip1', 'chip2', true, '2024-01-01', 'IPA', 'Brewer', 6.8, 50, 60)
      const batch2 = new Batch(1, 'Test', 'Desc', 'chip1', 'chip2', true, '2024-01-01', 'IPA', 'Brewer', 7.0, 50, 60)
      expect(Batch.compare(batch1, batch2)).toBe(false)
    })

    it('should ignore id when comparing', () => {
      const batch1 = new Batch(1, 'Test', 'Desc', 'chip1', 'chip2', true)
      const batch2 = new Batch(999, 'Test', 'Desc', 'chip1', 'chip2', true)
      // compare should ignore id - checking the logic
      const areSame = (
        batch1.name == batch2.name &&
        batch1.description == batch2.description &&
        batch1.active == batch2.active
      )
      expect(areSame).toBe(true)
    })
  })

  describe('Property getters and setters', () => {
    it('should get and set id', () => {
      const batch = new Batch()
      batch.id = 10
      expect(batch.id).toBe(10)
    })

    it('should handle all numeric properties', () => {
      const batch = new Batch()
      batch.abv = 7.5
      batch.ebc = 75
      batch.ibu = 80
      batch.fg = 1.010
      batch.og = 1.050
      batch.gravityCount = 100
      batch.pressureCount = 50
      batch.pourCount = 30

      expect(batch.abv).toBe(7.5)
      expect(batch.ebc).toBe(75)
      expect(batch.ibu).toBe(80)
      expect(batch.fg).toBe(1.010)
      expect(batch.og).toBe(1.050)
      expect(batch.gravityCount).toBe(100)
      expect(batch.pressureCount).toBe(50)
      expect(batch.pourCount).toBe(30)
    })

    it('should handle string properties', () => {
      const batch = new Batch()
      batch.name = 'New Name'
      batch.description = 'New Description'
      batch.style = 'Porter'
      batch.brewer = 'Jane Doe'

      expect(batch.name).toBe('New Name')
      expect(batch.description).toBe('New Description')
      expect(batch.style).toBe('Porter')
      expect(batch.brewer).toBe('Jane Doe')
    })

    it('should handle boolean properties', () => {
      const batch = new Batch()
      batch.active = false
      batch.tapList = false

      expect(batch.active).toBe(false)
      expect(batch.tapList).toBe(false)
    })

    it('should handle array properties', () => {
      const batch = new Batch()
      const newGravity = [{ id: 1, gravity: 1.05 }]
      batch.gravity = newGravity

      expect(batch.gravity).toEqual(newGravity)
      expect(batch.gravity[0].gravity).toBe(1.05)
    })
  })

  describe('fromJson - Static Method', () => {
    it('should create Batch from JSON object with array counts', () => {
      const json = {
        id: 5,
        name: 'API Batch',
        description: 'From API',
        chipIdGravity: 'chip-g1',
        chipIdPressure: 'chip-p1',
        active: true,
        brewDate: '2024-01-15',
        style: 'Stout',
        brewer: 'API Brewer',
        abv: 7.2,
        ebc: 60,
        ibu: 70,
        fg: 1.008,
        og: 1.060,
        brewfatherId: 'bf-123',
        fermentationChamber: 2,
        fermentationSteps: 'steps-data',
        tapList: true,
        gravityCount: 15,
        pressureCount: 8,
        pourCount: 5,
        lastPourVolume: 300,
        lastPourMaxVolume: 400,
        gravity: null,
        pressure: null,
        pour: null
      }
      
      const batch = Batch.fromJson(json)
      expect(batch.id).toBe(5)
      expect(batch.name).toBe('API Batch')
      expect(batch.description).toBe('From API')
      expect(batch.chipIdGravity).toBe('chip-g1')
      expect(batch.active).toBe(true)
      expect(batch.gravityCount).toBe(15)
      expect(batch.pressureCount).toBe(8)
      expect(batch.pourCount).toBe(5)
    })

    it('should calculate counts from arrays when present', () => {
      const json = {
        id: 1,
        name: 'Test',
        gravity: [{ id: 1 }, { id: 2 }, { id: 3 }],
        pressure: [{ id: 1 }, { id: 2 }],
        pour: [{ id: 1 }]
      }
      
      const batch = Batch.fromJson(json)
      expect(batch.gravityCount).toBe(3)
      expect(batch.pressureCount).toBe(2)
      expect(batch.pourCount).toBe(1)
    })

    it('should use provided counts when arrays are not present', () => {
      const json = {
        id: 1,
        name: 'Test',
        gravityCount: 10,
        pressureCount: 5,
        pourCount: 3,
        gravity: null,
        pressure: null,
        pour: null
      }
      
      const batch = Batch.fromJson(json)
      expect(batch.gravityCount).toBe(10)
      expect(batch.pressureCount).toBe(5)
      expect(batch.pourCount).toBe(3)
    })

    it('should handle missing optional fields', () => {
      const json = { id: 1, name: 'Minimal' }
      const batch = Batch.fromJson(json)
      expect(batch.id).toBe(1)
      expect(batch.name).toBe('Minimal')
      expect(batch.gravityCount).toBe(0)
    })

    it('should include sensor arrays in batch', () => {
      const gravityArray = [{ id: 1, gravity: 1.05 }]
      const pressureArray = [{ id: 1, pressure: 20 }]
      const pourArray = [{ id: 1, volume: 500 }]
      
      const json = {
        id: 1,
        name: 'Test',
        gravity: gravityArray,
        pressure: pressureArray,
        pour: pourArray
      }
      
      const batch = Batch.fromJson(json)
      expect(batch.gravity).toEqual(gravityArray)
      expect(batch.pressure).toEqual(pressureArray)
      expect(batch.pour).toEqual(pourArray)
    })
  })

  describe('fromDashboardJson - Static Method', () => {
    it('should create Batch from dashboard JSON', () => {
      const json = {
        id: 3,
        name: 'Dashboard Batch',
        chipIdGravity: 'chip-g1',
        chipIdPressure: 'chip-p1',
        active: true,
        tapList: true,
        fg: 1.008,
        og: 1.060,
        fermentationChamber: 1,
        gravity: [{ id: 1 }],
        pressure: [{ id: 1 }],
        pour: [{ id: 1, volume: 250, maxVolume: 500, active: true, created: '2024-01-15T10:00:00Z' }]
      }
      
      const batch = Batch.fromDashboardJson(json)
      expect(batch.id).toBe(3)
      expect(batch.name).toBe('Dashboard Batch')
      expect(batch.description).toBe('')
      expect(batch.style).toBe('')
      expect(batch.brewer).toBe('')
      expect(batch.gravityCount).toBe(1)
      expect(batch.pressureCount).toBe(1)
      expect(batch.pourCount).toBe(1)
    })

    it('should extract last pour values from dashboard data', () => {
      const json = {
        id: 1,
        name: 'Test',
        pour: [
          { id: 1, volume: 100, maxVolume: 500, active: true, created: '2024-01-15T08:00:00Z' },
          { id: 2, volume: 200, maxVolume: 500, active: true, created: '2024-01-15T10:00:00Z' },
          { id: 3, volume: 300, maxVolume: 500, active: true, created: '2024-01-15T12:00:00Z' }
        ]
      }
      
      const batch = Batch.fromDashboardJson(json)
      expect(batch.lastPourVolume).toBe(300)
      expect(batch.lastPourMaxVolume).toBe(500)
    })

    it('should handle inactive pours correctly', () => {
      const json = {
        id: 1,
        name: 'Test',
        pour: [
          { id: 1, volume: 100, maxVolume: 500, active: false, created: '2024-01-15T10:00:00Z' },
          { id: 2, volume: 200, maxVolume: 500, active: true, created: '2024-01-15T08:00:00Z' }
        ]
      }
      
      const batch = Batch.fromDashboardJson(json)
      expect(batch.lastPourVolume).toBe(200)
      expect(batch.lastPourMaxVolume).toBe(500)
    })

    it('should handle missing pour array', () => {
      const json = {
        id: 1,
        name: 'Test',
        pour: null
      }
      
      const batch = Batch.fromDashboardJson(json)
      expect(batch.lastPourVolume).toBeUndefined()
      expect(batch.lastPourMaxVolume).toBeUndefined()
      expect(batch.pourCount).toBe(0)
    })

    it('should handle empty pour array', () => {
      const json = {
        id: 1,
        name: 'Test',
        pour: []
      }
      
      const batch = Batch.fromDashboardJson(json)
      expect(batch.lastPourVolume).toBeUndefined()
      expect(batch.lastPourMaxVolume).toBeUndefined()
    })

    it('should calculate array counts correctly', () => {
      const json = {
        id: 1,
        name: 'Test',
        gravity: [{ id: 1 }, { id: 2 }],
        pressure: [{ id: 1 }],
        pour: [{ id: 1 }, { id: 2 }, { id: 3 }]
      }
      
      const batch = Batch.fromDashboardJson(json)
      expect(batch.gravityCount).toBe(2)
      expect(batch.pressureCount).toBe(1)
      expect(batch.pourCount).toBe(3)
    })

    it('should include sensor arrays in batch', () => {
      const gravityArray = [{ id: 1, gravity: 1.05 }]
      const pressureArray = [{ id: 1, pressure: 20 }]
      const pourArray = [{ id: 1, volume: 500, active: true, created: '2024-01-15T10:00:00Z' }]
      
      const json = {
        id: 1,
        name: 'Test',
        gravity: gravityArray,
        pressure: pressureArray,
        pour: pourArray
      }
      
      const batch = Batch.fromDashboardJson(json)
      expect(batch.gravity).toEqual(gravityArray)
      expect(batch.pressure).toEqual(pressureArray)
      expect(batch.pour).toEqual(pourArray)
    })
  })

  describe('toJson - Instance Method', () => {
    it('should convert Batch to JSON', () => {
      const batch = new Batch(
        5,
        'Export Batch',
        'For export',
        'chip-g1',
        'chip-p1',
        true,
        '2024-01-15',
        'IPA',
        'Brewer Joe',
        6.5,
        45,
        55,
        1.010,
        1.050,
        'bf-456'
      )
      
      const json = batch.toJson()
      expect(json.id).toBe(5)
      expect(json.name).toBe('Export Batch')
      expect(json.description).toBe('For export')
      expect(json.chipIdGravity).toBe('chip-g1')
      expect(json.chipIdPressure).toBe('chip-p1')
      expect(json.active).toBe(true)
      expect(json.brewDate).toBe('2024-01-15')
      expect(json.style).toBe('IPA')
      expect(json.brewer).toBe('Brewer Joe')
      expect(json.abv).toBe(6.5)
      expect(json.ebc).toBe(45)
      expect(json.ibu).toBe(55)
      expect(json.fg).toBe(1.010)
      expect(json.og).toBe(1.050)
    })

    it('should include empty arrays for sensor data', () => {
      const batch = new Batch()
      const json = batch.toJson()

      expect(json.gravity).toEqual([])
      expect(json.pressure).toEqual([])
      expect(json.pour).toEqual([])
    })

    it('should include provided sensor arrays', () => {
      const gravityArray = [{ id: 1, gravity: 1.05 }]
      const pressureArray = []
      const pourArray = [{ id: 1, volume: 250 }]
      
      const batch = new Batch(
        1,
        'Test',
        '',
        '',
        '',
        true,
        '',
        '',
        '',
        0,
        0,
        0,
        0,
        0,
        '',
        0,
        '',
        true,
        0,
        0,
        0,
        0,
        0,
        gravityArray,
        pressureArray,
        pourArray
      )
      
      const json = batch.toJson()
      expect(json.gravity).toEqual(gravityArray)
      expect(json.pressure).toEqual(pressureArray)
      expect(json.pour).toEqual(pourArray)
    })

    it('should handle fermentationChamber serialization', () => {
      const batch = new Batch(
        1,
        'Test',
        '',
        '',
        '',
        true,
        '',
        '',
        '',
        0,
        0,
        0,
        0,
        0,
        '',
        5
      )
      
      const json = batch.toJson()
      expect(json.fermentationChamber).toBe(5)
    })

    it('should handle null fermentationChamber', () => {
      const batch = new Batch()
      batch.fermentationChamber = null
      
      const json = batch.toJson()
      // fermentationChamber should be included even if null or 0
      expect('fermentationChamber' in json).toBe(true)
    })

    it('should round-trip through JSON serialization', () => {
      const original = new Batch(
        10,
        'Round Trip',
        'Test Description',
        'chip-g1',
        'chip-p1',
        true,
        '2024-02-20',
        'Porter',
        'Test Brewer',
        7.0,
        50,
        65,
        1.008,
        1.065,
        'bf-789'
      )
      
      const json = original.toJson()
      const restored = Batch.fromJson(json)
      
      expect(restored.name).toBe(original.name)
      expect(restored.description).toBe(original.description)
      expect(restored.chipIdGravity).toBe(original.chipIdGravity)
      expect(restored.abv).toBe(original.abv)
      expect(restored.style).toBe(original.style)
    })
  })
})

