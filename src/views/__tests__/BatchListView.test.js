
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BatchListView from '../BatchListView.vue'
import { nextTick, ref } from 'vue'

vi.mock('pinia', async () => {
  const { ref, watch } = await import('vue')
  return {
    storeToRefs: (store) => {
      const refs = {}
      for (const key in store) {
        if (typeof store[key] !== 'function' && key !== 'batchList') {
          const r = ref(store[key])
          refs[key] = r
          // Link the ref to the store property
          Object.defineProperty(store, key, {
            get() { return r.value },
            set(v) { r.value = v },
            configurable: true,
            enumerable: true
          })
        }
      }
      return refs
    }
  }
})

// Mock fetch for getBatch
global.fetch = vi.fn()


const globalMock = vi.hoisted(() => ({
  batchListFilterDevice: '*',
  batchListFilterActive: false,
  batchListFilterData: false,
  updatedBatchData: 0,
  disabled: false,
  messageError: '',
  messageSuccess: '',
  clearMessages: vi.fn(),
  fetchTimout: 1000
}))

const { batchStoreMock, deviceStoreMock, gravityStoreMock, pressureStoreMock } = vi.hoisted(() => {
  return {
    batchStoreMock: {
      batchList: [
        { id: 1, name: 'B1', brewDate: '2023-01-01', active: true, tapList: false, gravityCount: 10, pressureCount: 5, pourCount: 2, chipIdGravity: 'c1', chipIdPressure: 'p1' },
        { id: 2, name: 'B2', brewDate: '2023-02-01', active: false, tapList: true, gravityCount: 0, pressureCount: 0, pourCount: 0, chipIdGravity: 'c2', chipIdPressure: 'p2' }
      ],
      updateBatch: vi.fn().mockResolvedValue(true),
      deleteBatch: vi.fn().mockResolvedValue(true),
      getBatch: vi.fn().mockResolvedValue({ id: 1, name: 'B1', gravity: [] })
    },
    deviceStoreMock: {
      deviceList: [
        { chipId: 'c1', mdns: 'dev1' },
        { chipId: 'c2', mdns: 'dev2' }
      ]
    },
    gravityStoreMock: { getGravity: vi.fn().mockResolvedValue([{ date: '2023-01-01', gravity: 1.050 }]) },
    pressureStoreMock: { getPressure: vi.fn().mockResolvedValue([{ date: '2023-01-01', pressure: 12 }]) }
  }
})

vi.mock('@/modules/pinia', () => ({
  global: globalMock,
  batchStore: batchStoreMock,
  deviceStore: deviceStoreMock,
  gravityStore: gravityStoreMock,
  pressureStore: pressureStoreMock
}))

const routerMock = vi.hoisted(() => ({
  currentRoute: { value: { query: {} } },
  push: vi.fn()
}))
vi.mock('@/modules/router', () => ({ default: routerMock }))
const utilsMock = vi.hoisted(() => ({ download: vi.fn() }))
vi.mock('@/modules/utils', () => utilsMock)
vi.mock('@/modules/logger', () => ({ logDebug: vi.fn(), logError: vi.fn() }))
const uiMock = vi.hoisted(() => ({
  sortedIconClass: 'bi-sort',
  setSortingDefault: vi.fn(),
  sortedClass: vi.fn().mockReturnValue('sorted'),
  sortList: vi.fn(),
  applySortList: vi.fn()
}))

vi.mock('@/modules/ui', () => uiMock)

