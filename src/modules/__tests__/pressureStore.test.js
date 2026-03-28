import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePressureStore } from '@/modules/pressureStore'

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

describe('usePressureStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.fetch = vi.fn()
  })

  it('should have empty pressure array initially', () => {
    const store = usePressureStore()
    expect(store.pressure).toEqual([])
  })

  it('should fetch latest pressure data', async () => {
    const store = usePressureStore()
    const mockData = [
      {
        id: 1,
        temperature: 20.5,
        pressure: 1.5,
        pressure1: 1.6,
        battery: 4.2,
        rssi: -50,
        runTime: 3600,
        created: '2024-01-15T10:00:00',
        batchId: 1,
        active: true,
        batchName: 'IPA',
        chipIdPressure: 'chip1'
      }
    ]

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValueOnce(mockData)
    })

    const result = await store.getLatestPressure(10)

    expect(result).toBeTruthy()
    expect(store.pressure.length).toBe(1)
  })

  it('should handle fetch error', async () => {
    const store = usePressureStore()
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Error'))

    const result = await store.getLatestPressure(10)

    expect(result).toBeNull()
  })

  it('should handle non-ok response', async () => {
    const store = usePressureStore()
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404
    })

    const result = await store.getLatestPressure(10)

    expect(result).toBeNull()
  })
})
