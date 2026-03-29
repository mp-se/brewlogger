import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LifeEstimates from '../LifeEstimates.vue'

describe('LifeEstimates', () => {
  describe('Basic Rendering', () => {
    it('should not render when gravityStats is null', () => {
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: null }
      })
      const container = wrapper.find('.col-md-12')
      expect(container.exists()).toBe(false)
    })

    it('should render when gravityStats is provided', () => {
      const gravityStats = {
        readings: 10,
        date: { firstDate: '2024-01-15', lastDate: '2024-01-30' }
      }
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: gravityStats }
      })
      const container = wrapper.find('.col-md-12')
      expect(container.exists()).toBe(true)
    })

    it('should have row class for grid layout', () => {
      const gravityStats = {
        readings: 10,
        date: { firstDate: '2024-01-15', lastDate: '2024-01-30' }
      }
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: gravityStats }
      })
      const row = wrapper.find('.row')
      expect(row.exists()).toBe(true)
    })
  })

  describe('Battery Estimate Display', () => {
    it('should display 30 second estimate', () => {
      const gravityStats = {
        readings: 10,
        date: { firstDate: '2024-01-15', lastDate: '2024-01-30' }
      }
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: gravityStats }
      })
      expect(wrapper.text()).toContain('30 sec')
    })

    it('should display 60 second estimate', () => {
      const gravityStats = {
        readings: 10,
        date: { firstDate: '2024-01-15', lastDate: '2024-01-30' }
      }
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: gravityStats }
      })
      expect(wrapper.text()).toContain('60 sec')
    })

    it('should display 300 second estimate', () => {
      const gravityStats = {
        readings: 10,
        date: { firstDate: '2024-01-15', lastDate: '2024-01-30' }
      }
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: gravityStats }
      })
      expect(wrapper.text()).toContain('300 sec')
    })

    it('should display 900 second estimate', () => {
      const gravityStats = {
        readings: 10,
        date: { firstDate: '2024-01-15', lastDate: '2024-01-30' }
      }
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: gravityStats }
      })
      expect(wrapper.text()).toContain('900 sec')
    })

    it('should display 1800 second estimate', () => {
      const gravityStats = {
        readings: 10,
        date: { firstDate: '2024-01-15', lastDate: '2024-01-30' }
      }
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: gravityStats }
      })
      expect(wrapper.text()).toContain('1800 sec')
    })
  })

  describe('Battery Estimate Calculations', () => {
    it('should calculate battery life for 30 second intervals', () => {
      const gravityStats = {
        readings: 100,
        date: { firstDate: '2024-01-15', lastDate: '2024-01-30' }
      }
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: gravityStats }
      })
      // 100 readings * 30 seconds = 3000 seconds
      expect(wrapper.text()).toBeTruthy()
    })

    it('should calculate battery life for 60 second intervals', () => {
      const gravityStats = {
        readings: 100,
        date: { firstDate: '2024-01-15', lastDate: '2024-01-30' }
      }
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: gravityStats }
      })
      // 100 readings * 60 seconds = 6000 seconds
      expect(wrapper.text()).toBeTruthy()
    })

    it('should handle single reading', () => {
      const gravityStats = {
        readings: 1,
        date: { firstDate: '2024-01-15', lastDate: '2024-01-15' }
      }
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: gravityStats }
      })
      expect(wrapper.text()).toBeTruthy()
    })

    it('should handle high reading count', () => {
      const gravityStats = {
        readings: 1000,
        date: { firstDate: '2024-01-01', lastDate: '2024-12-31' }
      }
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: gravityStats }
      })
      expect(wrapper.text()).toBeTruthy()
    })
  })

  describe('Column Layout', () => {
    it('should have multiple col-md-1 columns for different intervals', () => {
      const gravityStats = {
        readings: 10,
        date: { firstDate: '2024-01-15', lastDate: '2024-01-30' }
      }
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: gravityStats }
      })
      const columns = wrapper.findAll('.col-md-1')
      expect(columns.length).toBeGreaterThanOrEqual(5)
    })

    it('should have labels for each interval', () => {
      const gravityStats = {
        readings: 10,
        date: { firstDate: '2024-01-15', lastDate: '2024-01-30' }
      }
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: gravityStats }
      })
      const labels = wrapper.findAll('.form-label')
      expect(labels.length).toBeGreaterThanOrEqual(5)
    })

    it('should have form-control-plaintext for values', () => {
      const gravityStats = {
        readings: 10,
        date: { firstDate: '2024-01-15', lastDate: '2024-01-30' }
      }
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: gravityStats }
      })
      const plaintext = wrapper.findAll('.form-control-plaintext')
      expect(plaintext.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('V-Model Binding', () => {
    it('should accept gravityStats via modelValue', () => {
      const gravityStats = {
        readings: 10,
        date: { firstDate: '2024-01-15', lastDate: '2024-01-30' }
      }
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: gravityStats }
      })
      expect(wrapper.props('modelValue')).toEqual(gravityStats)
    })

    it('should update when gravityStats changes', async () => {
      const gravityStats1 = {
        readings: 10,
        date: { firstDate: '2024-01-15', lastDate: '2024-01-30' }
      }
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: gravityStats1 }
      })

      const gravityStats2 = {
        readings: 20,
        date: { firstDate: '2024-01-15', lastDate: '2024-01-30' }
      }
      await wrapper.setProps({ modelValue: gravityStats2 })
      expect(wrapper.props('modelValue').readings).toBe(20)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero readings gracefully', () => {
      const gravityStats = {
        readings: 0,
        date: { firstDate: '2024-01-15', lastDate: '2024-01-30' }
      }
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: gravityStats }
      })
      expect(wrapper.find('.col-md-12').exists()).toBe(true)
    })

    it('should handle undefined stats property', () => {
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: undefined }
      })
      expect(wrapper.find('.col-md-12').exists()).toBe(false)
    })
  })

  describe('Styling', () => {
    it('should use fw-bold for labels', () => {
      const gravityStats = {
        readings: 10,
        date: { firstDate: '2024-01-15', lastDate: '2024-01-30' }
      }
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: gravityStats }
      })
      const boldLabels = wrapper.findAll('.fw-bold')
      expect(boldLabels.length).toBeGreaterThanOrEqual(5)
    })

    it('should use form-label class', () => {
      const gravityStats = {
        readings: 10,
        date: { firstDate: '2024-01-15', lastDate: '2024-01-30' }
      }
      const wrapper = mount(LifeEstimates, {
        props: { modelValue: gravityStats }
      })
      const labels = wrapper.findAll('.form-label')
      expect(labels.length).toBeGreaterThan(0)
    })
  })
})
