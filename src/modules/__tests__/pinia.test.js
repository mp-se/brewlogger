import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { createConfigSnapshot, detectConfigChanges, hasSignificantChanges } from '@/modules/pinia'

// Mock logger module to avoid logging output during tests
vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn()
}))

describe('pinia utilities', () => {
  describe('createConfigSnapshot', () => {
    it('should create a snapshot filtering out functions', () => {
      const config = {
        isTempF: true,
        isPressurePSI: false,
        someFunction: () => {},
        anotherKey: 'value'
      }

      const snapshot = createConfigSnapshot(config)

      expect(snapshot).toEqual({
        isTempF: true,
        isPressurePSI: false,
        anotherKey: 'value'
      })
      expect(snapshot.someFunction).toBeUndefined()
    })

    it('should filter out $id property', () => {
      const config = {
        isTempF: true,
        $id: 'internal-id',
        someValue: 42
      }

      const snapshot = createConfigSnapshot(config)

      expect(snapshot).toEqual({
        isTempF: true,
        someValue: 42
      })
      expect(snapshot.$id).toBeUndefined()
    })

    it('should handle empty object', () => {
      const config = {}

      const snapshot = createConfigSnapshot(config)

      expect(snapshot).toEqual({})
    })

    it('should preserve nested objects and arrays', () => {
      const config = {
        simpleValue: 'test',
        nestedObject: { key: 'value' },
        arrayValue: [1, 2, 3],
        functionValue: () => {}
      }

      const snapshot = createConfigSnapshot(config)

      expect(snapshot.nestedObject).toEqual({ key: 'value' })
      expect(snapshot.arrayValue).toEqual([1, 2, 3])
      expect(snapshot.functionValue).toBeUndefined()
    })

    it('should handle various value types', () => {
      const config = {
        stringVal: 'test',
        numberVal: 42,
        boolVal: true,
        nullVal: null,
        undefinedVal: undefined,
        dateVal: new Date('2025-01-01')
      }

      const snapshot = createConfigSnapshot(config)

      expect(snapshot.stringVal).toBe('test')
      expect(snapshot.numberVal).toBe(42)
      expect(snapshot.boolVal).toBe(true)
      expect(snapshot.nullVal).toBeNull()
      expect(snapshot.undefinedVal).toBeUndefined()
      expect(snapshot.dateVal).toBeInstanceOf(Date)
    })
  })

  describe('detectConfigChanges', () => {
    it('should detect simple value changes', () => {
      const saved = { isTempF: true, isPressurePSI: false }
      const current = { isTempF: false, isPressurePSI: false }

      const changes = detectConfigChanges(saved, current)

      expect(changes).toEqual({ isTempF: false })
    })

    it('should detect multiple changes', () => {
      const saved = { a: 1, b: 2, c: 3 }
      const current = { a: 1, b: 20, c: 30 }

      const changes = detectConfigChanges(saved, current)

      expect(changes).toEqual({ b: 20, c: 30 })
    })

    it('should return empty object when no changes', () => {
      const saved = { key: 'value', count: 42 }
      const current = { key: 'value', count: 42 }

      const changes = detectConfigChanges(saved, current)

      expect(changes).toEqual({})
    })

    it('should handle null or undefined in current values', () => {
      const saved = { a: 'value', b: 42 }
      const current = { a: null, b: undefined }

      const changes = detectConfigChanges(saved, current)

      expect(changes).toEqual({ a: null, b: undefined })
    })

    it('should not compare properties not in saved snapshot', () => {
      const saved = { a: 1, b: 2 }
      const current = { a: 1, b: 2, c: 3, d: 4 }

      const changes = detectConfigChanges(saved, current)

      expect(changes).toEqual({})
      expect(changes.c).toBeUndefined()
      expect(changes.d).toBeUndefined()
    })

    it('should handle null snapshot with error log', () => {
      const logErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const changes = detectConfigChanges(null, { a: 1 })

      expect(changes).toEqual({})
    })

    it('should handle object value changes', () => {
      const saved = { config: { nested: 'old' } }
      const current = { config: { nested: 'new' } }

      const changes = detectConfigChanges(saved, current)

      expect(changes).toHaveProperty('config')
      expect(changes.config).toEqual({ nested: 'new' })
    })

    it('should use loose equality (!=) for comparison', () => {
      const saved = { count: '42' }
      const current = { count: 42 }

      const changes = detectConfigChanges(saved, current)

      // '42' != 42 is false in JavaScript (loose equality)
      expect(changes).toEqual({})
    })
  })

  describe('hasSignificantChanges', () => {
    it('should return false for empty changes object', () => {
      const result = hasSignificantChanges({})

      expect(result).toBe(false)
    })

    it('should return true for single property change', () => {
      const result = hasSignificantChanges({ key: 'value' })

      expect(result).toBe(true)
    })

    it('should return true for multiple changes', () => {
      const result = hasSignificantChanges({ a: 1, b: 2, c: 3 })

      expect(result).toBe(true)
    })

    it('should return true for changes with various value types', () => {
      const result = hasSignificantChanges({ key: null, other: undefined })

      expect(result).toBe(true)
    })

    it('should handle deeply nested changes', () => {
      const result = hasSignificantChanges({
        config: { nested: { deep: 'value' } },
        settings: [1, 2, 3]
      })

      expect(result).toBe(true)
    })

    it('should return false only when JSON is exactly "{}"', () => {
      expect(hasSignificantChanges({})).toBe(false)
      expect(hasSignificantChanges({ _: false })).toBe(true)
      expect(hasSignificantChanges({ a: 0 })).toBe(true)
    })
  })

  describe('Integration scenarios', () => {
    it('should detect changes across snapshot cycle', () => {
      // Simulates real usage: save snapshot, modify config, detect changes
      const initialConfig = {
        isTempF: true,
        isPressurePSI: false,
        breweryName: 'My Brewery'
      }

      const snapshot = createConfigSnapshot(initialConfig)
      expect(snapshot).toEqual(initialConfig)

      // Simulate only temperature unit changing
      const updatedConfig = {
        isTempF: false,
        isPressurePSI: false,
        breweryName: 'My Brewery'
      }

      const changes = detectConfigChanges(snapshot, updatedConfig)
      const hasChanges = hasSignificantChanges(changes)

      expect(changes).toEqual({ isTempF: false })
      expect(hasChanges).toBe(true)
    })

    it('should handle no changes in snapshot cycle', () => {
      const config = {
        setting1: 'value1',
        setting2: 42,
        setting3: true
      }

      const snapshot = createConfigSnapshot(config)
      const unchangedConfig = createConfigSnapshot(config)

      const changes = detectConfigChanges(snapshot, unchangedConfig)
      const hasChanges = hasSignificantChanges(changes)

      expect(changes).toEqual({})
      expect(hasChanges).toBe(false)
    })

    it('should properly format config snapshot with mixed types', () => {
      const complexConfig = {
        appVersion: '1.0.0',
        isTempF: false,
        isPressurePSI: true,
        breweryId: 123,
        lastSync: new Date('2025-01-01'),
        settings: { theme: 'dark', lang: 'en' },
        $id: 'should-be-filtered',
        save: () => {},
        _internal: 'private'
      }

      const snapshot = createConfigSnapshot(complexConfig)

      expect(snapshot).not.toHaveProperty('$id')
      expect(snapshot).not.toHaveProperty('save')
      expect(snapshot).toHaveProperty('appVersion', '1.0.0')
      expect(snapshot).toHaveProperty('isTempF', false)
      expect(snapshot).toHaveProperty('settings')
    })

    it('should handle rapid consecutive snapshot-diff cycles', () => {
      const config1 = { a: 1, b: 2 }
      const config2 = { a: 1, b: 3 }
      const config3 = { a: 2, b: 3 }

      // First cycle
      const snap1 = createConfigSnapshot(config1)
      const diff1 = detectConfigChanges(snap1, createConfigSnapshot(config2))
      expect(diff1).toEqual({ b: 3 })

      // Second cycle starting from new base
      const snap2 = createConfigSnapshot(config2)
      const diff2 = detectConfigChanges(snap2, createConfigSnapshot(config3))
      expect(diff2).toEqual({ a: 2 })
    })

    it('should detect all property types as changes', () => {
      const snapshot = {
        string: 'old',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        object: { key: 'old' }
      }

      const updated = {
        string: 'new',
        number: 99,
        boolean: false,
        array: [4, 5, 6],
        object: { key: 'new' }
      }

      const changes = detectConfigChanges(snapshot, updated)

      expect(changes).toEqual(updated)
      expect(Object.keys(changes).length).toBe(5)
    })

    it('should differentiate between zero/false and undefined values', () => {
      const saved = {
        countA: 0,
        countB: 1,
        flagA: false,
        flagB: true,
        valueA: null
      }

      const current = {
        countA: 1,
        countB: 0,
        flagA: false,
        flagB: false,
        valueA: null
      }

      const changes = detectConfigChanges(saved, current)

      expect(changes).toEqual({
        countA: 1,
        countB: 0,
        flagB: false
      })
    })

    it('should handle large config objects', () => {
      const largeConfig = {}
      for (let i = 0; i < 100; i++) {
        largeConfig[`key${i}`] = `value${i}`
      }

      const snapshot = createConfigSnapshot(largeConfig)
      expect(Object.keys(snapshot).length).toBe(100)

      // Change a subset
      const updated = { ...largeConfig }
      updated.key50 = 'changed'
      updated.key75 = 'changed'

      const changes = detectConfigChanges(snapshot, updated)
      expect(Object.keys(changes).length).toBe(2)
      expect(changes).toHaveProperty('key50', 'changed')
      expect(changes).toHaveProperty('key75', 'changed')
    })
  })
})
