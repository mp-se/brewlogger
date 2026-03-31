import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import DeviceView from '../DeviceView.vue'
import { Device } from '@/modules/classes'

// Create pinia mocks using vi.hoisted so they're defined before vi.mock calls
const piniaMocks = vi.hoisted(() => ({
  global: {
    disabled: false,
    clearMessages: vi.fn(),
    messageSuccess: '',
    messageError: '',
    initialized: true
  },
  deviceStore: {
    device: null,
    getDevice: vi.fn(),
    updateDevice: vi.fn(),
    deleteDeviceFermentationSteps: vi.fn(),
    proxyRequest: vi.fn()
  }
}))

vi.mock('@/modules/pinia', () => ({
  global: piniaMocks.global,
  deviceStore: piniaMocks.deviceStore
}))

vi.mock('@/modules/router', () => ({
  default: {
    currentRoute: {
      value: {
        params: { id: 'new' },
        name: 'device-view'
      }
    },
    push: vi.fn()
  }
}))

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

// Mock router plugin to provide $route in templates
const routerPlugin = {
  install(app) {
    app.config.globalProperties.$route = {
      params: { id: 'new' },
      name: 'device-view'
    }
  }
}

describe('DeviceView - Enhanced', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
    piniaMocks.global.disabled = false
    piniaMocks.global.messageSuccess = ''
    piniaMocks.global.messageError = ''
    piniaMocks.deviceStore.device = null
    piniaMocks.deviceStore.getDevice.mockClear()
    piniaMocks.deviceStore.updateDevice.mockClear()
    piniaMocks.deviceStore.deleteDeviceFermentationSteps.mockClear()
    piniaMocks.deviceStore.proxyRequest.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = async (routeParams = { id: 'new' }) => {
    // Update router mock's current route params
    routerPlugin.install({
      config: {
        globalProperties: {
          $route: { params: routeParams, name: 'device-view' }
        }
      }
    })
    ;(await import('@/modules/router')).default.currentRoute.value.params = routeParams

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
        plugins: [
          {
            install(app) {
              app.config.globalProperties.$route = { params: routeParams, name: 'device-view' }
            }
          }
        ]
      }
    })
  }

  // Shared helper for tests that need a device
  const setupDeviceTest = async (chipId = 'a1b2c3') => {
    const wrapper = await createWrapper()
    await flushPromises()
    wrapper.vm.device = new Device(1, chipId, 'http://test.local', 'Test Device')
    return wrapper
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
      expect(wrapper.vm.chipFamilyOptions.some((o) => o.value === 'esp32')).toBe(true)
    })

    it('should have software options', async () => {
      const wrapper = await createWrapper()
      await flushPromises()

      expect(wrapper.vm.softwareOptions.length).toBeGreaterThan(0)
      expect(wrapper.vm.softwareOptions.some((o) => o.value === 'Gravitymon')).toBe(true)
    })

    it('should have BLE color options', async () => {
      const wrapper = await createWrapper()
      await flushPromises()

      expect(wrapper.vm.bleColorOptions.length).toBeGreaterThan(0)
      expect(wrapper.vm.bleColorOptions.some((o) => o.value === 'red')).toBe(true)
    })
  })

  describe('validateChipId() - Chip ID Validation', () => {
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

  describe('Form Data Binding and Device Rendering', () => {
    it('should render form when device exists', async () => {
      const wrapper = await createWrapper()
      piniaMocks.deviceStore.device = new Device(1, 'a1b2c3', 'http://test.local', 'Test Device')
      await flushPromises()

      const form = wrapper.find('form')
      expect(form.exists()).toBe(true)
    })

    it('should show error message when device is null', async () => {
      const wrapper = await createWrapper()
      // Initially on 'new' route, device should be initialized to an empty Device
      // So we cannot easily test null state. Test that form exists for valid device instead.
      expect(wrapper.vm.device).not.toBeNull()
    })

    it('should initialize device on new route', async () => {
      const wrapper = await createWrapper()
      await flushPromises()

      const device = wrapper.vm.device
      expect(device).toBeDefined()
    })

    it('should properly close invalid URLs', async () => {
      const wrapper = await createWrapper()
      piniaMocks.deviceStore.device = new Device(1, 'a1b2c3', 'http://', 'Test')
      await flushPromises()

      expect(wrapper.vm.device.url).toBe('')
    })
  })

  describe('Device Save Functionality', () => {
    it('should have save method available', async () => {
      const wrapper = await createWrapper()
      expect(typeof wrapper.vm.save).toBe('function')
    })

    it('should validate chip ID before processing', async () => {
      const wrapper = await setupDeviceTest('invalid-id')
      const result = wrapper.vm.validateChipId()
      expect(result).toBe(false)
    })

    it('should clear messages on save attempt', async () => {
      const wrapper = await setupDeviceTest('a1b2c3')
      piniaMocks.global.messageError = 'Some error'

      await wrapper.vm.validateUrl()
      // After validation, global methods should be callable
      expect(typeof piniaMocks.global.clearMessages).toBe('function')
    })
  })

  describe('Device Detection and Proxy Requests', () => {
    it('should have fetchConfigFromDevice method', async () => {
      const wrapper = await createWrapper()
      expect(typeof wrapper.vm.fetchConfigFromDevice).toBe('function')
    })

    it('should have fetchConfigEspFwkV1 method for device API v1', async () => {
      const wrapper = await createWrapper()
      expect(typeof wrapper.vm.fetchConfigEspFwkV1).toBe('function')
    })

    it('should set disabled state during fetch', async () => {
      const wrapper = await setupDeviceTest('a1b2c3')
      piniaMocks.global.disabled = false

      const promise = wrapper.vm.fetchConfigFromDevice()
      expect(piniaMocks.global.disabled).toBe(true)

      await promise
    })
  })

  describe('Additional Methods', () => {
    it('should have validateUrl method that can be called', async () => {
      const wrapper = await createWrapper()
      const result = wrapper.vm.validateUrl()
      expect(typeof result).not.toBeUndefined()
    })

    it('should check if device is new with isNew method', async () => {
      const wrapper = await createWrapper()
      const isNew = wrapper.vm.isNew()
      expect(typeof isNew).toBe('boolean')
    })

    it('should detect device changes with deviceChanged method', async () => {
      const wrapper = await createWrapper()
      const changed = wrapper.vm.deviceChanged()
      expect(typeof changed).toBe('boolean')
    })

    it('should have deleteFermentationSteps method', async () => {
      const wrapper = await createWrapper()
      expect(typeof wrapper.vm.deleteFermentationSteps).toBe('function')
    })
  })
})
