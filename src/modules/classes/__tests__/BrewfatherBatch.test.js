// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect } from 'vitest'
import { BrewfatherBatch } from '@/modules/classes'

describe('BrewfatherBatch - Data Class', () => {
  describe('Constructor', () => {
    it('should create with defaults', () => {
      const bb = new BrewfatherBatch()
      expect(bb.name).toBe('')
    })

    it('should use provided values', () => {
      const bb = new BrewfatherBatch({ brewfatherId: 'bf1', name: 'Recipe' })
      expect(bb.brewfatherId).toBe('bf1')
      expect(bb.name).toBe('Recipe')
    })
  })
})
