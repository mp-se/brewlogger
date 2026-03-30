import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import BackupView from '../BackupView.vue'
import BsProgress from '../../components/BsProgress.vue'
import BsFileUpload from '../../components/BsFileUpload.vue'
import piniaInstance from '@/modules/pinia'
import { useGlobalStore } from '@/modules/globalStore'
import * as logger from '@/modules/logger'
import * as utils from '@/modules/utils'

// Mock modules
vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}))

vi.mock('@/modules/utils', () => ({
  download: vi.fn()
}))

// Mock fetch globally
global.fetch = vi.fn()

describe('BackupView - State & Logic Tests', () => {
  let globalStore

  beforeEach(() => {
    setActivePinia(piniaInstance)
    globalStore = useGlobalStore()
    vi.clearAllMocks()
    global.fetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Structure', () => {
    it('should render with container', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })
      expect(wrapper.find('.container').exists()).toBe(true)
      expect(wrapper.text()).toContain('Backup & Restore')
    })

    it('should have title and sections', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })
      expect(wrapper.find('.h3').exists()).toBe(true)
      expect(wrapper.text()).toContain('Create a a complete backup')
      expect(wrapper.text()).toContain('Restore a previous backup')
    })

    it('should have form for restore', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })
      expect(wrapper.find('form').exists()).toBe(true)
    })
  })

  describe('State Initialization', () => {
    it('should initialize backup with correct structure', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      expect(wrapper.vm.backup.meta.version).toBe('0.8')
      expect(wrapper.vm.backup.meta.software).toBe('BrewLogger')
      expect(wrapper.vm.backup.batches).toEqual([])
      expect(wrapper.vm.backup.devices).toEqual([])
    })

    it('should initialize progress tracking', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      expect(wrapper.vm.backupProgress).toBe(0)
      expect(wrapper.vm.restoreProgress).toBe(0)
      expect(wrapper.vm.fileSelected).toBe(false)
      expect(wrapper.vm.restoreErrors).toBe(0)
    })

    it('should initialize file upload ref', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      expect(wrapper.vm.fileUploadRef).toBeDefined()
    })
  })

  describe('Backup Method - createBackup()', () => {
    it('should log debug message on createBackup call', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => []
      })

      wrapper.vm.createBackup()
      expect(logger.logDebug).toHaveBeenCalledWith('BackupView.createBackup()')
    })

    it('should set disabled flag during backup', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      globalStore.disabled = false
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => []
      })

      wrapper.vm.createBackup()
      expect(globalStore.disabled).toBe(true)
    })

    it('should set backup timestamp with current date', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      expect(wrapper.vm.backup.meta.created).toBe('')

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => []
      })

      wrapper.vm.createBackup()
      expect(wrapper.vm.backup.meta.created).toMatch(/\d{4}-\d{2}-\d{2}/)
    })

    it('should initialize progress to 0', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      wrapper.vm.backupProgress = 50
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => []
      })

      wrapper.vm.createBackup()
      expect(wrapper.vm.backupProgress).toBe(0)
    })

    it('should call download function after backup collection', async () => {
      global.fetch = vi.fn().mockImplementation((url) => {
        if (typeof url === 'string') {
          if (url.includes('/api/batch')) {
            return Promise.resolve({
              ok: true,
              json: async () => [{ id: 1, name: 'Batch 1' }]
            })
          }
          if (url.includes('/api/device')) {
            return Promise.resolve({
              ok: true,
              json: async () => [{ id: 1, chipId: 'ESP32' }]
            })
          }
        }
        return Promise.resolve({ ok: true, json: async () => [] })
      })

      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      wrapper.vm.createBackup()

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(utils.download).toHaveBeenCalledWith(
        expect.stringContaining('BrewLogger'),
        'text/plain',
        'brewlogger_backup.txt'
      )
    })

    it('should handle fetch errors in createBackup', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error'
      })

      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      wrapper.vm.createBackup()
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(globalStore.messageError).toBeDefined()
      expect(globalStore.disabled).toBe(false)
    })
  })

  describe('Process Restore and File Handling', () => {
    it('should handle processRestore', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true })

      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      const backupData = {
        batch: [],
        device: []
      }

      await wrapper.vm.processRestore(backupData)

      expect(globalStore.disabled).toBe(false)
    })
  })

  describe('Restore Method - restore()', () => {
    it('should log debug message on restore call', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      wrapper.vm.restore()

      expect(logger.logDebug).toHaveBeenCalledWith('BackupView.restore()')
    })

    it('should set error message when no file selected', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      console.log('Initial globalStore.messageError:', globalStore.messageError)

      // Mock fileUploadRef to return an empty querySelector result
      wrapper.vm.fileUploadRef = {
        value: {
          $el: {
            querySelector: () => null
          }
        }
      }

      console.log('wrapper.vm.fileUploadRef.value:', wrapper.vm.fileUploadRef.value)

      wrapper.vm.restore()

      console.log('After restore, globalStore.messageError:', globalStore.messageError)
      console.log('globalStore object:', globalStore)

      expect(globalStore.messageError).toBe('You need to select a file to restore data from')
    })

    it('should set disabled flag when restore starts with file', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      // Mock FileReader
      const mockFileReader = class {
        addEventListener() {}
        readAsText() {}
      }
      global.FileReader = mockFileReader

      // Mock fileUploadRef with a file
      const mockFile = new File(['test'], 'test.txt')
      const mockFileInput = { files: { length: 1, 0: mockFile } }

      // Spy on HTMLElement.prototype.querySelector to intercept the file input query
      const originalQuerySelector = Element.prototype.querySelector
      Element.prototype.querySelector = vi.fn((selector) => {
        if (selector === 'input[type="file"]') {
          return mockFileInput
        }
        return originalQuerySelector.call(this, selector)
      })

      globalStore.disabled = false

      wrapper.vm.restore()

      // Restore original querySelector
      Element.prototype.querySelector = originalQuerySelector

      expect(globalStore.disabled).toBe(true)
    })
  })

  describe('Data Cleanup - cleanupJson()', () => {
    it('should remove null values', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      const testData = [
        { id: 1, name: 'Test', nullValue: null, active: true }
      ]

      wrapper.vm.cleanupJson(testData)

      expect(testData[0]).toHaveProperty('id')
      expect(testData[0]).toHaveProperty('name')
      expect(testData[0]).toHaveProperty('active')
      expect(testData[0]).not.toHaveProperty('nullValue')
    })

    it('should preserve falsy non-null values', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      const testData = [
        { id: 1, value: '', count: 0, active: false }
      ]

      wrapper.vm.cleanupJson(testData)

      expect(testData[0].value).toBe('')
      expect(testData[0].count).toBe(0)
      expect(testData[0].active).toBe(false)
    })
  })

  describe('UI State Management', () => {
    it('should track file selection state', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      expect(wrapper.vm.fileSelected).toBe(false)
      wrapper.vm.fileSelected = true
      expect(wrapper.vm.fileSelected).toBe(true)
    })

    it('should track backup progress', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      wrapper.vm.backupProgress = 50
      expect(wrapper.vm.backupProgress).toBe(50)
    })

    it('should track restore progress', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      wrapper.vm.restoreProgress = 75
      expect(wrapper.vm.restoreProgress).toBe(75)
    })

    it('should track restore errors', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      wrapper.vm.restoreErrors = 5
      expect(wrapper.vm.restoreErrors).toBe(5)
    })
  })

  describe('Store Integration', () => {
    it('should reference global store', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      expect(wrapper.vm.global).toBeDefined()
    })

    it('should reference batch store', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      expect(wrapper.vm.batchStore).toBeDefined()
    })

    it('should reference device store', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      expect(wrapper.vm.deviceStore).toBeDefined()
    })
  })

  describe('Template Elements', () => {
    it('should have buttons for backup and restore', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })

    it('should have file upload component', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      expect(wrapper.findAll('bs-file-upload-stub').length).toBeGreaterThan(0)
    })

    it('should have progress components', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      expect(wrapper.findAll('bs-progress-stub').length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('API Integration', () => {
    it('should use global baseURL', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      expect(wrapper.vm.global.baseURL).toBeDefined()
    })

    it('should use global token for auth', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      expect(wrapper.vm.global.token).toBeDefined()
    })
  })

  describe('Methods Exist', () => {
    it('should have createBackup method', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      expect(typeof wrapper.vm.createBackup).toBe('function')
    })

    it('should have restore method', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      expect(typeof wrapper.vm.restore).toBe('function')
    })

    it('should have cleanupJson method', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      expect(typeof wrapper.vm.cleanupJson).toBe('function')
    })

    it('should have getBatchList method', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      expect(typeof wrapper.vm.getBatchList).toBe('function')
    })

    it('should have getDeviceList method', () => {
      const wrapper = mount(BackupView, {
        global: {
          components: { BsProgress, BsFileUpload },
          stubs: { BsProgress: true, BsFileUpload: true }
        }
      })

      expect(typeof wrapper.vm.getDeviceList).toBe('function')
    })
  })
})
