import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGravityStore } from '@/modules/gravityStore'

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

describe('useGravityStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.fetch = vi.fn()
  })

  it('should have empty gravity array initially', () => {
    const store = useGravityStore()
    expect(store.gravity).toEqual([])
  })

  it('should fetch latest gravity data', async () => {
    const store = useGravityStore()
    const mockData = [
      {
        id: 1,
        temperature: 20.5,
        gravity: 1.050,
        velocity: 0.5,
        angle: 45,
        battery: 4.2,
        rssi: -50,
        corrGravity: 1.048,
        runTime: 3600,
        created: '2024-01-15T10:00:00',
        batchId: 1,
        active: true,
        batchName: 'IPA',
        chipIdGravity: 'chip1'
      }
    ]

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValueOnce(mockData)
    })

    const result = await store.getLatestGravity(10)

    expect(result).toBeTruthy()
    expect(store.gravity.length).toBe(1)
  })

  it('should handle fetch error', async () => {
    const store = useGravityStore()
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Error'))

    const result = await store.getLatestGravity(10)

    expect(result).toBeNull()
  })

  it('should handle non-ok response', async () => {
    const store = useGravityStore()
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404
    })

    const result = await store.getLatestGravity(10)

    expect(result).toBeNull()
  })

  describe('getGravityListForBatch Action', () => {
    it('should fetch gravity data for batch', async () => {
      const store = useGravityStore()
      const mockData = {
        id: 1,
        gravity: [
          {
            id: 1,
            temperature: 20.5,
            gravity: 1.050,
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

      const result = await store.getGravityListForBatch(1)

      expect(result).toBeTruthy()
      expect(store.gravity.length).toBe(1)
    })

    it('should return null on fetch error in getGravityListForBatch', async () => {
      const store = useGravityStore()
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Error'))

      const result = await store.getGravityListForBatch(1)

      expect(result).toBeNull()
    })

    it('should handle non-ok response in getGravityListForBatch', async () => {
      const store = useGravityStore()
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const result = await store.getGravityListForBatch(1)

      expect(result).toBeNull()
    })
  })

  describe('updateGravity Action', () => {
    it('should update gravity successfully', async () => {
      const store = useGravityStore()
      const gravityToUpdate = {
        id: 1,
        toJson: () => ({ id: 1, gravity: 1.050 })
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 200
      })

      const result = await store.updateGravity(gravityToUpdate)

      expect(result).toBe(true)
    })

    it('should return false if update status is not 200', async () => {
      const store = useGravityStore()
      const gravityToUpdate = {
        id: 1,
        toJson: () => ({ id: 1 })
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 400
      })

      const result = await store.updateGravity(gravityToUpdate)

      expect(result).toBe(false)
    })

    it('should return false on update error', async () => {
      const store = useGravityStore()
      const gravityToUpdate = {
        id: 1,
        toJson: () => ({ id: 1 })
      }

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Error'))

      const result = await store.updateGravity(gravityToUpdate)

      expect(result).toBe(false)
    })
  })
})
