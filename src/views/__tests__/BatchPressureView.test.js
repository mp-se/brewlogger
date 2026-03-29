import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import BatchPressureView from '../BatchPressureView.vue'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn()
}))

describe('BatchPressureView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render container', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/batch/:id/pressure', name: 'batch-pressure' }]
    })
    const wrapper = mount(BatchPressureView, {
      global: {
        stubs: { 
          'router-link': true,
          PressureStatsFragment: true
        },
        plugins: [router]
      }
    })
    expect(wrapper.find('.container').exists()).toBe(true)
  })

  it('should render page title', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/batch/:id/pressure', name: 'batch-pressure' }]
    })
    const wrapper = mount(BatchPressureView, {
      global: {
        stubs: { 
          'router-link': true,
          PressureStatsFragment: true
        },
        plugins: [router]
      }
    })
    expect(wrapper.find('.h3').exists()).toBe(true)
  })
})
