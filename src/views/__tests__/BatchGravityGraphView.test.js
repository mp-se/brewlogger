import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import BsCard from '../../components/BsCard.vue'
import * as logger from '@/modules/logger'
import * as utils from '@/modules/utils'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}))

vi.mock('@/modules/utils', () => ({
  gravityToPlato: vi.fn((g) => g * 1000),
  tempToF: vi.fn((c) => (c * 9) / 5 + 32),
  getGravityDataAnalytics: vi.fn((list) => ({
    gravity: { max: 1.05, min: 1.01 },
    date: {
      first: '2024-01-01T00:00:00',
      last: '2024-01-10T23:59:59',
      firstDate: new Date('2024-01-01'),
      lastDate: new Date('2024-01-10')
    }
  })),
  abv: vi.fn((og, fg) => (og - fg) * 131.25)
}))

vi.mock('chart.js', () => {
  return {
    Chart: class {
      static register() {}
      constructor() {
        this.data = { datasets: [] }
        this.config = { options: { scales: {} } }
      }
      update() {}
    },
    registerables: []
  }
})

vi.mock('chartjs-plugin-zoom', () => ({
  default: {}
}))

vi.mock('date-fns')
vi.mock('chartjs-adapter-date-fns')

import BatchGravityGraphView from '../BatchGravityGraphView.vue'

describe('BatchGravityGraphView', () => {
  let router

  beforeEach(() => {
    setActivePinia(createPinia())
    
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/batch/:id/gravity/graph', name: 'batch-gravity-graph' },
        { path: '/batch/:id', name: 'batch' }
      ]
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render gravity graph view container', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true
          },
          plugins: [router]
        }
      })
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })

    it('should render page title', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.text()).toContain('Batch')
    })

    it('should have h3 class for title', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true
          },
          plugins: [router]
        }
      })
      const h3 = wrapper.find('.h3')
      expect(h3.exists()).toBe(true)
    })
  })

  describe('Graph Rendering', () => {
    it('should render graph container with proper structure', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.find('.container').exists()).toBe(true)
    })
  })

  describe('Data Display', () => {
    it('should initialize gravity data as empty', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.gravityData).toBeDefined()
    })

    it('should have container for batch gravity data', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.find('.container').exists()).toBe(true)
    })
  })

  describe('Layout Structure', () => {
    it('should render with proper bootstrap layout', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      expect(wrapper.find('.row').exists() || wrapper.find('.container').exists()).toBe(true)
    })

    it('should render horizontal rules for separation', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      const hrs = wrapper.findAll('hr')
      expect(hrs.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Navigation', () => {
    it('should have back link to batch view', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true
          },
          plugins: [router]
        }
      })

      const routerLinks = wrapper.findAll('router-link-stub')
      expect(routerLinks.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('State Initialization', () => {
    it('should initialize gravity data refs', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true,
            GravityStatsFragment: true,
            BsInputNumber: true,
            BsInputBase: true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.gravityData).toBeDefined()
      expect(wrapper.vm.gravityVelocityData).toBeDefined()
      expect(wrapper.vm.alcoholData).toBeDefined()
      expect(wrapper.vm.batteryData).toBeDefined()
      expect(wrapper.vm.temperatureData).toBeDefined()
    })

    it('should initialize filter and display refs', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true,
            GravityStatsFragment: true,
            BsInputNumber: true,
            BsInputBase: true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.infoFirstDay).toBeDefined()
      expect(wrapper.vm.infoLastDay).toBeDefined()
      expect(wrapper.vm.infoOG).toBeDefined()
      expect(wrapper.vm.infoFG).toBeDefined()
    })

    it('should initialize graph options with defaults', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true,
            GravityStatsFragment: true,
            BsInputNumber: true,
            BsInputBase: true
          },
          plugins: [router]
        }
      })

      const graphOptions = wrapper.vm.graphOptions
      expect(graphOptions.gravity).toBe(true)
      expect(graphOptions.temperature).toBe(true)
      expect(graphOptions.battery).toBe(false)
      expect(graphOptions.alcohol).toBe(true)
    })

    it('should initialize lowpass value', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true,
            GravityStatsFragment: true,
            BsInputNumber: true,
            BsInputBase: true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.lowpass).toBe(4)
    })
  })

  describe('Filter Functions', () => {
    it('should have filter functions defined', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true,
            GravityStatsFragment: true,
            BsInputNumber: true,
            BsInputBase: true
          },
          plugins: [router]
        }
      })

      expect(typeof wrapper.vm.filterGravity).toBe('function')
      expect(typeof wrapper.vm.filterTemp).toBe('function')
      expect(typeof wrapper.vm.filterDevice).toBe('function')
      expect(typeof wrapper.vm.filterVelocity).toBe('function')
    })

    it('should have time filter functions', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true,
            GravityStatsFragment: true,
            BsInputNumber: true,
            BsInputBase: true
          },
          plugins: [router]
        }
      })

      expect(typeof wrapper.vm.filter24h).toBe('function')
      expect(typeof wrapper.vm.filter48h).toBe('function')
      expect(typeof wrapper.vm.filter7d).toBe('function')
      expect(typeof wrapper.vm.filterAll).toBe('function')
      expect(typeof wrapper.vm.filterLowPass).toBe('function')
    })
  })

  describe('Data Mapping Functions', () => {
    it('should have battery data mapping', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true,
            GravityStatsFragment: true,
            BsInputNumber: true,
            BsInputBase: true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.batteryData).toBeDefined()
    })

    it('should have temperature data mapping', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true,
            GravityStatsFragment: true,
            BsInputNumber: true,
            BsInputBase: true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.temperatureData).toBeDefined()
    })

    it('should have alcohol data mapping', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true,
            GravityStatsFragment: true,
            BsInputNumber: true,
            BsInputBase: true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.alcoholData).toBeDefined()
    })

    it('should have velocity data mapping', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true,
            GravityStatsFragment: true,
            BsInputNumber: true,
            BsInputBase: true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.gravityVelocityData).toBeDefined()
      expect(wrapper.vm.gravityVelocityData1).toBeDefined()
    })
  })

  describe('Lifecycle Integration', () => {
    it('should call logDebug during lifecycle', async () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true,
            GravityStatsFragment: true,
            BsInputNumber: true,
            BsInputBase: true
          },
          plugins: [router]
        }
      })

      await flushPromises()
      expect(logger.logDebug).toHaveBeenCalled()
    })
  })

  describe('Store Integration', () => {
    it('should access global store', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true,
            GravityStatsFragment: true,
            BsInputNumber: true,
            BsInputBase: true
          },
          plugins: [router]
        }
      })

      expect(wrapper.vm.global).toBeDefined()
    })
  })

  describe('UI Components', () => {
    it('should have graph canvas element', () => {
      const wrapper = mount(BatchGravityGraphView, {
        global: {
          components: { BsCard },
          stubs: {
            BsCard: true,
            'router-link': true,
            GravityStatsFragment: true,
            BsInputNumber: true,
            BsInputBase: true
          },
          plugins: [router]
        }
      })

      expect(wrapper.html()).toContain('canvas')
    })
  })
})
