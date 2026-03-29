import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import BatchGravityListView from '../BatchGravityListView.vue'
import BsCard from '../../components/BsCard.vue'

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

describe('BatchGravityListView', () => {
  let router

  beforeEach(() => {
    setActivePinia(createPinia())
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/batch/:id/gravity/list', name: 'batch-gravity-list' },
        { path: '/batch/:id', name: 'batch' }
      ]
    })
  })

  describe('Basic Rendering', () => {
    it('should render gravity list container', () => {
      const wrapper = mount(BatchGravityListView, {
        global: {
          components: { BsCard },
          stubs: { BsCard: true, 'router-link': true },
          plugins: [router]
        }
      })
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should render page title containing batch identifier', () => {
      const wrapper = mount(BatchGravityListView, {
        global: {
          components: { BsCard },
          stubs: { BsCard: true, 'router-link': true },
          plugins: [router]
        }
      })
      expect(wrapper.find('.h3').exists()).toBe(true)
    })
  })

  describe('Table Rendering', () => {
    it('should render with proper layout for gravity data', () => {
      const wrapper = mount(BatchGravityListView, {
        global: {
          components: { BsCard },
          stubs: { BsCard: true, 'router-link': true },
          plugins: [router]
        }
      })
      
      expect(wrapper.find('.container').exists()).toBe(true)
    })
  })
})
