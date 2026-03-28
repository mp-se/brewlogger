import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setSortingDefault, sortedClass, sortList, applySortList } from '../ui'

// Mock the logger
vi.mock('../logger', () => ({
  logDebug: vi.fn()
}))

describe('ui.js - UI Utilities', () => {
  describe('setSortingDefault', () => {
    it('should set the default sorting configuration', () => {
      setSortingDefault('name', 'str', false)
      // Verify by calling sortedClass which uses this internal state
      const result = sortedClass('name')
      expect(result).toBe('text-primary')
    })

    it('should handle different column names', () => {
      setSortingDefault('date', 'date', true)
      const result = sortedClass('date')
      expect(result).toBe('text-primary')
    })

    it('should handle numeric column types', () => {
      setSortingDefault('quantity', 'num', false)
      const result = sortedClass('quantity')
      expect(result).toBe('text-primary')
    })
  })

  describe('sortedClass', () => {
    beforeEach(() => {
      setSortingDefault('name', 'str', false)
    })

    it('should return text-primary for the sorted column', () => {
      const result = sortedClass('name')
      expect(result).toBe('text-primary')
    })

    it('should return empty string for non-sorted columns', () => {
      const result = sortedClass('date')
      expect(result).toBe('')
    })

    it('should handle multiple different columns', () => {
      expect(sortedClass('name')).toBe('text-primary')
      expect(sortedClass('age')).toBe('')
      expect(sortedClass('email')).toBe('')
    })
  })

  describe('sortList - String sorting', () => {
    it('should sort strings in ascending order', () => {
      const list = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }]
      setSortingDefault('name', 'str', false)
      sortList(list, 'name', 'str')
      expect(list[0].name).toBe('Alice')
      expect(list[1].name).toBe('Bob')
      expect(list[2].name).toBe('Charlie')
    })

    it('should sort strings in descending order on second click', () => {
      const list = [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }]
      setSortingDefault('name', 'str', false)
      sortList(list, 'name', 'str')
      sortList(list, 'name', 'str')
      expect(list[0].name).toBe('Charlie')
      expect(list[1].name).toBe('Bob')
      expect(list[2].name).toBe('Alice')
    })

    it('should toggle sort order', () => {
      const list = [{ name: 'b' }, { name: 'a' }, { name: 'c' }]
      setSortingDefault('name', 'str', false)
      
      sortList(list, 'name', 'str')
      expect(list[0].name).toBe('a')
      
      sortList(list, 'name', 'str')
      expect(list[0].name).toBe('c')
    })
  })

  describe('sortList - Numeric sorting', () => {
    it('should sort numbers in ascending order', () => {
      const list = [{ quantity: 30 }, { quantity: 10 }, { quantity: 20 }]
      setSortingDefault('quantity', 'num', false)
      sortList(list, 'quantity', 'num')
      expect(list[0].quantity).toBe(10)
      expect(list[1].quantity).toBe(20)
      expect(list[2].quantity).toBe(30)
    })

    it('should sort numbers in descending order', () => {
      const list = [{ quantity: 10 }, { quantity: 20 }, { quantity: 30 }]
      setSortingDefault('quantity', 'num', false)
      sortList(list, 'quantity', 'num')
      sortList(list, 'quantity', 'num')
      expect(list[0].quantity).toBe(30)
      expect(list[1].quantity).toBe(20)
      expect(list[2].quantity).toBe(10)
    })
  })

  describe('sortList - Date sorting', () => {
    it('should sort dates in ascending order', () => {
      const list = [
        { date: '2024-03-15' },
        { date: '2024-01-10' },
        { date: '2024-02-20' }
      ]
      setSortingDefault('date', 'date', false)
      sortList(list, 'date', 'date')
      expect(list[0].date).toBe('2024-01-10')
      expect(list[1].date).toBe('2024-02-20')
      expect(list[2].date).toBe('2024-03-15')
    })

    it('should sort ISO date strings correctly', () => {
      const list = [
        { date: '2024-03-15T10:30:00Z' },
        { date: '2024-01-10T10:30:00Z' },
        { date: '2024-02-20T10:30:00Z' }
      ]
      setSortingDefault('date', 'date', false)
      sortList(list, 'date', 'date')
      expect(list[0].date).toBe('2024-01-10T10:30:00Z')
    })
  })

  describe('applySortList', () => {
    it('should apply descending sort when order is false', () => {
      const list = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }]
      setSortingDefault('name', 'str', false)
      applySortList(list)
      // When order=false, sorts descending (Z to A)
      expect(list[0].name).toBe('Charlie')
      expect(list[1].name).toBe('Bob')
      expect(list[2].name).toBe('Alice')
    })

    it('should apply ascending sort when order is true', () => {
      const list = [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }]
      setSortingDefault('name', 'str', true)
      applySortList(list)
      // When order=true, sorts ascending (A to Z)
      expect(list[0].name).toBe('Alice')
      expect(list[1].name).toBe('Bob')
      expect(list[2].name).toBe('Charlie')
    })

    it('should handle numeric sorting descending', () => {
      const list = [{ value: 30 }, { value: 10 }, { value: 20 }]
      setSortingDefault('value', 'num', false)
      applySortList(list)
      // When order=false, sorts descending (high to low)
      expect(list[0].value).toBe(30)
      expect(list[1].value).toBe(20)
      expect(list[2].value).toBe(10)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty list', () => {
      const list = []
      setSortingDefault('name', 'str', false)
      sortList(list, 'name', 'str')
      expect(list).toEqual([])
    })

    it('should handle single item list', () => {
      const list = [{ name: 'Alice' }]
      setSortingDefault('name', 'str', false)
      sortList(list, 'name', 'str')
      expect(list[0].name).toBe('Alice')
    })

    it('should handle duplicate values', () => {
      const list = [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Alice' }]
      setSortingDefault('name', 'str', false)
      sortList(list, 'name', 'str')
      expect(list[0].name).toBe('Alice')
      expect(list[1].name).toBe('Alice')
      expect(list[2].name).toBe('Bob')
    })
  })
})
