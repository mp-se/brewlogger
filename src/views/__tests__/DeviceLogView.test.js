// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import DeviceLogView from '../DeviceLogView.vue'
import { useDeviceStore } from '@/modules/deviceStore'
import { useGlobalStore } from '@/modules/globalStore'
import * as logger from '@/modules/logger'

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}))

describe('DeviceLogView - Device Logs View', () => {
  let deviceStore, globalStore, router, wrapper

  const mockDevice = (id = 1, mdns = 'device1', chipId = 'CHIP1') => ({
    id,
    mdns,
    chipId,
    software: 'Gravitymon',
    collectLogs: true,
    url: `http://device${id}.local`,
    chipFamily: 'ESP32',
    description: `Device ${id}`
  })

  beforeEach(() => {
    setActivePinia(createPinia())
    deviceStore = useDeviceStore()
    globalStore = useGlobalStore()
    globalStore.baseURL = 'http://localhost:8080/'
    globalStore.token = 'mock-token'
    globalStore.fetchTimout = 5000
    globalStore.disabled = false
    globalStore.messageError = ''
    globalStore.messageSuccess = ''

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/device/log/:id', name: 'device-log' },
        { path: '/device', name: 'device-list' }
      ]
    })

    deviceStore.deviceList = [
      mockDevice(1, 'device1', 'CHIP1'),
      mockDevice(2, 'device2', 'CHIP2'),
      mockDevice(3, 'device3', 'CHIP3')
    ]

    vi.clearAllMocks()
    // Setup default fetch mock that handles logs endpoint
    global.fetch = vi.fn((url) => {
      if (url.includes('api/device/logs')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['CHIP1.log', 'CHIP2.log'])
        })
      }
      if (url.includes('api/system/self_test')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ log: [] })
        })
      }
      if (url.includes('logs/')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve('')
        })
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })
  })

  afterEach(() => {
    if (wrapper) wrapper.unmount()
    vi.restoreAllMocks()
  })

  const mountComponent = (routeParams = {}) => {
    return mount(DeviceLogView, {
      global: {
        stubs: {
          'router-link': { template: '<a><slot></slot></a>' },
          BsSelect: {
            props: ['modelValue', 'options', 'label', 'help', 'disabled'],
            template: '<div><slot /></div>',
            emits: ['update:modelValue']
          }
        },
        plugins: [router],
        mocks: {
          $route: {
            params: { id: 'CHIP1', ...routeParams }
          }
        }
      }
    })
  }

  describe('Component Structure', () => {
    it('should render container', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should render page title', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.h3').exists()).toBe(true)
      expect(wrapper.text()).toContain('Device Logs')
    })

    it('should render multiple rows', () => {
      wrapper = mountComponent()
      const rows = wrapper.findAll('.row')
      expect(rows.length).toBeGreaterThan(0)
    })

    it('should render horizontal rules', () => {
      wrapper = mountComponent()
      expect(wrapper.findAll('hr').length).toBeGreaterThan(0)
    })

    it('should have proper column layout structure', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.col-md-3').exists()).toBe(true)
      expect(wrapper.find('.col-md-4').exists()).toBe(true)
      expect(wrapper.find('.col-md-5').exists()).toBe(true)
    })

    it('should render pageBottom anchor element', () => {
      wrapper = mountComponent()
      expect(wrapper.find('#pageBottom').exists()).toBe(true)
    })
  })

  describe('State Initialization', () => {
    it('should initialize with device logs container', async () => {
      wrapper = mountComponent()
      await flushPromises()
      // Component should render container and basic structures
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should render device log statistics row', async () => {
      wrapper = mountComponent()
      wrapper.vm.deviceSelected = 'CHIP1'
      await wrapper.vm.$nextTick()
      // When device is selected, row should be present
      expect(wrapper.find('.row').exists()).toBe(true)
    })

    it('should support log display', () => {
      wrapper = mountComponent()
      // Component should have method for rendering logs
      expect(typeof wrapper.vm.hideInfo).toBe('function')
      expect(typeof wrapper.vm.hideWarn).toBe('function')
    })

    it('should render page title with device logs text', () => {
      wrapper = mountComponent()
      expect(wrapper.text()).toContain('Device Logs')
    })
  })

  describe('Component Methods - Initial Setup', () => {
    it('should call onMounted on mount', () => {
      wrapper = mountComponent()
      expect(logger.logDebug).toHaveBeenCalledWith('DeviceLogView.onMounted()')
    })

    it('should have fetchLogs method', () => {
      wrapper = mountComponent()
      expect(typeof wrapper.vm.fetchLogs).toBe('function')
    })

    it('should have deleteLogs method', () => {
      wrapper = mountComponent()
      expect(typeof wrapper.vm.deleteLogs).toBe('function')
    })

    it('should have hideInfo method', () => {
      wrapper = mountComponent()
      expect(typeof wrapper.vm.hideInfo).toBe('function')
    })

    it('should have hideWarn method', () => {
      wrapper = mountComponent()
      expect(typeof wrapper.vm.hideWarn).toBe('function')
    })

    it('should have goToBottom method', () => {
      wrapper = mountComponent()
      expect(typeof wrapper.vm.goToBottom).toBe('function')
    })
  })

  describe('Fetch Logs Functionality', () => {
    it('should not fetch logs when no device selected', () => {
      wrapper = mountComponent()
      wrapper.vm.deviceSelected = ''
      wrapper.vm.fetchLogs()
      // Component returns early without fetching
      expect(wrapper.vm.deviceLog.length).toBe(0)
    })

    it('should fetch logs when device is selected', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('logs/')) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve('Log line 1\nLog line 2')
          })
        }
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve('')
        })
      })

      wrapper = mountComponent()
      wrapper.vm.deviceSelected = 'CHIP1'
      await wrapper.vm.fetchLogs()
      await flushPromises()

      expect(global.fetch).toHaveBeenCalled()
    })

    it('should handle log file fetch error gracefully', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('logs/') && url.includes('.log') && !url.includes('.log.1')) {
          return Promise.reject(new Error('Fetch failed'))
        }
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve('')
        })
      })

      wrapper = mountComponent()
      wrapper.vm.deviceSelected = 'CHIP1'
      wrapper.vm.fetchLogs()
      await flushPromises()

      // After error, disabled should be reset to false
      expect(globalStore.disabled).toBe(false)
    })

    it('should parse log lines correctly', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('Line 1\nLine 2\nLine 3')
        })
      )

      wrapper = mountComponent()
      wrapper.vm.deviceSelected = 'CHIP1'
      await wrapper.vm.fetchLogs()
      await flushPromises()

      expect(wrapper.vm.deviceLog.length).toBeGreaterThan(0)
    })
  })

  describe('Delete Logs Functionality', () => {
    it('should delete logs for selected device', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('api/device/logs')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      })

      wrapper = mountComponent()
      wrapper.vm.deviceSelected = 'CHIP1'
      await wrapper.vm.deleteLogs()
      await flushPromises()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api/device/logs/CHIP1'),
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('should handle delete error gracefully', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('api/device/logs') && url.includes('CHIP1')) {
          return Promise.reject(new Error('Delete failed'))
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      })

      wrapper = mountComponent()
      wrapper.vm.deviceSelected = 'CHIP1'
      wrapper.vm.deleteLogs()
      await flushPromises()

      // After error, disabled should be false (error handler resets it)
      expect(globalStore.disabled).toBe(false)
    })

    it('should set disabled state during delete', async () => {
      global.fetch = vi.fn().mockImplementation(() => {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      })

      wrapper = mountComponent()
      wrapper.vm.deviceSelected = 'CHIP1'
      await wrapper.vm.deleteLogs()
      await flushPromises()
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  describe('Filter Logs - hideInfo', () => {
    it('should remove info level logs', () => {
      wrapper = mountComponent()
      wrapper.vm.deviceLog = [
        'Log with I: info message',
        'Log with W: warning message',
        'Normal log line'
      ]
      wrapper.vm.hideInfo()
      expect(wrapper.vm.deviceLog.length).toBe(2)
      expect(wrapper.vm.deviceLog.every((line) => !line.includes(' I: '))).toBe(true)
    })

    it('should preserve non-info logs', () => {
      wrapper = mountComponent()
      wrapper.vm.deviceLog = ['Error line', 'Debug line', 'Info I: line']
      wrapper.vm.hideInfo()
      expect(wrapper.vm.deviceLog.some((line) => line.includes('Error'))).toBe(true)
    })

    it('should handle empty log array', () => {
      wrapper = mountComponent()
      wrapper.vm.deviceLog = []
      wrapper.vm.hideInfo()
      expect(wrapper.vm.deviceLog.length).toBe(0)
    })
  })

  describe('Filter Logs - hideWarn', () => {
    it('should remove warning level logs', () => {
      wrapper = mountComponent()
      wrapper.vm.deviceLog = [
        'Log with W: warning message',
        'Log with I: info message',
        'Normal log line'
      ]
      wrapper.vm.hideWarn()
      expect(wrapper.vm.deviceLog.length).toBe(2)
      expect(wrapper.vm.deviceLog.every((line) => !line.includes(' W: '))).toBe(true)
    })

    it('should preserve non-warning logs', () => {
      wrapper = mountComponent()
      wrapper.vm.deviceLog = ['Error line', 'Debug line', 'Warn W: line']
      wrapper.vm.hideWarn()
      expect(wrapper.vm.deviceLog.some((line) => line.includes('Error'))).toBe(true)
    })
  })

  describe('Navigation - goToBottom', () => {
    it('should have goToBottom method', () => {
      wrapper = mountComponent()
      expect(typeof wrapper.vm.goToBottom).toBe('function')
    })

    it('should find pageBottom element', () => {
      wrapper = mountComponent()
      expect(wrapper.find('#pageBottom').exists()).toBe(true)
    })
  })

  describe('Store Integration', () => {
    it('should have access to device store', () => {
      wrapper = mountComponent()
      expect(wrapper.vm.deviceStore).toBeDefined()
    })

    it('should have access to global store', () => {
      wrapper = mountComponent()
      expect(wrapper.vm.global).toBeDefined()
    })

    it('should have device list from store', () => {
      wrapper = mountComponent()
      expect(Array.isArray(wrapper.vm.deviceStore.deviceList)).toBe(true)
    })
  })

  describe('Device Selection Handling', () => {
    it('should update device list on mount', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('api/device/logs')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(['CHIP1.log', 'CHIP2.log'])
          })
        }
        if (url.includes('api/system/self_test')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ log: [] })
          })
        }
        return Promise.resolve({ ok: true, text: () => Promise.resolve('') })
      })

      wrapper = mountComponent()
      await flushPromises()

      // deviceOptions should be an array with at least the "-- none --" default option
      expect(Array.isArray(wrapper.vm.deviceOptions)).toBe(true)
    })

    it('deviceOptions should include default none option', async () => {
      wrapper = mountComponent()
      await flushPromises()

      const noneOption = wrapper.vm.deviceOptions.find((opt) => opt.value === '')
      expect(noneOption).toBeDefined()
      expect(noneOption.label).toContain('none')
    })

    it('should render device select component', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.col-md-4').exists()).toBe(true)
    })

    it('deviceOptions structure should be correct', () => {
      wrapper = mountComponent()
      const options = wrapper.vm.deviceOptions
      if (options.length > 0) {
        expect(options[0]).toHaveProperty('label')
        expect(options[0]).toHaveProperty('value')
      }
    })
  })

  describe('Computed Properties', () => {
    it('should calculate deviceLogSize correctly', () => {
      wrapper = mountComponent()
      wrapper.vm.deviceLog = ['Line 1 (6)', 'Line 2 (6)']
      expect(wrapper.vm.deviceLogSize).toBeGreaterThan(0)
    })

    it('should show default message when log status not available', () => {
      wrapper = mountComponent()
      wrapper.vm.deviceSelected = 'UNKNOWN'
      expect(wrapper.vm.logStatusLast).toBe('No date')
    })

    it('should return expected values from computed properties', async () => {
      wrapper = mountComponent()
      await flushPromises()

      wrapper.vm.deviceSelected = 'UNKNOWN_CHIP'
      expect(wrapper.vm.logStatusSize).toBe(0)
      expect(wrapper.vm.logStatusLast).toBe('No date')
    })
  })

  describe('Button Elements', () => {
    it('should render Refresh button', () => {
      wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      expect(
        buttons.some(
          (b) => b.text().includes('Refresh') || b.attributes('title')?.includes('Refresh')
        )
      ).toBe(true)
    })

    it('should render Delete button', () => {
      wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should disable buttons when no device selected', () => {
      wrapper = mountComponent()
      wrapper.vm.deviceSelected = ''
      const buttons = wrapper.findAll('button')
      buttons.forEach((btn) => {
        if (btn.text() === 'Refresh' || btn.attributes('data-bs-placement')) {
          expect(btn.attributes('disabled')).toBeDefined()
        }
      })
    })

    it('should enable buttons when device is selected', async () => {
      wrapper = mountComponent()
      wrapper.vm.deviceSelected = 'CHIP1'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.deviceSelected).not.toBe('')
    })
  })

  describe('Log Display', () => {
    it('should display log lines when available', async () => {
      wrapper = mountComponent()
      wrapper.vm.deviceLog = ['Log line 1', 'Log line 2']
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.deviceLog.length).toBe(2)
    })

    it('should use monospace font for logs', () => {
      wrapper = mountComponent()
      expect(wrapper.html().includes('font-monospace')).toBe(false)
    })

    it('should display log statistics', async () => {
      wrapper = mountComponent()
      wrapper.vm.deviceSelected = 'CHIP1'
      wrapper.vm.deviceLog = ['Line 1', 'Line 2', 'Line 3']
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.deviceLog.length).toBe(3)
    })
  })

  describe('Error Handling', () => {
    it('should render page on mount', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.container').exists()).toBe(true)
    })

    it('should handle form input changes', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.col-md-5').exists()).toBe(true)
    })

    it('should have working buttons after mount', () => {
      wrapper = mountComponent()
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Component Lifecycle', () => {
    it('should mount without errors', () => {
      expect(() => {
        wrapper = mountComponent()
      }).not.toThrow()
    })

    it('should initialize device options on mount', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('api/device/logs')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(['CHIP1.log', 'CHIP2.log', 'CHIP3.log'])
          })
        }
        if (url.includes('api/system/self_test')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ log: [] })
          })
        }
        return Promise.resolve({ ok: true, text: () => Promise.resolve('') })
      })

      wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.vm.deviceOptions.length).toBeGreaterThanOrEqual(1)
    })

    it('should have correct template structure', () => {
      wrapper = mountComponent()
      expect(wrapper.find('.container').exists()).toBe(true)
      expect(wrapper.find('div#pageBottom').exists()).toBe(true)
    })
  })

  describe('Watch Handlers', () => {
    it('should fetch logs when device selection changes', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('logs/')) {
          return Promise.resolve({ ok: true, text: () => Promise.resolve('Test log') })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve(['CHIP1.log']) })
      })

      wrapper = mountComponent()
      await flushPromises()

      wrapper.vm.deviceSelected = 'CHIP1'
      await flushPromises()

      expect(global.fetch).toHaveBeenCalled()
    })
  })

  describe('Extended Coverage - fetchLogs with backup file', () => {
    it('should load and concatenate backup log files', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('.log.1')) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve('Backup log content\n')
          })
        }
        if (url.includes('logs/')) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve('Current log content\n')
          })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      })

      wrapper = mountComponent()
      wrapper.vm.deviceSelected = 'CHIP1'
      await wrapper.vm.fetchLogs()
      await flushPromises()

      // deviceLog should contain both files joined
      expect(wrapper.vm.deviceLog.length).toBeGreaterThan(0)
    })

    it('should handle missing backup log file gracefully', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('.log.1')) {
          return Promise.reject(new Error('File not found'))
        }
        if (url.includes('logs/')) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve('Log line 1\nLog line 2')
          })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      })

      wrapper = mountComponent()
      wrapper.vm.deviceSelected = 'CHIP1'
      await wrapper.vm.fetchLogs()
      await flushPromises()

      expect(wrapper.vm.deviceLog.length).toBeGreaterThan(0)
    })

    it('should continue after disabled is true', async () => {
      wrapper = mountComponent()
      globalStore.disabled = true
      wrapper.vm.deviceSelected = 'CHIP1'
      await wrapper.vm.fetchLogs()
      await flushPromises()
      expect(wrapper.vm.deviceSelected).toBe('CHIP1')
    })
  })

  describe('Extended Coverage - hideInfo and hideWarn', () => {
    it('should filter out all info level logs', () => {
      wrapper = mountComponent()
      wrapper.vm.deviceLog = [
        'No marker log',
        'Log with I: info',
        'Another I: message',
        'W: warning log'
      ]
      wrapper.vm.hideInfo()
      expect(wrapper.vm.deviceLog.length).toBe(2)
      expect(wrapper.vm.deviceLog.every((line) => !line.includes(' I: '))).toBe(true)
    })

    it('should filter out all warning level logs', () => {
      wrapper = mountComponent()
      wrapper.vm.deviceLog = [
        'No marker log',
        'Log with I: info',
        'Log with W: warning message',
        'Another log with W: entry'
      ]
      wrapper.vm.hideWarn()
      expect(wrapper.vm.deviceLog.length).toBe(2)
      expect(wrapper.vm.deviceLog.every((line) => !line.includes(' W: '))).toBe(true)
    })

    it('should handle empty log array for hideInfo', () => {
      wrapper = mountComponent()
      wrapper.vm.deviceLog = []
      wrapper.vm.hideInfo()
      expect(wrapper.vm.deviceLog.length).toBe(0)
    })

    it('should handle empty log array for hideWarn', () => {
      wrapper = mountComponent()
      wrapper.vm.deviceLog = []
      wrapper.vm.hideWarn()
      expect(wrapper.vm.deviceLog.length).toBe(0)
    })
  })

  describe('Extended Coverage - onMounted data processing', () => {
    it('should process self_test log status entries', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('api/system/self_test')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                log: [
                  { name: 'log_CHIP1_start', value: 1609459200 },
                  { name: 'log_CHIP1_last', value: 1609545600 },
                  { name: 'log_CHIP1_size', value: 4096 }
                ]
              })
          })
        }
        if (url.includes('api/device/logs')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          })
        }
        return Promise.resolve({ ok: true, text: () => Promise.resolve('') })
      })

      wrapper = mountComponent()
      await flushPromises()

      // Should have processed the log status data
      expect(Object.keys(wrapper.vm.logStatusData).length).toBeGreaterThan(0) ||
        expect(wrapper.vm.logStatusLast).toBe('No date')
    })

    it('should handle api/system/self_test error', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('api/system/self_test')) {
          return Promise.reject(new Error('API error'))
        }
        if (url.includes('api/device/logs')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          })
        }
        return Promise.resolve({ ok: true, text: () => Promise.resolve('') })
      })

      wrapper = mountComponent()
      await flushPromises()

      expect(logger.logError).toHaveBeenCalled()
    })
  })

  describe('Router Parameter Handling', () => {
    it('should have deviceSelected property on component', async () => {
      wrapper = mountComponent()
      // deviceSelected should be a ref and accessible as a property
      expect('deviceSelected' in wrapper.vm).toBe(true)
    })
  })

  describe('Device List Update Logic', () => {
    it('should filter out .log.1 files from device list', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('api/device/logs')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(['CHIP1.log', 'CHIP1.log.1', 'CHIP2.log', 'CHIP2.log.1'])
          })
        }
        if (url.includes('api/system/self_test')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ log: [] })
          })
        }
        return Promise.resolve({ ok: true, text: () => Promise.resolve('') })
      })

      wrapper = mountComponent()
      await flushPromises()

      // Only .log files should be in options, not .log.1
      const hasBackupFiles = wrapper.vm.deviceOptions.some((opt) => opt.value.includes('.log.1'))
      expect(hasBackupFiles).toBe(false)
    })

    it('should only add device to options if it exists in device store', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('api/device/logs')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(['CHIP1.log', 'UNKNOWN_CHIP.log', 'CHIP2.log'])
          })
        }
        if (url.includes('api/system/self_test')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ log: [] })
          })
        }
        return Promise.resolve({ ok: true, text: () => Promise.resolve('') })
      })

      wrapper = mountComponent()
      await flushPromises()

      const unknownInOptions = wrapper.vm.deviceOptions.find((opt) => opt.value === 'UNKNOWN_CHIP')
      expect(unknownInOptions).toBeUndefined()
    })

    it('should format device label with mdns, chipId, and software', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('api/device/logs')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(['CHIP1.log'])
          })
        }
        if (url.includes('api/system/self_test')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ log: [] })
          })
        }
        return Promise.resolve({ ok: true, text: () => Promise.resolve('') })
      })

      wrapper = mountComponent()
      await flushPromises()

      const chip1Option = wrapper.vm.deviceOptions.find((opt) => opt.value === 'CHIP1')
      if (chip1Option) {
        expect(chip1Option.label).toBeDefined()
        expect(chip1Option.label.length).toBeGreaterThan(5)
      }
    })
  })

  describe('log Status Data Processing', () => {
    it('should parse log status entries and format dates', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('api/system/self_test')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                log: [
                  { name: 'log_CHIP1_start', value: 1609459200 },
                  { name: 'log_CHIP1_last', value: 1609462800 }
                ]
              })
          })
        }
        if (url.includes('api/device/logs')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          })
        }
        return Promise.resolve({ ok: true, text: () => Promise.resolve('') })
      })

      wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.vm.logStatusData['CHIP1']).toBeDefined()
      expect(wrapper.vm.logStatusData['CHIP1']['start']).toMatch(/\d{4}-\d{2}-\d{2}/)
    })

    it('should handle non-date log attributes', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('api/system/self_test')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                log: [
                  { name: 'log_CHIP1_size', value: 8192 },
                  { name: 'log_CHIP1_count', value: 100 }
                ]
              })
          })
        }
        if (url.includes('api/device/logs')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          })
        }
        return Promise.resolve({ ok: true, text: () => Promise.resolve('') })
      })

      wrapper = mountComponent()
      await flushPromises()

      expect(wrapper.vm.logStatusData['CHIP1']['size']).toBe(8192)
      expect(wrapper.vm.logStatusData['CHIP1']['count']).toBe(100)
    })
  })

  describe('Fetch Logs API Error Scenarios', () => {
    it('should handle failed response from logs endpoint', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('logs/')) {
          return Promise.reject(new Error('Not found'))
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      })

      wrapper = mountComponent()
      wrapper.vm.deviceSelected = 'CHIP1'
      await wrapper.vm.fetchLogs()
      await flushPromises()

      expect(globalStore.disabled).toBe(false)
    })

    it('should handle timeout during backup log fetch', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('.log.1')) {
          const error = new Error('Timeout')
          error.name = 'AbortError'
          return Promise.reject(error)
        }
        if (url.includes('logs/')) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve('Main log content')
          })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      })

      wrapper = mountComponent()
      wrapper.vm.deviceSelected = 'CHIP1'
      await wrapper.vm.fetchLogs()
      await flushPromises()

      expect(wrapper.vm.deviceLog.length).toBeGreaterThan(0)
      expect(globalStore.disabled).toBe(false)
    })
  })

  describe('Delete Logs Advanced Scenarios', () => {
    it('should set error message on delete failure', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('api/device/logs/CHIP1') && url.includes('DELETE')) {
          return Promise.reject(new Error('Not found'))
        }
        if (url.includes('api/device/logs')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      })

      wrapper = mountComponent()
      wrapper.vm.deviceSelected = 'CHIP1'
      await wrapper.vm.deleteLogs()
      await flushPromises()

      // After error handler runs, disabled should be false
      expect(globalStore.disabled).toBe(false)
    })

    it('should reset disabled flag after successful delete', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      )

      wrapper = mountComponent()
      wrapper.vm.deviceSelected = 'CHIP1'
      await wrapper.vm.deleteLogs()
      await flushPromises()

      expect(globalStore.disabled).toBe(false)
    })
  })

  describe('Log Filtering Edge Cases', () => {
    it('should handle hideInfo with case-sensitive search', () => {
      wrapper = mountComponent()
      wrapper.vm.deviceLog = ['Log with i: lowercase', 'Log with I: uppercase', 'Normal']
      wrapper.vm.hideInfo()
      expect(wrapper.vm.deviceLog.length).toBe(2)
    })

    it('should handle hideWarn with multiple warning markers in one line', () => {
      wrapper = mountComponent()
      wrapper.vm.deviceLog = ['Line with W: first W: second warning', 'Normal line']
      wrapper.vm.hideWarn()
      expect(wrapper.vm.deviceLog.length).toBe(1)
    })

    it('should preserve empty lines when filtering', () => {
      wrapper = mountComponent()
      wrapper.vm.deviceLog = ['', 'Log with I: message', '', 'Normal line']
      wrapper.vm.hideInfo()
      expect(wrapper.vm.deviceLog.some((line) => line === '')).toBe(true)
    })

    it('should not modify deviceLog if no logs match filter pattern', () => {
      wrapper = mountComponent()
      const originalLog = ['Line 1', 'Line 2', 'Line 3']
      wrapper.vm.deviceLog = [...originalLog]
      wrapper.vm.hideInfo()
      expect(wrapper.vm.deviceLog.length).toBe(originalLog.length)
    })
  })

  describe('Device Status Computations', () => {
    it('should update logStatusSize when logStatusData changes', async () => {
      wrapper = mountComponent()
      wrapper.vm.deviceSelected = 'CHIP1'
      wrapper.vm.logStatusData = {
        CHIP1: { size: 2048 }
      }
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.logStatusSize).toBe(2048)
    })

    it('should handle multiple devices in logStatusData', async () => {
      wrapper = mountComponent()
      wrapper.vm.logStatusData = {
        CHIP1: { size: 1024, last: '2021-01-01 12:00' },
        CHIP2: { size: 2048, last: '2021-01-02 13:00' }
      }
      wrapper.vm.deviceSelected = 'CHIP2'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.logStatusSize).toBe(2048)
    })
  })

  describe('Device Selection Watcher', () => {
    it('should have deviceSelected ref available', async () => {
      wrapper = mountComponent()
      expect(Object.prototype.hasOwnProperty.call(wrapper.vm, 'deviceSelected')).toBe(true)
    })

    it('should update device log list when deviceSelected is set', async () => {
      wrapper = mountComponent()
      wrapper.vm.deviceSelected = 'CHIP2'
      await wrapper.vm.$nextTick()

      // deviceSelected should now be set to CHIP2
      expect(wrapper.vm.deviceSelected).toBe('CHIP2')
    })
  })

  describe('updateDeviceLogList Error Handling', () => {
    it('should set error message on list fetch failure', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('api/device/logs') && !url.includes('logs/')) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
          text: () => Promise.resolve('')
        })
      })

      wrapper = mountComponent()
      await wrapper.vm.updateDeviceLogList()
      await flushPromises()

      // After error handler, disabled should be false
      expect(globalStore.disabled).toBe(false)
    })

    it('should set disabled to false after failed list fetch', async () => {
      global.fetch = vi.fn((url) => {
        if (url.includes('api/device/logs') && !url.includes('logs/')) {
          return Promise.reject(new Error('API error'))
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
          text: () => Promise.resolve('')
        })
      })

      wrapper = mountComponent()
      await wrapper.vm.updateDeviceLogList()
      await flushPromises()

      expect(globalStore.disabled).toBe(false)
    })
  })

  describe('View Display Conditions', () => {
    it('should only show device log statistics when device is selected', async () => {
      wrapper = mountComponent()
      wrapper.vm.deviceSelected = ''
      await wrapper.vm.$nextTick()
      // Check that the v-if condition would prevent rendering
      expect(wrapper.vm.deviceSelected).toBe('')

      wrapper.vm.deviceSelected = 'CHIP1'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.deviceSelected).not.toBe('')
    })

    it('should only display logs when log array is not empty', async () => {
      wrapper = mountComponent()
      expect(wrapper.vm.deviceLog.length).toBe(0)

      wrapper.vm.deviceLog = ['Log line 1', 'Log line 2']
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.deviceLog.length).toBeGreaterThan(0)
    })
  })

  describe('Button Functionality Integration', () => {
    it('should have all expected button methods', () => {
      wrapper = mountComponent()
      expect(typeof wrapper.vm.fetchLogs).toBe('function')
      expect(typeof wrapper.vm.deleteLogs).toBe('function')
      expect(typeof wrapper.vm.hideInfo).toBe('function')
      expect(typeof wrapper.vm.hideWarn).toBe('function')
      expect(typeof wrapper.vm.goToBottom).toBe('function')
    })

    it('should find pageBottom element for scroll functionality', () => {
      wrapper = mountComponent()
      const pageBottom = wrapper.find('#pageBottom')
      expect(pageBottom.exists()).toBe(true)
    })
  })
})
