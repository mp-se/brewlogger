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

  describe('getBatchDashboard Action', () => {
    it('should fetch batch dashboard data', async () => {
      const store = useBatchStore()
      const mockDashboard = {
        id: 1,
        name: 'Dashboard Batch',
        gravity: [{ id: 1, gravity: 1.050 }],
        pressure: [{ id: 1, pressure: 15.2 }],
        pour: []
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce(mockDashboard)
      })

      const result = await store.getBatchDashboard(1)

      expect(result).toBeTruthy()
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/batch/1/dashboard',
        expect.any(Object)
      )
    })

    it('should return null on dashboard fetch error', async () => {
      const store = useBatchStore()
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

      const result = await store.getBatchDashboard(1)

      expect(result).toBeNull()
    })

    it('should handle non-ok response for dashboard', async () => {
      const store = useBatchStore()
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const result = await store.getBatchDashboard(1)

      expect(result).toBeNull()
    })
  })

  describe('updateBatch Action', () => {
    it('should update batch successfully', async () => {
      const store = useBatchStore()
      const batchToUpdate = {
        id: 1,
        name: 'Updated Batch',
        toJson: () => ({ id: 1, name: 'Updated Batch' })
      }

      const mockUpdatedBatch = {
        id: 1,
        name: 'Updated Batch',
        description: 'Updated',
        active: true
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 200,
        json: vi.fn().mockResolvedValueOnce(mockUpdatedBatch)
      })

      const result = await store.updateBatch(batchToUpdate)

      expect(result).toBeTruthy()
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/batch/1',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' })
        })
      )
    })

    it('should return null on update error', async () => {
      const store = useBatchStore()
      const batchToUpdate = {
        id: 1,
        toJson: () => ({ id: 1 })
      }

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Update failed'))

      const result = await store.updateBatch(batchToUpdate)

      expect(result).toBeNull()
    })

    it('should return null if update status is not 200', async () => {
      const store = useBatchStore()
      const batchToUpdate = {
        id: 1,
        toJson: () => ({ id: 1 })
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 400
      })

      const result = await store.updateBatch(batchToUpdate)

      expect(result).toBeNull()
    })
  })

  describe('addBatch Action', () => {
    it('should add new batch successfully', async () => {
      const store = useBatchStore()
      const newBatch = {
        id: 0,
        name: 'New Batch',
        toJson: () => ({ name: 'New Batch' })
      }

      const mockResponse = {
        id: 2,
        name: 'New Batch',
        active: true
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 201,
        json: vi.fn().mockResolvedValueOnce(mockResponse)
      })

      const result = await store.addBatch(newBatch)

      expect(result).toBeTruthy()
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/batch/',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' })
        })
      )
    })

    it('should return null if add status is not 201', async () => {
      const store = useBatchStore()
      const newBatch = {
        toJson: () => ({ name: 'New Batch' })
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 400
      })

      const result = await store.addBatch(newBatch)

      expect(result).toBeNull()
    })

    it('should return null on add batch error', async () => {
      const store = useBatchStore()
      const newBatch = {
        toJson: () => ({ name: 'New Batch' })
      }

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Add failed'))

      const result = await store.addBatch(newBatch)

      expect(result).toBeNull()
    })
  })

  describe('deleteBatch Action', () => {
    it('should delete batch successfully', async () => {
      const store = useBatchStore()

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 204
      })

      const result = await store.deleteBatch(1)

      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/batch/1',
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })

    it('should return false if delete status is not 204', async () => {
      const store = useBatchStore()

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 404
      })

      const result = await store.deleteBatch(1)

      expect(result).toBe(false)
    })

    it('should return false on delete error', async () => {
      const store = useBatchStore()

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Delete failed'))

      const result = await store.deleteBatch(1)

      expect(result).toBe(false)
    })
  })

  describe('anyBatchesForDevice Action', () => {
    it('should return true if batches exist for gravity chip', () => {
      const store = useBatchStore()
      store.batches = [
        { id: 1, chipIdGravity: 'chip1', chipIdPressure: '' },
        { id: 2, chipIdGravity: 'chip2', chipIdPressure: '' }
      ]

      const result = store.anyBatchesForDevice('chip1')

      expect(result).toBe(true)
    })

    it('should return true if batches exist for pressure chip', () => {
      const store = useBatchStore()
      store.batches = [
        { id: 1, chipIdGravity: '', chipIdPressure: 'chip1' },
        { id: 2, chipIdGravity: '', chipIdPressure: 'chip2' }
      ]

      const result = store.anyBatchesForDevice('chip1')

      expect(result).toBe(true)
    })

    it('should return false if no batches exist for chip', () => {
      const store = useBatchStore()
      store.batches = [
        { id: 1, chipIdGravity: 'chip1', chipIdPressure: 'chip2' }
      ]

      const result = store.anyBatchesForDevice('chip999')

      expect(result).toBe(false)
    })

    it('should return false if batches array is empty', () => {
      const store = useBatchStore()
      store.batches = []

      const result = store.anyBatchesForDevice('chip1')

      expect(result).toBe(false)
    })
  })

  describe('processEvent Action', () => {
    it('should delete batch by id on delete event', () => {
      const store = useBatchStore()
      store.batches = [
        { id: 1, name: 'Batch1' },
        { id: 2, name: 'Batch2' }
      ]

      store.processEvent('delete', 1)

      expect(store.batches.length).toBe(1)
      expect(store.batches[0].id).toBe(2)
    })

    it('should not delete non-existent batch', () => {
      const store = useBatchStore()
      store.batches = [{ id: 1, name: 'Batch1' }]

      store.processEvent('delete', 999)

      expect(store.batches.length).toBe(1)
    })

    it('should update batch by id on update event', async () => {
      const store = useBatchStore()
      store.batches = [
        { id: 1, name: 'OldName' },
        { id: 2, name: 'Batch2' }
      ]

      const mockUpdatedBatch = {
        id: 1,
        name: 'NewName'
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce(mockUpdatedBatch)
      })

      await store.processEvent('update', 1)

      expect(store.batches.length).toBe(2)
      const updated = store.batches.find(b => b.id === 1)
      expect(updated.name).toBe('NewName')
    })

    it('should handle update event when batch not found on server', async () => {
      const store = useBatchStore()
      store.batches = [{ id: 1, name: 'Batch1' }]

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Not found'))

      await store.processEvent('update', 1)

      expect(store.batches.length).toBe(1)
    })

    it('should create new batch on create event', async () => {
      const store = useBatchStore()
      store.batches = [{ id: 1, name: 'Batch1' }]

      const mockNewBatch = {
        id: 2,
        name: 'NewBatch'
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce(mockNewBatch)
      })

      await store.processEvent('create', 2)

      expect(store.batches.length).toBe(2)
      const created = store.batches.find(b => b.id === 2)
      expect(created.name).toBe('NewBatch')
    })

    it('should handle create event when batch not found on server', async () => {
      const store = useBatchStore()
      store.batches = [{ id: 1, name: 'Batch1' }]

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Not found'))

      await store.processEvent('create', 2)

      expect(store.batches.length).toBe(1)
    })
  })
})
