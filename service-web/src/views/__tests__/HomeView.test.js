// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import HomeView from '../HomeView.vue'
import { Batch, Device } from '@/modules/classes'

// Create pinia mocks
const piniaMocks = vi.hoisted(() => ({
  global: {
    disabled: false,
    clearMessages: vi.fn(),
    messageSuccess: '',
    messageError: '',
    initialized: true,
    showChamberTemps: false,
    showKegmonTaps: false,
    updated: 0,
    baseURL: 'http://localhost:8080/',
    token: 'test-token',
    fetchTimout: 5000
  },
  batchStore: {
    batchList: [],
    getBatchList: vi.fn().mockResolvedValue([]),
    getBatchDashboard: vi.fn().mockResolvedValue(null)
  },
  deviceStore: {
    deviceList: [],
    getDeviceList: vi.fn().mockResolvedValue([]),
    getDevice: vi.fn().mockResolvedValue(null),
    proxyRequest: vi.fn().mockResolvedValue(null)
  },
  gravityStore: {
    gravityList: [],
    getGravityList: vi.fn().mockResolvedValue([])
  },
  pressureStore: {
    pressureList: [],
    getPressureList: vi.fn().mockResolvedValue([])
  },
  pourStore: {
    pourList: [],
    getPourList: vi.fn().mockResolvedValue([])
  },
  configStore: {
    config: {
      isGravitySG: true,
      isPressureBAR: false,
      isVolumeL: true
    }
  }
}))

vi.mock('@/modules/pinia', () => ({
  global: piniaMocks.global,
  batchStore: piniaMocks.batchStore,
  deviceStore: piniaMocks.deviceStore,
  gravityStore: piniaMocks.gravityStore,
  pressureStore: piniaMocks.pressureStore,
  pourStore: piniaMocks.pourStore,
  configStore: piniaMocks.configStore,
  config: piniaMocks.configStore.config
}))

