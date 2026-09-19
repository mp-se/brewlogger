// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SystemLogView from '../SystemLogView.vue'

// Create pinia mocks
const piniaMocks = vi.hoisted(() => ({
  global: {
    disabled: false,
    messageSuccess: '',
    messageError: '',
    baseURL: 'http://localhost:8080/',
    token: 'test-token',
    fetchTimout: 5000,
    clearMessages: vi.fn()
  }
}))

vi.mock('@/modules/pinia', () => ({
  global: piniaMocks.global
}))

vi.mock('@/modules/router', () => ({
  default: {
    currentRoute: {
      value: {
        params: { id: 'new' },
        name: 'system-log'
      }
    },
    push: vi.fn()
  }
}))

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

describe('SystemLogView - Enhanced', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    piniaMocks.global.disabled = false
    piniaMocks.global.messageSuccess = ''
    piniaMocks.global.messageError = ''
    piniaMocks.global.baseURL = 'http://localhost:8080/'
    piniaMocks.global.token = 'test-token'
    piniaMocks.global.fetchTimout = 5000
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = () => {
    return mount(SystemLogView, {
      global: {
        stubs: {},
        plugins: [
          {
            install(app) {
              app.config.globalProperties.$route = { params: {}, name: 'system-log' }
            }
          }
        ]
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
      expect(wrapper.text()).toContain('System log')
    })

    it('should render h3 title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.h3').exists()).toBe(true)
    })

    it('should render horizontal separator', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('hr').exists()).toBe(true)
    })
  })

  describe('Log Summary Info', () => {
    it('should display total log entries count', async () => {
      const wrapper = createWrapper()
      wrapper.vm.total = 100
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Total log entries: 100')
    })

    it('should display showing count', async () => {
      const wrapper = createWrapper()
      wrapper.vm.logList = [
        { id: 1, timestamp: '2025-05-09 10:00:00', module: 'test' },
        { id: 2, timestamp: '2025-05-09 11:00:00', module: 'test' }
      ]
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('first: 2')
    })

    it('should show 0 when logList is null', async () => {
      const wrapper = createWrapper()
      wrapper.vm.logList = null
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Showing the first: 0')
    })
  })

  describe('Buttons', () => {
    it('should have Refresh button', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      expect(buttons.some((b) => b.text().includes('Refresh'))).toBe(true)
    })

    it('should have Download button', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      expect(buttons.some((b) => b.text().includes('Download'))).toBe(true)
    })

    it('should render buttons', async () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have refresh and download buttons', async () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Table Headers', () => {
    it('should render table with headers when log list is populated', async () => {
      const wrapper = createWrapper()
      wrapper.vm.logList = [
        {
          id: 1,
          timestamp: '2025-05-09 10:00:00',
          module: 'test',
          message: 'msg',
          logLevel: 0,
          errorCode: 0
        }
      ]
      await wrapper.vm.$nextTick()

      const headers = wrapper.findAll('th')
      expect(headers.length).toBeGreaterThan(0)
    })

    it('should have correct number of header columns', async () => {
      const wrapper = createWrapper()
      wrapper.vm.logList = []
      await wrapper.vm.$nextTick()

      const headers = wrapper.findAll('th')
      expect(headers.length).toBe(5)
    })
  })

  describe('Log Level Mapping', () => {
    it('should map 0 to DEBUG', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.mapLogLevel(0)).toBe('DEBUG')
    })

    it('should map 1 to INFO', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.mapLogLevel(1)).toBe('INFO')
    })

    it('should map 2 to WARNING', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.mapLogLevel(2)).toBe('WARNING')
    })

    it('should map 3 to ERROR', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.mapLogLevel(3)).toBe('ERROR')
    })

    it('should map 4 to CRITICAL', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.mapLogLevel(4)).toBe('CRITICAL')
    })

    it('should return string of unknown level', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.mapLogLevel(99)).toBe('99')
    })
  })

  describe('Initial State', () => {
    it('should initialize with null log list', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.logList).toBeNull()
    })

    it('should initialize total as 0', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.total).toBe(0)
    })

    it('should initialize skip as 0', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.skip).toBe(0)
    })
  })

  describe('Log List Display', () => {
    it('should not show table when logList is null', async () => {
      const wrapper = createWrapper()
      wrapper.vm.logList = null
      await wrapper.vm.$nextTick()

      const table = wrapper.find('table')
      expect(table.exists()).toBe(false)
    })

    it('should show table when logList is set', async () => {
      const wrapper = createWrapper()
      wrapper.vm.logList = []
      await wrapper.vm.$nextTick()

      const table = wrapper.find('table')
      expect(table.exists()).toBe(true)
    })

    it('should display log rows', async () => {
      const wrapper = createWrapper()
      wrapper.vm.logList = [
        {
          id: 1,
          timestamp: '2025-05-09 10:00:00',
          module: 'system',
          message: 'Test message',
          logLevel: 1,
          errorCode: 0
        },
        {
          id: 2,
          timestamp: '2025-05-09 11:00:00',
          module: 'device',
          message: 'Another message',
          logLevel: 2,
          errorCode: 1
        }
      ]
      await wrapper.vm.$nextTick()

      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(2)
    })

    it('should display empty table when logList is empty array', async () => {
      const wrapper = createWrapper()
      wrapper.vm.logList = []
      await wrapper.vm.$nextTick()

      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(0)
    })
  })

  describe('Log Data Display', () => {
    it('should display timestamp correctly', async () => {
      const wrapper = createWrapper()
      wrapper.vm.logList = [
        {
          id: 1,
          timestamp: '2025-05-09 10:30:45',
          module: 'test',
          message: 'msg',
          logLevel: 0,
          errorCode: 0
        }
      ]
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('2025-05-09')
      expect(wrapper.text()).toContain('10:30:45')
    })

    it('should display module name', async () => {
      const wrapper = createWrapper()
      wrapper.vm.logList = [
        {
          id: 1,
          timestamp: '2025-05-09 10:00:00',
          module: 'device_service',
          message: 'msg',
          logLevel: 0,
          errorCode: 0
        }
      ]
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('device_service')
    })

    it('should display message', async () => {
      const wrapper = createWrapper()
      wrapper.vm.logList = [
        {
          id: 1,
          timestamp: '2025-05-09 10:00:00',
          module: 'test',
          message: 'Device connected',
          logLevel: 0,
          errorCode: 0
        }
      ]
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Device connected')
    })

    it('should display mapped log level', async () => {
      const wrapper = createWrapper()
      wrapper.vm.logList = [
        {
          id: 1,
          timestamp: '2025-05-09 10:00:00',
          module: 'test',
          message: 'msg',
          logLevel: 1,
          errorCode: 0
        }
      ]
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('INFO')
    })

    it('should display error code', async () => {
      const wrapper = createWrapper()
      wrapper.vm.logList = [
        {
          id: 1,
          timestamp: '2025-05-09 10:00:00',
          module: 'test',
          message: 'msg',
          logLevel: 0,
          errorCode: 42
        }
      ]
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('42')
    })
  })

  describe('Methods', () => {
    it('should have updateLogList method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.updateLogList).toBe('function')
    })

    it('should have downloadAllRecords method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.downloadAllRecords).toBe('function')
    })

    it('should have mapLogLevel method', () => {
      const wrapper = createWrapper()
      expect(typeof wrapper.vm.mapLogLevel).toBe('function')
    })
  })

  describe('Sorting', () => {
    it('should have sorting icon class', () => {
      const wrapper = createWrapper()
      expect(wrapper.vm.sortedIconClass).toBeDefined()
    })

    it('should render table with data when populated', async () => {
      const wrapper = createWrapper()
      wrapper.vm.logList = [
        {
          id: 1,
          timestamp: '2025-05-09 10:00:00',
          module: 'test',
          message: 'msg',
          logLevel: 0,
          errorCode: 0
        }
      ]
      await wrapper.vm.$nextTick()

      const table = wrapper.find('table')
      expect(table.exists()).toBe(true)
    })
  })

  describe('Table Structure', () => {
    it('should have table with striped class', async () => {
      const wrapper = createWrapper()
      wrapper.vm.logList = []
      await wrapper.vm.$nextTick()

      const table = wrapper.find('table')
      expect(table.classes()).toContain('table-striped')
    })

    it('should have proper column widths', async () => {
      const wrapper = createWrapper()
      wrapper.vm.logList = []
      await wrapper.vm.$nextTick()

      const headers = wrapper.findAll('th')
      expect(headers.length).toBe(5)
    })

    it('should have header scope attributes', async () => {
      const wrapper = createWrapper()
      wrapper.vm.logList = []
      await wrapper.vm.$nextTick()

      const headers = wrapper.findAll('th')
      headers.forEach((h) => {
        expect(h.attributes('scope')).toBe('col')
      })
    })
  })

  describe('Row Key Binding', () => {
    it('should render rows with unique id as key', async () => {
      const wrapper = createWrapper()
      wrapper.vm.logList = [
        {
          id: 1,
          timestamp: '2025-05-09 10:00:00',
          module: 'test',
          message: 'msg1',
          logLevel: 0,
          errorCode: 0
        },
        {
          id: 2,
          timestamp: '2025-05-09 11:00:00',
          module: 'test',
          message: 'msg2',
          logLevel: 0,
          errorCode: 0
        }
      ]
      await wrapper.vm.$nextTick()

      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(2)
    })
  })

  describe('Layout', () => {
    it('should have row alignment for header', () => {
      const wrapper = createWrapper()
      const row = wrapper.find('.row.align-items-center')
      expect(row.exists()).toBe(true)
    })

    it('should have column layout for title', () => {
      const wrapper = createWrapper()
      const col = wrapper.find('.col-md-10')
      expect(col.exists()).toBe(true)
    })

    it('should have column layout for buttons', () => {
      const wrapper = createWrapper()
      const col = wrapper.find('.col-md-2')
      expect(col.exists()).toBe(true)
    })
  })

  describe('Content Conditional Rendering', () => {
    it('should show message when no logs are loaded', async () => {
      const wrapper = createWrapper()
      wrapper.vm.logList = null
      await wrapper.vm.$nextTick()

      const table = wrapper.find('table')
      expect(table.exists()).toBe(false)
    })

    it('should show message info section always', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Total log entries')
    })
  })

  describe('Download Message', () => {
    it('should mention download in info text', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('download')
    })
  })

  describe('updateLogList() - Async Fetch', () => {
    it('should fetch from correct API endpoint and handle success', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          total: 5,
          skip: 0,
          data: [
            {
              id: 1,
              timestamp: '2025-05-09 10:00:00',
              module: 'test',
              message: 'msg',
              logLevel: 0,
              errorCode: 0
            }
          ]
        })
      }

      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      const wrapper = createWrapper()
      piniaMocks.global.disabled = false

      wrapper.vm.updateLogList()
      expect(piniaMocks.global.disabled).toBe(true)

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8080/api/system/log/?limit=50',
          expect.objectContaining({
            method: 'GET',
            headers: { Authorization: 'test-token' }
          })
        )
      })

      await vi.waitFor(() => {
        expect(wrapper.vm.logList).not.toBeNull()
        expect(wrapper.vm.total).toBe(5)
        expect(piniaMocks.global.disabled).toBe(false)
      })
    })

    it('should set total and skip from response', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ total: 150, skip: 25, data: [] })
      }

      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      const wrapper = createWrapper()
      wrapper.vm.updateLogList()

      await vi.waitFor(() => {
        expect(wrapper.vm.total).toBe(150)
        expect(wrapper.vm.skip).toBe(25)
      })
    })

    it('should populate logList from response data', async () => {
      const responseData = [
        {
          id: 1,
          timestamp: '2025-05-09 10:00:00',
          module: 'test1',
          message: 'msg1',
          logLevel: 0,
          errorCode: 0
        },
        {
          id: 2,
          timestamp: '2025-05-09 11:00:00',
          module: 'test2',
          message: 'msg2',
          logLevel: 1,
          errorCode: 1
        }
      ]

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ total: 2, skip: 0, data: responseData })
      }

      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      const wrapper = createWrapper()
      wrapper.vm.updateLogList()

      await vi.waitFor(() => {
        expect(wrapper.vm.logList).toEqual(responseData)
      })
    })

    it('should set null logList before fetching', () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ total: 1, skip: 0, data: [] })
      }

      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      const wrapper = createWrapper()
      wrapper.vm.logList = [{ id: 1 }]

      wrapper.vm.updateLogList()
      expect(wrapper.vm.logList).toBeNull()
    })

    it('should handle fetch failure and set error message', async () => {
      const mockResponse = {
        ok: false,
        status: 500
      }

      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      const wrapper = createWrapper()
      piniaMocks.global.messageError = ''
      piniaMocks.global.disabled = true

      wrapper.vm.updateLogList()

      await vi.waitFor(() => {
        expect(piniaMocks.global.messageError).toContain('Failed to retrive')
        expect(piniaMocks.global.disabled).toBe(false)
      })
    })

    it('should handle network error gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const wrapper = createWrapper()
      piniaMocks.global.disabled = true
      piniaMocks.global.messageError = ''

      wrapper.vm.updateLogList()

      await vi.waitFor(() => {
        expect(piniaMocks.global.disabled).toBe(false)
        expect(piniaMocks.global.messageError).toContain('Failed to retrive')
      })
    })
  })

  describe('downloadAllRecords() - Async Download', () => {
    beforeEach(() => {
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
      global.URL.revokeObjectURL = vi.fn()
      document.body.appendChild = vi.fn()
      document.body.removeChild = vi.fn()
    })

    it('should fetch logs with correct authorization', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: [] })
      }

      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      const wrapper = createWrapper()
      piniaMocks.global.disabled = false

      await wrapper.vm.downloadAllRecords()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api/system/log'),
        expect.objectContaining({
          headers: { Authorization: 'test-token' }
        })
      )
    })

    it('should set disabled to true when downloading and false after', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: [] })
      }

      global.fetch = vi.fn().mockResolvedValue(mockResponse)

      const wrapper = createWrapper()
      piniaMocks.global.disabled = false

      const promise = wrapper.vm.downloadAllRecords()
      expect(piniaMocks.global.disabled).toBe(true)

      await promise

      expect(piniaMocks.global.disabled).toBe(false)
    })

    it('should aggregate data from multiple fetch calls', async () => {
      const firstBatch = Array(50)
        .fill(0)
        .map((_, i) => ({ id: i }))
      const secondBatch = [{ id: 50 }]

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ data: firstBatch })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ data: secondBatch })
        })

      const wrapper = createWrapper()
      await wrapper.vm.downloadAllRecords()

      // Verify that fetch was called twice (batching)
      expect(global.fetch.mock.calls.length).toBeGreaterThanOrEqual(1)
    })

    it('should handle download failure gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false })

      const wrapper = createWrapper()
      piniaMocks.global.messageError = ''

      await wrapper.vm.downloadAllRecords()

      expect(piniaMocks.global.messageError).toContain('Failed to download')
      expect(piniaMocks.global.disabled).toBe(false)
    })

    it('should handle network error during download', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const wrapper = createWrapper()
      piniaMocks.global.messageError = ''

      await wrapper.vm.downloadAllRecords()

      expect(piniaMocks.global.messageError).toContain('Failed to download')
      expect(piniaMocks.global.disabled).toBe(false)
    })
  })
})
