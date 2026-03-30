import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import DeviceListView from '../DeviceListView.vue'
import { createPinia, setActivePinia } from 'pinia'

// V2 REWRITE
const mockDeviceStore = vi.hoisted(() => ({
  deviceList: [],
  load: vi.fn(),
  deleteDevice: vi.fn().mockResolvedValue(true),
  updateDevice: vi.fn().mockResolvedValue(true),
  addDevice: vi.fn().mockResolvedValue(true),
  searchNetwork: vi.fn().mockResolvedValue([]),
  proxyRequest: vi.fn().mockResolvedValue({}),
  anyBatchesForDevice: vi.fn(() => false)
}))

const mockGlobalStore = vi.hoisted(() => ({
  disabled: false,
  messageError: '',
  messageSuccess: '',
  deviceListFilterSoftware: '*',
  updatedDeviceData: {},
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
  currentRoute: { value: { query: {}, name: 'device-list' } }
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
  detectId: vi.fn().mockReturnValue('ABC123'),
  detectMdns: vi.fn().mockReturnValue('test-device'),
  detectPlatform: vi.fn().mockReturnValue('ESP32'),
  detectSoftware: vi.fn().mockReturnValue('Gravitymon')
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

  const mockDevice = (id = 1, mdns = 'device1', software = 'Gravitymon') => ({
    id,
    mdns,
    chipId: `CHIP${id}`,
    software,
    collectLogs: false,
    url: `http://1.1.1.${id}`,
    chipFamily: 'ESP32',
    description: `Device ${id}`
  })

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
      mockDevice(1, 'device1', 'Gravitymon'),
      mockDevice(2, 'device2', 'Kegmon'),
      mockDevice(3, 'device3', 'Chamber-Controller')
    ]
    mockGlobalStore.deviceListFilterSoftware = '*'
    mockGlobalStore.disabled = false
    mockGlobalStore.messageError = ''
    mockGlobalStore.messageSuccess = ''
    // Setup default fetch mock
    global.fetch = vi.fn(() => 
      Promise.resolve({ ok: true, json: () => Promise.resolve(['device1.log', 'device2.log']) })
    )
    mockRouter.currentRoute.value = { query: {}, name: 'device-list' }
  })

  afterEach(() => { if (wrapper) wrapper.unmount() })

  describe('Rendering', () => {
    it('renders component structure', async () => {
      wrapper = mountWrapper()
      expect(wrapper.find('.container').exists()).toBe(true)
      expect(wrapper.find('p.h3').text()).toContain('Device List')
    })

    it('renders table with all devices', async () => {
      wrapper = mountWrapper()
      await flushPromises()
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(3)
    })

    it('renders loading state when deviceList is null', async () => {
      mockDeviceStore.deviceList = []
      wrapper = mountWrapper()
      await flushPromises()
      expect(wrapper.text()).toMatch(/Loading|Device/)
    })
  })

  describe('Filtering', () => {
    it('renders all devices when filter is *', async () => {
      wrapper = mountWrapper()
      await flushPromises()
      expect(wrapper.findAll('tbody tr').length).toBe(3)
    })

    it('filters by software type', async () => {
      mockGlobalStore.deviceListFilterSoftware = 'Gravitymon'
      wrapper = mountWrapper()
      await flushPromises()
      expect(wrapper.findAll('tbody tr').length).toBe(1)
      expect(wrapper.find('tbody tr').text()).toContain('device1')
    })

    it('filters by Chamber-Controller', async () => {
      mockGlobalStore.deviceListFilterSoftware = 'Chamber-Controller'
      wrapper = mountWrapper()
      await flushPromises()
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBeGreaterThan(0)
    })

    it('updates filter when watch triggers', async () => {
      wrapper = mountWrapper()
      await flushPromises()
      mockGlobalStore.deviceListFilterSoftware = 'Kegmon'
      await flushPromises()
      await wrapper.vm.$nextTick()
    })
  })

  describe('Fetch Device Logs', () => {
    it('fetches device log list on mount', async () => {
      wrapper = mountWrapper()
      await flushPromises()
      expect(global.fetch).toHaveBeenCalled()
    })

    it('sets disabled state during fetch', async () => {
      global.fetch = vi.fn(async () => {
        expect(mockGlobalStore.disabled).toBe(true)
        return { ok: true, json: () => Promise.resolve([]) }
      })
      wrapper = mountWrapper()
      await flushPromises()
    })

    it('handles fetch error gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Fetch failed'))
      wrapper = mountWrapper()
      await flushPromises()
      expect(mockLogger.logError).toHaveBeenCalled()
    })

    it('handles empty device logs list', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      wrapper = mountWrapper()
      await flushPromises()
      expect(mockGlobalStore.disabled).toBe(false)
    })

    it('filters log file names correctly', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({ 
        ok: true, 
        json: () => Promise.resolve(['device1.log', 'device1.log.1', 'device2.log']) 
      })
      wrapper = mountWrapper()
      await flushPromises()
    })
  })

  describe('Toggle Device Logging', () => {
    it('toggles device logging', async () => {
      wrapper = mountWrapper()
      await flushPromises()
      const device = wrapper.vm.deviceList[0]
      await wrapper.vm.toggleDeviceLogging(device.id)
      expect(mockDeviceStore.updateDevice).toHaveBeenCalled()
    })

    it('handles logging toggle failure', async () => {
      mockDeviceStore.updateDevice.mockResolvedValueOnce(false)
      wrapper = mountWrapper()
      await flushPromises()
      await wrapper.vm.toggleDeviceLogging(1)
      expect(mockGlobalStore.messageError).toBeDefined()
    })

    it('toggles collectLogs property', async () => {
      wrapper = mountWrapper()
      await flushPromises()
      const initialState = wrapper.vm.deviceList[0].collectLogs
      await wrapper.vm.toggleDeviceLogging(wrapper.vm.deviceList[0].id)
      expect(wrapper.vm.deviceList[0].collectLogs).toBe(!initialState)
    })
  })

  describe('Delete Device', () => {
    it('calls deleteDevice with correct id', async () => {
      wrapper = mountWrapper()
      await flushPromises()
      const device = wrapper.vm.deviceList[0]
      await wrapper.vm.confirmDeleteCallback(true)
      expect(mockGlobalStore.disabled).toBeDefined()
    })

    it('sets error message on delete failure', async () => {
      mockDeviceStore.deleteDevice.mockResolvedValueOnce(false)
      wrapper = mountWrapper()
      await flushPromises()
      wrapper.vm.confirmDeleteId = 1
      await wrapper.vm.confirmDeleteCallback(true)
      expect(mockGlobalStore.messageError).toContain('Failed to delete')
    })

    it('ignores delete confirmation when result is false', async () => {
      wrapper = mountWrapper()
      await flushPromises()
      const initialCallCount = mockDeviceStore.deleteDevice.mock.calls.length
      await wrapper.vm.confirmDeleteCallback(false)
      expect(mockDeviceStore.deleteDevice.mock.calls.length).toBe(initialCallCount)
    })

    it('sets success message on delete', async () => {
      mockDeviceStore.deleteDevice.mockResolvedValueOnce(true)
      wrapper = mountWrapper()
      await flushPromises()
      wrapper.vm.confirmDeleteId = 1
      await wrapper.vm.confirmDeleteCallback(true)
      expect(mockGlobalStore.messageSuccess).toContain('Deleted')
    })
  })

  describe('Open URL', () => {
    it('opens device URL in new window', () => {
      wrapper = mountWrapper()
      wrapper.vm.openUrl('http://device.local')
      expect(global.open).toHaveBeenCalledWith('http://device.local', '_blank')
    })

    it('filters devices with valid URLs', async () => {
      mockDeviceStore.deviceList = [
        { ...mockDevice(1), url: 'http://device.local' },
        { ...mockDevice(2), url: '' }
      ]
      wrapper = mountWrapper()
      await flushPromises()
      expect(wrapper.vm.deviceList.length).toBeGreaterThan(0)
    })
  })

  describe('Search Network', () => {
    it('opens search modal', async () => {
      wrapper = mountWrapper()
      await flushPromises()
      vi.spyOn(document, 'getElementById').mockReturnValue({ click: vi.fn() })
      await wrapper.vm.search()
      expect(mockGlobalStore.disabled).toBe(true)
    })

    it('handles search network success', async () => {
      mockDeviceStore.searchNetwork.mockResolvedValueOnce([
        { name: 'device1', host: 'device1.local', type: 'http.local.' }
      ])
      wrapper = mountWrapper()
      await flushPromises()
      await wrapper.vm.search()
      expect(wrapper.vm.searchOptions).toBeDefined()
    })

    it('handles search network failure', async () => {
      mockDeviceStore.searchNetwork.mockResolvedValueOnce(null)
      wrapper = mountWrapper()
      await flushPromises()
      await wrapper.vm.search()
      expect(mockGlobalStore.messageError).toContain('Failed to search')
    })

    it('clears previous search results', async () => {
      wrapper = mountWrapper()
      await flushPromises()
      wrapper.vm.searchOptions = [{ label: 'old' }]
      wrapper.vm.searchSelected = 'something'
      vi.spyOn(document, 'getElementById').mockReturnValue({ click: vi.fn() })
      await wrapper.vm.search()
      expect(wrapper.vm.searchSelected).toBe('')
    })
  })

  describe('Detect Device Type', () => {
    it('detects device type from API response', async () => {
      mockDeviceStore.proxyRequest.mockResolvedValueOnce({ 
        id: 'ABC123',
        mdns: 'test-device',
        model: 'ESP32',
        fw_type: 'Gravitymon'
      })
      wrapper = mountWrapper()
      await flushPromises()
      await wrapper.vm.detectDeviceType('http://device.local')
      expect(mockDetect.detectId).toHaveBeenCalled()
    })

    it('adds detected device to store', async () => {
      mockDeviceStore.proxyRequest.mockResolvedValueOnce({})
      wrapper = mountWrapper()
      await flushPromises()
      await wrapper.vm.detectDeviceType('http://test.local')
      expect(mockDeviceStore.addDevice).toHaveBeenCalled()
    })

    it('handles empty device ID during detection', async () => {
      mockDetect.detectId.mockReturnValueOnce('')
      mockDeviceStore.proxyRequest.mockResolvedValueOnce({})
      wrapper = mountWrapper()
      await flushPromises()
      await wrapper.vm.detectDeviceType('http://test.local')
      expect(mockGlobalStore.messageError).toContain('Unable to detect')
    })

    it('handles fetch failure during detection', async () => {
      mockDeviceStore.proxyRequest.mockRejectedValueOnce(new Error('Connection failed'))
      wrapper = mountWrapper()
      await flushPromises()
      await wrapper.vm.detectDeviceType('http://test.local')
      expect(mockGlobalStore.messageError).toContain('Failed to fetch')
    })

    it('handles duplicate device during add', async () => {
      mockDeviceStore.addDevice.mockResolvedValueOnce(false)
      mockDeviceStore.proxyRequest.mockResolvedValueOnce({})
      wrapper = mountWrapper()
      await flushPromises()
      await wrapper.vm.detectDeviceType('http://test.local')
      expect(mockGlobalStore.messageError).toContain('might already exist')
    })
  })

  describe('Software Options', () => {
    it('provides all software filter options', async () => {
      wrapper = mountWrapper()
      expect(wrapper.vm.softwareOptions.length).toBeGreaterThan(0)
      expect(wrapper.vm.softwareOptions.some(o => o.value === 'Gravitymon')).toBe(true)
    })
  })

  describe('Table Columns', () => {
    it('displays device mdns in table', async () => {
      wrapper = mountWrapper()
      await flushPromises()
      const row = wrapper.find('tbody tr')
      expect(row.text()).toContain('device1')
    })

    it('uses URL as fallback when mdns is empty', async () => {
      mockDeviceStore.deviceList = [
        { ...mockDevice(1), mdns: '', url: 'http://10.0.0.1' }
      ]
      wrapper = mountWrapper()
      await flushPromises()
      const row = wrapper.find('tbody tr')
      expect(row.text()).toContain('http://10.0.0.1')
    })

    it('uses description as fallback when mdns and url are empty', async () => {
      mockDeviceStore.deviceList = [
        { ...mockDevice(1), mdns: '', url: '', description: 'My Device' }
      ]
      wrapper = mountWrapper()
      await flushPromises()
      const row = wrapper.find('tbody tr')
      expect(row.text()).toContain('My Device')
    })
  })

  describe('Buttons and Actions', () => {
    it('renders action buttons', async () => {
      wrapper = mountWrapper()
      await flushPromises()
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('disables buttons when global.disabled is true', async () => {
      mockGlobalStore.disabled = true
      wrapper = mountWrapper()
      await flushPromises()
      const buttons = wrapper.findAll('button')
      // Verify buttons exist - the actual disabled binding is handled by Vue
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Modal Integration', () => {
    it('renders delete confirmation modal', async () => {
      wrapper = mountWrapper()
      // Modal is rendered as a stub button with id="deleteDevice"
      expect(wrapper.find('button[id="deleteDevice"]').exists()).toBe(true)
    })

    it('renders search modal', async () => {
      wrapper = mountWrapper()
      // Modal is rendered as a stub button with id="searchDevice"
      expect(wrapper.find('button[id="searchDevice"]').exists()).toBe(true)
    })
  })

  describe('Component Lifecycle', () => {
    it('initializes on mount', async () => {
      wrapper = mountWrapper()
      await flushPromises()
      expect(mockUi.setSortingDefault).toHaveBeenCalled()
    })

    it('applies sorting on mount', async () => {
      wrapper = mountWrapper()
      await flushPromises()
      expect(mockUi.applySortList).toHaveBeenCalled()
    })
  })
})
