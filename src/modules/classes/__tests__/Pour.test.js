import { describe, it, expect } from 'vitest'
import { Pour } from '@/modules/classes'

describe('Pour - Data Class', () => {
  describe('Constructor', () => {
    it('should create defaults', () => {
      const p = new Pour()
      expect(p.id).toBe(0)
    })

    it('should use provided values', () => {
      const p = new Pour({ id: 50, pour: 500 })
      expect(p.id).toBe(50)
    })
  })
})
