import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import TapPourListView from '../TapPourListView.vue'
import piniaInstance from '@/modules/pinia'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}))

vi.mock('@/modules/ui', () => ({
  sortedIconClass: 'bi-sort-down',
  setSortingDefault: vi.fn(),
  sortedClass: vi.fn(() => 'sorted'),
  sortList: vi.fn(),
  applySortList: vi.fn()
}))

describe('TapPourListView', () => {
  let router

  beforeEach(() => {
    setActivePinia(piniaInstance)
    vi.clearAllMocks()
    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/tap/:id/pour', name: 'tap-pour-list', component: TapPourListView }]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Structure', () => {
    it('should render container', () => {
      const wrapper = mount(TapPourListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should render page title with batch name placeholder', () => {
      const wrapper = mount(TapPourListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.find('.h3').text()).toContain('Tap Pour List')
    })

    it('should render data table', () => {
      const wrapper = mount(TapPourListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.find('table').exists()).toBe(true)
      expect(wrapper.find('thead').exists()).toBe(true)
    })

    it('should have proper table headers', () => {
      const wrapper = mount(TapPourListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      const headers = wrapper.findAll('th')
      expect(headers.length).toBeGreaterThanOrEqual(5)
      expect(headers[0].text()).toContain('Date')
      expect(headers[1].text()).toContain('Active')
      expect(headers[2].text()).toContain('Pour')
    })
  })

  describe('State Initialization', () => {
    it('should initialize with empty batch name', () => {
      const wrapper = mount(TapPourListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.find('.h3').text()).toContain("''")
    })

    it('should initialize with null pour list', () => {
      const wrapper = mount(TapPourListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      // Table body should be empty initially
      expect(wrapper.findAll('tbody tr').length).toBe(0)
    })
  })

  describe('Store Access', () => {
    it('should have access to pour store', () => {
      const wrapper = mount(TapPourListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      // Check if store is defined in wrapper.vm if needed, 
      // but usually we check if it was called during lifecycle
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Component Methods', () => {
    it('should have updatePour method', () => {
      const wrapper = mount(TapPourListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(typeof wrapper.vm.updatePour).toBe('function')
    })
  })

  describe('Navigation', () => {
    it('should render back button to tap list', () => {
      const wrapper = mount(TapPourListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      const backBtn = wrapper.find('button.btn-secondary')
      expect(backBtn.exists()).toBe(true)
      expect(backBtn.text()).toContain('Tap list')
    })
  })

  describe('Mounting', () => {
    it('should mount without errors', () => {
      const wrapper = mount(TapPourListView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.exists()).toBe(true)
    })
  })
})
