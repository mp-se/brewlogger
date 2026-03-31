import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import DeviceView from '../DeviceView.vue'
import { useDeviceStore } from '@/modules/deviceStore'
import { useGlobalStore } from '@/modules/globalStore'
import { Device } from '@/modules/classes'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}))

vi.mock('@/modules/utils', () => ({
  validateCurrentForm: vi.fn(() => true),
  gravityToPlato: vi.fn()
}))

vi.mock('@/modules/detect', () => ({
  detectMdns: vi.fn(() => 'test.local'),
  detectPlatform: vi.fn(() => 'esp32'),
  detectSoftware: vi.fn(() => 'Gravitymon')
}))

describe('DeviceView - Enhanced', () => {
  let router, pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
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

  const createWrapper = async (routeParams = { id: 'new' }) => {
    await router.push({ name: 'device', params: routeParams })
    return mount(DeviceView, {
      global: {
        stubs: {
          BsInputText: true,
          BsInputNumber: true,
          BsInputDate: true,
          BsCard: true,
          BsInputSwitch: true,
          BsInputRadio: true,
          BsInputBase: true,
          BsFileUpload: true,
          BsModal: true,
          BsModalConfirm: true,
          BsMessage: true,
          FermentationStepFragment: true,
          'router-link': true
        },
        plugins: [router]
      }
    })
  }

  describe('Rendering', () => {
    it('should render device view container', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should render page title', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.text()).toContain('Device')
    })

    it('should render h3 title element', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.find('.h3').exists()).toBe(true)
    })
  })






  describe('Option Arrays', () => {
    it('should have chip family options', async () => {
      const wrapper = await createWrapper()
      await flushPromises()
      
      expect(wrapper.vm.chipFamilyOptions.length).toBeGreaterThan(0)
      expect(wrapper.vm.chipFamilyOptions.some(o => o.value === 'esp32')).toBe(true)
    })

    it('should have software options', async () => {
      const wrapper = await createWrapper()
      await flushPromises()
      
      expect(wrapper.vm.softwareOptions.length).toBeGreaterThan(0)
      expect(wrapper.vm.softwareOptions.some(o => o.value === 'Gravitymon')).toBe(true)
    })

    it('should have BLE color options', async () => {
      const wrapper = await createWrapper()
      await flushPromises()
      
      expect(wrapper.vm.bleColorOptions.length).toBeGreaterThan(0)
      expect(wrapper.vm.bleColorOptions.some(o => o.value === 'red')).toBe(true)
    })
  })

  describe('validateChipId() - Chip ID Validation', () => {
    const setupDeviceTest = async (chipId = 'a1b2c3') => {
      const wrapper = await createWrapper()
      await flushPromises()
      // Set device directly on wrapper since onMounted initializes with new Device for 'new' route
      wrapper.vm.device = new Device(1, chipId, 'http://test.local', 'Test Device')
      return wrapper
    }

    it('should accept valid 6-char hex lowercase chip IDs', async () => {
      const wrapper = await setupDeviceTest('a1b2c3')
      const result = wrapper.vm.validateChipId()
      expect(result).toBe(true)
    })

    it('should accept all zeros', async () => {
      const wrapper = await setupDeviceTest('000000')
      const result = wrapper.vm.validateChipId()
      expect(result).toBe(true)
    })

    it('should accept all f characters', async () => {
      const wrapper = await setupDeviceTest('ffffff')
      const result = wrapper.vm.validateChipId()
      expect(result).toBe(true)
    })

    it('should accept mixed valid hex', async () => {
      const wrapper = await setupDeviceTest('a0b1c2')
      const result = wrapper.vm.validateChipId()
      expect(result).toBe(true)
    })

    it('should reject chip IDs too short', async () => {
      const wrapper = await setupDeviceTest('a1b2c')
      const result = wrapper.vm.validateChipId()
      expect(result).toBe(false)
    })

    it('should reject chip IDs too long', async () => {
      const wrapper = await setupDeviceTest('a1b2c3d4')
      const result = wrapper.vm.validateChipId()
      expect(result).toBe(false)
    })

    it('should reject chip IDs with uppercase letters', async () => {
      const wrapper = await setupDeviceTest('A1B2C3')
      const result = wrapper.vm.validateChipId()
      expect(result).toBe(false)
    })

    it('should reject chip IDs with commas (previous regex bug)', async () => {
      const wrapper = await setupDeviceTest('a1,b2c3')
      const result = wrapper.vm.validateChipId()
      expect(result).toBe(false)
    })

    it('should reject chip IDs with invalid characters', async () => {
      const wrapper = await setupDeviceTest('a1b2c!')
      const result = wrapper.vm.validateChipId()
      expect(result).toBe(false)
    })

    it('should reject empty chip ID', async () => {
      const wrapper = await setupDeviceTest('')
      const result = wrapper.vm.validateChipId()
      expect(result).toBe(false)
    })

    it('should reject chip IDs with spaces', async () => {
      const wrapper = await setupDeviceTest('a1 b2c3')
      const result = wrapper.vm.validateChipId()
      expect(result).toBe(false)
    })

    it('should update chipIdValid reactive property', async () => {
      const wrapper = await setupDeviceTest('a1b2c3')
      wrapper.vm.validateChipId()
      expect(wrapper.vm.chipIdValid).toBe(true)

      wrapper.vm.device = new Device(1, 'invalid', 'http://test.local', 'Test')
      wrapper.vm.validateChipId()
      expect(wrapper.vm.chipIdValid).toBe(false)
    })
  })

  describe('Method Existence', () => {
    it('should have copyToClipboard method', async () => {
      const wrapper = await createWrapper()
      expect(typeof wrapper.vm.copyToClipboard).toBe('function')
    })

    it('should have fetchConfigFromDevice method', async () => {
      const wrapper = await createWrapper()
      expect(typeof wrapper.vm.fetchConfigFromDevice).toBe('function')
    })

    it('should have validateUrl method', async () => {
      const wrapper = await createWrapper()
      expect(typeof wrapper.vm.validateUrl).toBe('function')
    })

    it('should have deviceChanged method', async () => {
      const wrapper = await createWrapper()
      expect(typeof wrapper.vm.deviceChanged).toBe('function')
    })

    it('should have isNew method', async () => {
      const wrapper = await createWrapper()
      expect(typeof wrapper.vm.isNew).toBe('function')
    })

    it('should have save method', async () => {
      const wrapper = await createWrapper()
      expect(typeof wrapper.vm.save).toBe('function')
    })

    it('should have deleteFermentationSteps method', async () => {
      const wrapper = await createWrapper()
      expect(typeof wrapper.vm.deleteFermentationSteps).toBe('function')
    })
  })

  describe('Layout Structure', () => {
    it('should render grid rows', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.findAll('.row').length).toBeGreaterThan(0)
    })

    it('should render horizontal separator', async () => {
      const wrapper = await createWrapper()
      expect(wrapper.findAll('hr').length).toBeGreaterThan(0)
    })

    it('should render bootstrap column classes', async () => {
      const wrapper = await createWrapper()
      const cols = wrapper.findAll('[class*="col-"]')
      expect(cols.length).toBeGreaterThan(0)
    })
  })


})
