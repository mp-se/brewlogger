import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ReceiveLogView from '../ReceiveLogView.vue'
import piniaInstance from '@/modules/pinia'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}))

describe('ReceiveLogView', () => {
  let router

  beforeEach(() => {
    setActivePinia(piniaInstance)
    vi.clearAllMocks()
    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/receive-log', name: 'receive-log', component: ReceiveLogView }]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Structure', () => {
    it('should render container', () => {
      const wrapper = mount(ReceiveLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should render page title', () => {
      const wrapper = mount(ReceiveLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.find('.h3').text()).toContain('Receive log')
    })

    it('should render horizontal rule', () => {
      const wrapper = mount(ReceiveLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.find('hr').exists()).toBe(true)
    })

    it('should have proper Bootstrap grid classes', () => {
      const wrapper = mount(ReceiveLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.find('.row').exists()).toBe(true)
      expect(wrapper.find('.col-md-10').exists()).toBe(true)
    })
  })

  describe('State Initialization', () => {
    it('should initialize logList as null', () => {
      const wrapper = mount(ReceiveLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.find('table').exists()).toBe(false)
    })

    it('should initialize total and skip as 0', () => {
      const wrapper = mount(ReceiveLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.text()).toContain('Total log entries: 0')
    })
  })

  describe('Buttons and Actions', () => {
    it('should render Refresh button', () => {
      const wrapper = mount(ReceiveLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      const buttons = wrapper.findAll('button')
      const refreshBtn = buttons.find(b => b.text().includes('Refresh'))
      expect(refreshBtn.exists()).toBe(true)
      expect(refreshBtn.classes()).toContain('btn-secondary')
    })

    it('should render Download button', () => {
      const wrapper = mount(ReceiveLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      const buttons = wrapper.findAll('button')
      const downloadBtn = buttons.find(b => b.text().includes('Download'))
      expect(downloadBtn.exists()).toBe(true)
      expect(downloadBtn.classes()).toContain('btn-primary')
    })
  })

  describe('Component Methods', () => {
    it('should have updateLogList method', () => {
      const wrapper = mount(ReceiveLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(typeof wrapper.vm.updateLogList).toBe('function')
    })

    it('should have downloadAllRecords method', () => {
      const wrapper = mount(ReceiveLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(typeof wrapper.vm.downloadAllRecords).toBe('function')
    })
  })

  describe('Conditional Rendering', () => {
    it('should show table only when logList has data', async () => {
      const wrapper = mount(ReceiveLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.find('table').exists()).toBe(false)
    })
  })

  describe('Mounting', () => {
    it('should mount without errors', () => {
      const wrapper = mount(ReceiveLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      expect(wrapper.exists()).toBe(true)
    })
  })
})
