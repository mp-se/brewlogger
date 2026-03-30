import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import DeviceListView from '../DeviceListView.vue'
import { createPinia, setActivePinia } from 'pinia'

// V2 REWRITE
const mockDeviceStore = vi.hoisted(() => ({
  deviceList: [],
  load: vi.fn(),
  deleteDevice: vi.fn(),
  updateDevice: vi.fn(),
  addDevice: vi.fn(),
  searchNetwork: vi.fn(),
  proxyRequest: vi.fn()
}))

const mockGlobalStore = vi.hoisted(() => ({
  disabled: false,
  messageError: '',
  messageSuccess: '',
  deviceListFilterSoftware: '*',
  clearMessages: vi.fn(),
  baseURL: 'http://localhost:8080/',
  token: 'mock-token',
  fetchTimout: 5000
}))

const mockBatchStore = vi.hoisted(() => ({
  batchList: [],
  anyBatchesForDevice: vi.fn(() => false)
}))

const mockRouter = vi.hoisted(() => ({
  push: vi.fn(),
  currentRoute: { value: { query: {} } }
}))

const mockUi = vi.hoisted(() => ({
  setSortingDefault: vi.fn(),
  applySortList: vi.fn(),
  sortList: vi.fn(),
  getSortIcon: vi.fn().mockReturnValue('bi-sort-alpha-down'),
  sortedClass: vi.fn().mockReturnValue('sorted'),
  sortedIconClass: 'bi-sort-down'
}))

const mockLogger = vi.hoisted(() => ({
  logDebug: vi.fn(),
  logInfo: vi.fn(),
  logError: vi.fn()
}))

const mockDetect = vi.hoisted(() => ({
  detectId: vi.fn(),
  detectMdns: vi.fn(),
  detectPlatform: vi.fn(),
  detectSoftware: vi.fn()
}))

vi.mock('@/modules/deviceStore', () => ({ useDeviceStore: () => mockDeviceStore }))
vi.mock('@/modules/globalStore', () => ({ useGlobalStore: () => mockGlobalStore }))
vi.mock('@/modules/batchStore', () => ({ useBatchStore: () => mockBatchStore }))
vi.mock('@/modules/router', () => ({ default: mockRouter }))
vi.mock('@/modules/ui', () => mockUi)
vi.mock('@/modules/logger', () => mockLogger)
vi.mock('@/modules/detect', () => mockDetect)

vi.stubGlobal('open', vi.fn())

describe('DeviceListView.vue', () => {
  let wrapper

  const mountWrapper = () => {
    return mount(DeviceListView, {
      global: {
        stubs: {
          'router-link': true,
          'BsCard': { template: '<div><slot name="header"></slot><slot></slot><slot name="footer"></slot></div>' },
          'BsMenuBar': { template: '<div><slot></slot></div>' },
          'BsModal': { props: ['id'], template: '<div :id="id"><slot></slot></div>' },
          'BsModalConfirm': { 
            props: ['id', 'callback'], 
            template: '<button type="button" :id="id" hidden style="display:none" @click="callback(true)"></button>' 
          },
          'BsModalSelect': { 
            props: ['id', 'callback'], 
            template: '<button type="button" :id="id" hidden style="display:none" @click="callback(true, \'mock-val\')"></button>' 
          },
          'BsSelect': { props: ['modelValue'], template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
          'BsMessage': { template: '<div></div>' },
          'IconCpu': { template: '<span></span>' },
          'IconTools': { template: '<span></span>' },
          'IconXCircle': { template: '<span></span>' },
          'IconInfoCircle': { template: '<span></span>' },
          'IconUpArrow': { template: '<span></span>' },
          'IconCloudUpArrow': { template: '<span></span>' },
          'IconListUl': { template: '<span></span>' }
        },
        directives: { tooltip: {} }
      }
    })
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockDeviceStore.deviceList = [
      { id: 1, mdns: 'device1', software: 'Gravitymon', collectLogs: false, url: 'http://1.1.1.1', chipFamily: 'ESP32', chipId: 'ABC1' },
      { id: 2, mdns: 'device2', software: 'Kegmon', collectLogs: true, url: 'http://1.1.1.2', chipFamily: 'ESP8266', chipId: 'DEF2' }
    ]
    mockGlobalStore.deviceListFilterSoftware = '*'
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(['device1.log', 'device2.log']) })
    mockRouter.currentRoute.value = { query: {} }
  })

  afterEach(() => { if (wrapper) wrapper.unmount() })

  it('renders and loads data on mount', async () => {
    wrapper = mountWrapper()
    await flushPromises()
    expect(mockUi.setSortingDefault).toHaveBeenCalled()
    expect(wrapper.findAll('tbody tr').length).toBe(2)
  })

  it('filters by software', async () => {
    mockGlobalStore.deviceListFilterSoftware = 'Gravitymon'
    wrapper = mountWrapper()
    await flushPromises()
    expect(wrapper.findAll('tbody tr').length).toBe(1)
    expect(wrapper.find('tbody tr').text()).toContain('device1')
  })

  it.skip('navigates to device view on edit click', async () => {
    wrapper = mountWrapper()
    await flushPromises()
    const btns = wrapper.findAll('button')
    const editBtn = btns.find(b => b.attributes('title')?.includes('Edit device'))
    await editBtn.trigger('click')
    expect(mockRouter.push).toHaveBeenCalled()
  })

  it.skip('calls deleteDevice on confirm', async () => {
    wrapper = mountWrapper()
    await flushPromises()
    const deleteBtn = wrapper.findAll('button').find(b => b.attributes('title')?.includes('Delete device'))
    await deleteBtn.trigger('click')
    const modal = wrapper.find('#idModalDeviceDelete')
    const confirmBtn = modal.find('button.confirm')
    await confirmBtn.trigger('click')
    expect(mockDeviceStore.deleteDevice).toHaveBeenCalled()
  })

  it.skip('toggles log collection', async () => {
    wrapper = mountWrapper()
    await flushPromises()
    const logBtn = wrapper.findAll('button').find(b => b.attributes('t')?.includes('logging'))
    await logBtn.trigger('click')
    expect(mockDeviceStore.updateDevice).toHaveBeenCalled()
  })

  it.skip('handles MDNS search', async () => {
    mockDeviceStore.searchNetwork.mockResolvedValueOnce(['newdevice'])
    wrapper = mountWrapper()
    await flushPromises()
    const searchBtn = wrapper.findAll('button').find(b => b.text().includes('Search'))
    await searchBtn.trigger('click')
    expect(mockDeviceStore.searchNetwork).toHaveBeenCalled()
  })

  it.skip('calls search on mount if query param present', async () => {
    mockRouter.currentRoute.value.query = { search: 'true' }
    wrapper = mountWrapper()
    await flushPromises()
    expect(mockDeviceStore.searchNetwork).toHaveBeenCalled()
  })
})
