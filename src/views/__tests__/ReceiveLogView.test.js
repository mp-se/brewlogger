import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ReceiveLogView from '../ReceiveLogView.vue'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}))

describe('ReceiveLogView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render container', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/receive-log', name: 'receive-log' }]
    })
    const wrapper = mount(ReceiveLogView, {
      global: {
        stubs: { 'router-link': true },
        plugins: [router]
      }
    })
    expect(wrapper.find('.container').exists()).toBe(true)
  })

  it('should render title', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/receive-log', name: 'receive-log' }]
    })
    const wrapper = mount(ReceiveLogView, {
      global: {
        stubs: { 'router-link': true },
        plugins: [router]
      }
    })
    expect(wrapper.find('.h3').exists()).toBe(true)
  })

  it('should initialize properly', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/receive-log', name: 'receive-log' }]
    })
    const wrapper = mount(ReceiveLogView, {
      global: {
        stubs: { 'router-link': true },
        plugins: [router]
      }
    })
    // Component should mount successfully
    expect(wrapper.exists()).toBe(true)
  })
})
