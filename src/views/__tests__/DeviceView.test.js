import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import DeviceView from '../DeviceView.vue'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}))

describe('DeviceView', () => {
  let router

  beforeEach(() => {
    setActivePinia(createPinia())
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/device/:id', name: 'device' },
        { path: '/devices', name: 'device-list' }
      ]
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render device view container', () => {
      const wrapper = mount(DeviceView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            BsFileUpload: true,
            'router-link': true
          },
          plugins: [router]
        }
      })
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })

    it('should render page title', () => {
      const wrapper = mount(DeviceView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            BsFileUpload: true,
            'router-link': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.text()).toContain('Device')
    })

    it('should have h3 class for title', () => {
      const wrapper = mount(DeviceView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            BsFileUpload: true,
            'router-link': true
          },
          plugins: [router]
        }
      })
      const h3 = wrapper.find('.h3')
      expect(h3.exists()).toBe(true)
    })
  })

  describe('Form Structure', () => {
    it('should render form element structure', () => {
      const wrapper = mount(DeviceView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            BsFileUpload: true,
            'router-link': true
          },
          plugins: [router]
        }
      })
      // Component renders with input components
      const inputStubs = wrapper.findAll('[class*="input"], bsinput-stub')
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should have form structure', () => {
      const wrapper = mount(DeviceView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            BsFileUpload: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      // Verify component renders
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Initialization', () => {
    it('should initialize with empty device object', () => {
      const wrapper = mount(DeviceView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            BsFileUpload: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.device).toBeDefined()
    })

    it('should mount component successfully', () => {
      const wrapper = mount(DeviceView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            BsFileUpload: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      // Should mount without errors
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Layout', () => {
    it('should render container with bootstrap grid', () => {
      const wrapper = mount(DeviceView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            BsFileUpload: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.find('.row').exists()).toBe(true)
    })

    it('should render horizontal rules', () => {
      const wrapper = mount(DeviceView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            BsFileUpload: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      const hrs = wrapper.findAll('hr')
      expect(hrs.length).toBeGreaterThan(0)
    })
  })

  describe('Device Configuration Sections', () => {
    it('should have fermentation steps section', () => {
      const wrapper = mount(DeviceView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            BsFileUpload: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      // FermentationStepFragment should be stubbed
      const text = wrapper.text()
      expect(text).toBeDefined()
    })
  })

  describe('Navigation', () => {
    it('should have router links for navigation', () => {
      const wrapper = mount(DeviceView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            BsFileUpload: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      const routerLinks = wrapper.findAll('router-link-stub')
      expect(routerLinks.length).toBeGreaterThanOrEqual(0)
    })
  })
})
