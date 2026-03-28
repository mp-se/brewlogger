import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useBatchStore } from '@/modules/batchStore'

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

describe('useBatchStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.fetch = vi.fn()
  })

  describe('Initial State', () => {
    it('should have empty batches array initially', () => {
      const store = useBatchStore()
      expect(store.batches).toEqual([])
    })

    it('should have batchList getter', () => {
      const store = useBatchStore()
      expect(store.batchList).toEqual([])
    })
  })

  describe('getBatchList Action', () => {
    it('should fetch all batches', async () => {
      const store = useBatchStore()
      const mockBatches = [
        {
          id: 1,
          name: 'Batch1',
          description: '',
          chipIdGravity: 'chip1',
          chipIdPressure: '',
          active: true,
          brewDate: '',
          style: '',
          brewer: '',
          abv: 0,
          ebc: 0,
          ibu: 0,
          fg: 0,
          og: 0,
          brewfatherId: '',
          fermentationChamber: 0,
          fermentationSteps: '',
          tapList: false,
          gravity: [],
          pressure: [],
          pour: []
        }
      ]

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce(mockBatches)
      })

      const result = await store.getBatchList()

      expect(result).toBeTruthy()
      expect(store.batches.length).toBe(1)
    })

    it('should handle error', async () => {
      const store = useBatchStore()
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Error'))

      const result = await store.getBatchList()

      expect(result).toBeNull()
    })

    it('should handle non-ok response', async () => {
      const store = useBatchStore()
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const result = await store.getBatchList()

      expect(result).toBeNull()
    })
  })

  describe('getBatch Action', () => {
    it('should fetch batch by ID', async () => {
      const store = useBatchStore()
      const mockBatch = {
        id: 1,
        name: 'Single Batch',
        description: 'Description',
        chipIdGravity: 'chip1',
        chipIdPressure: '',
        active: true,
        brewDate: '2024-01-15',
        style: 'IPA',
        brewer: 'John',
        abv: 6.5,
        ebc: 20,
        ibu: 50,
        fg: 1.010,
        og: 1.055,
        brewfatherId: '',
        fermentationChamber: 0,
        fermentationSteps: '',
        tapList: false,
        gravity: [],
        pressure: [],
        pour: []
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce(mockBatch)
      })

      const result = await store.getBatch(1)

      expect(result).toBeTruthy()
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/batch/1',
        expect.any(Object)
      )
    })

    it('should return null on fetch error', async () => {
      const store = useBatchStore()
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Error'))

      const result = await store.getBatch(1)

      expect(result).toBeNull()
    })
  })

  describe('State Mutations', () => {
    it('should allow setting batches array', () => {
      const store = useBatchStore()
      store.batches = [
        {
          id: 1,
          name: 'Batch1',
          description: '',
          chipIdGravity: 'chip1',
          chipIdPressure: '',
          active: true,
          brewDate: '',
          style: '',
          brewer: '',
          abv: 0,
          ebc: 0,
          ibu: 0,
          fg: 0,
          og: 0,
          brewfatherId: '',
          fermentationChamber: 0,
          fermentationSteps: '',
          tapList: false,
          gravity: [],
          pressure: [],
          pour: [],
          gravityCount: 0,
          pressureCount: 0,
          pourCount: 0
        }
      ]

      expect(store.batches.length).toBe(1)
      expect(store.batches[0].name).toBe('Batch1')
    })

    it('should allow clearing batch array', () => {
      const store = useBatchStore()
      store.batches = [{ id: 1, name: 'Batch1' }]
      store.batches = []
      expect(store.batches.length).toBe(0)
    })
  })
})
