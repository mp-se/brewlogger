import { describe, it, expect } from 'vitest'
import { Pressure } from '@/modules/classes'

describe('Pressure - Data Class', () => {
  describe('Constructor', () => {
    it('should create defaults', () => {
      const p = new Pressure()
      expect(p.id).toBe(0)
    })

    it('should use provided values', () => {
      const p = new Pressure({ id: 22, pressure: 1.5 })
      expect(p.id).toBe(22)
    })
  })
})
