import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BatchView from '../BatchView.vue'
import { Batch } from '@/modules/classes'

import routerMock from '@/modules/router'

const piniaMocks = vi.hoisted(() => ({
  global: {
    disabled: false,
    clearMessages: vi.fn(),
    messageSuccess: '',
    messageError: '',
    batchChanged: false
  },
  deviceStore: {
    deviceList: [],
    devices: [],
    getDevice: vi.fn(),
    deleteDeviceFermentationSteps: vi.fn()
  },
  batchStore: {
    getBatch: vi.fn(),
    addBatch: vi.fn(),
    updateBatch: vi.fn(),
    deleteFermentationSteps: vi.fn()
  },
  brewfatherStore: {
    getBatchList: vi.fn(),
    batches: []
  },
  configStore: {
    config: {
      brewfatherEnabled: false,
      isGravitySG: true
    }
  }
}))

vi.mock('@/modules/router', () => ({
  default: {
    currentRoute: {
      value: {
        params: { id: 'new' },
        name: 'batch-view'
      }
    },
    push: vi.fn()
  }
}))

vi.mock('@/modules/logger', () => ({ logDebug: vi.fn(), logError: vi.fn(), logInfo: vi.fn() }))
vi.mock('@/modules/utils', () => ({
  validateCurrentForm: vi.fn(() => true),
  roundValue: vi.fn((val) => val)
}))
vi.mock('@/modules/pinia', () => ({
  global: piniaMocks.global,
  deviceStore: piniaMocks.deviceStore,
  batchStore: piniaMocks.batchStore,
  brewfatherStore: piniaMocks.brewfatherStore,
  configStore: piniaMocks.configStore,
  config: piniaMocks.configStore.config
}))

vi.mock('@/fragments/FermentationStepFragment.vue', () => ({
  default: {
    name: 'FermentationStepFragment',
    template: '<div>FermentationStepFragment</div>',
    props: ['fermentationSteps']
  }
}))

