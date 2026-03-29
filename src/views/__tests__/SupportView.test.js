import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SupportView from '../SupportView.vue'
import { useGlobalStore } from '@/modules/globalStore'

describe('SupportView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Mock fetch for SupportView
    global.fetch = vi.fn()
  })

  describe('Basic Rendering', () => {
    it('should render support container', () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ log: [], ble: [] })
        })
      )
      const wrapper = mount(SupportView, {
        global: {
          stubs: {}
        }
      })
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })

    it('should render support title', () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ log: [], ble: [] })
        })
      )
      const wrapper = mount(SupportView, {
        global: {
          stubs: {}
        }
      })
      expect(wrapper.text()).toContain('Support')
    })

    it('should have h3 title class', () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ log: [], ble: [] })
        })
      )
      const wrapper = mount(SupportView)
      const h3 = wrapper.find('.h3')
      expect(h3.exists()).toBe(true)
    })

    it('should render horizontal rule', () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ log: [], ble: [] })
        })
      )
      const wrapper = mount(SupportView)
      const hr = wrapper.findAll('hr')
      expect(hr.length).toBeGreaterThan(0)
    })
  })

  describe('Log Status Section', () => {
    it('should display "Log status" heading', () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ log: [], ble: [] })
        })
      )
      const wrapper = mount(SupportView)
      expect(wrapper.text()).toContain('Log status')
    })

    it('should have h5 class for log status heading', () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ log: [], ble: [] })
        })
      )
      const wrapper = mount(SupportView)
      const h5 = wrapper.findAll('.h5')
      expect(h5.length).toBeGreaterThan(0)
    })

    it('should render pre element for log data', () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ log: [], ble: [] })
        })
      )
      const wrapper = mount(SupportView)
      const preElements = wrapper.findAll('pre')
      expect(preElements.length).toBeGreaterThan(0)
    })
  })

  describe('BLE Status Section', () => {
    it('should display "BLE status" heading', () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ log: [], ble: [] })
        })
      )
      const wrapper = mount(SupportView)
      expect(wrapper.text()).toContain('BLE status')
    })

    it('should have multiple h5 headings', () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ log: [], ble: [] })
        })
      )
      const wrapper = mount(SupportView)
      const h5 = wrapper.findAll('.h5')
      expect(h5.length).toBeGreaterThanOrEqual(2)
    })

    it('should have multiple pre elements for both log and BLE data', () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ log: [], ble: [] })
        })
      )
      const wrapper = mount(SupportView)
      const preElements = wrapper.findAll('pre')
      expect(preElements.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('API Integration', () => {
    it('should make API call on mount', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ log: [], ble: [] })
        })
      )
      const wrapper = mount(SupportView)
      await flushPromises()
      expect(global.fetch).toHaveBeenCalled()
    })

    it('should call self_test API endpoint', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ log: [], ble: [] })
        })
      )
      const wrapper = mount(SupportView)
      await flushPromises()
      const callArgs = global.fetch.mock.calls[0]
      expect(callArgs[0]).toContain('self_test')
    })

    it('should use GET method for API call', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ log: [], ble: [] })
        })
      )
      const wrapper = mount(SupportView)
      await flushPromises()
      const callArgs = global.fetch.mock.calls[0]
      expect(callArgs[1].method).toBe('GET')
    })
  })

  describe('Data Processing', () => {
    it('should handle empty log data', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ log: [], ble: [] })
        })
      )
      const wrapper = mount(SupportView)
      await flushPromises()
      expect(wrapper.vm.logData).toBeDefined()
    })

    it('should handle empty BLE data', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ log: [], ble: [] })
        })
      )
      const wrapper = mount(SupportView)
      await flushPromises()
      expect(wrapper.vm.bleData).toBeDefined()
    })

    it('should display data as JSON', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ log: [], ble: [] })
        })
      )
      const wrapper = mount(SupportView)
      await flushPromises()
      expect(wrapper.text()).toContain('{')
    })
  })

  describe('Layout Structure', () => {
    it('should use container for layout', () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ log: [], ble: [] })
        })
      )
      const wrapper = mount(SupportView)
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })

    it('should have empty paragraph at start', () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ log: [], ble: [] })
        })
      )
      const wrapper = mount(SupportView)
      const paragraphs = wrapper.findAll('p')
      expect(paragraphs.length).toBeGreaterThan(0)
    })
  })
})
