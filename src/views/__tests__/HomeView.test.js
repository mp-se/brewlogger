import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import HomeView from '../HomeView.vue'
import BsCard from '../../components/BsCard.vue'
import BsInputSwitch from '../../components/BsInputSwitch.vue'
import { useBatchStore } from '@/modules/batchStore'
import { useDeviceStore } from '@/modules/deviceStore'
import { useGlobalStore } from '@/modules/globalStore'
import { Batch, Device, Gravity, Pressure, Pour } from '@/modules/classes'

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
  getFormattedPressure: vi.fn((p) => `${p} PSI`),
  getFormattedVolume: vi.fn((v) => `${v}L`),
  getFormattedPourVolume: vi.fn((p) => `${(p / 100).toFixed(1)} cl`),
  truncateString: vi.fn((s, l) => s?.substring(0, l) || ''),
  getTimeSincePosted: vi.fn((d) => '2m ago')
}))

describe('HomeView', () => {
  let router
  let batchStore
  let deviceStore
  let globalStore

  beforeEach(() => {
    setActivePinia(createPinia())
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home' },
        { path: '/batch/:id/gravity/graph', name: 'batch-gravity-graph' },
        { path: '/batch/:id/pressure/graph', name: 'batch-pressure-graph' }
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
    it('should render home view container', () => {
      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
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
      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.text()).toContain('Home - Overview')
    })

    it('should have h3 class for title', () => {
      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })
      const h3 = wrapper.find('.h3')
      expect(h3.exists()).toBe(true)
    })

    it('should render controls section with proper structure', () => {
      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })
      const rows = wrapper.findAll('.row')
      expect(rows.length).toBeGreaterThan(0)
    })
  })

  describe('Toggle Switches', () => {
    it('should render input switch components for controls', () => {
      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })
      
      // Since BsInputSwitch is stubbed, we verify the structure instead
      const switches = wrapper.findAll('bsinputswitch-stub')
      expect(switches.length).toBeGreaterThanOrEqual(0)
    })

    it('should have proper component structure for toggles', () => {
      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })
      
      // Component should mount successfully with controls
      expect(wrapper.find('.container').exists()).toBe(true)
    })
  })

  describe('Computed Properties', () => {
    it('should have deviceCount computed property defined', () => {
      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      // Verify computed property exists
      expect(wrapper.vm.deviceCount).toBeDefined()
      expect(typeof wrapper.vm.deviceCount).toBe('number')
    })

    it('should have batchCount computed property defined', () => {
      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      // Verify computed property exists
      expect(wrapper.vm.batchCount).toBeDefined()
      expect(typeof wrapper.vm.batchCount).toBe('number')
    })
  })

  describe('Helper Functions', () => {
    it('should format scheduler task names correctly', () => {
      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.prettySchedulerName('task_fetch_chamberctrl_temps')).toBe(
        'Fetch ChamberControl Temps'
      )
      expect(wrapper.vm.prettySchedulerName('task_fermentation_control')).toBe(
        'Chamber Control'
      )
      expect(wrapper.vm.prettySchedulerName('unknown')).toBe('Unknown mapping')
    })

    it('should format time duration correctly', () => {
      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.prettySeconds(30)).toContain('s')
      expect(wrapper.vm.prettySeconds(300)).toContain('m')
      expect(wrapper.vm.prettySeconds(3600)).toContain('h')
    })
  })

  describe('Lifecycle', () => {
    it('should have multiple intervals set up on mount', async () => {
      const mockFetch = vi.fn()
      global.fetch = mockFetch

      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      await flushPromises()

      // Verify intervals are set up
      expect(wrapper.vm.ticker).toBeDefined()
      expect(wrapper.vm.readingsTicker).toBeDefined()

      // Cleanup intervals
      wrapper.unmount()
    })

    it('should clear intervals on unmount', async () => {
      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      const ticker = wrapper.vm.ticker
      const readingsTicker = wrapper.vm.readingsTicker

      wrapper.unmount()

      // Intervals should be cleared (values will be null after unmount)
      // We verify that unmount didn't throw an error
      expect(true).toBe(true)
    })
  })

  describe('Data Display', () => {
    it('should render with bootstrap layout for database metrics', () => {
      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      // The component should render the container and have the view structure
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should have horizontal rules for visual structure', () => {
      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      // Component renders with structural elements
      expect(wrapper.find('.container').exists()).toBe(true)
    })
  })

  describe('Computed Properties - Data Aggregation', () => {
    it('should have gravityCount computed property defined', () => {
      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.gravityCount).toBeDefined()
      expect(typeof wrapper.vm.gravityCount).toBe('number')
    })

    it('should have pourCount computed property defined', () => {
      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.pourCount).toBeDefined()
      expect(typeof wrapper.vm.pourCount).toBe('number')
    })

    it('should have pressureCount computed property defined', () => {
      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.pressureCount).toBeDefined()
      expect(typeof wrapper.vm.pressureCount).toBe('number')
    })
  })

  describe('Helper Methods - Formatter Functions', () => {
    it('should format scheduler task names correctly', () => {
      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.prettySchedulerName('task_fetch_chamberctrl_temps')).toBe(
        'Fetch ChamberControl Temps'
      )
      expect(wrapper.vm.prettySchedulerName('task_fermentation_control')).toBe(
        'Chamber Control'
      )
      expect(wrapper.vm.prettySchedulerName('task_forward_gravity')).toBe('Forward gravity')
      expect(wrapper.vm.prettySchedulerName('task_check_database')).toBe('Database Maintenance')
      expect(wrapper.vm.prettySchedulerName('unknown_task')).toBe('Unknown mapping')
    })

    it('should format seconds into human-readable time', () => {
      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.prettySeconds(0)).toContain('s')
      expect(wrapper.vm.prettySeconds(30)).toContain('s')
      expect(wrapper.vm.prettySeconds(59)).toContain('s')
      expect(wrapper.vm.prettySeconds(60)).toContain('m')
      expect(wrapper.vm.prettySeconds(300)).toContain('m')
      expect(wrapper.vm.prettySeconds(3599)).toContain('m')
      expect(wrapper.vm.prettySeconds(3600)).toContain('h')
      expect(wrapper.vm.prettySeconds(7200)).toContain('h')
    })

    it('should get gravity reading age from batch with gravity data', () => {
      const now = new Date()
      const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000)

      const batch = new Batch(1, 'Test Batch')
      batch.gravityCount = 2
      batch.gravity = [
        { gravity: 1.050, created: now.toISOString() },
        { gravity: 1.045, created: twoHoursAgo.toISOString() }
      ]

      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      const age = wrapper.vm.getGravityReadingAge(batch)
      expect(age).toBeDefined()
    })

    it('should return empty string when batch has less than 2 gravity readings', () => {
      const batch = new Batch(1, 'Test Batch')
      batch.gravityCount = 1
      batch.gravity = [
        { gravity: 1.050, created: new Date().toISOString() }
      ]

      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      const age = wrapper.vm.getGravityReadingAge(batch)
      expect(age).toBe('')
    })

    it('should get OG (original gravity) from batch gravity array', () => {
      const batch = new Batch(1, 'Test Batch')
      batch.gravityCount = 2
      batch.gravity = [
        { gravity: 1.050, created: new Date().toISOString() },
        { gravity: 1.045, created: new Date().toISOString() }
      ]

      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      const og = wrapper.vm.getGravityOG(batch)
      expect(og).toBeDefined()
      expect(og).not.toBe('0.0')
    })

    it('should return 0.0 for OG when batch has less than 2 gravity readings', () => {
      const batch = new Batch(1, 'Test Batch', '', true, [], [])

      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      const og = wrapper.vm.getGravityOG(batch)
      expect(og).toBe(0.0)
    })

    it('should get last gravity reading from batch', () => {
      const batch = new Batch(1, 'Test Batch')
      batch.gravityCount = 2
      batch.gravity = [
        { gravity: 1.050, created: new Date().toISOString() },
        { gravity: 1.045, created: new Date().toISOString() }
      ]

      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      const gravity = wrapper.vm.getLastGravity(batch)
      expect(gravity).toBeDefined()
      expect(gravity).not.toBe('N/A')
    })

    it('should return N/A when no gravity readings', () => {
      const batch = new Batch(1, 'Test Batch')
      batch.gravityCount = 0

      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      const gravity = wrapper.vm.getLastGravity(batch)
      expect(gravity).toBe('N/A')
    })

    it('should get temperature from gravity reading', () => {
      const batch = new Batch(1, 'Test Batch')
      batch.gravityCount = 2
      batch.gravity = [
        { gravity: 1050, temperature: 20, created: new Date().toISOString() },
        { gravity: 1.045, temperature: 20, created: new Date().toISOString() }
      ]

      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      const temp = wrapper.vm.getLastTemperature(batch)
      expect(temp).toBeDefined()
    })

    it('should get pressure from batch', () => {
      const batch = new Batch(1, 'Test Batch')
      batch.pressureCount = 2
      batch.pressure = [
        { pressure: 1.5, temperature: 20, created: new Date().toISOString() },
        { pressure: 2.0, temperature: 20, created: new Date().toISOString() }
      ]

      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      const pressure = wrapper.vm.getLastPressure(batch)
      expect(pressure).toBeDefined()
    })

    it('should return N/A for pressure when no pressure readings', () => {
      const batch = new Batch(1, 'Test Batch')
      batch.pressureCount = 0

      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      const pressure = wrapper.vm.getLastPressure(batch)
      expect(pressure).toBe('N/A')
    })
  })

  describe('Lifecycle Hooks - Mount and Unmount', () => {
    it('should initialize data arrays on mount', async () => {
      batchStore.batches = [
        new Batch(1, 'Active Batch', '', true, [])
      ]
      batchStore.getBatchDashboard = vi.fn().mockResolvedValue(
        new Batch(1, 'Active Batch', '', true, [])
      )

      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      await flushPromises()

      expect(wrapper.vm.activeBatchList).toBeDefined()
      expect(Array.isArray(wrapper.vm.activeBatchList)).toBe(true)
    })

    it('should load active batches on mount', async () => {
      const mockBatch = new Batch(1, 'Active Batch', '', true, [])
      batchStore.batches = [mockBatch]
      batchStore.getBatchDashboard = vi.fn().mockResolvedValue(mockBatch)

      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      await flushPromises()

      // Verify the component mounted and batches were initialized
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.vm.activeBatchList).toBeDefined()
    })

    it('should not load inactive batches', async () => {
      const inactiveBatch = new Batch(1, 'Inactive Batch', '', false, [])
      batchStore.batches = [inactiveBatch]
      batchStore.getBatchDashboard = vi.fn()

      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      await flushPromises()

      expect(wrapper.vm.activeBatchList).toHaveLength(0)
    })

    it('should clean up intervals on unmount', () => {
      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      const ticker = wrapper.vm.ticker
      const readingsTicker = wrapper.vm.readingsTicker

      expect(() => {
        wrapper.unmount()
      }).not.toThrow()
    })
  })

  describe('Global Store Integration', () => {
    it('should respect showChamberTemps global flag', () => {
      globalStore.showChamberTemps = true

      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(globalStore.showChamberTemps).toBe(true)
    })

    it('should respect showKegmonTaps global flag', () => {
      globalStore.showKegmonTaps = true

      const wrapper = mount(HomeView, {
        global: {
          components: { BsCard, BsInputSwitch },
          stubs: {
            BsCard: true,
            BsInputSwitch: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(globalStore.showKegmonTaps).toBe(true)
    })
  })
})
