import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import BatchPressureGraphView from '../BatchPressureGraphView.vue'
import piniaInstance from '@/modules/pinia'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn()
}))

describe('BatchPressureGraphView', () => {
  let router

  beforeEach(() => {
    setActivePinia(piniaInstance)
    vi.clearAllMocks()
    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/batch/:id/pressure/graph', name: 'batch-pressure-graph', component: BatchPressureGraphView }]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Structure', () => {
    it('should render container', () => {
      const wrapper = mount(BatchPressureGraphView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'PressureStatsFragment': true },
          plugins: [router]
        }
      })
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should render page title with placeholder', () => {
      const wrapper = mount(BatchPressureGraphView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'PressureStatsFragment': true },
          plugins: [router]
        }
      })
      expect(wrapper.find('.h3').text()).toContain('Batch Pressure Graph')
    })

    it('should render row and fragments', () => {
      const wrapper = mount(BatchPressureGraphView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'PressureStatsFragment': true },
          plugins: [router]
        }
      })
      expect(wrapper.find('.row').exists()).toBe(true)
    })
  })

  describe('State Initialization', () => {
    it('should initialize with empty batch name', () => {
      const wrapper = mount(BatchPressureGraphView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'PressureStatsFragment': true },
          plugins: [router]
        }
      })
      expect(wrapper.find('.h3').text()).toContain("''")
    })

    it('should initialize with null pressure list', () => {
      const wrapper = mount(BatchPressureGraphView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'PressureStatsFragment': true },
          plugins: [router]
        }
      })
      // Should show back button when no data
      expect(wrapper.find('button').text()).toContain('Batch list')
    })
  })

  describe('Filter Buttons', () => {
    it('should show batch list back button when no data', () => {
      const wrapper = mount(BatchPressureGraphView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'PressureStatsFragment': true },
          plugins: [router]
        }
      })
      // When pressureList is null, it shows a back button in a template v-else
      const buttons = wrapper.findAll('button')
      expect(buttons.find(b => b.text().includes('Batch list'))).toBeDefined()
    })
  })

  describe('Component Methods', () => {
    it('should have filter methods', () => {
      const wrapper = mount(BatchPressureGraphView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'PressureStatsFragment': true },
          plugins: [router]
        }
      })
      expect(typeof wrapper.vm.filter24h).toBe('function')
      expect(typeof wrapper.vm.filter48h).toBe('function')
      expect(typeof wrapper.vm.filter7d).toBe('function')
    })
  })

  describe('Mounting', () => {
    it('should mount without errors', () => {
      const wrapper = mount(BatchPressureGraphView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' }, 'PressureStatsFragment': true },
          plugins: [router]
        }
      })
      expect(wrapper.exists()).toBe(true)
    })
  })
})
