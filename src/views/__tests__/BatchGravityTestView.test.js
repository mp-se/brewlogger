import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import BatchGravityTestView from '../BatchGravityTestView.vue'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn()
}))

describe('BatchGravityTestView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render container', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', name: 'home' }]
    })
    const wrapper = mount(BatchGravityTestView, {
      global: {
        stubs: { 'router-link': true },
        plugins: [router]
      }
    })
    expect(wrapper.find('.container').exists()).toBe(true)
  })

  it('should render page title', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', name: 'home' }]
    })
    const wrapper = mount(BatchGravityTestView, {
      global: {
        stubs: { 'router-link': true },
        plugins: [router]
      }
    })
    expect(wrapper.find('.h3').exists()).toBe(true)
  })
})
