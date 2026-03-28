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
})