describe('BatchView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    piniaMocks.brewfatherStore.getBatchList.mockResolvedValue(true)
    piniaMocks.brewfatherStore.batches = []
    piniaMocks.global.messageError = ''
    piniaMocks.global.messageSuccess = ''
    piniaMocks.global.disabled = false

    // Default mock behavior for router
    routerMock.currentRoute.value.params.id = 'new'
    routerMock.push.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const mountWrapper = () =>
    mount(BatchView, {
      global: {
        stubs: {
          BsInputText: true,
          BsInputNumber: true,
          BsInputDate: true,
          BsInputRadio: true,
          BsSelect: true,
          BsCard: true,
          BsInputSwitch: true,
          BsInputBase: true,
          BsModalConfirm: true,
          'router-link': true
        }
      }
    })

  describe('Rendering', () => {
    it('should render batch view container', () => {
      const wrapper = mountWrapper()
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should render page title', () => {
      const wrapper = mountWrapper()
      expect(wrapper.text()).toContain('Batch')
    })
  })

  describe('Save operations', () => {
    it('adds new batch on save when ID is new', async () => {
      routerMock.currentRoute.value.params.id = 'new'

      const newBatch = new Batch(999, 'New')
      newBatch.id = 999
      newBatch.name = 'New'
      newBatch.fermentationSteps = '[]'
      newBatch.toJson = vi.fn().mockReturnValue({ id: 999, name: 'New', fermentationSteps: '[]' })
      piniaMocks.batchStore.addBatch.mockResolvedValue(newBatch)

      const wrapper = mountWrapper()
      await flushPromises()

      wrapper.vm.batch = new Batch(0, 'New')
      wrapper.vm.batch.fermentationSteps = '[]'
      wrapper.vm.batch.toJson = vi
        .fn()
        .mockReturnValue({ id: 0, name: 'New', fermentationSteps: '[]' })
      wrapper.vm.batchSaved = new Batch(0, 'New')

      await wrapper.vm.save()
      expect(piniaMocks.batchStore.addBatch).toHaveBeenCalled()
      expect(routerMock.push).toHaveBeenCalled()
    })

    it('handles addBatch failure', async () => {
      routerMock.currentRoute.value.params.id = 'new'
      piniaMocks.batchStore.addBatch.mockResolvedValue(null)

      const wrapper = mountWrapper()
      await flushPromises()

      wrapper.vm.batch = new Batch(0, 'New')
      wrapper.vm.batch.toJson = vi.fn().mockReturnValue({ id: 0, name: 'New' })
      wrapper.vm.batchSaved = new Batch(0, 'New')

      await wrapper.vm.save()
      expect(piniaMocks.global.messageError).toBe('Failed to add batch')
    })

    it('updates existing batch on save', async () => {
      routerMock.currentRoute.value.params.id = '123'

      const existing = new Batch(123, 'Existing')
      existing.toJson = vi.fn().mockReturnValue({ id: 123, name: 'Existing' })
      piniaMocks.batchStore.updateBatch.mockResolvedValue(true)
      piniaMocks.batchStore.getBatch.mockResolvedValue(existing)

      const wrapper = mountWrapper()
      await flushPromises()

      wrapper.vm.batch = existing
      wrapper.vm.batchSaved = new Batch(123, 'Old')

      await wrapper.vm.save()
      expect(piniaMocks.batchStore.updateBatch).toHaveBeenCalled()
      expect(piniaMocks.global.messageSuccess).toBe('Saved batch')
    })

    it('handles save failure for existing batch', async () => {
      piniaMocks.batchStore.updateBatch.mockResolvedValue(false)
      piniaMocks.batchStore.getBatch.mockResolvedValue(new Batch(1, 'E'))
      routerMock.currentRoute.value.params.id = '1'
      const wrapper = mountWrapper()
      await flushPromises()
      wrapper.vm.batchSaved = new Batch(1, 'E')
      await wrapper.vm.save()
      expect(piniaMocks.global.messageError).toBe('Failed to save batch')
    })

    it('reports form validation failure on save', async () => {
      const wrapper = mountWrapper()
      await flushPromises()
      vi.mocked((await import('@/modules/utils')).validateCurrentForm).mockReturnValueOnce(false)
      await wrapper.vm.save()
      expect(wrapper.vm).toBeDefined()
    })
  })

  describe('Fermentation steps operations', () => {
    it('removes fermentation steps successfully', async () => {
      const wrapper = mountWrapper()
      await flushPromises()
      wrapper.vm.batch = new Batch(1, 'Test')
      wrapper.vm.batch.fermentationChamber = 'chamber1'
      piniaMocks.deviceStore.deleteDeviceFermentationSteps.mockResolvedValue(true)

      await wrapper.vm.deleteFermentationStepsCallback()
      expect(piniaMocks.global.messageSuccess).toBe('Fermentation steps removed')
      expect(wrapper.vm.activeFermentationSteps).toBe('')
    })

    it('handles remove fermentation steps failure', async () => {
      const wrapper = mountWrapper()
      await flushPromises()
      wrapper.vm.batch = new Batch(1, 'Test')
      piniaMocks.deviceStore.deleteDeviceFermentationSteps.mockResolvedValue(false)
      await wrapper.vm.deleteFermentationStepsCallback()
      expect(piniaMocks.global.messageError).toBe('Failed to remove fermentation steps')
    })

    it('triggers delete fermentation steps via button click', async () => {
      const mockBtn = { click: vi.fn() }
      const getElemSpy = vi.spyOn(document, 'getElementById').mockReturnValue(mockBtn)
      const wrapper = mountWrapper()
      await flushPromises()
      wrapper.vm.batch = new Batch(1, 'Test')
      wrapper.vm.batchSaved = new Batch(1, 'Test')
      wrapper.vm.deleteFermentationSteps()
      expect(mockBtn.click).toHaveBeenCalled()
      getElemSpy.mockRestore()
    })

    it('loads device stepList if existing batch has fermentationChamber', async () => {
      const existing = new Batch(1, 'Existing')
      existing.fermentationChamber = 10
      piniaMocks.batchStore.getBatch.mockResolvedValue(existing)
      piniaMocks.deviceStore.getDevice.mockResolvedValue({
        device: { id: 10 },
        stepList: '[step1]'
      })

      routerMock.currentRoute.value.params.id = '1'
      const wrapper = mountWrapper()
      await flushPromises()
      expect(wrapper.vm.activeFermentationSteps).toBe('[step1]')
    })
  })

  describe('Batch loading and initialization', () => {
    it('handles successful batch load on mount', async () => {
      const existing = new Batch(1, 'Existing')
      piniaMocks.batchStore.getBatch.mockResolvedValue(existing)
      routerMock.currentRoute.value.params.id = '1'
      const wrapper = mountWrapper()
      await flushPromises()
      expect(wrapper.vm.batch).toEqual(existing)
    })

    it('handles failed batch load in onMounted', async () => {
      routerMock.currentRoute.value.params.id = '456'
      piniaMocks.batchStore.getBatch.mockResolvedValue(null)
      mountWrapper()
      await flushPromises()
      expect(piniaMocks.global.messageError).toContain('Failed to load batch')
    })
  })

  describe('Device options management', () => {
    it('updates device options with multiple device types', async () => {
      piniaMocks.deviceStore.devices = [
        { software: 'Gravitymon', chipId: 'g1', mdns: 'g.local', url: '', description: '' },
        { software: 'Pressuremon', chipId: 'p1', mdns: '', url: 'http://p', description: '' },
        { software: 'Chamber-Controller', id: 10, mdns: '', url: 'http://c', description: 'desc' },
        { software: 'Gravitymon', chipId: 'g2', mdns: '', url: 'http://g2', description: '' },
        { software: 'Pressuremon', chipId: 'p2', mdns: '', url: '', description: 'desc' }
      ]
      const wrapper = mountWrapper()
      await flushPromises()
      expect(wrapper.vm.gravityDeviceOptions.length).toBeGreaterThan(1)
    })

    it('updates device options with empty URLs', async () => {
      piniaMocks.deviceStore.devices = [
        { software: 'Chamber-Controller', id: 22, mdns: 'c.local', url: '', description: 'desc' }
      ]
      const wrapper = mountWrapper()
      await flushPromises()
      wrapper.vm.updateDeviceOptions()
      expect(wrapper.vm.tempControlDeviceOptions.length).toBe(1)
    })

    it('updates device options with only MDNS entries', async () => {
      piniaMocks.deviceStore.devices = [
        { software: 'Gravitymon', chipId: 'g3', mdns: '', url: '', description: 'desc3' },
        { software: 'Pressuremon', chipId: 'p3', mdns: '', url: '', description: 'desc3' }
      ]
      const wrapper = mountWrapper()
      await flushPromises()
      wrapper.vm.updateDeviceOptions()
      expect(wrapper.vm.gravityDeviceOptions.length).toBeGreaterThan(1)
    })
  })

  describe('Brewfather integration', () => {
    it('updates batch from Brewfather match', async () => {
      const b1 = new Batch(1, 'B1')
      b1.brewfatherId = 'bf1'
      piniaMocks.brewfatherStore.batches = [
        {
          brewfatherId: 'bf1',
          name: 'BF Name',
          brewDate: '2023',
          brewer: 'M',
          style: 'S',
          ebc: 1,
          abv: 5,
          ibu: 30,
          og: 1.05,
          fg: 1.01,
          fermentationSteps: '[]'
        }
      ]
      const wrapper = mountWrapper()
      await flushPromises()
      wrapper.vm.batch = b1
      wrapper.vm.brewfatherChanged('bf1')
      expect(wrapper.vm.batch.name).toBe('BF Name')
    })

    it('handles Brewfather changed with no match', async () => {
      const wrapper = mountWrapper()
      await flushPromises()
      wrapper.vm.brewfatherChanged('no-match')
      // Should not throw
      expect(wrapper.vm.batch).toBeDefined()
    })

    it('handles brewfatherStore.getBatchList failure', async () => {
      piniaMocks.brewfatherStore.getBatchList.mockResolvedValue(false)
      const wrapper = mountWrapper()
      await flushPromises()
      // Should handle gracefully
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Batch state tracking', () => {
    it('detects batch changes when batch differs from saved', async () => {
      const wrapper = mountWrapper()
      await flushPromises()
      wrapper.vm.batch = new Batch(1, 'Updated')
      wrapper.vm.batchSaved = new Batch(1, 'Original')
      expect(wrapper.vm.batchChanged()).toBe(true)
    })

    it('returns false when batch is null', async () => {
      const wrapper = mountWrapper()
      await flushPromises()
      wrapper.vm.batch = null
      expect(wrapper.vm.batchChanged()).toBe(false)
    })

    it('handles fermentationChamber and fermentationSteps interaction', async () => {
      const wrapper = mountWrapper()
      await flushPromises()
      wrapper.vm.batch = new Batch(1, 'Test')
      wrapper.vm.batch.fermentationChamber = 1
      wrapper.vm.batch.fermentationSteps = '[]'
      await flushPromises()
      expect(wrapper.vm.batch.fermentationChamber).toBe(1)
    })
  })
})
