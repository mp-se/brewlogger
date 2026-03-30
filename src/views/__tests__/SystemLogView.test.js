import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import SystemLogView from '../SystemLogView.vue'
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

describe('SystemLogView', () => {
  let router

  beforeEach(() => {
    setActivePinia(piniaInstance)
    vi.clearAllMocks()
    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/system-log', name: 'system-log', component: SystemLogView }]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Structure', () => {
    it('should render container', () => {
      const wrapper = mount(SystemLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should render page title', () => {
      const wrapper = mount(SystemLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.find('.h3').text()).toContain('System log')
    })

    it('should render horizontal rule', () => {
      const wrapper = mount(SystemLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.find('hr').exists()).toBe(true)
    })
  })

  describe('State Initialization', () => {
    it('should initialize with 0 total entries', () => {
      const wrapper = mount(SystemLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.text()).toContain('Total log entries: 0')
    })

    it('should not show table initially', () => {
      const wrapper = mount(SystemLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.find('table').exists()).toBe(false)
    })
  })

  describe('Buttons and Actions', () => {
    it('should render Refresh button', () => {
      const wrapper = mount(SystemLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      const buttons = wrapper.findAll('button')
      const refreshBtn = buttons.find(b => b.text().includes('Refresh'))
      expect(refreshBtn.exists()).toBe(true)
    })

    it('should render Download button', () => {
      const wrapper = mount(SystemLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      const buttons = wrapper.findAll('button')
      const downloadBtn = buttons.find(b => b.text().includes('Download'))
      expect(downloadBtn.exists()).toBe(true)
    })
  })

  describe('Component Methods', () => {
    it('should have updateLogList method', () => {
      const wrapper = mount(SystemLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(typeof wrapper.vm.updateLogList).toBe('function')
    })

    it('should have mapLogLevel method', () => {
      const wrapper = mount(SystemLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(typeof wrapper.vm.mapLogLevel).toBe('function')
      expect(wrapper.vm.mapLogLevel(0)).toBe('DEBUG')
      expect(wrapper.vm.mapLogLevel(3)).toBe('ERROR')
      expect(wrapper.vm.mapLogLevel(99)).toBe('99')
    })
  })

  describe('Mounting', () => {
    it('should mount without errors', () => {
      const wrapper = mount(SystemLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.exists()).toBe(true)
    })
  })
})
