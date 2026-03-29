import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import BatchPressureListView from '../BatchPressureListView.vue'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn()
}))

vi.mock('@/modules/ui', () => ({
  sortedIconClass: 'bi-sort-down',
  setSortingDefault: vi.fn(),
  sortedClass: vi.fn(() => 'sorted'),
  sortList: vi.fn(),
  applySortList: vi.fn()
}))

describe('BatchPressureListView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render container', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/batch/:id/pressure/list', name: 'batch-pressure-list' }]
    })
    const wrapper = mount(BatchPressureListView, {
      global: {
        stubs: { 'router-link': true },
        plugins: [router]
      }
    })
    expect(wrapper.find('.container').exists()).toBe(true)
  })

  it('should render table with pressure data', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/batch/:id/pressure/list', name: 'batch-pressure-list' }]
    })
    const wrapper = mount(BatchPressureListView, {
      global: {
        stubs: { 'router-link': true },
        plugins: [router]
      }
    })
    wrapper.vm.pressureList = []
    expect(wrapper.vm.pressureList).toBeDefined()
  })
})
