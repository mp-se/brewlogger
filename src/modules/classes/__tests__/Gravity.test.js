import { describe, it, expect } from 'vitest'
import { Gravity } from '@/modules/classes'

describe('Gravity - Data Class', () => {
  describe('Constructor', () => {
    it('should create a Gravity with default values', () => {
      const g = new Gravity()
      expect(g.id).toBe(0)
      expect(g.gravity).toBe(0.0)
    })

    it('should use provided values', () => {
      const g = new Gravity({ id: 5, gravity: 1.055 })
      expect(g.id).toBe(5)
      expect(g.gravity).toBe(1.055)
    })
  })
})