describe('BatchListView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    globalMock.batchListFilterDevice = '*'
    globalMock.batchListFilterActive = false
    globalMock.batchListFilterData = false
    globalMock.messageError = ''
    globalMock.messageSuccess = ''
    routerMock.currentRoute.value.query = {}
    batchStoreMock.batchList[0].active = true
    batchStoreMock.batchList[1].active = false
  })

  const mountWrapper = () => mount(BatchListView, {
    attachTo: document.body,
    global: {
      stubs: {
        'router-link': true,
        'BsSelect': {
          template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="o in options" :value="o.value">{{o.label}}</option></select>',
          props: ['modelValue', 'options']
        },
        'BsInputSwitch': {
          template: '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
          props: ['modelValue']
        },
        'BsModalConfirm': {
           template: '<div id="deleteBatch" @click="$props.callback(true)"></div>',
           props: ['callback']
        }
      }
    }
  })

  it('filters by active status', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    globalMock.batchListFilterActive = true
    wrapper.vm.filterBatchList() 
    expect(wrapper.vm.batchList).toHaveLength(1)
  })

  it('filters by data status', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    globalMock.batchListFilterActive = false
    globalMock.batchListFilterData = true
    wrapper.vm.filterBatchList() 
    expect(wrapper.vm.batchList).toHaveLength(1)
    expect(wrapper.vm.batchList[0].id).toBe(1)
  })

  it('filters by device', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    globalMock.batchListFilterActive = false
    globalMock.batchListFilterData = false
    globalMock.batchListFilterDevice = 'c2'
    wrapper.vm.filterBatchList() 
    expect(wrapper.vm.batchList).toHaveLength(1)
    expect(wrapper.vm.batchList[0].id).toBe(2)
  })

  it('handles empty query chipId on mount', async () => {
    routerMock.currentRoute.value.query = {}
    const wrapper = mountWrapper()
    await nextTick()
    expect(globalMock.batchListFilterDevice).toBe('*')
  })

  it('handles chipId query on mount', async () => {
    routerMock.currentRoute.value.query = { chipId: 'c1' }
    const wrapper = mountWrapper()
    await nextTick()
    expect(globalMock.batchListFilterDevice).toBe('c1')
  })

  it('toggles batch tapList', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    await wrapper.vm.toggleBatchTapList(1)
    expect(batchStoreMock.updateBatch).toHaveBeenCalled()
  })

  it('toggles batch active', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    await wrapper.vm.toggleBatchActive(1)
    expect(batchStoreMock.updateBatch).toHaveBeenCalled()
  })

  it('deletes batch on confirmation', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    wrapper.vm.deleteBatch(1, 'Batch 1')
    await wrapper.vm.confirmDeleteCallback(true)
    expect(batchStoreMock.deleteBatch).toHaveBeenCalled()
  })

  it('fails to toggle batch active if update fails', async () => {
    batchStoreMock.updateBatch.mockResolvedValueOnce(false)
    const wrapper = mountWrapper()
    await nextTick()
    await wrapper.vm.toggleBatchActive(1)
    expect(globalMock.messageError).toContain('Failed to load batch')
  })

  it('fails to toggle batch tapList if update fails', async () => {
    batchStoreMock.updateBatch.mockResolvedValueOnce(false)
    const wrapper = mountWrapper()
    await nextTick()
    await wrapper.vm.toggleBatchTapList(1)
    expect(globalMock.messageError).toContain('Failed to load batch')
  })

  it('exports JSON', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'B1', gravity: [] })
    })

    const wrapper = mountWrapper()
    await nextTick()
    await wrapper.vm.exportBatchJSON(1)
    await nextTick() 
    await nextTick() 
    expect(utilsMock.download).toHaveBeenCalled()
  })

  it('exports pressure CSV', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'B1', pressure: [{ date: '2023-01-01', pressure: 10 }] })
    })

    const wrapper = mountWrapper()
    await nextTick()
    await wrapper.vm.exportBatchPressureCSV(1)
    await nextTick() 
    await nextTick() 
    expect(utilsMock.download).toHaveBeenCalled()
  })

  it('exports gravity CSV', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'B1', gravity: [{ date: '2023-01-01', gravity: 1.050 }] })
    })

    const wrapper = mountWrapper()
    await nextTick()
    await wrapper.vm.exportBatchGravityCSV(1)
    await nextTick() 
    await nextTick() 
    expect(utilsMock.download).toHaveBeenCalled()
  })

  it('handles confirmDeleteCallback on failure', async () => {
    batchStoreMock.deleteBatch.mockResolvedValueOnce(false)
    const wrapper = mountWrapper()
    await nextTick()
    await wrapper.vm.confirmDeleteCallback(true)
    expect(globalMock.messageError).toContain('Failed to batch device')
  })

  it('sorts batch list', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    const sortLink = wrapper.find('a.icon-link') 
    await sortLink.trigger('click')
    expect(uiMock.sortList).toHaveBeenCalled()
  })

  it('watches updatedBatchData', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    globalMock.updatedBatchData = 1
    await nextTick()
    expect(uiMock.applySortList).toHaveBeenCalled()
  })

  it('watches batchListFilterDevice', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    globalMock.batchListFilterDevice = 'c1'
    await nextTick()
    await nextTick()
    expect(uiMock.applySortList).toHaveBeenCalled()
  })

  it('watches batchListFilterData', async () => {
    const wrapper = mountWrapper()
    await nextTick()
    globalMock.batchListFilterData = true
    await nextTick()
    await nextTick()
    expect(uiMock.applySortList).toHaveBeenCalled()
  })
})