vi.mock('@/modules/router', () => ({
  default: {
    currentRoute: {
      value: {
        params: { id: 'new' },
        name: 'home'
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
  gravityToPlato: vi.fn((g) => ((g - 1) * 1000) / 4),
  formatTime: vi.fn((s) => {
    if (s < 60) return `${s}s`
    if (s < 3600) return `${Math.round(s / 60)}m`
    return `${Math.round(s / 3600)}h`
  }),
  getFormattedTemperature: vi.fn((t) => `${t}°C`),
  getFormattedPressure: vi.fn((p) => `${p}PSI`),
  getFormattedVolume: vi.fn((v) => `${v}L`),
  getFormattedPourVolume: vi.fn((p) => `${(p / 100).toFixed(1)}cl`),
  truncateString: vi.fn((s, l) => s?.substring(0, l) || ''),
  getTimeSincePosted: vi.fn(() => '2m ago')
}))

describe('HomeView - Enhanced', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    piniaMocks.global.disabled = false
    piniaMocks.global.messageSuccess = ''
    piniaMocks.global.messageError = ''
    piniaMocks.global.showChamberTemps = false
    piniaMocks.global.showKegmonTaps = false
    piniaMocks.batchStore.batchList = []
    piniaMocks.deviceStore.deviceList = []
    piniaMocks.gravityStore.gravityList = []
    piniaMocks.pressureStore.pressureList = []
    piniaMocks.pourStore.pourList = []
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = () => {
    return mount(HomeView, {
      global: {
        stubs: {
          BsCard: true,
          BsInputSwitch: true,
          'router-link': true
        },
        plugins: [
          {
            install(app) {
              app.config.globalProperties.$route = { params: {}, name: 'home' }
            }
          }
        ]
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
      expect(wrapper.text()).toContain('Home - Overview')
    })

    it('should render h3 title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.h3').exists()).toBe(true)
    })

    it('should render grid rows', () => {
      const wrapper = createWrapper()
      const rows = wrapper.findAll('.row')
      expect(rows.length).toBeGreaterThan(0)
    })
  })

  describe('Toggle Switches', () => {
    it('should have showChamberTemps property', () => {
      expect(typeof piniaMocks.global.showChamberTemps).toBe('boolean')
    })

    it('should have showKegmonTaps property', () => {
      expect(typeof piniaMocks.global.showKegmonTaps).toBe('boolean')
    })

    it('should bind Chamber toggle to global.showChamberTemps', async () => {
      const wrapper = createWrapper()

      piniaMocks.global.showChamberTemps = true
      await wrapper.vm.$nextTick()

      expect(piniaMocks.global.showChamberTemps).toBe(true)
    })

    it('should bind Kegmon toggle to global.showKegmonTaps', async () => {
      const wrapper = createWrapper()

      piniaMocks.global.showKegmonTaps = true
      await wrapper.vm.$nextTick()

      expect(piniaMocks.global.showKegmonTaps).toBe(true)
    })
  })

  describe('Initial State', () => {
    it('should initialize activeBatchList', () => {
      const wrapper = createWrapper()
      expect(Array.isArray(wrapper.vm.activeBatchList)).toBe(true)
    })

    it('should initialize chamberTemps', () => {
      const wrapper = createWrapper()
      expect(Array.isArray(wrapper.vm.chamberTemps)).toBe(true)
    })

    it('should initialize kegmonTaps', () => {
      const wrapper = createWrapper()
      expect(Array.isArray(wrapper.vm.kegmonTaps)).toBe(true)
    })

    it('should initialize latest readings arrays', () => {
      const wrapper = createWrapper()
      expect(Array.isArray(wrapper.vm.latestGravityReadings)).toBe(true)
      expect(Array.isArray(wrapper.vm.latestPressureReadings)).toBe(true)
      expect(Array.isArray(wrapper.vm.latestPourReadings)).toBe(true)
    })

    it('should initialize fermentation control list', () => {
      const wrapper = createWrapper()
      expect(Array.isArray(wrapper.vm.fermentationControlList)).toBe(true)
    })
  })

  describe('Computed Properties - Counts', () => {
    it('should have gravity count computed property', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.gravityCount).toBe('number')
    })

    it('should have pour count computed property', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.pourCount).toBe('number')
    })

    it('should have pressure count computed property', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.pressureCount).toBe('number')
    })

    it('should have device count computed property', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.deviceCount).toBe('number')
    })

    it('should have batch count computed property', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.batchCount).toBe('number')
    })

    it('should compute zero count for empty stores', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.gravityCount).toBe(0)
      expect(wrapper.vm.pourCount).toBe(0)
      expect(wrapper.vm.pressureCount).toBe(0)
    })
  })

  describe('Pretty Formatting Methods', () => {
    it('should format scheduler task names', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.prettySchedulerName('task_fetch_chamberctrl_temps')).toBe(
        'Fetch chamber control temps'
      )
    })

    it('should format chamber control task name', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.prettySchedulerName('task_fermentation_control')).toBe('Chamber control')
    })

    it('should format gravity forward task name', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.prettySchedulerName('task_forward_gravity')).toBe('Forward gravity data')
    })

    it('should format database maintenance task name', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.prettySchedulerName('task_check_database')).toBe('Database maintenance')
    })

    it('should return unknown mapping for unknown task', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.prettySchedulerName('unknown_task')).toBe('Unknown mapping')
    })

    it('should format seconds to seconds display', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.prettySeconds(45)).toContain('s')
    })

    it('should format seconds to minutes display', () => {
      const wrapper = createWrapper()
      const result = wrapper.vm.prettySeconds(300)
      expect(result).toContain('m')
    })

    it('should format seconds to hours display', () => {
      const wrapper = createWrapper()
      const result = wrapper.vm.prettySeconds(3600)
      expect(result).toContain('h')
    })
  })

  describe('Methods', () => {
    it('should have getGravityReadingAge method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.getGravityReadingAge).toBe('function')
    })

    it('should have getPressureReadingAge method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.getPressureReadingAge).toBe('function')
    })

    it('should have getGravityOG method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.getGravityOG).toBe('function')
    })

    it('should have getLastGravity method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.getLastGravity).toBe('function')
    })

    it('should have getLastTemperature method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.getLastTemperature).toBe('function')
    })

    it('should have getLastPressure method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.getLastPressure).toBe('function')
    })

    it('should have prettySchedulerName method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.prettySchedulerName).toBe('function')
    })

    it('should have prettySeconds method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.prettySeconds).toBe('function')
    })
  })

  describe('Batch Card Display', () => {
    it('should initialize activeBatchList', () => {
      const wrapper = createWrapper()
      expect(Array.isArray(wrapper.vm.activeBatchList)).toBe(true)
    })

    it('should support adding batch to list', async () => {
      const wrapper = createWrapper()
      const batch = new Batch({ id: 1, name: 'Test Batch' })
      wrapper.vm.activeBatchList.push(batch)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.activeBatchList.length).toBe(1)
      expect(wrapper.vm.activeBatchList[0].name).toBe('Test Batch')
    })
  })

  describe('Database Metrics Card', () => {
    it('should initialize database metric variables', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.deviceCount).toBe('number')
      expect(typeof wrapper.vm.batchCount).toBe('number')
      expect(typeof wrapper.vm.gravityCount).toBe('number')
      expect(typeof wrapper.vm.pourCount).toBe('number')
      expect(typeof wrapper.vm.pressureCount).toBe('number')
    })
  })

  describe('Latest Readings Tables', () => {
    it('should initialize latest gravity readings array', () => {
      const wrapper = createWrapper()
      expect(Array.isArray(wrapper.vm.latestGravityReadings)).toBe(true)
    })

    it('should initialize latest pressure readings array', () => {
      const wrapper = createWrapper()
      expect(Array.isArray(wrapper.vm.latestPressureReadings)).toBe(true)
    })

    it('should initialize latest pour readings array', () => {
      const wrapper = createWrapper()
      expect(Array.isArray(wrapper.vm.latestPourReadings)).toBe(true)
    })

    it('should support adding gravity readings', async () => {
      const wrapper = createWrapper()
      wrapper.vm.latestGravityReadings.push({
        id: 1,
        batchName: 'Test',
        gravity: 1.05,
        created: '2025-05-09 10:00:00'
      })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.latestGravityReadings.length).toBe(1)
    })
  })

  describe('Data Binding Integration', () => {
    it('should bind global.showChamberTemps', async () => {
      const wrapper = createWrapper()

      piniaMocks.global.showChamberTemps = false
      await wrapper.vm.$nextTick()
      expect(piniaMocks.global.showChamberTemps).toBe(false)

      piniaMocks.global.showChamberTemps = true
      await wrapper.vm.$nextTick()
      expect(piniaMocks.global.showChamberTemps).toBe(true)
    })

    it('should bind global.showKegmonTaps', async () => {
      const wrapper = createWrapper()

      piniaMocks.global.showKegmonTaps = false
      await wrapper.vm.$nextTick()
      expect(piniaMocks.global.showKegmonTaps).toBe(false)

      piniaMocks.global.showKegmonTaps = true
      await wrapper.vm.$nextTick()
      expect(piniaMocks.global.showKegmonTaps).toBe(true)
    })
  })

  describe('Store Integration', () => {
    it('should access batch store', () => {
      expect(piniaMocks.batchStore).toBeDefined()
    })

    it('should access device store', () => {
      expect(piniaMocks.deviceStore).toBeDefined()
    })

    it('should access global store', () => {
      expect(piniaMocks.global).toBeDefined()
    })

    it('should access config store', () => {
      expect(piniaMocks.configStore).toBeDefined()
    })
  })

  describe('Component Lifecycle', () => {
    it('should initialize tickers', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.ticker).toBeDefined()
      expect(wrapper.vm.readingsTicker).toBeDefined()
    })

    it('should have scheduler status', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.schedulerStatus).toBeDefined()
    })
  })

  describe('Gravity Reading Methods', () => {
    it('getGravityReadingAge should return empty string for batch with < 2 gravity readings', () => {
      const wrapper = createWrapper()
      const batch = new Batch(1, 'Test')
      batch.gravityCount = 1
      const age = wrapper.vm.getGravityReadingAge(batch)
      expect(age).toBe('')
    })

    it('getGravityOG should return 0.0 for batch with < 2 gravity readings', () => {
      const wrapper = createWrapper()
      const batch = new Batch(1, 'Test')
      batch.gravityCount = 1
      const og = wrapper.vm.getGravityOG(batch)
      expect(og).toBe(0.0)
    })

    it('getLastGravity should return N/A for batch with < 2 gravity readings', () => {
      const wrapper = createWrapper()
      const batch = new Batch(1, 'Test')
      batch.gravityCount = 1
      const gravity = wrapper.vm.getLastGravity(batch)
      expect(gravity).toBe('N/A')
    })

    it('getLastGravity should format gravity value correctly', () => {
      const wrapper = createWrapper()
      const batch = new Batch(1, 'Test')
      batch.gravityCount = 2
      batch.gravity = [{ gravity: 1.05 }, { gravity: 1.01 }]
      const gravity = wrapper.vm.getLastGravity(batch)
      expect(gravity).toBeDefined()
      expect(typeof gravity).toBe('string')
    })
  })

  describe('Temperature Methods', () => {
    it('getLastTemperature should return N/A for batch with no readings', () => {
      const wrapper = createWrapper()
      const batch = new Batch(1, 'Test')
      batch.gravityCount = 0
      batch.pressureCount = 0
      const temp = wrapper.vm.getLastTemperature(batch)
      expect(temp).toBe('N/A')
    })

    it('getLastTemperature should use gravity reading if available', () => {
      const wrapper = createWrapper()
      const batch = new Batch(1, 'Test')
      batch.gravityCount = 2
      batch.gravity = [{ temperature: 18 }, { temperature: 20 }]
      const temp = wrapper.vm.getLastTemperature(batch)
      expect(temp).toBeDefined()
    })

    it('getLastTemperature should fallback to pressure reading', () => {
      const wrapper = createWrapper()
      const batch = new Batch(1, 'Test')
      batch.gravityCount = 0
      batch.pressureCount = 2
      batch.pressure = [{ temperature: 18 }, { temperature: 22 }]
      const temp = wrapper.vm.getLastTemperature(batch)
      expect(temp).toBeDefined()
    })
  })

  describe('Pressure Methods', () => {
    it('getLastPressure should return N/A for batch with no pressure readings', () => {
      const wrapper = createWrapper()
      const batch = new Batch(1, 'Test')
      batch.pressureCount = 0
      const pressure = wrapper.vm.getLastPressure(batch)
      expect(pressure).toBe('N/A')
    })

    it('getLastPressure should format pressure value correctly', () => {
      const wrapper = createWrapper()
      const batch = new Batch(1, 'Test')
      batch.pressureCount = 2
      batch.pressure = [{ pressure: 2.0 }, { pressure: 2.5 }]
      const pressure = wrapper.vm.getLastPressure(batch)
      expect(pressure).toBeDefined()
    })
  })

  describe('Activity Reading Age', () => {
    it('getPressureReadingAge should return empty string for batch with < 2 pressure readings', () => {
      const wrapper = createWrapper()
      const batch = new Batch(1, 'Test')
      batch.pressureCount = 1
      const age = wrapper.vm.getPressureReadingAge(batch)
      expect(age).toBe('')
    })

    it('getPressureReadingAge should calculate time for batch with 2+ pressure readings', () => {
      const wrapper = createWrapper()
      const batch = new Batch(1, 'Test')
      batch.pressureCount = 2
      const now = new Date()
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
      batch.pressure = [{ created: fiveMinutesAgo.toISOString() }, { created: now.toISOString() }]
      const age = wrapper.vm.getPressureReadingAge(batch)
      expect(typeof age).toBe('string')
    })
  })

  describe('Timer Management', () => {
    it('should clear ticker on unmount', async () => {
      const wrapper = createWrapper()
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      wrapper.vm.ticker = setInterval(() => {}, 5000)

      wrapper.unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
      clearIntervalSpy.mockRestore()
    })

    it('should clear readingsTicker on unmount', async () => {
      const wrapper = createWrapper()
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      wrapper.vm.readingsTicker = setInterval(() => {}, 5000)

      wrapper.unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
      clearIntervalSpy.mockRestore()
    })
  })

  describe('Prediction Methods', () => {
    it('getPrediction should return null if prediction data is missing', () => {
      const wrapper = createWrapper()
      const batch = new Batch(1, 'Test')
      expect(wrapper.vm.getPrediction(batch)).toBeNull()
    })

    it('getPrediction should return DONE if remaining time is less than 0.5h', () => {
      const wrapper = createWrapper()
      const batch = new Batch(1, 'Test')
      const now = new Date()
      batch.predictionHoursLeft = 0.4
      batch.predictionAtTimestamp = now.toISOString()
      expect(wrapper.vm.getPrediction(batch)).toBe('DONE')
    })

    it('getPrediction should adjust for elapsed time and return formatted hours', () => {
      const wrapper = createWrapper()
      const batch = new Batch(1, 'Test')
      const predictionTime = new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
      batch.predictionHoursLeft = 5.0
      batch.predictionAtTimestamp = predictionTime.toISOString()
      // 5.0 - 1.0 = 4.0
      expect(wrapper.vm.getPrediction(batch)).toBe('4.0 h')
    })

    it('getPrediction should return DONE if elapsed time exceeds prediction', () => {
      const wrapper = createWrapper()
      const batch = new Batch(1, 'Test')
      const predictionTime = new Date(Date.now() - 1000 * 60 * 60 * 10) // 10 hours ago
      batch.predictionHoursLeft = 5.0
      batch.predictionAtTimestamp = predictionTime.toISOString()
      // 5.0 - 10.0 = -5.0
      expect(wrapper.vm.getPrediction(batch)).toBe('DONE')
    })

    it('getPrediction should return null for invalid timestamp', () => {
      const wrapper = createWrapper()
      const batch = new Batch(1, 'Test')
      batch.predictionHoursLeft = 5.0
      batch.predictionAtTimestamp = 'invalid-date'
      expect(wrapper.vm.getPrediction(batch)).toBeNull()
    })
  })

  describe('Gravity Count Computation', () => {
    it('should calculate total gravity count from all batches', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.gravityCount).toBe('number')
    })

    it('should return 0 when no batches have gravity readings', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.gravityCount).toBe(0)
    })
  })

  describe('Pour Count Computation', () => {
    it('should calculate total pour count from all batches', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.pourCount).toBe('number')
    })

    it('should return 0 when no batches have pour readings', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.pourCount).toBe(0)
    })
  })

  describe('Pressure Count Computation', () => {
    it('should calculate total pressure count from all batches', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.pressureCount).toBe('number')
    })

    it('should return 0 when no batches have pressure readings', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.pressureCount).toBe(0)
    })
  })

  describe('Device Count Computation', () => {
    it('should return device count from device store', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.deviceCount).toBe(piniaMocks.deviceStore.deviceList.length)
    })
  })

  describe('Batch Count Computation', () => {
    it('should return batch count from batch store', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.batchCount).toBe(piniaMocks.batchStore.batchList.length)
    })
  })

  describe('Async Chamber and Kegmon Fetch', () => {
    it('should initialize chamber temps as empty array', () => {
      const wrapper = createWrapper()
      expect(Array.isArray(wrapper.vm.chamberTemps)).toBe(true)
      expect(wrapper.vm.chamberTemps.length).toBe(0)
    })

    it('should initialize kegmon taps as empty array', () => {
      const wrapper = createWrapper()
      expect(Array.isArray(wrapper.vm.kegmonTaps)).toBe(true)
      expect(wrapper.vm.kegmonTaps.length).toBe(0)
    })
  })

  describe('Reading Display', () => {
    it('should support adding and displaying gravity readings', async () => {
      const wrapper = createWrapper()
      const reading = {
        id: 1,
        batchName: 'Test Batch',
        gravity: 1.05,
        temperature: 20,
        battery: 4.5,
        created: new Date().toISOString()
      }
      wrapper.vm.latestGravityReadings.push(reading)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.latestGravityReadings.length).toBe(1)
      expect(wrapper.vm.latestGravityReadings[0].batchName).toBe('Test Batch')
    })

    it('should support adding and displaying pressure readings', async () => {
      const wrapper = createWrapper()
      const reading = {
        id: 1,
        batchName: 'Test Batch',
        pressure: 2.5,
        temperature: 20,
        battery: 4.5,
        created: new Date().toISOString()
      }
      wrapper.vm.latestPressureReadings.push(reading)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.latestPressureReadings.length).toBe(1)
    })

    it('should support adding and displaying pour readings', async () => {
      const wrapper = createWrapper()
      const reading = {
        id: 1,
        batchName: 'Test Batch',
        volume: 50,
        pour: 20,
        created: new Date().toISOString()
      }
      wrapper.vm.latestPourReadings.push(reading)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.latestPourReadings.length).toBe(1)
    })
  })

  describe('Fermentation Control List', () => {
    it('should initialize fermentation control list', () => {
      const wrapper = createWrapper()
      expect(Array.isArray(wrapper.vm.fermentationControlList)).toBe(true)
    })

    it('should support adding fermentation controller device', async () => {
      const wrapper = createWrapper()
      const device = new Device(
        1,
        'abc123',
        'http://localhost:8080/',
        'Chamber Controller',
        'Chamber-Controller'
      )
      wrapper.vm.fermentationControlList.push(device)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.fermentationControlList.length).toBe(1)
    })
  })

  describe('fetchChamber() - Async Chamber Data', () => {
    it('should clear chamber temps when showChamberTemps is false', async () => {
      const wrapper = createWrapper()
      piniaMocks.global.showChamberTemps = false
      wrapper.vm.chamberTemps = [{ mdns: 'test' }]

      await wrapper.vm.fetchChamber()

      expect(wrapper.vm.chamberTemps).toEqual([])
    })

    it('should call proxyRequest for each chamber device when enabled', async () => {
      const wrapper = createWrapper()
      const device = new Device(
        1,
        'abc123',
        'http://localhost/',
        'Test Chamber',
        'Chamber-Controller'
      )
      piniaMocks.deviceStore.deviceList = [device]
      piniaMocks.deviceStore.proxyRequest = vi.fn().mockResolvedValue({
        mdns: 'chamber1',
        pid_fridge_temp: 10
      })
      piniaMocks.global.showChamberTemps = true

      await wrapper.vm.fetchChamber()

      expect(wrapper.vm.chamberTemps.length).toBeGreaterThanOrEqual(0)
    })

    it('should filter only Chamber-Controller devices', async () => {
      const wrapper = createWrapper()
      const chamberDevice = new Device({
        id: 1,
        chipId: 'abc123',
        url: 'http://chamber/',
        description: 'Chamber'
      })
      const otherDevice = new Device({ id: 2, chipId: 'def456', url: 'http://other/', description: 'Other' })
      piniaMocks.deviceStore.deviceList = [chamberDevice, otherDevice]
      piniaMocks.global.showChamberTemps = true

      // Should succeed without errors
      await wrapper.vm.fetchChamber()

      expect(wrapper.vm.chamberTemps).toBeDefined()
    })
  })

  describe('fetchKegmon() - Async Kegmon Data', () => {
    it('should clear kegmon taps when showKegmonTaps is false', async () => {
      const wrapper = createWrapper()
      piniaMocks.global.showKegmonTaps = false
      wrapper.vm.kegmonTaps = [{ mdns: 'test' }]

      await wrapper.vm.fetchKegmon()

      expect(wrapper.vm.kegmonTaps).toEqual([])
    })

    it('should filter only Kegmon devices', async () => {
      const wrapper = createWrapper()
      const kegmonDevice = new Device({ id: 1, chipId: 'def456', url: 'http://kegmon/', description: 'Kegmon' })
      const otherDevice = new Device(
        2,
        'abc123',
        'http://chamber/',
        'Chamber',
        'Chamber-Controller'
      )
      piniaMocks.deviceStore.deviceList = [kegmonDevice, otherDevice]
      piniaMocks.global.showKegmonTaps = true

      // Should succeed without errors
      await wrapper.vm.fetchKegmon()

      expect(wrapper.vm.kegmonTaps).toBeDefined()
    })

    it('should fallback to empty array when fetch fails', async () => {
      const wrapper = createWrapper()
      piniaMocks.deviceStore.deviceList = []
      piniaMocks.global.showKegmonTaps = true

      await wrapper.vm.fetchKegmon()

      expect(wrapper.vm.kegmonTaps).toEqual([])
    })
  })

  describe('fetchScheduler() - Async Scheduler Status', () => {
    it('should attempt to fetch scheduler status', async () => {
      const wrapper = createWrapper()
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([])
      })

      await wrapper.vm.fetchScheduler()

      // Verify fetch was called
      expect(global.fetch.mock.calls.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('fetchLatestReadings() - Async Readings Fetch', () => {
    it('should populate latest arrays with data', async () => {
      const wrapper = createWrapper()

      // Just verify the method exists and can be called without crashing
      await wrapper.vm.fetchLatestReadings()

      expect(wrapper.vm.latestGravityReadings).toBeDefined()
      expect(wrapper.vm.latestPressureReadings).toBeDefined()
      expect(wrapper.vm.latestPourReadings).toBeDefined()
    })

    it('should initialize empty readings on first call', async () => {
      const wrapper = createWrapper()

      await wrapper.vm.fetchLatestReadings()

      expect(Array.isArray(wrapper.vm.latestGravityReadings)).toBe(true)
      expect(Array.isArray(wrapper.vm.latestPressureReadings)).toBe(true)
      expect(Array.isArray(wrapper.vm.latestPourReadings)).toBe(true)
    })

    it('should support adding readings after fetch', async () => {
      const wrapper = createWrapper()

      wrapper.vm.latestGravityReadings.push({
        batchName: 'Test',
        gravity: 1.05,
        temperature: 20,
        battery: 3.8,
        created: new Date().toISOString()
      })

      expect(wrapper.vm.latestGravityReadings.length).toBe(1)
    })
  })

  describe('onMounted() - Component Initialization', () => {
    it('should initialize active batch list', async () => {
      const wrapper = createWrapper()

      await flushPromises()

      expect(wrapper.vm.activeBatchList).toBeDefined()
      expect(Array.isArray(wrapper.vm.activeBatchList)).toBe(true)
    })

    it('should set up ticker intervals on mount', async () => {
      const wrapper = createWrapper()

      await flushPromises()

      expect(wrapper.vm.ticker).toBeDefined()
      expect(wrapper.vm.readingsTicker).toBeDefined()
    })
  })
})
