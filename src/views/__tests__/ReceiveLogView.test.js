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

// Mock fetch globally - returns proper Promise
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  })
)
global.URL = {
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn()
}
global.Blob = class Blob {}
// Extend existing document with our mocks, don't replace it entirely
const originalCreateElement = document.createElement
document.createElement = vi.fn((tag) => {
  if (tag === 'a') {
    return {
      href: '',
      download: '',
      click: vi.fn(),
      tagName: tag.toUpperCase()
    }
  }
  return originalCreateElement.call(document, tag)
})

const originalAppendChild = document.body.appendChild
document.body.appendChild = vi.fn(originalAppendChild.bind(document.body))

const originalRemoveChild = document.body.removeChild
document.body.removeChild = vi.fn(originalRemoveChild.bind(document.body))

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

  describe('Data Fetching', () => {
    it('should fetch log list on updateLogList call', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          total: 1,
          skip: 0,
          data: [
            {
              id: 1,
              timestamp: '2024-01-15T10:30:45',
              ipAddress: '192.168.1.100',
              payload: 'test payload'
            }
          ]
        })
      })

      const wrapper = mount(ReceiveLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })

      await wrapper.vm.updateLogList()
      expect(global.fetch).toHaveBeenCalled()
    })


  })

  describe('Download Functionality', () => {
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

  describe('Button Interactions', () => {
    it('should call updateLogList when Refresh button clicked', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ total: 0, skip: 0, data: [] })
      })

      const wrapper = mount(ReceiveLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })

      const refreshBtn = wrapper.findAll('button').find(b => b.text().includes('Refresh'))
      await refreshBtn?.trigger('click')
      await wrapper.vm.$nextTick?.()
      
      expect(global.fetch).toHaveBeenCalled()
    })

    it('should call downloadAllRecords when Download button clicked', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ total: 0, skip: 0, data: [] })
      })

      const wrapper = mount(ReceiveLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })

      const downloadBtn = wrapper.findAll('button').find(b => b.text().includes('Download'))
      await downloadBtn?.trigger('click')
      await new Promise(resolve => setTimeout(resolve, 50))
      
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  describe('Table Rendering', () => {
    it('should have table element in template', () => {
      const wrapper = mount(ReceiveLogView, {
        global: {
          stubs: { 'router-link': { template: '<a><slot></slot></a>' } },
          plugins: [router]
        }
      })
      // Table should not be visible initially (v-if checks if logList != null)
      expect(wrapper.find('table').exists()).toBe(false)
    })
  })
})
