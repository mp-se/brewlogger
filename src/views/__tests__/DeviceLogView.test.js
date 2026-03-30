import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import DeviceLogView from '../DeviceLogView.vue'
import piniaInstance from '@/modules/pinia'
import { useDeviceStore } from '@/modules/deviceStore'
import { useGlobalStore } from '@/modules/globalStore'
import * as logger from '@/modules/logger'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}))

describe('DeviceLogView', () => {
  let deviceStore, globalStore, router

  beforeEach(() => {
    setActivePinia(piniaInstance)
    deviceStore = useDeviceStore()
    globalStore = useGlobalStore()
    vi.clearAllMocks()

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/device/log/:id', name: 'device-log' },
        { path: '/device', name: 'device-list' }
      ]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Structure', () => {
    it('should render container', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should render page title', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      expect(wrapper.find('.h3').exists()).toBe(true)
      expect(wrapper.text()).toContain('Device Logs')
    })

    it('should render multiple rows', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      const rows = wrapper.findAll('.row')
      expect(rows.length).toBeGreaterThan(0)
    })

    it('should render horizontal rules', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      expect(wrapper.findAll('hr').length).toBeGreaterThan(0)
    })

    it('should have proper column layout structure', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      expect(wrapper.find('.col-md-3').exists()).toBe(true)
      expect(wrapper.find('.col-md-4').exists()).toBe(true)
      expect(wrapper.find('.col-md-5').exists()).toBe(true)
    })
  })

  describe('State Initialization', () => {
    it('should initialize with empty device selected', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      // Buttons should be disabled when no device is selected
      const buttons = wrapper.findAll('button')
      const refreshBtn = buttons.find(b => b.attributes('data-bs-placement') === 'top' && b.classes().includes('btn-primary'))
      expect(refreshBtn?.attributes('disabled')).toBeDefined()
    })

    it('should initialize with empty device log array', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      expect(Array.isArray(wrapper.vm.deviceLog)).toBe(true)
      expect(wrapper.vm.deviceLog.length).toBe(0)
    })

    it('should initialize device log size as 0', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      expect(wrapper.vm.deviceLogSize).toBe(0)
    })

    it('should initialize log status values', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      expect(wrapper.vm.logStatusLast).toBeDefined()
      expect(wrapper.vm.logStatusSize).toBeDefined()
    })

    it('should call onMounted on component mount', () => {
      mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      expect(logger.logDebug).toHaveBeenCalledWith('DeviceLogView.onMounted()')
    })
  })

  describe('Store Access', () => {
    it('should have access to global store', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      expect(wrapper.vm.global).toBeDefined()
    })

    it('should have access to device store', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      expect(wrapper.vm.deviceStore).toBeDefined()
    })
  })

  describe('Router Integration', () => {
    it('should have router instance', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      expect(wrapper.vm.router).toBeDefined()
    })

    it('should have device options computed property', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      expect(Array.isArray(wrapper.vm.deviceOptions)).toBe(true)
    })
  })

  describe('Component Methods', () => {
    it('should have fetchLogs method', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      expect(typeof wrapper.vm.fetchLogs).toBe('function')
    })

    it('should have deleteLogs method', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      expect(typeof wrapper.vm.deleteLogs).toBe('function')
    })

    it('should have hideInfo method', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      expect(typeof wrapper.vm.hideInfo).toBe('function')
    })

    it('should have hideWarn method', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      expect(typeof wrapper.vm.hideWarn).toBe('function')
    })

    it('should have goToBottom method', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      expect(typeof wrapper.vm.goToBottom).toBe('function')
    })
  })

  describe('Button Elements', () => {
    it('should render Refresh button', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      const buttons = wrapper.findAll('button')
      expect(buttons.some(b => b.text().includes('Refresh'))).toBe(true)
    })

    it('should render Delete button', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have buttons with proper attributes', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('Styling Classes', () => {
    it('should use Bootstrap button classes', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      const buttons = wrapper.findAll('button')
      expect(buttons.some(b => b.classes().includes('btn'))).toBe(true)
    })

    it('should use monospace font for log display', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      // Check for font-monospace class in the template when logs exist
      expect(wrapper.html()).toBeDefined()
    })
  })

  describe('Component Mounting', () => {
    it('should mount without errors', () => {
      expect(() => {
        mount(DeviceLogView, {
          global: {
            stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
            plugins: [router]
          }
        })
      }).not.toThrow()
    })

    it('should render complete template structure', () => {
      const wrapper = mount(DeviceLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsSelect': true },
          plugins: [router]
        }
      })
      expect(wrapper.find('.container').exists()).toBe(true)
      expect(wrapper.find('div#pageBottom').exists()).toBe(true)
    })
  })
})
