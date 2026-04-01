import { describe, it, expect } from 'vitest'
import { FermentationStep } from '@/modules/classes'

describe('FermentationStep - Data Class', () => {
  describe('Constructor', () => {
    it('should create with defaults', () => {
      const fs = new FermentationStep()
      expect(fs.name).toBe('')
    })

    it('should use provided values', () => {
      const fs = new FermentationStep({ order: 1, name: 'Cooling' })
      expect(fs.order).toBe(1)
      expect(fs.name).toBe('Cooling')
    })
  })
})
