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
})
