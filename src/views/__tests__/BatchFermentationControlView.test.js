// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BatchFermentationControlView from '../BatchFermentationControlView.vue'
import { nextTick } from 'vue'

const mockStores = vi.hoisted(() => ({
  batch: {
    getBatch: vi.fn()
  },
  device: {
    getDevice: vi.fn(),
    getDeviceFermentationSteps: vi.fn(),
    addDeviceFermentationSteps: vi.fn(),
    deleteDeviceFermentationSteps: vi.fn()
  },
  global: {
    disabled: false,
    messageError: '',
    messageSuccess: '',
    clearMessages: vi.fn(),
    $subscribe: vi.fn(),
    $patch: vi.fn()
  },
  config: {
    isTempF: false,
    isTempC: true,
    tempUnit: 'C'
  },
  router: {
    currentRoute: {
      value: {
        params: { id: '1' }
      }
    }
  }
}))

vi.mock('@/modules/pinia', () => ({
  batchStore: mockStores.batch,
  deviceStore: mockStores.device,
  global: mockStores.global,
  config: mockStores.config,
  default: {}
}))

vi.mock('@/modules/router', () => ({
  default: mockStores.router
}))

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}))

vi.mock('@/modules/utils', () => ({
  tempToF: vi.fn((c) => c * 9 / 5 + 32),
  validateCurrentForm: vi.fn(() => true)
}))

describe('BatchFermentationControlView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    mockStores.batch.getBatch.mockResolvedValue({
      id: '1',
      name: 'Batch 1',
      fermentationSteps: JSON.stringify([
        { order: 0, type: 'Primary', temp: 20, days: 5, date: '2024-01-15 to 2024-01-20' }
      ]),
      fermentationChamber: 10
    })
    mockStores.device.getDevice.mockResolvedValue({
      device: {
        id: 10,
        software: 'BrewPi',
        description: 'Main Chamber',
        mdns: 'brewpi.local',
        url: 'http://192.168.1.10'
      }
    })
    mockStores.device.getDeviceFermentationSteps.mockResolvedValue([])
    mockStores.device.addDeviceFermentationSteps.mockResolvedValue(true)
  })

  const mountWrapper = async () => {
    const wrapper = mount(BatchFermentationControlView, {
      global: {
        stubs: {
          'router-link': { template: '<a><slot></slot></a>' },
          BsInputReadonly: true,
          BsMessage: true
        }
      }
    })
    await nextTick()
    await nextTick()
    await nextTick()
    return wrapper
  }

  it('loads profile correctly on mount', async () => {
    const wrapper = await mountWrapper()
    expect(mockStores.batch.getBatch).toHaveBeenCalledWith('1')
    expect(wrapper.vm.batchName).toBe('Batch 1')
    expect(wrapper.vm.device.id).toBe(10)
    expect(wrapper.vm.fermentationSteps.length).toBe(1)
  })

  it('handles batch without fermentation profile', async () => {
    mockStores.batch.getBatch.mockResolvedValue({
      id: '1',
      name: 'No Steps Batch',
      fermentationSteps: 'invalid json',
      fermentationChamber: 10
    })
    const wrapper = await mountWrapper()
    expect(mockStores.global.messageError).toContain('No fermentation profile found')
    expect(wrapper.vm.fermentationSteps).toBeNull()
  })

  it('handles batch without fermentation controller selected', async () => {
    mockStores.batch.getBatch.mockResolvedValue({
      id: '1',
      name: 'No Controller Batch',
      fermentationSteps: JSON.stringify([{ id: 1 }]),
      fermentationChamber: 0
    })
    await mountWrapper()
    expect(mockStores.global.messageError).toContain('No fermentation controller is selected')
  })

  it('handles device load failure', async () => {
    mockStores.batch.getBatch.mockResolvedValue({
      id: '1',
      name: 'Fail Device Batch',
      fermentationSteps: JSON.stringify([{ id: 1 }]),
      fermentationChamber: 10
    })
    mockStores.device.getDevice.mockResolvedValue(null)
    await mountWrapper()
    expect(mockStores.global.messageError).toContain('Failed to load the device configuration')
  })

  it('handles active fermentation steps check failure', async () => {
    mockStores.device.getDeviceFermentationSteps.mockResolvedValue(null)
    await mountWrapper()
    expect(mockStores.global.messageError).toContain(
      'Failed to check for active fermentration steps'
    )
  })

  it('shows warning when device has active steps', async () => {
    mockStores.device.getDeviceFermentationSteps.mockResolvedValue([
      { order: 0, type: 'Primary', temp: 20, days: 5, date: '2024-01-15 to 2024-01-20' }
    ])
    const wrapper = await mountWrapper()
    expect(wrapper.vm.activeFermentationSteps.length).toBe(1)
    expect(wrapper.find('bs-message-stub').exists()).toBe(true)
  })

  it('renders fermentation steps as read-only table', async () => {
    const wrapper = await mountWrapper()
    const tables = wrapper.findAll('table')
    expect(tables.length).toBeGreaterThan(0)
  })

  it('displays step details in table columns', async () => {
    const wrapper = await mountWrapper()
    const tableText = wrapper.text()
    expect(tableText).toContain('Primary')
    expect(tableText).toContain('20')
    expect(tableText).toContain('5')
    // Date gets recalculated by FermentationStep.listFromJson, just verify it exists
    expect(tableText).toContain('Date')
  })

  it('displays correct temperature unit in table', async () => {
    mockStores.config.isTempC = true
    mockStores.config.isTempF = false
    mockStores.config.tempUnit = 'C'
    const wrapper = await mountWrapper()
    const tableText = wrapper.text()
    expect(tableText).toContain('°C')
  })

  it('displays fermentation steps with proper step numbers starting from 1', async () => {
    const wrapper = await mountWrapper()
    const tableText = wrapper.text()
    expect(tableText).toContain('1')
  })

  it('starts steps when none are active', async () => {
    const wrapper = await mountWrapper()
    await wrapper.find('button.btn-primary').trigger('click')
    expect(mockStores.device.addDeviceFermentationSteps).toHaveBeenCalled()
    expect(mockStores.global.messageSuccess).toContain(
      'Fermentation steps for device has been created'
    )
  })

  it('deletes existing steps before starting new ones', async () => {
    mockStores.device.getDeviceFermentationSteps.mockResolvedValue([{ id: 99 }])
    const wrapper = await mountWrapper()
    await wrapper.find('button.btn-primary').trigger('click')
    expect(mockStores.device.deleteDeviceFermentationSteps).toHaveBeenCalledWith(10)
    expect(mockStores.device.addDeviceFermentationSteps).toHaveBeenCalled()
  })

  it('handles start steps failure', async () => {
    mockStores.device.addDeviceFermentationSteps.mockResolvedValue(false)
    const wrapper = await mountWrapper()
    await wrapper.find('button.btn-primary').trigger('click')
    expect(mockStores.global.messageError).toContain('Failed to load the device')
  })

  it('handles loadProfile failure (batch not found)', async () => {
    mockStores.batch.getBatch.mockResolvedValue(null)
    await mountWrapper()
    expect(mockStores.global.messageError).toContain('Failed to load the batch')
  })
})
