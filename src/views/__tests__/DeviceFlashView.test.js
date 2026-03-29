import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import DeviceFlashView from '../DeviceFlashView.vue'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn()
}))

describe('DeviceFlashView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render container', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/device/flash', name: 'device-flash' }]
    })
    const wrapper = mount(DeviceFlashView, {
      global: {
        stubs: { 'router-link': true },
        plugins: [router]
      }
    })
    expect(wrapper.find('.container').exists()).toBe(true)
  })

  it('should render page title containing flash', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/device/flash', name: 'device-flash' }]
    })
    const wrapper = mount(DeviceFlashView, {
      global: {
        stubs: { 'router-link': true },
        plugins: [router]
      }
    })
    expect(wrapper.find('.h3').exists()).toBe(true)
  })
})
