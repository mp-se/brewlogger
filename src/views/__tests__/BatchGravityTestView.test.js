import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import BatchGravityTestView from '../BatchGravityTestView.vue'
import { nextTick } from 'vue'

const mockStores = vi.hoisted(() => ({
  batch: {
    getBatch: vi.fn()
  },
  gravity: {
    getGravityListForBatch: vi.fn()
  }
}))

vi.mock('@/modules/pinia', () => ({
  batchStore: mockStores.batch,
  gravityStore: mockStores.gravity
}))

const mockRouter = vi.hoisted(() => ({
  currentRoute: {
    value: {
      params: { id: '123' }
    }
  }
}))

vi.mock('@/modules/router', () => ({
  default: mockRouter
}))

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn()
}))

describe('BatchGravityTestView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mountWrapper = async () => {
    const wrapper = mount(BatchGravityTestView, {
      global: {
        stubs: {
          'router-link': true
        }
      }
    })
    await nextTick()
    return wrapper
  }

  describe('Component Structure', () => {
    it('should render container', async () => {
      mockStores.batch.getBatch.mockResolvedValue({ id: '123', name: 'Test Batch' })
      mockStores.gravity.getGravityListForBatch.mockResolvedValue([])
      const wrapper = await mountWrapper()
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should render page title with batch name', async () => {
      mockStores.batch.getBatch.mockResolvedValue({ id: '123', name: 'IPA Batch' })
      mockStores.gravity.getGravityListForBatch.mockResolvedValue([])
      const wrapper = await mountWrapper()
      expect(wrapper.find('.h3').text()).toContain("Batch Gravity Test List - 'IPA Batch'")
    })

    it('should render data table', async () => {
      mockStores.batch.getBatch.mockResolvedValue({ id: '123', name: 'Test Batch' })
      mockStores.gravity.getGravityListForBatch.mockResolvedValue([])
      const wrapper = await mountWrapper()
      expect(wrapper.find('table').exists()).toBe(true)
    })
  })

  describe('Data Loading and Regression', () => {
    it('should load batch and gravity data on mount', async () => {
      mockStores.batch.getBatch.mockResolvedValue({ id: '123', name: 'Test Batch' })
      mockStores.gravity.getGravityListForBatch.mockResolvedValue([
        { created: '2023-01-01T10:00:00Z', gravity: 1.05 },
        { created: '2023-01-01T10:15:00Z', gravity: 1.049 },
        { created: '2023-01-01T10:30:00Z', gravity: 1.048 }
      ])

      const wrapper = await mountWrapper()
      expect(mockStores.batch.getBatch).toHaveBeenCalledWith('123')
      expect(mockStores.gravity.getGravityListForBatch).toHaveBeenCalledWith('123')
      expect(wrapper.vm.data.length).toBeGreaterThan(0)
      expect(wrapper.vm.data[0].day).toBe('2023-01-01')
    })

    it('should log error if gravity loading fails', async () => {
      mockStores.batch.getBatch.mockResolvedValue({ id: '123', name: 'Test Batch' })
      mockStores.gravity.getGravityListForBatch.mockResolvedValue(null)

      await mountWrapper()
      const logger = await import('@/modules/logger')
      expect(logger.logError).toHaveBeenCalledWith(
        'BatchGravityTestView.onMounted()',
        'Failed to load gravity',
        '123'
      )
    })

    it('should handle missing batch', async () => {
      mockStores.batch.getBatch.mockResolvedValue(null)
      mockStores.gravity.getGravityListForBatch.mockResolvedValue([])
      const wrapper = await mountWrapper()
      expect(wrapper.vm.batchName).toBe('')
    })

    it('should handle empty gravity list', async () => {
      mockStores.batch.getBatch.mockResolvedValue({ id: '123', name: 'Test Batch' })
      mockStores.gravity.getGravityListForBatch.mockResolvedValue([])
      const wrapper = await mountWrapper()
      expect(wrapper.vm.data).toHaveLength(0)
    })

    it('should filter outliers correctly', async () => {
      mockStores.batch.getBatch.mockResolvedValue({ id: '123', name: 'Test Batch' })
      mockStores.gravity.getGravityListForBatch.mockResolvedValue([
        { created: '2023-01-01T10:00:00Z', gravity: 1.05 },
        { created: '2023-01-01T10:15:00Z', gravity: 1.06 }, // Outlier (diff 0.010 > 0.002)
        { created: '2023-01-01T10:30:00Z', gravity: 1.049 } // Not outlier (relative to 1.050, diff 0.001)
      ])

      const wrapper = await mountWrapper()
      expect(wrapper.vm.data[0].points).toBe(2)
    })

    it('should calculate daily stats correctly', async () => {
      mockStores.batch.getBatch.mockResolvedValue({ id: '123', name: 'Test Batch' })
      mockStores.gravity.getGravityListForBatch.mockResolvedValue([
        { created: '2023-01-01T10:00:00Z', gravity: 1.05 },
        { created: '2023-01-01T11:00:00Z', gravity: 1.049 },
        { created: '2023-01-02T10:00:00Z', gravity: 1.048 },
        { created: '2023-01-02T11:00:00Z', gravity: 1.047 }
      ])

      const wrapper = await mountWrapper()
      expect(wrapper.vm.data).toHaveLength(2)
      expect(wrapper.vm.data[0].day).toBe('2023-01-01')
      expect(wrapper.vm.data[0].min).toBe(1.049)
      expect(wrapper.vm.data[0].max).toBe(1.05)
      expect(wrapper.vm.data[0].points).toBe(2)

      expect(wrapper.vm.data[1].day).toBe('2023-01-02')
      expect(wrapper.vm.data[1].min).toBe(1.047)
      expect(wrapper.vm.data[1].max).toBe(1.048)
      expect(wrapper.vm.data[1].points).toBe(2)
    })
  })

  describe('Regression Logic', () => {
    it('handles regression calculations', async () => {
      mockStores.batch.getBatch.mockResolvedValue({ id: '123', name: 'Test Batch' })
      const points = []
      for (let i = 0; i < 5; i++) {
        points.push({
          created: '2023-01-01T10:0' + i + ':00Z',
          gravity: 1.05 - i * 0.001
        })
      }
      mockStores.gravity.getGravityListForBatch.mockResolvedValue(points)

      const wrapper = await mountWrapper()
      const dayData = wrapper.vm.data[0]
      expect(dayData.linearFirst).toBeDefined()
      expect(dayData.linearLast).toBeDefined()
      expect(dayData.linear).toContain('y =')
    })
  })
})
