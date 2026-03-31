import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDeviceStore } from '@/modules/deviceStore'

// Mock logger
vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn()
}))

// Mock pinia global object
vi.mock('@/modules/pinia', () => ({
  global: {
    disabled: false,
    baseURL: 'http://localhost:8080/',
    token: 'Bearer test',
    fetchTimout: 30000,
    updatedDeviceData: 0
  }
}))

describe('useDeviceStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.fetch = vi.fn()
  })

  it('should have empty devices array initially', () => {
    const store = useDeviceStore()
    expect(store.devices).toEqual([])
  })

  it('should have deviceList getter', () => {
    const store = useDeviceStore()
    expect(store.deviceList).toEqual([])
  })

  it('should fetch all devices via getDeviceList', async () => {
    const store = useDeviceStore()
    const mockDevices = [
      {
        id: 1,
        chipId: 'chip1',
        chipFamily: 'ESP32',
        software: 'gravitymon',
        mdns: 'device1.local',
        config: 'config1',
        bleColor: 'FF0000',
        url: 'http://192.168.1.1',
        description: 'Device 1',
        collectLogs: false
      }
    ]

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValueOnce(mockDevices)
    })

    const result = await store.getDeviceList()

    expect(result).toBeTruthy()
    expect(store.devices.length).toBe(1)
  })

  it('should handle fetch error in getDeviceList', async () => {
    const store = useDeviceStore()
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

    const result = await store.getDeviceList()

    expect(result).toBeNull()
  })

  it('should fetch device by ID with fermentation steps', async () => {
    const store = useDeviceStore()
    const mockData = {
      id: 1,
      chipId: 'chip1',
      chipFamily: 'ESP32',
      software: 'gravitymon',
      mdns: 'device1.local',
      config: '',
      bleColor: '',
      url: '',
      description: 'Test Device',
      collectLogs: false,
      fermentationStep: []
    }

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValueOnce(mockData)
    })

    const result = await store.getDevice(1)

    expect(result).toBeTruthy()
    expect(result.device).toBeDefined()
    expect(result.stepList).toBeDefined()
  })

  it('should allow adding devices to array', () => {
    const store = useDeviceStore()
    store.devices.push({
      id: 1,
      chipId: 'chip1',
      chipFamily: 'ESP32',
      software: 'gravitymon',
      mdns: '',
      config: '',
      bleColor: '',
      url: '',
      description: 'Device',
      collectLogs: false
    })

    expect(store.devices.length).toBe(1)
  })

  it('should allow clearing devices', () => {
    const store = useDeviceStore()
    store.devices = [{ id: 1 }]
    store.devices = []
    expect(store.devices.length).toBe(0)
  })

  it('should handle non-ok response in getDeviceList', async () => {
    const store = useDeviceStore()
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404
    })

    const result = await store.getDeviceList()

    expect(result).toBeNull()
  })

  it('should handle invalid device ID in getDevice', async () => {
    const store = useDeviceStore()

    const resultUndefined = await store.getDevice(undefined)
    expect(resultUndefined).toBeNull()

    const resultNull = await store.getDevice(null)
    expect(resultNull).toBeNull()

    const resultZero = await store.getDevice(0)
    expect(resultZero).toBeNull()
  })

  it('should handle fetch error in getDevice', async () => {
    const store = useDeviceStore()
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

    const result = await store.getDevice(1)

    expect(result).toBeNull()
  })

  it('should handle non-ok response in getDevice', async () => {
    const store = useDeviceStore()
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404
    })

    const result = await store.getDevice(1)

    expect(result).toBeNull()
  })

  describe('updateDevice Action', () => {
    it('should update device successfully', async () => {
      const store = useDeviceStore()
      const deviceToUpdate = {
        id: 1,
        toJson: () => ({ id: 1, chipId: 'chip1' })
      }

      const mockUpdatedDevice = {
        id: 1,
        chipId: 'chip1',
        description: 'Updated'
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 200,
        json: vi.fn().mockResolvedValueOnce(mockUpdatedDevice)
      })

      const result = await store.updateDevice(deviceToUpdate)

      expect(result).toBeTruthy()
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/device/1',
        expect.objectContaining({ method: 'PATCH' })
      )
    })

    it('should return null if update status is not 200', async () => {
      const store = useDeviceStore()
      const deviceToUpdate = {
        id: 1,
        toJson: () => ({ id: 1 })
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 400
      })

      const result = await store.updateDevice(deviceToUpdate)

      expect(result).toBeNull()
    })

    it('should return null on update error', async () => {
      const store = useDeviceStore()
      const deviceToUpdate = {
        id: 1,
        toJson: () => ({ id: 1 })
      }

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Update error'))

      const result = await store.updateDevice(deviceToUpdate)

      expect(result).toBeNull()
    })
  })

  describe('addDevice Action', () => {
    it('should add new device successfully', async () => {
      const store = useDeviceStore()
      const newDevice = {
        toJson: () => ({ chipId: 'newchip' })
      }

      const mockResponse = {
        id: 1,
        chipId: 'newchip'
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 201,
        json: vi.fn().mockResolvedValueOnce(mockResponse)
      })

      const result = await store.addDevice(newDevice)

      expect(result).toBeTruthy()
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/device/',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('should return null if add status is not 201', async () => {
      const store = useDeviceStore()
      const newDevice = {
        toJson: () => ({ chipId: 'newchip' })
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 400
      })

      const result = await store.addDevice(newDevice)

      expect(result).toBeNull()
    })

    it('should return null on add device error', async () => {
      const store = useDeviceStore()
      const newDevice = {
        toJson: () => ({ chipId: 'newchip' })
      }

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Add error'))

      const result = await store.addDevice(newDevice)

      expect(result).toBeNull()
    })
  })

  describe('deleteDevice Action', () => {
    it('should delete device successfully', async () => {
      const store = useDeviceStore()

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 204
      })

      const result = await store.deleteDevice(1)

      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/device/1',
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('should return false if delete status is not 204', async () => {
      const store = useDeviceStore()

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 404
      })

      const result = await store.deleteDevice(1)

      expect(result).toBe(false)
    })

    it('should return false on delete device error', async () => {
      const store = useDeviceStore()

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Delete error'))

      const result = await store.deleteDevice(1)

      expect(result).toBe(false)
    })
  })

  describe('getDeviceFermentationSteps Action', () => {
    it('should get fermentation steps for device', async () => {
      const store = useDeviceStore()

      const mockData = {
        id: 1,
        fermentationStep: [
          { order: 0, name: 'Step1', type: 'Type1', date: '2024-01-15', temp: 20, days: 1 }
        ]
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce(mockData)
      })

      const result = await store.getDeviceFermentationSteps(1)

      expect(result).toBeTruthy()
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/device/1',
        expect.any(Object)
      )
    })

    it('should handle invalid device ID in getDeviceFermentationSteps', async () => {
      const store = useDeviceStore()

      const resultZero = await store.getDeviceFermentationSteps(0)
      expect(resultZero).toBeNull()
    })

    it('should return null on getDeviceFermentationSteps error', async () => {
      const store = useDeviceStore()

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Fetch error'))

      const result = await store.getDeviceFermentationSteps(1)

      expect(result).toBeNull()
    })

    it('should handle non-ok response in getDeviceFermentationSteps', async () => {
      const store = useDeviceStore()

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      const result = await store.getDeviceFermentationSteps(1)

      expect(result).toBeNull()
    })
  })

  describe('addDeviceFermentationSteps Action', () => {
    it('should add fermentation steps successfully', async () => {
      const store = useDeviceStore()
      const fsList = [
        { order: 0, name: 'Step1', type: 'Type1', date: '2024-01-15', temp: 20, days: 1 }
      ]

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 201
      })

      const result = await store.addDeviceFermentationSteps(1, fsList)

      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/device/1/step/',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('should return false if add status is not 201', async () => {
      const store = useDeviceStore()
      const fsList = []

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 400
      })

      const result = await store.addDeviceFermentationSteps(1, fsList)

      expect(result).toBe(false)
    })

    it('should return false on add fermentation steps error', async () => {
      const store = useDeviceStore()
      const fsList = []

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Add error'))

      const result = await store.addDeviceFermentationSteps(1, fsList)

      expect(result).toBe(false)
    })
  })

  describe('deleteDeviceFermentationSteps Action', () => {
    it('should delete fermentation steps successfully', async () => {
      const store = useDeviceStore()

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 204
      })

      const result = await store.deleteDeviceFermentationSteps(1)

      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/device/1/step/',
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('should return false if delete status is not 204', async () => {
      const store = useDeviceStore()

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 404
      })

      const result = await store.deleteDeviceFermentationSteps(1)

      expect(result).toBe(false)
    })

    it('should return false on delete fermentation steps error', async () => {
      const store = useDeviceStore()

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Delete error'))

      const result = await store.deleteDeviceFermentationSteps(1)

      expect(result).toBe(false)
    })
  })

  describe('processEvent Action', () => {
    it('should delete device by id on delete event', () => {
      const store = useDeviceStore()
      store.devices = [
        { id: 1, chipId: 'chip1' },
        { id: 2, chipId: 'chip2' }
      ]

      store.processEvent('delete', 1)

      expect(store.devices.length).toBe(1)
      expect(store.devices[0].id).toBe(2)
    })

    it('should update device by id on update event', async () => {
      const store = useDeviceStore()
      store.devices = [
        { id: 1, chipId: 'chip1' },
        { id: 2, chipId: 'chip2' }
      ]

      const mockDevice = {
        id: 1,
        chipId: 'chip1_updated',
        fermentationStep: []
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce(mockDevice)
      })

      await store.processEvent('update', 1)

      expect(store.devices.length).toBe(2)
      const updated = store.devices.find((d) => d.id === 1)
      expect(updated.id).toBe(1)
    })

    it('should create new device on create event', async () => {
      const store = useDeviceStore()
      store.devices = [{ id: 1, chipId: 'chip1' }]

      const mockDevice = {
        id: 2,
        chipId: 'chip2',
        fermentationStep: []
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce(mockDevice)
      })

      await store.processEvent('create', 2)

      expect(store.devices.length).toBe(2)
      const created = store.devices.find((d) => d.id === 2)
      expect(created.id).toBe(2)
    })

    it('should not create device if fetch fails', async () => {
      const store = useDeviceStore()
      store.devices = [{ id: 1, chipId: 'chip1' }]

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Fetch error'))

      await store.processEvent('create', 2)

      expect(store.devices.length).toBe(1)
    })

    it('should not update device if fetch fails', async () => {
      const store = useDeviceStore()
      store.devices = [{ id: 1, chipId: 'chip1' }]

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Fetch error'))

      await store.processEvent('update', 1)

      expect(store.devices.length).toBe(1)
    })
  })

  describe('proxyRequest Action', () => {
    it('should make a proxy request successfully', async () => {
      const store = useDeviceStore()
      const mockResponse = { status: 'success', data: 'test' }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce(mockResponse)
      })

      const result = await store.proxyRequest('GET', 'http://device.local/api/status', {}, null)

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/device/proxy_fetch/',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('should return null if proxy request fails with non-200 status', async () => {
      const store = useDeviceStore()

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 500
      })

      const result = await store.proxyRequest('GET', 'http://device.local/api/status', {}, null)

      expect(result).toBeNull()
    })

    it('should return null on proxy request error', async () => {
      const store = useDeviceStore()

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

      const result = await store.proxyRequest(
        'POST',
        'http://device.local/api/config',
        { 'Content-Type': 'application/json' },
        '{"key":"value"}'
      )

      expect(result).toBeNull()
    })

    it('should handle proxy request with various HTTP methods', async () => {
      const store = useDeviceStore()
      const mockResponse = { success: true }

      global.fetch = vi.fn().mockResolvedValueOnce({
        status: 200,
        json: vi.fn().mockResolvedValueOnce(mockResponse)
      })

      const result = await store.proxyRequest(
        'DELETE',
        'http://device.local/api/resource',
        {},
        null
      )

      expect(result).toEqual(mockResponse)
    })
  })

  describe('searchNetwork Action', () => {
    it('should search network for devices successfully', async () => {
      const store = useDeviceStore()
      const mockMdnsList = [
        { name: 'device1.local', ip: '192.168.1.100', port: 80 },
        { name: 'device2.local', ip: '192.168.1.101', port: 80 }
      ]

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce(mockMdnsList)
      })

      const result = await store.searchNetwork()

      expect(result).toBeTruthy()
      expect(Array.isArray(result)).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/device/mdns/',
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should return null if search returns non-ok response', async () => {
      const store = useDeviceStore()

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 503
      })

      const result = await store.searchNetwork()

      expect(result).toBeNull()
    })

    it('should return null on search network error', async () => {
      const store = useDeviceStore()

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Search error'))

      const result = await store.searchNetwork()

      expect(result).toBeNull()
    })

    it('should handle empty MDNS list', async () => {
      const store = useDeviceStore()

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce([])
      })

      const result = await store.searchNetwork()

      expect(result).toBeTruthy()
      expect(result.length).toBe(0)
    })

    it('should properly create MDNS objects from response', async () => {
      const store = useDeviceStore()
      const mockMdnsData = [
        { name: 'gravitymon1.local', ip: '192.168.1.50', port: 80, mdnsName: 'gravitymon1' }
      ]

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce(mockMdnsData)
      })

      const result = await store.searchNetwork()

      expect(result).toBeTruthy()
      expect(result.length).toBe(1)
    })
  })
})
