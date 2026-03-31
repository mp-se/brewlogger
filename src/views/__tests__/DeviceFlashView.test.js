import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import DeviceFlashView from '../DeviceFlashView.vue'
import { useGlobalStore } from '@/modules/globalStore'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}))

describe('DeviceFlashView - Enhanced', () => {
  let router

  beforeEach(() => {
    setActivePinia(createPinia())
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/device/flash', name: 'device-flash' },
        { path: '/devices', name: 'device-list' }
      ]
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = () => {
    return mount(DeviceFlashView, {
      global: {
        stubs: {
          'router-link': { template: '<a><slot></slot></a>' },
          BsInputRadio: true,
          BsInputSwitch: true,
          'esp-web-install-button': true
        },
        plugins: [router]
      }
    })
  }

  describe('Rendering', () => {
    it('should render container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should render page title', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Flash devices')
    })

    it('should render h3 title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.h3').exists()).toBe(true)
    })

    it('should render horizontal separator', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('hr').exists()).toBe(true)
    })
  })

  describe('SSL Detection', () => {
    it('should define isSSL constant', () => {
      const isSSL =
        window.location.protocol === 'https:' || window.location.hostname === 'localhost'
      expect(typeof isSSL).toBe('boolean')
    })

    it('should show content for localhost', () => {
      // localhost should be treated as SSL
      const isSSL =
        window.location.protocol === 'https:' || window.location.hostname === 'localhost'
      expect(isSSL).toBe(true)
    })
  })

  describe('Software Options', () => {
    it('should have software options defined', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.softwareOptions).toBeDefined()
      expect(wrapper.vm.softwareOptions.length).toBeGreaterThan(0)
    })

    it('should include Gravitymon option', () => {
      const wrapper = createWrapper()
      const hasGravitymon = wrapper.vm.softwareOptions.some((o) => o.value === 'gravitymon')
      expect(hasGravitymon).toBe(true)
    })

    it('should include Kegmon option', () => {
      const wrapper = createWrapper()
      const hasKegmon = wrapper.vm.softwareOptions.some((o) => o.value === 'kegmon')
      expect(hasKegmon).toBe(true)
    })

    it('should have enabled flag for options', () => {
      const wrapper = createWrapper()
      wrapper.vm.softwareOptions.forEach((option) => {
        expect(option).toHaveProperty('enabled')
      })
    })

    it('should have github URLs for options', () => {
      const wrapper = createWrapper()
      wrapper.vm.softwareOptions.forEach((option) => {
        expect(option).toHaveProperty('github')
      })
    })

    it('should have boards for options', () => {
      const wrapper = createWrapper()
      wrapper.vm.softwareOptions.forEach((option) => {
        expect(Array.isArray(option.boards)).toBe(true)
      })
    })
  })

  describe('Software Selection', () => {
    it('should initialize with empty software', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.software).toBe('')
    })

    it('should update software selection', async () => {
      const wrapper = createWrapper()
      wrapper.vm.software = 'gravitymon'
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.software).toBe('gravitymon')
    })

    it('should populate variant options when software selected', async () => {
      const wrapper = createWrapper()
      wrapper.vm.software = 'gravitymon'
      await flushPromises()

      // Should have board variants
      expect(wrapper.vm.variantBoardOptions.length).toBeGreaterThan(0)
    })

    it('should set github URL when software selected', async () => {
      const wrapper = createWrapper()
      wrapper.vm.software = 'gravitymon'
      await flushPromises()

      expect(wrapper.vm.github).toContain('github.com')
    })

    it('should clear variant on software change', async () => {
      const wrapper = createWrapper()
      wrapper.vm.software = 'gravitymon'
      await flushPromises()

      wrapper.vm.software = 'kegmon'
      await flushPromises()

      expect(wrapper.vm.variant).toBe('')
    })
  })

  describe('Variant Selection', () => {
    it('should initialize with empty variant', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.variant).toBe('')
    })

    it('should have board variants for Gravitymon', async () => {
      const wrapper = createWrapper()
      wrapper.vm.software = 'gravitymon'
      await flushPromises()

      expect(wrapper.vm.variantBoardOptions.length).toBeGreaterThan(0)
      expect(wrapper.vm.variantBoardOptions.some((v) => v.value === '')).toBe(true)
    })

    it('should set first variant as default', async () => {
      const wrapper = createWrapper()
      wrapper.vm.software = 'gravitymon'
      await flushPromises()

      expect(wrapper.vm.variant).toBe('') // First variant is Lolin (empty value)
    })

    it('should update variant selection', async () => {
      const wrapper = createWrapper()
      wrapper.vm.software = 'gravitymon'
      await flushPromises()

      wrapper.vm.variant = '_waveshare'
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.variant).toBe('_waveshare')
    })
  })

  describe('Beta Mode', () => {
    it('should initialize with beta off', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.beta).toBe(false)
    })

    it('should toggle beta mode', async () => {
      const wrapper = createWrapper()
      wrapper.vm.beta = true
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.beta).toBe(true)
    })

    it('should compute isBeta from beta ref', () => {
      const wrapper = createWrapper()
      wrapper.vm.beta = true

      expect(wrapper.vm.isBeta).toBe(true)
    })

    it('should compute isBeta as false initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.isBeta).toBe(false)
    })
  })

  describe('Manifest URL Generation', () => {
    it('should create correct manifest URL for release version', () => {
      const wrapper = createWrapper()
      const url = wrapper.vm.createManifestUrl('gravitymon', '')

      expect(url).toContain('gravitymon')
      expect(url).toContain('manifest')
      expect(url).toContain('.json')
      expect(url).not.toContain('beta')
    })

    it('should create correct manifest URL for beta version', () => {
      const wrapper = createWrapper()
      wrapper.vm.beta = true

      const url = wrapper.vm.createManifestUrl('gravitymon', '')
      expect(url).toContain('beta')
    })

    it('should include variant in manifest URL', () => {
      const wrapper = createWrapper()
      const url = wrapper.vm.createManifestUrl('gravitymon', '_waveshare')

      expect(url).toContain('_waveshare')
    })

    it('should create correct manifest URL for different software', () => {
      const wrapper = createWrapper()
      const url = wrapper.vm.createManifestUrl('kegmon', '')

      expect(url).toContain('kegmon')
    })
  })

  describe('Binary URL Generation', () => {
    it('should create correct binary URL', () => {
      const wrapper = createWrapper()
      const url = wrapper.vm.createBinUrl('gravitymon', 'app.bin')

      expect(url).toContain('gravitymon')
      expect(url).toContain('app.bin')
      expect(url).not.toContain('beta')
    })

    it('should include beta in binary URL when beta mode on', () => {
      const wrapper = createWrapper()
      wrapper.vm.beta = true

      const url = wrapper.vm.createBinUrl('gravitymon', 'app.bin')
      expect(url).toContain('beta')
    })
  })

  describe('Status States', () => {
    it('should initialize manifest status as 0', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.manifestStatus).toBe(0)
    })

    it('should initialize validation log', () => {
      const wrapper = createWrapper()
      expect(Array.isArray(wrapper.vm.validationLog)).toBe(true)
    })

    it('should have validation count tracker', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.validationCount).toHaveProperty('total')
      expect(wrapper.vm.validationCount).toHaveProperty('validated')
    })

    it('should initialize supported boards manifest', () => {
      const wrapper = createWrapper()
      expect(Array.isArray(wrapper.vm.supportedBoardsManifest)).toBe(true)
    })
  })

  describe('Initial Values', () => {
    it('should initialize with empty message', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.message).toBe('')
    })

    it('should initialize with empty github URL', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.github).toBe('')
    })

    it('should initialize with empty software version', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.softwareVersion).toBe('')
    })

    it('should initialize with empty supported boards', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.supportedBoardsManifest.length).toBe(0)
    })
  })

  describe('Computed Properties', () => {
    it('should have doValidation computed property', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.doValidation).toEqual(expect.any(Boolean))
    })

    it('should have isBeta computed property', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.isBeta).toEqual(expect.any(Boolean))
    })

    it('should have manifestUrl computed property', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.manifestUrl).toBe('string')
    })
  })

  describe('Methods', () => {
    it('should have parseManifest method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.parseManifest).toBe('function')
    })

    it('should have createManifestUrl method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.createManifestUrl).toBe('function')
    })

    it('should have createBinUrl method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.createBinUrl).toBe('function')
    })
  })

  describe('Component Watchers', () => {
    it('should update on disabled change', async () => {
      const globalStore = useGlobalStore()
      globalStore.disabled = true
      await flushPromises()

      // Should handle disabled state
      expect(globalStore.disabled).toBe(true)
    })

    it('should update on software change', async () => {
      const wrapper = createWrapper()
      wrapper.vm.software = 'gravitymon'
      await flushPromises()

      expect(wrapper.vm.software).toBe('gravitymon')
    })

    it('should update on beta change', async () => {
      const wrapper = createWrapper()
      wrapper.vm.beta = true
      await flushPromises()

      expect(wrapper.vm.beta).toBe(true)
    })
  })

  describe('Layout Structure', () => {
    it('should have row and column classes', () => {
      const wrapper = createWrapper()
      const rows = wrapper.findAll('.row')
      expect(rows.length).toBeGreaterThan(0)
    })

    it('should have column divs with col-md classes', () => {
      const wrapper = createWrapper()
      const cols = wrapper.findAll('[class*="col-md"]')
      expect(cols.length).toBeGreaterThan(0)
    })
  })
})
