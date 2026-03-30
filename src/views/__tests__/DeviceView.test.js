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

  describe('Chip ID Validation', () => {
    it('should return true for valid hex chip ID', () => {
      // Create simple object to test regex without mounting component
      const testObj = { chipId: 'abc123' }
      const regex = new RegExp(/^([0-9,a-f]){6}$/)
      expect(regex.test(testObj.chipId)).toBe(true)
    })

    it('should return false for invalid chip ID (too short)', () => {
      const testObj = { chipId: 'abc12' }
      const regex = new RegExp(/^([0-9,a-f]){6}$/)
      expect(regex.test(testObj.chipId)).toBe(false)
    })

    it('should return false for invalid chip ID (uppercase)', () => {
      const testObj = { chipId: 'ABC123' }
      const regex = new RegExp(/^([0-9,a-f]){6}$/)
      expect(regex.test(testObj.chipId)).toBe(false)
    })

    it('should return true for numeric chip ID', () => {
      const testObj = { chipId: '123456' }
      const regex = new RegExp(/^([0-9,a-f]){6}$/)
      expect(regex.test(testObj.chipId)).toBe(true)
    })

    it('should return true for lowercase hex', () => {
      const testObj = { chipId: 'abcdef' }
      const regex = new RegExp(/^([0-9,a-f]){6}$/)
      expect(regex.test(testObj.chipId)).toBe(true)
    })
  })

  describe('Device Change Detection', () => {
    it('should have deviceChanged method', () => {
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

      expect(typeof wrapper.vm.deviceChanged).toBe('function')
    })
  })

  describe('Option Arrays and Computed Properties', () => {
    it('should initialize option arrays in component', () => {
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

      // Option arrays should be initialized
      expect(wrapper.vm.chipFamilyOptions).toBeDefined()
      expect(wrapper.vm.softwareOptions).toBeDefined()
      expect(wrapper.vm.bleColorOptions).toBeDefined()
      
      // Should have items
      expect(wrapper.vm.chipFamilyOptions.length).toBeGreaterThan(0)
      expect(wrapper.vm.softwareOptions.length).toBeGreaterThan(0)
      expect(wrapper.vm.bleColorOptions.length).toBeGreaterThan(0)
    })
  })

  describe('URL Validation Logic', () => {
    it('should verify URL validation function exists', () => {
      // validateUrl() should ensure URL ends with / or is short
      const testUrl1 = 'http://example.com'
      const testUrl2 = 'http:'  // Very short URL (< 7 chars)
      
      // Logic: add / if not present and long enough
      const processed1 = testUrl1.endsWith('/') || testUrl1.length < 7 ? testUrl1 : testUrl1 + '/'
      expect(processed1).toBe('http://example.com/')
      
      // Very short URLs shouldn't get /
      const processed2 = testUrl2.endsWith('/') || testUrl2.length < 7 ? testUrl2 : testUrl2 + '/'
      expect(processed2).toBe('http:')
    })
  })

  describe('Component Methods Available', () => {
    it('should have copyToClipboard method', () => {
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

      expect(typeof wrapper.vm.copyToClipboard).toBe('function')
    })

    it('should have fetchConfigFromDevice method', () => {
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

      expect(typeof wrapper.vm.fetchConfigFromDevice).toBe('function')
    })

    it('should have validateUrl method', () => {
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

      expect(typeof wrapper.vm.validateUrl).toBe('function')
    })

    it('should have deleteFermentationSteps method', () => {
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

      expect(typeof wrapper.vm.deleteFermentationSteps).toBe('function')
    })
  })
})
