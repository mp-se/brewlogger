import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import SupportView from '../SupportView.vue'

// Mock pinia before anything else
vi.mock('@/modules/pinia', () => ({
  global: {
    disabled: false,
    fetchTimout: 1000,
    baseURL: 'http://localhost/',
    token: 'test-token'
  }
}))

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn()
}))

describe('SupportView', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          log: [
            { name: 'log_1_start', value: 1600000000 },
            { name: 'log_1_last', value: 1600001000 }
          ],
          ble: [{ name: 'ble_1_last', value: 1600002000 }]
        })
    })
  })

  it('should render correctly', async () => {
    const wrapper = mount(SupportView)

    // Wait for the fetch promise inside onMounted to resolve and trigger updates
    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Support')
    expect(wrapper.text()).toContain('Log status')
    expect(wrapper.text()).toContain('2020')
  })
})
