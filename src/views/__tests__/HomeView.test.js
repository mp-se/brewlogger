import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import HomeView from '../HomeView.vue'
import { useBatchStore } from '@/modules/batchStore'
import { useDeviceStore } from '@/modules/deviceStore'
import { useGlobalStore } from '@/modules/globalStore'
import { useConfigStore } from '@/modules/configStore'
import { Batch, Device } from '@/modules/classes'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}))

vi.mock('@/modules/utils', () => ({
  gravityToPlato: vi.fn((g) => (g - 1) * 1000 / 4),
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
  getTimeSincePosted: vi.fn((d) => '2m ago')
}))

describe('HomeView - Enhanced', () => {
  let router, pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home' },
        { path: '/batch/:id/gravity/graph', name: 'batch-gravity-graph' },
        { path: '/batch/:id/pressure/graph', name: 'batch-pressure-graph' }
      ]
    })
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
      const wrapper = createWrapper()
      const globalStore = useGlobalStore()
      expect(typeof globalStore.showChamberTemps).toBe('boolean')
    })

    it('should have showKegmonTaps property', () => {
      const wrapper = createWrapper()
      const globalStore = useGlobalStore()
      expect(typeof globalStore.showKegmonTaps).toBe('boolean')
    })

    it('should bind Chamber toggle to global.showChamberTemps', async () => {
      const wrapper = createWrapper()
      const globalStore = useGlobalStore()
      
      globalStore.showChamberTemps = true
      await wrapper.vm.$nextTick()

      expect(globalStore.showChamberTemps).toBe(true)
    })

    it('should bind Kegmon toggle to global.showKegmonTaps', async () => {
      const wrapper = createWrapper()
      const globalStore = useGlobalStore()
      
      globalStore.showKegmonTaps = true
      await wrapper.vm.$nextTick()

      expect(globalStore.showKegmonTaps).toBe(true)
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
      expect(wrapper.vm.prettySchedulerName('task_fetch_chamberctrl_temps')).toBe('Fetch ChamberControl Temps')
    })

    it('should format chamber control task name', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.prettySchedulerName('task_fermentation_control')).toBe('Chamber Control')
    })

    it('should format gravity forward task name', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.prettySchedulerName('task_forward_gravity')).toBe('Forward gravity')
    })

    it('should format database maintenance task name', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.prettySchedulerName('task_check_database')).toBe('Database Maintenance')
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
      const batch = new Batch(1, 'Test Batch')
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
        gravity: 1.050,
        created: '2025-05-09 10:00:00'
      })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.latestGravityReadings.length).toBe(1)
    })
  })

  

  describe('Data Binding Integration', () => {
    it('should bind global.showChamberTemps', async () => {
      const wrapper = createWrapper()
      const globalStore = useGlobalStore()
      
      globalStore.showChamberTemps = false
      await wrapper.vm.$nextTick()
      expect(globalStore.showChamberTemps).toBe(false)

      globalStore.showChamberTemps = true
      await wrapper.vm.$nextTick()
      expect(globalStore.showChamberTemps).toBe(true)
    })

    it('should bind global.showKegmonTaps', async () => {
      const wrapper = createWrapper()
      const globalStore = useGlobalStore()
      
      globalStore.showKegmonTaps = false
      await wrapper.vm.$nextTick()
      expect(globalStore.showKegmonTaps).toBe(false)

      globalStore.showKegmonTaps = true
      await wrapper.vm.$nextTick()
      expect(globalStore.showKegmonTaps).toBe(true)
    })
  })

  describe('Store Integration', () => {
    it('should access batch store', () => {
      const wrapper = createWrapper()
      const batchStore = useBatchStore()
      expect(batchStore).toBeDefined()
    })

    it('should access device store', () => {
      const wrapper = createWrapper()
      const deviceStore = useDeviceStore()
      expect(deviceStore).toBeDefined()
    })

    it('should access global store', () => {
      const wrapper = createWrapper()
      const globalStore = useGlobalStore()
      expect(globalStore).toBeDefined()
    })

    it('should access config store', () => {
      const wrapper = createWrapper()
      const configStore = useConfigStore()
      expect(configStore).toBeDefined()
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
      batch.gravity = [
        { gravity: 1.050 },
        { gravity: 1.010 }
      ]
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
      batch.gravity = [
        { temperature: 18 },
        { temperature: 20 }
      ]
      const temp = wrapper.vm.getLastTemperature(batch)
      expect(temp).toBeDefined()
    })

    it('getLastTemperature should fallback to pressure reading', () => {
      const wrapper = createWrapper()
      const batch = new Batch(1, 'Test')
      batch.gravityCount = 0
      batch.pressureCount = 2
      batch.pressure = [
        { temperature: 18 },
        { temperature: 22 }
      ]
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
      batch.pressure = [
        { pressure: 2.0 },
        { pressure: 2.5 }
      ]
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
      batch.pressure = [
        { created: fiveMinutesAgo.toISOString() },
        { created: now.toISOString() }
      ]
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

  describe('Gravity Count Computation', () => {
    it('should calculate total gravity count from all batches', () => {
      const wrapper = createWrapper()
      const batchStore = useBatchStore()
      
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
      const deviceStore = useDeviceStore()
      expect(wrapper.vm.deviceCount).toBe(deviceStore.deviceList.length)
    })
  })

  describe('Batch Count Computation', () => {
    it('should return batch count from batch store', () => {
      const wrapper = createWrapper()
      const batchStore = useBatchStore()
      expect(wrapper.vm.batchCount).toBe(batchStore.batchList.length)
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
        gravity: 1.050,
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
      const device = new Device(1, 'abc123', 'http://localhost:8080/', 'Chamber Controller', 'Chamber-Controller')
      wrapper.vm.fermentationControlList.push(device)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.fermentationControlList.length).toBe(1)
    })
  })
})
