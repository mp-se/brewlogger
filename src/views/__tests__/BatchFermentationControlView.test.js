import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import BatchFermentationControlView from '../BatchFermentationControlView.vue'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn()
}))

describe('BatchFermentationControlView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render container', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/batch/:id/fermentation-control', name: 'batch-fermentation-control' }]
    })
    const wrapper = mount(BatchFermentationControlView, {
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
      routes: [{ path: '/batch/:id/fermentation-control', name: 'batch-fermentation-control' }]
    })
    const wrapper = mount(BatchFermentationControlView, {
      global: {
        stubs: { 'router-link': true },
        plugins: [router]
      }
    })
    expect(wrapper.find('.h3').exists()).toBe(true)
  })
})
