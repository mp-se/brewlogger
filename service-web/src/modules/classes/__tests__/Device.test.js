// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect } from 'vitest'
import { Device } from '@/modules/classes'

describe('Device - Data Class', () => {
  describe('Constructor', () => {
    it('should create a Device with default values', () => {
      const device = new Device()
      expect(device.id).toBe(0)
    })

    it('should use provided values', () => {
      const device = new Device({ id: 1, chipId: 'esp' })
      expect(device.id).toBe(1)
      expect(device.chipId).toBe('esp')
    })
  })
})
