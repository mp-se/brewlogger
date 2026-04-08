// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useConfigStore } from '@/modules/configStore'

// Mock logger
vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn()
}))

// Mock pinia global object
vi.mock('@/modules/pinia', () => {
  const global = {
    disabled: false,
    baseURL: 'http://localhost:8080/',
    token: 'Bearer test',
    fetchTimout: 30000
  }
  return {
    global,
    saveConfigState: vi.fn()
  }
})

describe('useConfigStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Reset fetch mock
    global.fetch = vi.fn()
  })

  describe('Initial State', () => {
    it('should have default config values', () => {
      const store = useConfigStore()
      expect(store.id).toBe(0)
      expect(store.temperatureFormat).toBe('')
      expect(store.pressureFormat).toBe('')
      expect(store.gravityFormat).toBe('')
      expect(store.volumeFormat).toBe('')
      expect(store.appVersion).toBe(0)
      expect(store.gravityForwardUrl).toBe('')
      expect(store.dark_mode).toBe(false)
    })
  })

  describe('Temperature Format Getters', () => {
    it('should determine if temperature is Celsius', () => {
      const store = useConfigStore()
      store.temperatureFormat = 'C'
      expect(store.isTempC).toBe(true)
      expect(store.isTempF).toBe(false)
    })

    it('should determine if temperature is Fahrenheit', () => {
      const store = useConfigStore()
      store.temperatureFormat = 'F'
      expect(store.isTempF).toBe(true)
      expect(store.isTempC).toBe(false)
    })

    it('should return temperature unit', () => {
      const store = useConfigStore()
      store.temperatureFormat = 'C'
      expect(store.tempUnit).toBe('C')
    })
  })

  describe('Gravity Format Getters', () => {
    it('should determine if gravity is SG', () => {
      const store = useConfigStore()
      store.gravityFormat = 'SG'
      expect(store.isGravitySG).toBe(true)
      expect(store.isGravityP).toBe(false)
    })

    it('should determine if gravity is P', () => {
      const store = useConfigStore()
      store.gravityFormat = 'P'
      expect(store.isGravityP).toBe(true)
      expect(store.isGravitySG).toBe(false)
    })
  })

  describe('Volume Format Getters', () => {
    it('should determine if volume is metric', () => {
      const store = useConfigStore()
      store.volumeFormat = 'L'
      expect(store.isVolumeMetric).toBe(true)
      expect(store.isVolumeUs).toBe(false)
      expect(store.isVolumeUk).toBe(false)
    })

    it('should determine if volume is US', () => {
      const store = useConfigStore()
      store.volumeFormat = 'US'
      expect(store.isVolumeUs).toBe(true)
      expect(store.isVolumeMetric).toBe(false)
      expect(store.isVolumeUk).toBe(false)
    })

    it('should determine if volume is UK', () => {
      const store = useConfigStore()
      store.volumeFormat = 'UK'
      expect(store.isVolumeUk).toBe(true)
      expect(store.isVolumeMetric).toBe(false)
      expect(store.isVolumeUs).toBe(false)
    })
  })

  describe('Pressure Format Getters', () => {
    it('should determine if pressure is BAR', () => {
      const store = useConfigStore()
      store.pressureFormat = 'BAR'
      expect(store.isPressureBAR).toBe(true)
      expect(store.isPressureKPA).toBe(false)
      expect(store.isPressurePSI).toBe(false)
    })

    it('should determine if pressure is KPA', () => {
      const store = useConfigStore()
      store.pressureFormat = 'KPA'
      expect(store.isPressureKPA).toBe(true)
      expect(store.isPressureBAR).toBe(false)
      expect(store.isPressurePSI).toBe(false)
    })

    it('should determine if pressure is PSI', () => {
      const store = useConfigStore()
      store.pressureFormat = 'PSI'
      expect(store.isPressurePSI).toBe(true)
      expect(store.isPressureBAR).toBe(false)
      expect(store.isPressureKPA).toBe(false)
    })
  })

  describe('load Action', () => {
    it('should load config successfully', async () => {
      const store = useConfigStore()
      const mockResponse = {
        id: 1,
        temperatureFormat: 'C',
        pressureFormat: 'BAR',
        gravityFormat: 'SG',
        volumeFormat: 'L',
        appVersion: 1,
        gravityForwardUrl: 'http://example.com',
        darkMode: true
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockResponse)
      })

      const result = await store.load()

      expect(result).toBe(true)
      expect(store.id).toBe(1)
      expect(store.temperatureFormat).toBe('C')
      expect(store.pressureFormat).toBe('BAR')
      expect(store.gravityFormat).toBe('SG')
      expect(store.volumeFormat).toBe('L')
      expect(store.appVersion).toBe(1)
      expect(store.dark_mode).toBe(true)
    })

    it('should handle fetch error', async () => {
      const store = useConfigStore()
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

      const result = await store.load()

      expect(result).toBe(false)
    })

    it('should handle JSON parse error', async () => {
      const store = useConfigStore()
      global.fetch = vi.fn().mockResolvedValueOnce({
        json: vi.fn().mockRejectedValueOnce(new Error('Invalid JSON'))
      })

      const result = await store.load()

      expect(result).toBe(false)
    })
  })

  describe('save Action', () => {
    it('should save config successfully', async () => {
      const store = useConfigStore()
      store.id = 1
      store.temperatureFormat = 'F'
      store.pressureFormat = 'PSI'
      store.gravityFormat = 'P'
      store.volumeFormat = 'US'
      store.dark_mode = false
      store.gravityForwardUrl = 'http://example.com'

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 200
      })

      const result = await store.save()

      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/config/1',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('should handle non-200 response status', async () => {
      const store = useConfigStore()
      store.id = 1

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 400
      })

      const result = await store.save()

      expect(result).toBe(false)
    })

    it('should handle fetch error during save', async () => {
      const store = useConfigStore()
      store.id = 1

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

      const result = await store.save()

      expect(result).toBe(false)
    })
  })

  describe('State Mutations', () => {
    it('should allow setting config values', () => {
      const store = useConfigStore()
      store.id = 5
      store.temperatureFormat = 'C'
      store.pressureFormat = 'BAR'
      store.gravityFormat = 'SG'
      store.volumeFormat = 'L'
      store.appVersion = 2
      store.dark_mode = true

      expect(store.id).toBe(5)
      expect(store.temperatureFormat).toBe('C')
      expect(store.pressureFormat).toBe('BAR')
      expect(store.gravityFormat).toBe('SG')
      expect(store.volumeFormat).toBe('L')
      expect(store.appVersion).toBe(2)
      expect(store.dark_mode).toBe(true)
    })
  })
})
