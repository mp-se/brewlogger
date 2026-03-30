import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import BatchGravityListView from '../BatchGravityListView.vue'
import piniaInstance from '@/modules/pinia'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn()
}))

vi.mock('@/modules/ui', () => ({
  sortedIconClass: 'bi-sort-down',
  setSortingDefault: vi.fn(),
  sortedClass: vi.fn(() => 'sorted'),
  sortList: vi.fn(),
  applySortList: vi.fn()
}))

describe('BatchGravityListView', () => {
  let router

  beforeEach(() => {
    setActivePinia(piniaInstance)
    vi.clearAllMocks()
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/batch/:id/gravity/list', name: 'batch-gravity-list', component: BatchGravityListView },
        { path: '/batch/:id', name: 'batch', component: { render: () => null } }
      ]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Structure', () => {
    it('should render gravity list container', () => {
      const wrapper = mount(BatchGravityListView, {
        global: {
          stubs: { 
            'router-link': { template: '<a><slot></slot></a>' },
            'GravityStatsFragment': true,
            'LifeEstimates': true,
            'BsInputDate': true,
            'BsInputNumber': true,
            'BsInputBase': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should render page title with placeholder', () => {
      const wrapper = mount(BatchGravityListView, {
        global: {
          stubs: { 
            'router-link': { template: '<a><slot></slot></a>' },
            'GravityStatsFragment': true,
            'LifeEstimates': true,
            'BsInputDate': true,
            'BsInputNumber': true,
            'BsInputBase': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.find('.h3').text()).toContain('Batch Gravity List')
    })

    it('should render data table', () => {
      const wrapper = mount(BatchGravityListView, {
        global: {
          stubs: { 
            'router-link': { template: '<a><slot></slot></a>' },
            'GravityStatsFragment': true,
            'LifeEstimates': true,
            'BsInputDate': true,
            'BsInputNumber': true,
            'BsInputBase': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.find('table').exists()).toBe(true)
      expect(wrapper.find('thead').exists()).toBe(true)
    })
  })

  describe('State Initialization', () => {
    it('should initialize with empty batch name', () => {
      const wrapper = mount(BatchGravityListView, {
        global: {
          stubs: { 
            'router-link': { template: '<a><slot></slot></a>' },
            'GravityStatsFragment': true,
            'LifeEstimates': true,
            'BsInputDate': true,
            'BsInputNumber': true,
            'BsInputBase': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.find('.h3').text()).toContain("''")
    })

    it('should initialize with null gravity list', () => {
      const wrapper = mount(BatchGravityListView, {
        global: {
          stubs: { 
            'router-link': { template: '<a><slot></slot></a>' },
            'GravityStatsFragment': true,
            'LifeEstimates': true,
            'BsInputDate': true,
            'BsInputNumber': true,
            'BsInputBase': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.findAll('tbody tr').length).toBe(0)
    })
  })

  describe('Filter Controls', () => {
    it('should render apply filter and activate all buttons', () => {
      const wrapper = mount(BatchGravityListView, {
        global: {
          stubs: { 
            'router-link': { template: '<a><slot></slot></a>' },
            'GravityStatsFragment': true,
            'LifeEstimates': true,
            'BsInputDate': true,
            'BsInputNumber': true,
            'BsInputBase': { template: '<div><slot></slot></div>' }
          },
          plugins: [router]
        }
      })
      const buttons = wrapper.findAll('button')
      expect(buttons.find(b => b.text().includes('Apply Filter'))).toBeDefined()
      expect(buttons.find(b => b.text().includes('All active'))).toBeDefined()
    })
  })

  describe('Component Methods', () => {
    it('should have updateGravity, apply, and activateAll methods', () => {
      const wrapper = mount(BatchGravityListView, {
        global: {
          stubs: { 
            'router-link': { template: '<a><slot></slot></a>' },
            'GravityStatsFragment': true,
            'LifeEstimates': true,
            'BsInputDate': true,
            'BsInputNumber': true,
            'BsInputBase': true
          },
          plugins: [router]
        }
      })
      expect(typeof wrapper.vm.updateGravity).toBe('function')
      expect(typeof wrapper.vm.apply).toBe('function')
      expect(typeof wrapper.vm.activateAll).toBe('function')
    })
  })

  describe('Mounting', () => {
    it('should mount without errors', () => {
      const wrapper = mount(BatchGravityListView, {
        global: {
          stubs: { 
            'router-link': { template: '<a><slot></slot></a>' },
            'GravityStatsFragment': true,
            'LifeEstimates': true,
            'BsInputDate': true,
            'BsInputNumber': true,
            'BsInputBase': true
          },
          plugins: [router]
        }
      })
      expect(wrapper.exists()).toBe(true)
    })
  })
})
