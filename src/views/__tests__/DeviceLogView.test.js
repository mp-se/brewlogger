import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import DeviceLogView from '../DeviceLogView.vue'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}))

describe('DeviceLogView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render container', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/device/log/:id', name: 'device-log' }]
    })
    const wrapper = mount(DeviceLogView, {
      global: {
        stubs: { 'router-link': true },
        plugins: [router]
      }
    })
    expect(wrapper.find('.container').exists()).toBe(true)
  })

  it('should initialize properly', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/device/log/:id', name: 'device-log' }]
    })
    const wrapper = mount(DeviceLogView, {
      global: {
        stubs: { 'router-link': true },
        plugins: [router]
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
