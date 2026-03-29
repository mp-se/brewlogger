import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import TapPourListView from '../TapPourListView.vue'

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

describe('TapPourListView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render container', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/tap/:id/pour', name: 'tap-pour-list' }]
    })
    const wrapper = mount(TapPourListView, {
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
      routes: [{ path: '/tap/:id/pour', name: 'tap-pour-list' }]
    })
    const wrapper = mount(TapPourListView, {
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
      routes: [{ path: '/tap/:id/pour', name: 'tap-pour-list' }]
    })
    const wrapper = mount(TapPourListView, {
      global: {
        stubs: { 'router-link': true },
        plugins: [router]
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
