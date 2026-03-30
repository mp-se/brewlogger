import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import BatchPressureListView from '../BatchPressureListView.vue'
import piniaInstance from '@/modules/pinia'
import { useBatchStore } from '@/modules/batchStore'
import { usePressureStore } from '@/modules/pressureStore'
import { useConfigStore } from '@/modules/configStore'
import { useGlobalStore } from '@/modules/globalStore'
import * as logger from '@/modules/logger'
import * as ui from '@/modules/ui'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn()
}))

vi.mock('@/modules/ui', () => ({
  sortedIconClass: 'bi-sort-down',
  setSortingDefault: vi.fn(),
  sortedClass: vi.fn(() => 'sorted'),
  sortList: vi.fn(() => []),
  applySortList: vi.fn()
}))

describe('BatchPressureListView', () => {
  let batchStore, pressureStore, configStore, globalStore, router

  beforeEach(() => {
    setActivePinia(piniaInstance)
    batchStore = useBatchStore()
    pressureStore = usePressureStore()
    configStore = useConfigStore()
    globalStore = useGlobalStore()
    vi.clearAllMocks()

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/batch/:id/pressure/list', name: 'batch-pressure-list' },
        { path: '/batch/:id', name: 'batch' }
      ]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Structure', () => {
    it('should render container', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should render page title', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      expect(wrapper.find('.h3').exists()).toBe(true)
      expect(wrapper.text()).toContain('Batch Pressure List')
    })

    it('should render data table', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      expect(wrapper.find('table').exists()).toBe(true)
    })

    it('should render table headers', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      const thead = wrapper.find('thead')
      expect(thead.exists()).toBe(true)
      const headers = thead.findAll('th')
      expect(headers.length).toBeGreaterThan(0)
    })

    it('should have filter input components', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      expect(wrapper.findAllComponents({ name: 'BsInputDate' }).length).toBeGreaterThan(0)
    })

    it('should have filter and sort buttons', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('State Initialization', () => {
    it('should initialize with null pressure list', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      expect(wrapper.vm.pressureList).toBe(null)
    })

    it('should initialize with empty batch name', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      expect(wrapper.vm.batchName).toBe('')
    })

    it('should initialize filter dates as null', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      expect(wrapper.vm.infoFirstDay).toBe(null)
      expect(wrapper.vm.infoLastDay).toBe(null)
    })

    it('should call onMounted on component mount', () => {
      mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      expect(logger.logDebug).toHaveBeenCalledWith('BatchPressureListView.onMounted()')
    })
  })

  describe('Store Access', () => {
    it('should have access to batch store', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      expect(wrapper.vm.batchStore).toBeDefined()
    })

    it('should have access to pressure store', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      expect(wrapper.vm.pressureStore).toBeDefined()
    })

    it('should have access to config store', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      expect(wrapper.vm.config).toBeDefined()
    })

    it('should have access to global store', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      expect(wrapper.vm.global).toBeDefined()
    })
  })

  describe('Router Integration', () => {
    it('should have router instance', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      expect(wrapper.vm.router).toBeDefined()
    })

    it('should read batch id from route params', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      expect(wrapper.vm.router.currentRoute.value.params).toBeDefined()
    })
  })

  describe('Component Methods', () => {
    it('should have apply method', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      expect(typeof wrapper.vm.apply).toBe('function')
    })

    it('should have activateAll method', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      expect(typeof wrapper.vm.activateAll).toBe('function')
    })

    it('should have sortList method', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      expect(typeof wrapper.vm.sortList).toBe('function')
    })

    it('should have sortedClass method', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      expect(typeof wrapper.vm.sortedClass).toBe('function')
    })
  })

  describe('Table Rendering', () => {
    it('should have no data rows initially', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(0)
    })

    it('should have table body for data', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      expect(wrapper.find('tbody').exists()).toBe(true)
    })

    it('should have column headers for pressure analysis', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      const headerTexts = wrapper.findAll('th').map(h => h.text().toLowerCase())
      // Check for key columns (may vary by config)
      expect(headerTexts.some(h => h.includes('date') || h.includes('pressure'))).toBe(true)
    })

    it('should have proper table class', () => {
      const wrapper = mount(BatchPressureListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'BsInputDate': true, 'BsInputBase': true },
          plugins: [router]
        }
      })
      const table = wrapper.find('table')
      expect(table.classes()).toContain('table')
    })
  })
})
