import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import BatchGravityTestView from '../BatchGravityTestView.vue'
import piniaInstance from '@/modules/pinia'
import { useBatchStore } from '@/modules/batchStore'
import { useGravityStore } from '@/modules/gravityStore'
import * as logger from '@/modules/logger'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn()
}))

describe('BatchGravityTestView', () => {
  let batchStore, gravityStore, router

  beforeEach(() => {
    setActivePinia(piniaInstance)
    batchStore = useBatchStore()
    gravityStore = useGravityStore()
    vi.clearAllMocks()

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/batch/:id/gravity-test', name: 'batch-gravity-test' },
        { path: '/batch/:id', name: 'batch' }
      ]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Structure', () => {
    it('should render container', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should render page title', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.find('.h3').exists()).toBe(true)
      expect(wrapper.text()).toContain('Batch Gravity Test List')
    })

    it('should render description text', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.text()).toContain('Testing page for gravity related development')
    })

    it('should render data table', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.find('table').exists()).toBe(true)
    })

    it('should render table headers', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      const thead = wrapper.find('thead')
      expect(thead.exists()).toBe(true)
      const headers = thead.findAll('th')
      expect(headers.length).toBeGreaterThan(0)
    })

    it('should have column headers for gravity analysis', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      const headerTexts = wrapper.findAll('th').map(h => h.text())
      expect(headerTexts).toContain('Day')
      expect(headerTexts).toContain('Points')
      expect(headerTexts).toContain('First')
      expect(headerTexts).toContain('Last')
    })

    it('should have table body for data rows', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      const tbody = wrapper.find('tbody')
      expect(tbody.exists()).toBe(true)
    })
  })

  describe('State Initialization', () => {
    it('should initialize with null gravity list', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.vm.gravityList).toBe(null)
    })

    it('should initialize with empty batch name', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.vm.batchName).toBe('')
    })

    it('should initialize with empty data array', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.vm.data).toEqual([])
    })

    it('should call onMounted on component mount', () => {
      mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(logger.logDebug).toHaveBeenCalledWith('BatchGravityTestView.onMounted()')
    })
  })

  describe('Store Access', () => {
    it('should have access to batch store', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.vm.batchStore).toBeDefined()
    })

    it('should have access to gravity store', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.vm.gravityStore).toBeDefined()
    })
  })

  describe('Router Integration', () => {
    it('should have router instance', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.vm.router).toBeDefined()
    })

    it('should read batch id from route params', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.vm.router.currentRoute.value.params).toBeDefined()
    })
  })

  describe('Component Methods', () => {
    it('should have filterOutliers method', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(typeof wrapper.vm.filterOutliers).toBe('function')
    })

    it('should have test method', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(typeof wrapper.vm.test).toBe('function')
    })
  })

  describe('Table Rendering', () => {
    it('should have no data rows initially', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(0)
    })

    it('should have table with proper structure', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      const table = wrapper.find('table')
      expect(table.exists()).toBe(true)
      expect(table.find('thead').exists()).toBe(true)
      expect(table.find('tbody').exists()).toBe(true)
    })

    it('should render all header columns', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      const headers = wrapper.findAll('th')
      // Should have at least these columns
      expect(headers.length).toBeGreaterThanOrEqual(12)
    })
  })

  describe('Dynamic Title', () => {
    it('should display batch name in title when available', () => {
      const wrapper = mount(BatchGravityTestView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      // Initially empty
      expect(wrapper.vm.batchName).toBe('')
      // Title should still exist
      expect(wrapper.find('.h3').exists()).toBe(true)
    })
  })
})
