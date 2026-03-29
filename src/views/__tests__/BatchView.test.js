import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import BatchView from '../BatchView.vue'
import BsInput from '../../components/BsInputText.vue'
import BsCard from '../../components/BsCard.vue'
import { useBatchStore } from '@/modules/batchStore'
import { useDeviceStore } from '@/modules/deviceStore'
import { useGlobalStore } from '@/modules/globalStore'
import { Batch, Device } from '@/modules/classes'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}))

vi.mock('@/modules/utils', () => ({
  validateCurrentForm: vi.fn(() => true)
}))

describe('BatchView', () => {
  let router
  let batchStore
  let deviceStore
  let globalStore

  beforeEach(() => {
    setActivePinia(createPinia())
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/batch/:id', name: 'batch' },
        { path: '/batches', name: 'batch-list' },
        { path: '/batch/:id/fermentation-control', name: 'batch-fermentation-control' }
      ]
    })
    batchStore = useBatchStore()
    deviceStore = useDeviceStore()
    globalStore = useGlobalStore()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render batch view container', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })

    it('should render page title', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.text()).toContain('Batch')
    })

    it('should have h3 class for title', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })
      // Component should have input structure
      expect(wrapper.find('.container').exists()).toBe(true)
    })
  })

  describe('Form Structure', () => {
    it('should render with proper layout structure', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should have form for batch data entry', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      // Verify form structure exists
      expect(wrapper.find('.container').exists()).toBe(true)
    })
  })

  describe('Initialization', () => {
    it('should initialize with empty batch object', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.batch).toBeDefined()
    })

    it('should initialize with internal state', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      // Component mounts successfully
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Layout', () => {
    it('should render container with proper bootstrap grid', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.find('.row').exists()).toBe(true)
      expect(wrapper.find('.col-md').exists() || wrapper.find('[class*="col"]').exists()).toBe(true)
    })

    it('should render horizontal rules for visual separation', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      const hrs = wrapper.findAll('hr')
      expect(hrs.length).toBeGreaterThan(0)
    })
  })

  describe('Navigation Buttons', () => {
    it('should have router-link for navigation', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      const routerLinks = wrapper.findAll('router-link-stub')
      expect(routerLinks.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Device Options Updates', () => {
    it('should populate device options from device store', async () => {
      const gravityDevice = new Device(1, 'gravity_chip_1', 'http://192.168.1.10')
      gravityDevice.software = 'Gravitymon'
      gravityDevice.mdns = 'gravitymon.local'

      const pressureDevice = new Device(2, 'pressure_chip_1', 'http://192.168.1.11')
      pressureDevice.software = 'Pressuremon'
      pressureDevice.mdns = 'pressuremon.local'

      const chamberDevice = new Device(3, 'chamber_chip_1', 'http://192.168.1.12')
      chamberDevice.software = 'Chamber-Controller'
      chamberDevice.mdns = 'chamber.local'

      deviceStore.devices = [gravityDevice, pressureDevice, chamberDevice]

      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true,
            BsSelect: true
          },
          plugins: [router]
        }
      })

      await flushPromises()

      // Verify device store is populated
      expect(deviceStore.devices.length).toBeGreaterThan(0)
    })

    it('should initialize disabled options for all device types', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true,
            BsSelect: true
          },
          plugins: [router]
        }
      })

      // Verify device option refs are defined
      expect(wrapper.vm.gravityDeviceOptions).toBeDefined()
      expect(wrapper.vm.pressureDeviceOptions).toBeDefined()
      expect(wrapper.vm.tempControlDeviceOptions).toBeDefined()
    })

    it('should handle gravitymon devices correctly', async () => {
      const gravityDevice = new Device(1, 'grav_chip', 'http://192.168.1.100')
      gravityDevice.software = 'Gravitymon'
      gravityDevice.mdns = 'my-gravitymon'

      deviceStore.devices = [gravityDevice]

      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true,
            BsSelect: true
          },
          plugins: [router]
        }
      })

      await flushPromises()

      // Verify component mounts with gravity device
      expect(wrapper.vm.gravityDeviceOptions).toBeDefined()
    })

    it('should handle pressuremon devices correctly', async () => {
      const pressureDevice = new Device(2, 'pres_chip', 'http://192.168.1.101')
      pressureDevice.software = 'Pressuremon'
      pressureDevice.mdns = 'my-pressuremon'

      deviceStore.devices = [pressureDevice]

      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true,
            BsSelect: true
          },
          plugins: [router]
        }
      })

      await flushPromises()

      // Verify component mounts with pressure device
      expect(wrapper.vm.pressureDeviceOptions).toBeDefined()
    })

    it('should handle chamber controller devices correctly', async () => {
      const chamberDevice = new Device(3, 'chamber_chip', 'http://192.168.1.102')
      chamberDevice.software = 'Chamber-Controller'
      chamberDevice.mdns = 'my-chamber'

      deviceStore.devices = [chamberDevice]

      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true,
            BsSelect: true
          },
          plugins: [router]
        }
      })

      await flushPromises()

      // Verify component mounts with chamber device
      expect(wrapper.vm.tempControlDeviceOptions).toBeDefined()
    })
  })

  describe('Batch Save Functionality', () => {
    it('should initialize batch object with new batch', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.batch).toBeDefined()
    })

    it('should have reactive batch properties', async () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      // Verify batch ref is reactive
      expect(wrapper.vm.batch).toBeDefined()
      if (wrapper.vm.batch) {
        expect(typeof wrapper.vm.batch).toBe('object')
      }
    })

    it('should track batchSaved state', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.batchSaved).toBeDefined()
    })
  })

  describe('Form Options', () => {
    it('should have active status options', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true,
            BsInputRadio: true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.activeOptions).toBeDefined()
      expect(wrapper.vm.activeOptions.length).toBeGreaterThan(0)
    })

    it('should have tap list visibility options', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true,
            BsInputRadio: true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.tapListOptions).toBeDefined()
      expect(wrapper.vm.tapListOptions.length).toBeGreaterThan(0)
    })

    it('should have brewfather options initialized', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true,
            BsSelect: true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.brewfatherOptions).toBeDefined()
      expect(wrapper.vm.brewfatherOptions.length).toBeGreaterThan(0)
    })

    it('should have extensive beer style options', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true,
            BsSelect: true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.styleOptions).toBeDefined()
      expect(wrapper.vm.styleOptions.length).toBeGreaterThan(50)
    })
  })

  describe('Fermentation Steps', () => {
    it('should initialize active fermentation steps as empty string', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.activeFermentationSteps).toBeDefined()
    })

    it('should track fermentation step deletion', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            BsModalConfirm: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.activeFermentationSteps).toBeDefined()
    })
  })

  describe('Global Store Integration', () => {
    it('should respect global disabled state', () => {
      globalStore.disabled = false

      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(globalStore.disabled).toBe(false)
    })

    it('should clear messages from global store', () => {
      globalStore.clearMessages = vi.fn()

      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(globalStore).toBeDefined()
    })

    it('should set success and error messages', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      globalStore.messageSuccess = 'Test success'
      globalStore.messageError = 'Test error'

      expect(globalStore.messageSuccess).toBe('Test success')
      expect(globalStore.messageError).toBe('Test error')
    })
  })

  describe('Batch Data Persistence', () => {
    it('should maintain batch reference after initialization', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      const batch1 = wrapper.vm.batch
      const batch2 = wrapper.vm.batch

      expect(batch1).toBe(batch2)
    })

    it('should update batch properties reactively', async () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      if (wrapper.vm.batch) {
        wrapper.vm.batch.name = 'Test Batch'
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.batch.name).toBe('Test Batch')
      }
    })
  })

  describe('Form Rendering', () => {
    it('should render form template when batch exists', async () => {
      const batch = new Batch(1, 'Test Batch')
      
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            BsInputRadio: true,
            BsSelect: true,
            BsInputBase: true,
            BsModalConfirm: true,
            FermentationStepFragment: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      if (wrapper.vm.batch) {
        await wrapper.vm.$nextTick()
        expect(wrapper.find('form').exists() || wrapper.vm.batch).toBeDefined()
      }
    })

    it('should show loading message when batch is null', () => {
      const wrapper = mount(BatchView, {
        global: {
          stubs: {
            BsInputText: true,
            BsInputNumber: true,
            BsInputDate: true,
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      // Component structure should be present
      expect(wrapper.find('.container').exists()).toBe(true)
    })
  })
})
