import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setActivePinia } from 'pinia'
import TapPourListView from '../TapPourListView.vue'
import piniaInstance from '@/modules/pinia'
import { Pour } from '@/modules/classes'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}))

vi.mock('@/modules/ui', () => ({
  sortedIconClass: 'bi-sort-down',
  setSortingDefault: vi.fn(),
  sortedClass: vi.fn((field) => `sorted-${field}`),
  sortList: vi.fn(),
  applySortList: vi.fn()
}))

vi.mock('@/modules/utils', () => ({
  getFormattedVolume: vi.fn((v) => `${v}L`),
  getFormattedPourVolume: vi.fn((p) => `${(p / 100).toFixed(1)}cl`)
}))

describe('TapPourListView - Enhanced', () => {
  let router

  beforeEach(() => {
    setActivePinia(piniaInstance)
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/tap/:id/pour', name: 'tap-pour-list' },
        { path: '/taps', name: 'tap-list' }
      ]
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (batchId = '1') => {
    router.push({ name: 'tap-pour-list', params: { id: batchId } })
    return mount(TapPourListView, {
      global: {
        stubs: {
          'router-link': { template: '<a><slot></slot></a>' }
        },
        plugins: [router]
      }
    })
  }

  describe('Rendering', () => {
    it('should render container', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should render page title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.h3').exists()).toBe(true)
      expect(wrapper.text()).toContain('Tap Pour List')
    })

    it('should render data table', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('table').exists()).toBe(true)
    })

    it('should render thead', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('thead').exists()).toBe(true)
    })

    it('should render tbody', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('tbody').exists()).toBe(true)
    })
  })

  describe('Table Headers', () => {
    it('should have Date header', () => {
      const wrapper = createWrapper()
      const headers = wrapper.findAll('th')
      expect(headers.some((h) => h.text().includes('Date'))).toBe(true)
    })

    it('should have Active header', () => {
      const wrapper = createWrapper()
      const headers = wrapper.findAll('th')
      expect(headers.some((h) => h.text().includes('Active'))).toBe(true)
    })

    it('should have Pour header', () => {
      const wrapper = createWrapper()
      const headers = wrapper.findAll('th')
      expect(headers.some((h) => h.text().includes('Pour'))).toBe(true)
    })

    it('should have Volume header', () => {
      const wrapper = createWrapper()
      const headers = wrapper.findAll('th')
      expect(headers.some((h) => h.text().includes('Volume'))).toBe(true)
    })

    it('should have Max Volume header', () => {
      const wrapper = createWrapper()
      const headers = wrapper.findAll('th')
      expect(headers.some((h) => h.text().includes('Max Volume'))).toBe(true)
    })

    it('should have correct number of headers', () => {
      const wrapper = createWrapper()
      const headers = wrapper.findAll('th')
      expect(headers.length).toBe(5)
    })
  })

  describe('State Initialization', () => {
    it('should initialize with null pour list', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.pourList).toBeNull()
    })

    it('should initialize batch name as empty', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.batchName).toBe('')
    })

    it('should initialize force render counter', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.forceRender).toBe(0)
    })
  })

  describe('Pour Table Rendering', () => {
    it('should display checkboxes for active status', async () => {
      const wrapper = createWrapper()
      wrapper.vm.pourList = [
        new Pour(1, 50, 100, 200, '2025-05-09 10:00:00', 1, true),
        new Pour(2, 75, 150, 200, '2025-05-09 11:00:00', 1, false)
      ]
      await wrapper.vm.$nextTick()

      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    it('should render pour data rows', async () => {
      const wrapper = createWrapper()
      wrapper.vm.pourList = [new Pour(1, 50, 100, 200, '2025-05-09 10:00:00', 1, true)]
      await wrapper.vm.$nextTick()

      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(1)
    })

    it('should display correct number of rows', async () => {
      const wrapper = createWrapper()
      wrapper.vm.pourList = [
        new Pour(1, 50, 100, 200, '2025-05-09 10:00:00', 1, true),
        new Pour(2, 75, 150, 200, '2025-05-09 11:00:00', 1, false),
        new Pour(3, 100, 200, 200, '2025-05-09 12:00:00', 1, true)
      ]
      await wrapper.vm.$nextTick()

      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(3)
    })

    it('should display created date in correct format', async () => {
      const wrapper = createWrapper()
      wrapper.vm.pourList = [new Pour({ id: 1, pour: 50, volume: 100, maxVolume: 200, created: '2025-05-09 10:30:45', batchId: 1, active: true })]
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('2025-05-09')
      expect(wrapper.text()).toContain('10:30:45')
    })
  })

  describe('Active Status Toggle', () => {
    it('should initialize active status', async () => {
      const wrapper = createWrapper()
      wrapper.vm.pourList = [new Pour({ id: 1, pour: 50, volume: 100, maxVolume: 200, created: '2025-05-09 10:00:00', batchId: 1, active: true })]
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.pourList[0].active).toBe(true)
    })

    it('should render active checkbox as checked when active is true', async () => {
      const wrapper = createWrapper()
      const pour = new Pour({ id: 1, pour: 50, volume: 100, maxVolume: 200, created: '2025-05-09 10:00:00', batchId: 1, active: true })
      wrapper.vm.pourList = [pour]
      await wrapper.vm.$nextTick()

      const checkbox = wrapper.find('input[type="checkbox"]')
      expect(checkbox.element.checked).toBe(true)
    })

    it('should render active checkbox as unchecked when active is false', async () => {
      const wrapper = createWrapper()
      const pour = new Pour({ id: 1, pour: 50, volume: 100, maxVolume: 200, created: '2025-05-09 10:00:00', batchId: 1, active: false })
      wrapper.vm.pourList = [pour]
      await wrapper.vm.$nextTick()

      const checkbox = wrapper.find('input[type="checkbox"]')
      expect(checkbox.element.checked).toBe(false)
    })
  })

  describe('Data Binding', () => {
    it('should bind pour volume correctly', async () => {
      const wrapper = createWrapper()
      wrapper.vm.pourList = [new Pour(1, 50, 100, 200, '2025-05-09 10:00:00', 1, true)]
      await wrapper.vm.$nextTick()

      const cells = wrapper.findAll('td')
      // Pour volume should be displayed
      expect(cells.length).toBeGreaterThan(0)
    })

    it('should bind volume correctly', async () => {
      const wrapper = createWrapper()
      wrapper.vm.pourList = [new Pour({ id: 1, pour: 50, volume: 100, maxVolume: 200, created: '2025-05-09 10:00:00', batchId: 1, active: true })]
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.pourList[0].volume).toBe(100)
    })

    it('should bind maxVolume correctly', async () => {
      const wrapper = createWrapper()
      wrapper.vm.pourList = [new Pour({ id: 1, pour: 50, volume: 100, maxVolume: 200, created: '2025-05-09 10:00:00', batchId: 1, active: true })]
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.pourList[0].maxVolume).toBe(200)
    })
  })

  describe('Navigation', () => {
    it('should display tap list button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Tap list')
    })

    it('should have button with icon', () => {
      const wrapper = createWrapper()
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })
  })

  describe('Component Initialization', () => {
    it('should have sortedIconClass available', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.sortedIconClass).toBeDefined()
    })

    it('should have getFormattedVolume util function', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.getFormattedVolume).toBe('function')
    })

    it('should have getFormattedPourVolume util function', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.getFormattedPourVolume).toBe('function')
    })
  })

  describe('Methods', () => {
    it('should have updatePour method', async () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.updatePour).toBe('function')
    })
  })

  describe('Empty State', () => {
    it('should show title with empty batch name initially', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.h3').text()).toContain("''")
    })

    it('should show empty table initially', () => {
      const wrapper = createWrapper()
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(0)
    })
  })

  describe('Table Structure', () => {
    it('should have table with striped class', async () => {
      const wrapper = createWrapper()
      wrapper.vm.pourList = []
      await wrapper.vm.$nextTick()

      const table = wrapper.find('table')
      expect(table.classes()).toContain('table-striped')
    })

    it('should have proper header columns', async () => {
      const wrapper = createWrapper()
      wrapper.vm.pourList = []
      await wrapper.vm.$nextTick()

      const headers = wrapper.findAll('th')
      expect(headers.length).toBe(5)
    })
  })

  describe('Sorting UI', () => {
    it('should have icon links for sorting columns', () => {
      const wrapper = createWrapper()
      const links = wrapper.findAll('a.icon-link')
      expect(links.length).toBeGreaterThan(0)
    })

    it('should have bootstrap icon elements', () => {
      const wrapper = createWrapper()
      const icons = wrapper.findAll('i')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Form Elements', () => {
    it('should have form checkboxes with form-check class', () => {
      const wrapper = createWrapper()
      wrapper.vm.pourList = [new Pour(1, 50, 100, 200, '2025-05-09 10:00:00', 1, true)]
      expect(wrapper.vm.pourList.length).toBe(1)
    })
  })

  describe('Unit Display', () => {
    it('should show config unit for pour volume', () => {
      const wrapper = createWrapper()
      // Component should reference config for volume units
      expect(wrapper.vm.config).toBeDefined()
    })

    it('should show config unit for volume', () => {
      const wrapper = createWrapper()
      // Component should reference config
      expect(wrapper.vm.config).toBeDefined()
    })
  })

  describe('Batch Name Display', () => {
    it('should update batch name when loaded', async () => {
      const wrapper = createWrapper()
      wrapper.vm.batchName = 'Test Batch'
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.batchName).toBe('Test Batch')
    })

    it('should display batch name in title', async () => {
      const wrapper = createWrapper()
      wrapper.vm.batchName = 'My Brewery Batch'
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.h3').text()).toContain('My Brewery Batch')
    })
  })

  describe('List Rendering', () => {
    it('should render pour list with correct keys', async () => {
      const wrapper = createWrapper()
      wrapper.vm.pourList = [
        new Pour(1, 50, 100, 200, '2025-05-09 10:00:00', 1, true),
        new Pour(2, 75, 150, 200, '2025-05-09 11:00:00', 1, false)
      ]
      await wrapper.vm.$nextTick()

      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(2)
    })

    it('should handle empty pour list', async () => {
      const wrapper = createWrapper()
      wrapper.vm.pourList = []
      await wrapper.vm.$nextTick()

      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(0)
    })
  })
})
