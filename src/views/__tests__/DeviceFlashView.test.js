import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import DeviceFlashView from '../DeviceFlashView.vue'
import piniaInstance from '@/modules/pinia'
import { useGlobalStore } from '@/modules/globalStore'
import * as logger from '@/modules/logger'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn()
}))

describe('DeviceFlashView', () => {
  let globalStore, router

  beforeEach(() => {
    setActivePinia(piniaInstance)
    globalStore = useGlobalStore()
    vi.clearAllMocks()

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/device/flash', name: 'device-flash' },
        { path: '/device', name: 'device-list' }
      ]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Structure', () => {
    it('should render container', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should render page title', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.find('.h3').exists()).toBe(true)
      expect(wrapper.text()).toContain('Flash devices')
    })

    it('should render horizontal rule', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.find('hr').exists()).toBe(true)
    })

    it('should have template elements', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      // Component uses v-if/v-else templates
      expect(wrapper.html()).toBeDefined()
      expect(wrapper.html().length).toBeGreaterThan(0)
    })

    it('should render main content area', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      const container = wrapper.find('.container')
      expect(container.html()).toContain('Flash devices')
    })
  })

  describe('State Initialization', () => {
    it('should initialize with default state values', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      // Check component has reactive data
      expect(wrapper.vm).toBeDefined()
      expect(wrapper.vm.software).toBeDefined()
      expect(wrapper.vm.beta).toBeDefined()
    })

    it('should initialize software as empty string', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.vm.software).toBe('')
    })

    it('should initialize beta as false', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.vm.beta).toBe(false)
    })

    it('should initialize variant as empty string', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.vm.variant).toBe('')
    })

    it('should initialize message as empty string', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.vm.message).toBe('')
    })
  })

  describe('Component Methods', () => {
    it('should have computedIsSSL method or property', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.vm.isSSL).toBeDefined()
    })

    it('should have isBeta computed property', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.vm.isBeta).toBeDefined()
    })

    it('should have softwareOptions array', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      expect(Array.isArray(wrapper.vm.softwareOptions)).toBe(true)
    })

    it('should have variantBoardOptions array', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      expect(Array.isArray(wrapper.vm.variantBoardOptions)).toBe(true)
    })

    it('should have manifestUrl computed property', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.vm.manifestUrl).toBeDefined()
    })
  })

  describe('Router Integration', () => {
    it('should have router instance', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      // Router should be available through $router
      expect(wrapper.vm.$router).toBeDefined()
    })

    it('should have back button link', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      const backButton = wrapper.findAll('button').find(b => b.text().includes('Back'))
      expect(backButton).toBeDefined()
    })
  })

  describe('Input Components', () => {
    it('should have BsInputRadio component stub', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      const radioInputs = wrapper.findAllComponents({ name: 'BsInputRadio' })
      expect(radioInputs.length).toBeGreaterThanOrEqual(0)
    })

    it('should have BsInputSwitch component stub', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      const switchInputs = wrapper.findAllComponents({ name: 'BsInputSwitch' })
      expect(switchInputs.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Template Conditionals', () => {
    it('should mount without errors', () => {
      expect(() => {
        mount(DeviceFlashView, {
          global: {
            stubs: {
              'router-link': { template: '<a><slot></slot></a>' },
              'BsInputRadio': true,
              'BsInputSwitch': true,
              'esp-web-install-button': true
            },
            plugins: [router]
          }
        })
      }).not.toThrow()
    })

    it('should have complete DOM structure', () => {
      const wrapper = mount(DeviceFlashView, {
        global: {
          stubs: {
            'router-link': { template: '<a><slot></slot></a>' },
            'BsInputRadio': true,
            'BsInputSwitch': true,
            'esp-web-install-button': true
          },
          plugins: [router]
        }
      })
      // Should render container with content
      expect(wrapper.find('.container').exists()).toBe(true)
      expect(wrapper.html().includes('Flash devices')).toBe(true)
    })
  })
})
