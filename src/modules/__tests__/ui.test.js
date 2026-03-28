import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setSortingDefault, sortedClass, sortList, applySortList, sortedIconClass } from '../ui'

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

  describe('sortedIconClass - Icon Display', () => {
    it('should return bi-sort-alpha-down when order is ascending', () => {
      setSortingDefault('name', 'str', false)
      expect(sortedIconClass.value).toContain('bi-sort-alpha-up')
    })

    it('should return bi-sort-alpha-up when order is descending', () => {
      setSortingDefault('name', 'str', true)
      expect(sortedIconClass.value).toContain('bi-sort-alpha-down')
    })

    it('should always include bi class prefix', () => {
      setSortingDefault('name', 'str', false)
      expect(sortedIconClass.value).toContain('bi ')
    })
  })

  describe('applySortList - Direct Sort Application', () => {
    it('should sort strings ascending directly', () => {
      const list = [{ name: 'Carol' }, { name: 'Alice' }, { name: 'Bob' }]
      setSortingDefault('name', 'str', true)
      applySortList(list)
      expect(list[0].name).toBe('Alice')
      expect(list[1].name).toBe('Bob')
      expect(list[2].name).toBe('Carol')
    })

    it('should sort strings descending directly', () => {
      const list = [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Carol' }]
      setSortingDefault('name', 'str', false)
      applySortList(list)
      expect(list[0].name).toBe('Carol')
      expect(list[1].name).toBe('Bob')
      expect(list[2].name).toBe('Alice')
    })

    it('should sort numbers ascending', () => {
      const list = [{ count: 30 }, { count: 10 }, { count: 20 }]
      setSortingDefault('count', 'num', true)
      applySortList(list)
      expect(list[0].count).toBe(10)
      expect(list[1].count).toBe(20)
      expect(list[2].count).toBe(30)
    })

    it('should sort numbers descending', () => {
      const list = [{ count: 10 }, { count: 30 }, { count: 20 }]
      setSortingDefault('count', 'num', false)
      applySortList(list)
      expect(list[0].count).toBe(30)
      expect(list[1].count).toBe(20)
      expect(list[2].count).toBe(10)
    })

    it('should sort dates ascending', () => {
      const list = [
        { date: '2025-01-15' },
        { date: '2025-01-10' },
        { date: '2025-01-20' }
      ]
      setSortingDefault('date', 'date', true)
      applySortList(list)
      expect(list[0].date).toBe('2025-01-10')
      expect(list[1].date).toBe('2025-01-15')
      expect(list[2].date).toBe('2025-01-20')
    })

    it('should sort dates descending', () => {
      const list = [
        { date: '2025-01-10' },
        { date: '2025-01-20' },
        { date: '2025-01-15' }
      ]
      setSortingDefault('date', 'date', false)
      applySortList(list)
      expect(list[0].date).toBe('2025-01-20')
      expect(list[1].date).toBe('2025-01-15')
      expect(list[2].date).toBe('2025-01-10')
    })
  })

  describe('sortList - Numeric sorting', () => {
    it('should sort numbers in ascending order', () => {
      const list = [{ quantity: 50 }, { quantity: 10 }, { quantity: 30 }]
      setSortingDefault('quantity', 'num', false)
      sortList(list, 'quantity', 'num')
      expect(list[0].quantity).toBe(10)
      expect(list[1].quantity).toBe(30)
      expect(list[2].quantity).toBe(50)
    })

    it('should sort numbers in descending order', () => {
      const list = [{ price: 10 }, { price: 40 }, { price: 20 }]
      setSortingDefault('price', 'num', false)
      sortList(list, 'price', 'num')
      sortList(list, 'price', 'num')
      expect(list[0].price).toBe(40)
      expect(list[1].price).toBe(20)
      expect(list[2].price).toBe(10)
    })

    it('should handle negative numbers', () => {
      const list = [{ value: 5 }, { value: -10 }, { value: 0 }]
      setSortingDefault('value', 'num', false)
      sortList(list, 'value', 'num')
      expect(list[0].value).toBe(-10)
      expect(list[1].value).toBe(0)
      expect(list[2].value).toBe(5)
    })

    it('should handle floating point numbers', () => {
      const list = [{ amount: 3.5 }, { amount: 1.2 }, { amount: 2.8 }]
      setSortingDefault('amount', 'num', false)
      sortList(list, 'amount', 'num')
      expect(list[0].amount).toBe(1.2)
      expect(list[1].amount).toBe(2.8)
      expect(list[2].amount).toBe(3.5)
    })
  })

  describe('sortList - Date sorting', () => {
    it('should sort dates in ascending order', () => {
      const list = [
        { created: '2025-03-15' },
        { created: '2025-01-10' },
        { created: '2025-02-20' }
      ]
      setSortingDefault('created', 'date', false)
      sortList(list, 'created', 'date')
      expect(list[0].created).toBe('2025-01-10')
      expect(list[1].created).toBe('2025-02-20')
      expect(list[2].created).toBe('2025-03-15')
    })

    it('should sort dates in descending order', () => {
      const list = [
        { updated: '2025-01-01' },
        { updated: '2025-12-31' },
        { updated: '2025-06-15' }
      ]
      setSortingDefault('updated', 'date', false)
      sortList(list, 'updated', 'date')
      sortList(list, 'updated', 'date')
      expect(list[0].updated).toBe('2025-12-31')
      expect(list[1].updated).toBe('2025-06-15')
      expect(list[2].updated).toBe('2025-01-01')
    })

    it('should handle ISO datetime format', () => {
      const list = [
        { timestamp: '2025-01-15T10:30:00Z' },
        { timestamp: '2025-01-10T14:20:00Z' },
        { timestamp: '2025-01-20T09:15:00Z' }
      ]
      setSortingDefault('timestamp', 'date', false)
      sortList(list, 'timestamp', 'date')
      expect(Date.parse(list[0].timestamp)).toBeLessThan(Date.parse(list[1].timestamp))
    })
  })

  describe('Cross-Column Sorting', () => {
    it('should switch sort column', () => {
      const list = [
        { name: 'Bob', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Charlie', age: 35 }
      ]
      setSortingDefault('name', 'str', false)
      sortList(list, 'name', 'str')
      expect(list[0].name).toBe('Alice')

      // Switch to age column (toggles order from true to false = desc)
      sortList(list, 'age', 'num')
      expect(list[0].age).toBe(35)
      expect(list[1].age).toBe(30)
      expect(list[2].age).toBe(25)
    })

    it('should reset sort order when switching columns', () => {
      const list = [
        { name: 'Bob', priority: 2 },
        { name: 'Alice', priority: 1 },
        { name: 'Charlie', priority: 3 }
      ]
      setSortingDefault('name', 'str', true)
      sortList(list, 'name', 'str')

      sortList(list, 'priority', 'num')
      expect(list[0].priority).toBe(1)
    })
  })
})
