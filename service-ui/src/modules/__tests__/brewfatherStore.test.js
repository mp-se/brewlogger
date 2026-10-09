// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useBrewfatherStore } from '@/modules/brewfatherStore'

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

// Mock setTimeout for cache test
vi.useFakeTimers()

describe('useBrewfatherStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.fetch = vi.fn()
    vi.clearAllTimers()
  })

  it('should have empty batches array initially', () => {
    const store = useBrewfatherStore()
    expect(store.batches).toEqual([])
    expect(store.valid).toBe(false)
  })

  it('should have getters for valid and batchList', () => {
    const store = useBrewfatherStore()
    expect(store.isValid).toBe(false)
    expect(store.batchList).toEqual([])
  })

  it('should fetch batches from API', async () => {
    const store = useBrewfatherStore()
    const mockData = [
      {
        brewfatherId: 'bf1',
        name: 'IPA',
        brewDate: '2024-01-15',
        style: 'IPA',
        brewer: 'John',
        abv: 6.5,
        ebc: 20,
        ibu: 50,
        fermentationSteps: ''
      }
    ]

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValueOnce(mockData)
    })

    const result = await store.getBatchList()

    expect(result).toBe(true)
    expect(store.batches.length).toBe(1)
    expect(store.valid).toBe(true)
  })

  it('should skip fetch if cache is valid', async () => {
    const store = useBrewfatherStore()
    store.valid = true
    store.batches = [{ brewfatherId: 'bf1', name: 'Cached' }]

    const result = await store.getBatchList()

    expect(result).toBe(true)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should handle fetch error', async () => {
    const store = useBrewfatherStore()
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Error'))

    const result = await store.getBatchList()

    expect(result).toBe(false)
  })

  it('should handle non-ok response', async () => {
    const store = useBrewfatherStore()
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404
    })

    const result = await store.getBatchList()

    expect(result).toBe(false)
  })

  it('should set cache validity timeout to 5 minutes', async () => {
    const store = useBrewfatherStore()
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValueOnce([])
    })

    await store.getBatchList()
    expect(store.valid).toBe(true)

    // Fast-forward 5 minutes
    vi.advanceTimersByTime(60 * 5 * 1000)
    expect(store.valid).toBe(false)
  })
})
