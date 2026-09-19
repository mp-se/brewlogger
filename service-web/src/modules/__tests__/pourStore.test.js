// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePourStore } from '@/modules/pourStore'

// Mock logger
vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn()
}))

// Mock pinia global object
vi.mock('@/modules/pinia', () => ({
  global: {
    disabled: false,
    baseURL: 'http://localhost:8080/',
    token: 'Bearer test',
    fetchTimout: 30000
  }
}))

describe('usePourStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.fetch = vi.fn()
  })

  it('should have empty pour array initially', () => {
    const store = usePourStore()
    expect(store.pour).toEqual([])
  })

  it('should fetch latest pour data', async () => {
    const store = usePourStore()
    const mockData = [
      {
        id: 1,
        pour: 5,
        volume: 500,
        maxVolume: 1000,
        created: '2024-01-15T10:00:00',
        batchId: 1,
        active: true,
        batchName: 'IPA'
      }
    ]

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValueOnce(mockData)
    })

    const result = await store.getLatestPour(10)

    expect(result).toBeTruthy()
    expect(store.pour.length).toBe(1)
  })

  it('should handle fetch error', async () => {
    const store = usePourStore()
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Error'))

    const result = await store.getLatestPour(10)

    expect(result).toBeNull()
  })

  it('should handle non-ok response', async () => {
    const store = usePourStore()
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404
    })

    const result = await store.getLatestPour(10)

    expect(result).toBeNull()
  })

  describe('getPourListForBatch Action', () => {
    it('should fetch pour data for batch', async () => {
      const store = usePourStore()
      const mockData = {
        id: 1,
        pour: [
          {
            id: 1,
            pour: 5,
            volume: 500,
            created: '2024-01-15T10:00:00',
            batchId: 1,
            active: true
          }
        ]
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce(mockData)
      })

      const result = await store.getPourListForBatch(1)

      expect(result).toBeTruthy()
      expect(store.pour.length).toBe(1)
    })

    it('should return null on fetch error', async () => {
      const store = usePourStore()
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Error'))

      const result = await store.getPourListForBatch(1)

      expect(result).toBeNull()
    })

    it('should handle non-ok response', async () => {
      const store = usePourStore()
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const result = await store.getPourListForBatch(1)

      expect(result).toBeNull()
    })
  })

  describe('updatePour Action', () => {
    it('should update pour successfully', async () => {
      const store = usePourStore()
      const pourToUpdate = {
        id: 1,
        toJson: () => ({ id: 1, pour: 5 })
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 200
      })

      const result = await store.updatePour(pourToUpdate)

      expect(result).toBe(true)
    })

    it('should return false if update status is not 200', async () => {
      const store = usePourStore()
      const pourToUpdate = {
        id: 1,
        toJson: () => ({ id: 1 })
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 400
      })

      const result = await store.updatePour(pourToUpdate)

      expect(result).toBe(false)
    })

    it('should return false on update error', async () => {
      const store = usePourStore()
      const pourToUpdate = {
        id: 1,
        toJson: () => ({ id: 1 })
      }

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Error'))

      const result = await store.updatePour(pourToUpdate)

      expect(result).toBe(false)
    })
  })

  describe('addPour Action', () => {
    it('should add pour successfully', async () => {
      const store = usePourStore()
      const newPour = {
        toJson: () => ({ pour: 5 })
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 201
      })

      const result = await store.addPour(newPour)

      expect(result).toBe(true)
    })

    it('should return false if add status is not 201', async () => {
      const store = usePourStore()
      const newPour = {
        toJson: () => ({})
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 400
      })

      const result = await store.addPour(newPour)

      expect(result).toBe(false)
    })

    it('should return false on add error', async () => {
      const store = usePourStore()
      const newPour = {
        toJson: () => ({})
      }

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Error'))

      const result = await store.addPour(newPour)

      expect(result).toBe(false)
    })
  })
})
