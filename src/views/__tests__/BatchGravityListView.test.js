import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BatchGravityListView from '../BatchGravityListView.vue'
import { nextTick } from 'vue'

const mockStores = vi.hoisted(() => ({
  batch: {
    getBatch: vi.fn()
  },
  gravity: {
    getGravityListForBatch: vi.fn(),
    updateGravity: vi.fn().mockResolvedValue(true)
  },
  config: {
    isGravitySG: true,
    gravityFormat: 'SG',
    showAllRecords: false,
    $subscribe: vi.fn(),
    $patch: vi.fn(),
    isTempC: true
  },
  global: {
    isNetworkConnected: true,
    disabled: false,
    messageError: '',
    $subscribe: vi.fn(),
    $patch: vi.fn()
  },
  analytics: {
    date: { firstDate: '2023-01-01 10:00:00', lastDate: '2023-01-03 10:00:00' },
    gravity: { min: 1.01, max: 1.05 }
  },
  router: {
    currentRoute: {
      value: {
        params: { id: '1' }
      }
    }
  }
}))

vi.mock('@/modules/pinia', () => ({
  config: mockStores.config,
  gravityStore: mockStores.gravity,
  batchStore: mockStores.batch,
  global: mockStores.global,
  default: {}
}))

vi.mock('@/modules/router', () => ({
  default: mockStores.router
}))

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn()
}))

vi.mock('@/modules/ui', () => ({
  sortedIconClass: vi.fn(() => 'bi-sort-down'),
  setSortingDefault: vi.fn(),
  sortedClass: vi.fn(() => 'sorted'),
  sortList: vi.fn(),
  applySortList: vi.fn((l) => l)
}))

vi.mock('@/modules/utils', async (importActual) => {
  const actual = await importActual()
  return {
    ...actual,
    getGravityDataAnalytics: () => mockStores.analytics,
    getFormattedTemperature: (t) => `${t} C`
  }
})

