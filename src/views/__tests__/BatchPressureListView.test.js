import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BatchPressureListView from '../BatchPressureListView.vue'
import { nextTick } from 'vue'

const mockStores = vi.hoisted(() => ({
  batch: {
    getBatch: vi.fn()
  },
  pressure: {
    getPressureListForBatch: vi.fn(),
    updatePressure: vi.fn()
  },
  config: {
    isPressurePSI: true,
    isPressureBAR: false,
    isTempC: true,
    $subscribe: vi.fn(),
    $patch: vi.fn()
  },
  global: {
    disabled: false,
    messageError: '',
    $subscribe: vi.fn(),
    $patch: vi.fn()
  },
  analytics: {
    date: {
      firstDate: '2023-01-01',
      lastDate: '2023-01-03'
    }
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
  pressureStore: mockStores.pressure,
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

vi.mock('@/modules/utils', () => ({
  getPressureDataAnalytics: vi.fn(() => mockStores.analytics),
  getFormattedTemperature: vi.fn((t) => `${t} C`),
  getFormattedPressure: vi.fn((p) => `${p} PSI`)
}))

vi.mock('@/modules/ui', () => ({
  sortedIconClass: 'bi-sort-down',
  setSortingDefault: vi.fn(),
  sortedClass: vi.fn(() => 'sorted'),
  sortList: vi.fn(),
  applySortList: vi.fn()
}))

describe('BatchPressureListView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    mockStores.batch.getBatch.mockResolvedValue({ id: '1', name: 'Batch 1' })
    mockStores.pressure.getPressureListForBatch.mockResolvedValue([
      {
        id: 1,
        pressure: 10,
        created: '2023-01-01T10:00:00Z',
        active: true,
        temperature: 20,
        battery: 4.2,
        rssi: -60,
        runTime: 1.5
      },
      {
        id: 2,
        pressure: 12,
        created: '2023-01-02T10:00:00Z',
        active: true,
        temperature: 21,
        battery: 4.1,
        rssi: -65,
        runTime: 1.6
      }
    ])
    mockStores.pressure.updatePressure.mockResolvedValue(true)
  })

  const mountWrapper = async () => {
    const wrapper = mount(BatchPressureListView, {
      global: {
        stubs: {
          'router-link': { template: '<a><slot></slot></a>' },
          BsInputDate: { template: '<input v-model="modelValue" />', props: ['modelValue'] },
          BsInputBase: { template: '<div><slot></slot></div>' }
        }
      }
    })

    await nextTick()
    await nextTick()
    return wrapper
  }

  it('initializes and loads data on mount', async () => {
    const wrapper = await mountWrapper()
    expect(mockStores.batch.getBatch).toHaveBeenCalledWith('1')
    expect(mockStores.pressure.getPressureListForBatch).toHaveBeenCalledWith('1')
    expect(wrapper.vm.batchName).toBe('Batch 1')
    expect(wrapper.vm.pressureList.length).toBe(2)
  })

  it('handles loading error for batch', async () => {
    mockStores.batch.getBatch.mockResolvedValue(null)
    const wrapper = await mountWrapper()
    expect(wrapper.vm.batchName).toBe('')
  })

  it('updates pressure when checkbox clicked', async () => {
    const wrapper = await mountWrapper()
    const checkbox = wrapper.find('input[type="checkbox"]')

    await checkbox.trigger('click')
    expect(mockStores.pressure.updatePressure).toHaveBeenCalled()
  })

  it('handles update failure', async () => {
    mockStores.pressure.updatePressure.mockResolvedValue(false)
    const wrapper = await mountWrapper()
    const checkbox = wrapper.find('input[type="checkbox"]')

    await checkbox.trigger('click')
    expect(mockStores.global.messageError).toContain('Failed to load pressure')
  })

  it('applies filters', async () => {
    const wrapper = await mountWrapper()
    wrapper.vm.infoFirstDay = '2023-01-01'
    wrapper.vm.infoLastDay = '2023-01-02'

    await wrapper.vm.apply()
    expect(mockStores.pressure.updatePressure).toHaveBeenCalled()
  })

  it('handles apply failure', async () => {
    mockStores.pressure.updatePressure.mockResolvedValue(false)
    const wrapper = await mountWrapper()
    wrapper.vm.infoFirstDay = '2023-01-01'
    wrapper.vm.infoLastDay = '2023-01-02'

    await wrapper.vm.apply()
    // It should have logged error
    const logger = await import('@/modules/logger')
    expect(logger.logError).toHaveBeenCalled()
  })

  it('activates all records', async () => {
    mockStores.pressure.getPressureListForBatch.mockResolvedValue([
      { id: 1, pressure: 10, created: '2023-01-01T10:00:00Z', active: false, temperature: 20 }
    ])
    const wrapper = await mountWrapper()

    await wrapper.vm.activateAll()
    expect(mockStores.pressure.updatePressure).toHaveBeenCalled()
    expect(wrapper.vm.pressureList[0].active).toBe(true)
  })

  it('handles activateAll failure', async () => {
    mockStores.pressure.getPressureListForBatch.mockResolvedValue([
      { id: 1, pressure: 10, created: '2023-01-01T10:00:00Z', active: false, temperature: 20 }
    ])
    mockStores.pressure.updatePressure.mockResolvedValue(false)
    const wrapper = await mountWrapper()

    await wrapper.vm.activateAll()
    const logger = await import('@/modules/logger')
    expect(logger.logError).toHaveBeenCalled()
  })

  it('should render table headers and icons', async () => {
    const wrapper = await mountWrapper()
    expect(wrapper.find('th').exists()).toBe(true)
    expect(wrapper.find('.icon-link').exists()).toBe(true)
  })
})
