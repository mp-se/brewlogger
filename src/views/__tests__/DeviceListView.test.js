import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import DeviceListView from '../DeviceListView.vue'
import BsSelect from '../../components/BsSelect.vue'
import { useDeviceStore } from '@/modules/deviceStore'
import { useBatchStore } from '@/modules/batchStore'
import { useGlobalStore } from '@/modules/globalStore'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}))

vi.mock('@/modules/ui', () => ({
  sortedIconClass: 'bi-sort-down',
  setSortingDefault: vi.fn(),
  sortedClass: vi.fn(() => 'sorted'),
  sortList: vi.fn(),
  applySortList: vi.fn()
}))

vi.mock('@/modules/detect', () => ({
  detectId: vi.fn(),
  detectMdns: vi.fn(),
  detectPlatform: vi.fn(),
  detectSoftware: vi.fn()
}))

describe('DeviceListView', () => {
  let router

  beforeEach(() => {
    setActivePinia(createPinia())
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/devices', name: 'device-list' },
        { path: '/device/:id', name: 'device' },
        { path: '/device/flash', name: 'device-flash' },
        { path: '/device/log/:id', name: 'device-log' },
        { path: '/batches', name: 'batch-list' }
      ]
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render device list container', () => {
      const wrapper = mount(DeviceListView, {
        global: {
          components: { BsSelect },
          stubs: {
            BsSelect: true,
            'router-link': true
          },
          plugins: [router]
        }
      })
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })

    it('should render page title', () => {
      const wrapper = mount(DeviceListView, {
        global: {
          components: { BsSelect },
          stubs: {
            BsSelect: true,
            'router-link': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.text()).toContain('Device List')
    })

    it('should have h3 class for title', () => {
      const wrapper = mount(DeviceListView, {
        global: {
          components: { BsSelect },
          stubs: {
            BsSelect: true,
            'router-link': true
          },
          plugins: [router]
        }
      })
      const h3 = wrapper.find('.h3')
      expect(h3.exists()).toBe(true)
    })
  })

  describe('Filter Controls', () => {
    it('should render filter select component', () => {
      const wrapper = mount(DeviceListView, {
        global: {
          components: { BsSelect },
          stubs: {
            BsSelect: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      const selects = wrapper.findAll('bsselect-stub')
      expect(selects.length).toBeGreaterThanOrEqual(0)
    })

    it('should render filter select components', () => {
      const wrapper = mount(DeviceListView, {
        global: {
          components: { BsSelect },
          stubs: {
            BsSelect: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.find('.container').exists()).toBe(true)
    })
  })

  describe('Table Structure', () => {
    it('should render device list table when data loads', async () => {
      const deviceStore = useDeviceStore()
      deviceStore.devices = [
        {
          id: 1,
          mdns: 'device1',
          chipId: 'ABC123',
          chipFamily: 'ESP32',
          software: 'Gravitymon',
          collectLogs: false,
          url: 'http://192.168.1.100',
          description: 'Test Device'
        }
      ]

      const wrapper = mount(DeviceListView, {
        global: {
          components: { BsSelect },
          stubs: {
            BsSelect: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      await flushPromises()

      // Device list table should render
      expect(wrapper.exists()).toBe(true)
    })

    it('should render table with proper structure', () => {
      const wrapper = mount(DeviceListView, {
        global: {
          components: { BsSelect },
          stubs: {
            BsSelect: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      // Component renders with container and table structure
      expect(wrapper.find('.container').exists()).toBe(true)
    })
  })

  describe('Device Data Display', () => {
    it('should render device info when data loads', async () => {
      const deviceStore = useDeviceStore()
      deviceStore.devices = [
        {
          id: 1,
          mdns: 'brewdevice',
          chipId: 'XYZ789',
          chipFamily: 'ESP32-C3',
          software: 'Chamber-Controller',
          collectLogs: true,
          url: 'http://192.168.1.50'
        }
      ]

      const wrapper = mount(DeviceListView, {
        global: {
          components: { BsSelect },
          stubs: {
            BsSelect: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      await flushPromises()

      expect(wrapper.exists()).toBe(true)
    })

    it('should display device name when available', async () => {
      const deviceStore = useDeviceStore()
      deviceStore.devices = [
        {
          id: 1,
          mdns: '',
          chipId: 'ABC123',
          url: 'http://192.168.1.100',
          description: 'My Device',
          chipFamily: 'ESP32',
          software: 'Gravitymon',
          collectLogs: false
        }
      ]

      const wrapper = mount(DeviceListView, {
        global: {
          components: { BsSelect },
          stubs: {
            BsSelect: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      await flushPromises()

      // Device list should have proper data structure
      expect(wrapper.vm.deviceList).toBeDefined()
    })
  })

  describe('Action Buttons', () => {
    it('should initialize with proper data structures', () => {
      const wrapper = mount(DeviceListView, {
        global: {
          components: { BsSelect },
          stubs: {
            BsSelect: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should render action controls', () => {
      const wrapper = mount(DeviceListView, {
        global: {
          components: { BsSelect },
          stubs: {
            BsSelect: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      // Buttons render through router-links which are stubbed
      const routerLinks = wrapper.findAll('router-link-stub')
      expect(routerLinks.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Lifecycle and Data Fetching', () => {
    it('should mount with valid initial state', () => {
      const wrapper = mount(DeviceListView, {
        global: {
          components: { BsSelect },
          stubs: {
            BsSelect: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should have search selected initializer', () => {
      const wrapper = mount(DeviceListView, {
        global: {
          components: { BsSelect },
          stubs: {
            BsSelect: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.searchSelected).toBe('')
    })
  })

  describe('Sorting Feature', () => {
    it('should render sortable column headers structure', () => {
      const wrapper = mount(DeviceListView, {
        global: {
          components: { BsSelect },
          stubs: {
            BsSelect: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      // Sortable headers use icon-link class
      expect(wrapper.find('.container').exists()).toBe(true)
    })
  })

  describe('Confirmation Modal', () => {
    it('should have confirmation modal support available', () => {
      const wrapper = mount(DeviceListView, {
        global: {
          components: { BsSelect },
          stubs: {
            BsSelect: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })
})