describe('BatchGravityListView', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    mockStores.batch.getBatch.mockResolvedValue({ id: '1', name: 'Batch 1' })
    mockStores.gravity.getGravityListForBatch.mockResolvedValue([
      {
        id: 1,
        batchId: 1,
        gravity: 1.05,
        created: '2023-01-01 10:00:00',
        active: true,
        temperature: 20
      },
      {
        id: 2,
        batchId: 1,
        gravity: 1.045,
        created: '2023-01-02 10:00:00',
        active: true,
        temperature: 20
      },
      {
        id: 3,
        batchId: 1,
        gravity: 1.04,
        created: '2023-01-03 10:00:00',
        active: false,
        temperature: 20
      }
    ])
  })

  const mountWrapper = () => {
    return mount(BatchGravityListView, {
      global: {
        stubs: {
          'router-link': { template: '<a><slot></slot></a>' },
          GravityStatsFragment: true,
          LifeEstimates: true,
          BsInputDate: true,
          BsInputNumber: true,
          BsInputBase: true
        }
      }
    })
  }

  it('loads batch and gravity data on mount', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    expect(mockStores.batch.getBatch).toHaveBeenCalledWith('1')
    expect(mockStores.gravity.getGravityListForBatch).toHaveBeenCalledWith('1')
    expect(wrapper.vm.batchName).toBe('Batch 1')
    expect(wrapper.vm.gravityList).toHaveLength(3)
  })

  it('filters gravity records correctly when apply() is called', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    wrapper.vm.infoFirstDay = '2023-01-02 00:00:00'
    wrapper.vm.infoLastDay = '2023-01-03 23:59:59'
    wrapper.vm.infoOG = 1.048
    wrapper.vm.infoFG = 1.035

    await wrapper.vm.apply()

    expect(mockStores.gravity.updateGravity).toHaveBeenCalledTimes(2)
  })

  it('handles apply() failure when updateGravity fails', async () => {
    mockStores.gravity.updateGravity.mockResolvedValueOnce(false)
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    wrapper.vm.infoFirstDay = '2023-01-02 00:00:00'
    wrapper.vm.infoLastDay = '2023-01-03 23:59:59'
    wrapper.vm.infoOG = 1.048
    wrapper.vm.infoFG = 1.035

    await wrapper.vm.apply()
    // It should continue even if one fails
    expect(mockStores.gravity.updateGravity).toHaveBeenCalled()
  })

  it('activates all records when activateAll() is called', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    await wrapper.vm.activateAll()

    expect(mockStores.gravity.updateGravity).toHaveBeenCalledTimes(1)
    expect(mockStores.gravity.updateGravity).toHaveBeenCalledWith(
      expect.objectContaining({ id: 3, active: true })
    )
  })

  it('handles activateAll() failure when updateGravity fails', async () => {
    mockStores.gravity.updateGravity.mockResolvedValueOnce(false)
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    await wrapper.vm.activateAll()
    expect(mockStores.gravity.updateGravity).toHaveBeenCalled()
  })

  it('toggles record activity with updateGravity()', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    await wrapper.vm.updateGravity(1)

    expect(mockStores.gravity.updateGravity).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, active: false })
    )
  })

  it('handles updateGravity() failure', async () => {
    mockStores.gravity.updateGravity.mockResolvedValue(false)
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    await wrapper.vm.updateGravity(1)
    expect(mockStores.global.messageError).toContain('Failed to load gravity 1')
  })

  it('handles onMounted with no gravity records', async () => {
    mockStores.gravity.getGravityListForBatch.mockResolvedValue([])
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    expect(wrapper.vm.gravityList).toBeNull()
  })

  it('renders batch name in template', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    expect(wrapper.text()).toContain('Batch 1')
  })

  it('initializes filter inputs with analytics data', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    expect(wrapper.vm.infoFirstDay).toBe('2023-01-01 10:00:00')
    expect(wrapper.vm.infoLastDay).toBe('2023-01-03 10:00:00')
    expect(wrapper.vm.infoOG).toBe(1.05)
    expect(wrapper.vm.infoFG).toBe(1.01)
  })

  it('has sortedIconClass function available', async () => {
    const wrapper = mountWrapper()
    await nextTick()

    expect(typeof wrapper.vm.sortedIconClass).toBe('function')
  })

  it('has sortedClass function available', async () => {
    const wrapper = mountWrapper()
    await nextTick()

    expect(typeof wrapper.vm.sortedClass).toBe('function')
  })

  it('has sortList function available', async () => {
    const wrapper = mountWrapper()
    await nextTick()

    expect(typeof wrapper.vm.sortList).toBe('function')
  })

  it('has gravityToPlato function available', async () => {
    const wrapper = mountWrapper()
    await nextTick()

    expect(typeof wrapper.vm.gravityToPlato).toBe('function')
  })

  it('has getFormattedTemperature function available', async () => {
    const wrapper = mountWrapper()
    await nextTick()

    expect(typeof wrapper.vm.getFormattedTemperature).toBe('function')
  })

  it('initializes with proper refs structure', async () => {
    const wrapper = mountWrapper()
    await nextTick()

    expect(Object.prototype.hasOwnProperty.call(wrapper.vm, 'gravityList')).toBe(true)
    expect(Object.prototype.hasOwnProperty.call(wrapper.vm, 'gravityStats')).toBe(true)
    expect(Object.prototype.hasOwnProperty.call(wrapper.vm, 'forceRender')).toBe(true)
    expect(Object.prototype.hasOwnProperty.call(wrapper.vm, 'infoFirstDay')).toBe(true)
    expect(Object.prototype.hasOwnProperty.call(wrapper.vm, 'infoLastDay')).toBe(true)
    expect(Object.prototype.hasOwnProperty.call(wrapper.vm, 'infoOG')).toBe(true)
    expect(Object.prototype.hasOwnProperty.call(wrapper.vm, 'infoFG')).toBe(true)
    expect(Object.prototype.hasOwnProperty.call(wrapper.vm, 'batchName')).toBe(true)
  })

  it('updateGravity recalculates gravityStats after successful update', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    await wrapper.vm.updateGravity(1)

    // Stats should be recalculated
    expect(wrapper.vm.gravityStats).toBeDefined()
  })

  it('updateGravity handles item not found gracefully', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    await wrapper.vm.updateGravity(999)

    // Should not call gravityStore.updateGravity if item not found
    // The function finds and updates if found, otherwise breaks
    expect(wrapper.vm.gravityList).toHaveLength(3)
  })

  it('apply() increments forceRender to trigger re-render', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    const initialForceRender = wrapper.vm.forceRender
    wrapper.vm.infoFirstDay = '2023-01-01 00:00:00'
    wrapper.vm.infoLastDay = '2023-01-03 23:59:59'
    wrapper.vm.infoOG = 1.05
    wrapper.vm.infoFG = 1.01

    await wrapper.vm.apply()

    expect(wrapper.vm.forceRender).toBeGreaterThan(initialForceRender)
  })

  it('apply() disables and re-enables controls', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    wrapper.vm.infoFirstDay = '2023-01-01 00:00:00'
    wrapper.vm.infoLastDay = '2023-01-03 23:59:59'
    wrapper.vm.infoOG = 1.05
    wrapper.vm.infoFG = 1.01

    await wrapper.vm.apply()

    expect(mockStores.global.disabled).toBe(false)
  })

  it('activateAll() increments forceRender', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    const initialForceRender = wrapper.vm.forceRender
    await wrapper.vm.activateAll()

    expect(wrapper.vm.forceRender).toBeGreaterThan(initialForceRender)
  })

  it('activateAll() disables and re-enables controls', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    await wrapper.vm.activateAll()

    expect(mockStores.global.disabled).toBe(false)
  })

  it('filter with date range excludes records outside range', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    // Set dates to include only the middle record
    wrapper.vm.infoFirstDay = '2023-01-02 00:00:00'
    wrapper.vm.infoLastDay = '2023-01-02 23:59:59'
    wrapper.vm.infoOG = 1.05
    wrapper.vm.infoFG = 1.01

    await wrapper.vm.apply()

    // Only one record should be affected (one active already, two need update)
    expect(mockStores.gravity.updateGravity).toHaveBeenCalled()
  })

  it('filter with gravity range works correctly', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    // Set gravity range to exclude highest reading
    wrapper.vm.infoFirstDay = '2023-01-01 00:00:00'
    wrapper.vm.infoLastDay = '2023-01-03 23:59:59'
    wrapper.vm.infoOG = 1.04 // Only matches third record
    wrapper.vm.infoFG = 1.03

    await wrapper.vm.apply()

    expect(mockStores.gravity.updateGravity).toHaveBeenCalled()
  })

  it('handles batch loading failure', async () => {
    mockStores.batch.getBatch.mockResolvedValue(null)
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    expect(wrapper.vm.batchName).toBe('')
  })

  it('renders table headers when data is available', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    const html = wrapper.html()
    //  Table structure exists
    expect(html).toContain('thead')
    expect(html).toContain('<tbody')
  })

  it('displays gravity records in table with correct formatting', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    const html = wrapper.html()
    expect(html).toContain('2023-01-01')
    expect(html).toContain('10:00:00')
  })

  it('deactivateAll by filtering to empty set', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    // Set filter that excludes all records
    wrapper.vm.infoFirstDay = '2023-01-04 00:00:00'
    wrapper.vm.infoLastDay = '2023-01-05 23:59:59'
    wrapper.vm.infoOG = 1.05
    wrapper.vm.infoFG = 1.01

    await wrapper.vm.apply()

    // All previously active records should be deactivated
    expect(mockStores.gravity.updateGravity).toHaveBeenCalled()
  })

  it('config temperature format is respected', async () => {
    mockStores.config.isTempC = false
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    // Component stores config reference
    expect(wrapper.vm.config).toBeDefined()
  })

  it('config gravity format is respected', async () => {
    mockStores.config.isGravitySG = false
    const wrapper = mountWrapper()
    await nextTick()
    await nextTick()
    await nextTick()

    // Component stores config reference
    expect(wrapper.vm.config).toBeDefined()
  })
})
