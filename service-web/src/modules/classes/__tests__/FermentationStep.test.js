// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect } from 'vitest'
import { FermentationStep } from '@/modules/classes'

describe('FermentationStep - Data Class', () => {
  describe('Constructor', () => {
    it('should create with defaults', () => {
      const fs = new FermentationStep()
      expect(fs.name).toBe('')
      expect(fs.control).toBe('fridge')
    })

    it('should use provided values', () => {
      const fs = new FermentationStep({ order: 1, name: 'Cooling' })
      expect(fs.order).toBe(1)
      expect(fs.name).toBe('Cooling')
    })

    it('should initialize control field', () => {
      const fs = new FermentationStep({ order: 0, type: 'Primary', temp: 20, days: 5, control: 'fridge' })
      expect(fs.control).toBe('fridge')
    })
  })

  describe('fromJson', () => {
    it('should create instance from JSON', () => {
      const json = {
        order: 0,
        name: 'Primary',
        type: 'Primary',
        date: '2024-01-15',
        temp: 20,
        days: 5,
        control: 'fridge'
      }
      const fs = FermentationStep.fromJson(json)
      expect(fs.order).toBe(0)
      expect(fs.name).toBe('Primary')
      expect(fs.type).toBe('Primary')
      expect(fs.temp).toBe(20)
      expect(fs.days).toBe(5)
      expect(fs.control).toBe('fridge')
    })

    it('should handle missing control field', () => {
      const json = { order: 0, type: 'Primary', temp: 20, days: 5 }
      const fs = FermentationStep.fromJson(json)
      expect(fs.control).toBe('fridge')
    })
  })

  describe('toJson', () => {
    it('should serialize to JSON with control field', () => {
      const fs = new FermentationStep({
        order: 0,
        name: 'Primary',
        type: 'Primary',
        date: '2024-01-15',
        temp: 20,
        days: 5,
        control: 'fridge'
      })
      const json = fs.toJson()
      expect(json.control).toBe('fridge')
      expect(json.order).toBe(0)
      expect(json.type).toBe('Primary')
    })
  })

  describe('Getters and Setters', () => {
    it('should get and set control', () => {
      const fs = new FermentationStep()
      fs.control = 'beer'
      expect(fs.control).toBe('beer')
    })
  })

  describe('listToJson', () => {
    it('should serialize list with control field', () => {
      const steps = [
        new FermentationStep({ order: 0, type: 'Primary', temp: 20, days: 5, control: 'fridge' }),
        new FermentationStep({ order: 1, type: 'Secondary', temp: 18, days: 10, control: 'beer' })
      ]
      const json = FermentationStep.listToJson(steps, 1)
      expect(json).toHaveLength(2)
      expect(json[0].control).toBe('fridge')
      expect(json[1].control).toBe('beer')
      expect(json[0].deviceId).toBe(1)
      expect(json[1].deviceId).toBe(1)
    })
  })
})
