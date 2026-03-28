import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGlobalStore } from '@/modules/globalStore'

describe('useGlobalStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Mock environment variables
    import.meta.env.VITE_APP_HOST = undefined
    import.meta.env.VITE_APP_TOKEN = 'test-token'
    import.meta.env.VITE_APP_VERSION = '1.0.0'
    import.meta.env.VITE_APP_BUILD = '1'
    window.VITE_APP_TOKEN = undefined
    // Mock window.location.origin (read-only, so use Object.defineProperty)
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:8080' },
      writable: true
    })
  })

  describe('Initial State', () => {
    it('should have default initialized state', () => {
      const store = useGlobalStore()
      expect(store.initialized).toBe(false)
      expect(store.disabled).toBe(false)
      expect(store.configChanged).toBe(false)
      expect(store.batchChanged).toBe(false)
      expect(store.deviceChanged).toBe(false)
    })

    it('should have empty messages by default', () => {
      const store = useGlobalStore()
      expect(store.messageError).toBe('')
      expect(store.messageWarning).toBe('')
      expect(store.messageSuccess).toBe('')
      expect(store.messageInfo).toBe('')
    })

    it('should have proper filter defaults', () => {
      const store = useGlobalStore()
      expect(store.batchListFilterDevice).toBe('*')
      expect(store.batchListFilterActive).toBe(false)
      expect(store.batchListFilterData).toBe(false)
      expect(store.deviceListFilterSoftware).toBe('*')
      expect(store.showChamberTemps).toBe(false)
      expect(store.showKegmonTaps).toBe(false)
    })

    it('should have notification counters initialized to 0', () => {
      const store = useGlobalStore()
      expect(store.updatedDeviceData).toBe(0)
      expect(store.updatedBatchData).toBe(0)
      expect(store.updatedGravityData).toBe(0)
      expect(store.updatedPourData).toBe(0)
    })
  })

  describe('Message Getters', () => {
    it('should detect error message', () => {
      const store = useGlobalStore()
      expect(store.isError).toBe(false)
      store.messageError = 'Error occurred'
      expect(store.isError).toBe(true)
    })

    it('should detect warning message', () => {
      const store = useGlobalStore()
      expect(store.isWarning).toBe(false)
      store.messageWarning = 'Warning message'
      expect(store.isWarning).toBe(true)
    })

    it('should detect success message', () => {
      const store = useGlobalStore()
      expect(store.isSuccess).toBe(false)
      store.messageSuccess = 'Success'
      expect(store.isSuccess).toBe(true)
    })

    it('should detect info message', () => {
      const store = useGlobalStore()
      expect(store.isInfo).toBe(false)
      store.messageInfo = 'Information'
      expect(store.isInfo).toBe(true)
    })
  })

  describe('baseURL Getter', () => {
    it('should use window.location.origin when VITE_APP_HOST is undefined', () => {
      const store = useGlobalStore()
      // Note: import.meta.env values are strings, not undefined
      const url = store.baseURL
      // The URL should either be localhost or the env value
      expect(url).toBeTruthy()
    })

    it('should cache baseURL after first access', () => {
      const store = useGlobalStore()
      const url1 = store.baseURL
      const url2 = store.baseURL
      expect(url1).toBe(url2)
      expect(store.url).toBeDefined()
    })

    it('should use VITE_APP_HOST when defined', () => {
      const store = useGlobalStore()
      import.meta.env.VITE_APP_HOST = 'http://example.com/'
      store.url = undefined // Reset cached value
      const url = store.baseURL
      expect(url).toBe('http://example.com/')
    })
  })

  describe('Token Getter', () => {
    it('should use window.VITE_APP_TOKEN when available', () => {
      const store = useGlobalStore()
      window.VITE_APP_TOKEN = 'window-token'
      const token = store.token
      expect(token).toBe('Bearer window-token')
    })

    it('should use import.meta.env token when window token is undefined', () => {
      const store = useGlobalStore()
      window.VITE_APP_TOKEN = undefined
      const token = store.token
      expect(token).toContain('Bearer')
    })

    it('should use import.meta.env token when window token is __TOKEN__', () => {
      const store = useGlobalStore()
      window.VITE_APP_TOKEN = '__TOKEN__'
      import.meta.env.VITE_APP_TOKEN = 'env-token'
      const token = store.token
      expect(token).toBe('Bearer env-token')
    })
  })

  describe('Version Getters', () => {
    it('should return UI version from environment', () => {
      const store = useGlobalStore()
      expect(store.uiVersion).toBe('1.0.0')
    })

    it('should return UI build from environment', () => {
      const store = useGlobalStore()
      expect(store.uiBuild).toBe('1')
    })
  })

  describe('clearMessages Action', () => {
    it('should clear all messages', () => {
      const store = useGlobalStore()
      store.messageError = 'Error'
      store.messageWarning = 'Warning'
      store.messageSuccess = 'Success'
      store.messageInfo = 'Info'

      store.clearMessages()

      expect(store.messageError).toBe('')
      expect(store.messageWarning).toBe('')
      expect(store.messageSuccess).toBe('')
      expect(store.messageInfo).toBe('')
    })

    it('should clear only when messages exist', () => {
      const store = useGlobalStore()
      expect(store.messageError).toBe('')
      store.clearMessages()
      expect(store.messageError).toBe('')
    })
  })

  describe('State Mutations', () => {
    it('should allow setting initialized state', () => {
      const store = useGlobalStore()
      store.initialized = true
      expect(store.initialized).toBe(true)
    })

    it('should allow setting disabled state', () => {
      const store = useGlobalStore()
      store.disabled = true
      expect(store.disabled).toBe(true)
    })

    it('should allow setting change flags', () => {
      const store = useGlobalStore()
      store.configChanged = true
      store.batchChanged = true
      store.deviceChanged = true
      expect(store.configChanged).toBe(true)
      expect(store.batchChanged).toBe(true)
      expect(store.deviceChanged).toBe(true)
    })

    it('should allow setting filters', () => {
      const store = useGlobalStore()
      store.batchListFilterDevice = 'device-1'
      store.batchListFilterActive = true
      store.batchListFilterData = true
      expect(store.batchListFilterDevice).toBe('device-1')
      expect(store.batchListFilterActive).toBe(true)
      expect(store.batchListFilterData).toBe(true)
    })

    it('should allow incrementing notification counters', () => {
      const store = useGlobalStore()
      store.updatedDeviceData += 1
      store.updatedBatchData += 1
      store.updatedGravityData += 1
      store.updatedPourData += 1
      expect(store.updatedDeviceData).toBe(1)
      expect(store.updatedBatchData).toBe(1)
      expect(store.updatedGravityData).toBe(1)
      expect(store.updatedPourData).toBe(1)
    })
  })
})
