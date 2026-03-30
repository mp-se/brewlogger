import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

const { piniaMocks } = vi.hoisted(() => {
  return {
    piniaMocks: {
      global: {
        batchListFilterDevice: '*',
        batchListFilterActive: false,
        batchListFilterData: false,
        updatedBatchData: 0,
        disabled: false,
        messageError: '',
        messageSuccess: '',
        baseURL: 'http://localhost/',
        token: 'Bearer token',
        fetchTimeout: 1000,
        clearMessages: vi.fn()
      },
      batchStore: {
        batchList: [],
        updateBatch: vi.fn(),
        deleteBatch: vi.fn()
      },
      deviceStore: {
        deviceList: []
      }
    }
  }
})

vi.mock('@/modules/pinia', () => ({
  global: piniaMocks.global,
  batchStore: piniaMocks.batchStore,
  deviceStore: piniaMocks.deviceStore
}))

const { routerMock } = vi.hoisted(() => ({
  routerMock: {
    currentRoute: {
      value: {
        query: {}
      }
    }
  }
}))

vi.mock('@/modules/router', () => ({
  default: routerMock
}))

const { utilsMocks } = vi.hoisted(() => ({
  utilsMocks: {
    download: vi.fn()
  }
}))
vi.mock('@/modules/utils', () => utilsMocks)

const { uiMocks } = vi.hoisted(() => ({
  uiMocks: {
    sortedIconClass: 'bi-sort-alpha-down',
    setSortingDefault: vi.fn(),
    sortedClass: vi.fn(() => 'sorted'),
    sortList: vi.fn(),
    applySortList: vi.fn()
  }
}))
vi.mock('@/modules/ui', () => uiMocks)

import BatchListView from '@/views/BatchListView.vue'

describe('BatchListView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    piniaMocks.global.batchListFilterDevice = '*'
    piniaMocks.global.batchListFilterActive = false
    piniaMocks.global.batchListFilterData = false
    piniaMocks.global.updatedBatchData = 0
    piniaMocks.global.disabled = false
    piniaMocks.global.messageError = ''
    piniaMocks.global.messageSuccess = ''
    routerMock.currentRoute.value.query = {}
    
    piniaMocks.batchStore.batchList = [
      { id: 1, name: 'B1', chipIdGravity: 'c1', chipIdPressure: '', active: true, gravityCount: 1, pressureCount: 0, pourCount: 0, brewDate: '2025-01-01', tapList: true },
      { id: 2, name: 'B2', chipIdGravity: 'c2', chipIdPressure: 'c2', active: false, gravityCount: 0, pressureCount: 1, pourCount: 0, brewDate: '2025-02-01', tapList: false }
    ]
    
    piniaMocks.deviceStore.deviceList = [
      { id: 1, chipId: 'c1', mdns: 'm1' },
      { id: 2, chipId: 'c2', mdns: 'm2' }
    ]

    global.fetch = vi.fn()
  })

  const mountWrapper = () => {
    return mount(BatchListView, {
      global: {
        stubs: {
          'router-link': { template: '<a><slot /></a>' },
          'BsSelect': {
            template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="o in options" :value="o.value">{{o.label}}</option></select>',
            props: ['modelValue', 'options']
          },
          'BsInputSwitch': {
            template: '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
            props: ['modelValue']
          },
          'BsModalConfirm': {
            template: '<div id="deleteBatch" @click="callback(true)"></div>'
          }
        }
      }
    })
  }

  it('filters by active status', async () => {
    const wrapper = mountWrapper()
    expect(wrapper.vm.batchList).toHaveLength(2)
    
    piniaMocks.global.batchListFilterActive = true
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.batchList).toHaveLength(1)
  })

  it('filters by device', async () => {
    const wrapper = mountWrapper()
    piniaMocks.global.batchListFilterDevice = 'c2'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.batchList).toHaveLength(1)
  })

  it('filters by data', async () => {
    const wrapper = mountWrapper()
    piniaMocks.global.batchListFilterData = true
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.batchList).toHaveLength(1)
  })

  it('handles query parameters on mount', async () => {
    routerMock.currentRoute.value.query = { chipId: 'c2' }
    mountWrapper()
    expect(piniaMocks.global.batchListFilterDevice).toBe('c2')
  })

  it('toggles batch active', async () => {
    piniaMocks.batchStore.updateBatch.mockResolvedValue(true)
    const wrapper = mountWrapper()
    await wrapper.vm.toggleBatchActive(1)
    expect(piniaMocks.batchStore.updateBatch).toHaveBeenCalled()
  })

  it('toggles batch taplist', async () => {
    piniaMocks.batchStore.updateBatch.mockResolvedValue(true)
    const wrapper = mountWrapper()
    await wrapper.vm.toggleBatchTapList(1)
    expect(piniaMocks.batchStore.updateBatch).toHaveBeenCalled()
  })

  it('deletes batch on confirmation', async () => {
    piniaMocks.batchStore.deleteBatch.mockResolvedValue(true)
    const wrapper = mountWrapper()
    await wrapper.vm.confirmDeleteCallback(true)
    expect(piniaMocks.batchStore.deleteBatch).toHaveBeenCalled()
  })

  it('exports JSON', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'Test' })
    })
    const wrapper = mountWrapper()
    await wrapper.vm.exportBatchJSON(1)
    expect(global.fetch).toHaveBeenCalled()
    expect(utilsMocks.download).toHaveBeenCalled()
  })

  it('exports CSV Gravity', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'Test', gravity: [{created: 'c', temperature: 1, gravity: 2, angle: 3, battery: 4, rssi: 5, corrGravity: 6, runTime: 7, chamberTemperature: 8, beerTemperature: 9, velocity: 10}] })
    })
    const wrapper = mountWrapper()
    await wrapper.vm.exportBatchGravityCSV(1)
    expect(utilsMocks.download).toHaveBeenCalled()
  })

  it('exports CSV Pressure', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'Test', pressure: [{created: 'c', temperature: 1, pressure: 2, pressure1: 3, battery: 4, rssi: 5, runTime: 6}] })
    })
    const wrapper = mountWrapper()
    await wrapper.vm.exportBatchPressureCSV(1)
    expect(utilsMocks.download).toHaveBeenCalled()
  })

  it('handles updatedBatchData watch', async () => {
    const wrapper = mountWrapper()
    piniaMocks.global.updatedBatchData += 1
    await wrapper.vm.$nextTick()
    expect(uiMocks.applySortList).toHaveBeenCalled()
  })

  it('covers sorting', async () => {
    const wrapper = mountWrapper()
    const sortBtn = wrapper.find('.icon-link')
    if (sortBtn.exists()) {
      await sortBtn.trigger('click')
      expect(uiMocks.sortList).toHaveBeenCalled()
    }
  })

  it('handles fetch failures in exports', async () => {
    global.fetch.mockResolvedValue({ ok: false })
    const wrapper = mountWrapper()
    await wrapper.vm.exportBatchJSON(1)
    expect(piniaMocks.global.messageError).toContain('Failed to fetch batch')
  })

  it('covers deleteBatch setup', async () => {
    const wrapper = mountWrapper()
    const spy = vi.spyOn(document, 'getElementById').mockReturnValue({ click: vi.fn() })
    await wrapper.vm.deleteBatch(1, 'name')
    expect(spy).toHaveBeenCalledWith('deleteBatch')
  })
})
