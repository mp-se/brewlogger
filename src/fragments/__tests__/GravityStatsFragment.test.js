import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GravityStatsFragment from '../GravityStatsFragment.vue'
import BsInputReadonly from '../../components/BsInputReadonly.vue'
import BsInputBase from '../../components/BsInputBase.vue'

describe('GravityStatsFragment - Gravity Statistics Display', () => {
  const sampleGravityStats = {
    gravity: {
      maxString: '1.050',
      minString: '1.010'
    },
    abvString: '5.2%',
    readings: '15',
    averageIntervalString: '1.2 days',
    temperature: {
      maxString: '68°F',
      minString: '65°F'
    },
    date: {
      firstDate: '2024-01-15',
      lastDate: '2024-01-30'
    }
  }

  describe('Basic Rendering', () => {
    it('should render when gravityStats is provided', () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const container = wrapper.find('.col-md-12')
      expect(container.exists()).toBe(true)
    })

    it('should not render when gravityStats is null', () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: null },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const container = wrapper.find('.col-md-12')
      expect(container.exists()).toBe(false)
    })

    it('should have row class for layout', () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const row = wrapper.find('.row')
      expect(row.exists()).toBe(true)
    })
  })

  describe('Display Fields', () => {
    it('should display OG (Original Gravity)', () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.text()).toContain('OG')
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[0].element.value).toContain('1.050')
    })

    it('should display FG (Final Gravity)', () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.text()).toContain('FG')
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[1].element.value).toContain('1.010')
    })

    it('should display ABV (Alcohol by Volume)', () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.text()).toContain('ABV')
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[2].element.value).toContain('5.2%')
    })

    it('should display reading count', () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.text()).toContain('#')
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[3].element.value).toContain('15')
    })

    it('should display average interval', () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.text()).toContain('Ave Int')
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[4].element.value).toContain('1.2 days')
    })

    it('should display high and low temperatures', () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[5].element.value).toContain('68°F')
      expect(inputs[6].element.value).toContain('65°F')
    })

    it('should display first and last dates', () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.text()).toContain('First')
      expect(wrapper.text()).toContain('Last')
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[7].element.value).toContain('2024-01-15')
      expect(inputs[8].element.value).toContain('2024-01-30')
    })
  })

  describe('Grid Layout', () => {
    it('should use col-md columns for responsiveness', () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const columns = wrapper.findAll('[class*="col-md"]')
      expect(columns.length).toBeGreaterThan(0)
    })

    it('should have 9 field columns', () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const columns = wrapper.findAll('.col-md-1, .col-md-2')
      expect(columns.length).toBeGreaterThanOrEqual(9)
    })
  })

  describe('V-Model Binding', () => {
    it('should accept gravityStats model', () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.props('modelValue')).toEqual(sampleGravityStats)
    })

    it('should update when gravityStats changes', async () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const newStats = {
        ...sampleGravityStats,
        abvString: '6.0%'
      }
      await wrapper.setProps({ modelValue: newStats })
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[2].element.value).toContain('6.0%')
    })

    it('should trigger reactive setter with multiple sequential updates', async () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      
      // First update
      let newStats = {
        ...sampleGravityStats,
        abvString: '6.0%'
      }
      await wrapper.setProps({ modelValue: newStats })
      expect(wrapper.props('modelValue').abvString).toBe('6.0%')
      
      // Second update
      newStats = {
        ...sampleGravityStats,
        abvString: '7.0%'
      }
      await wrapper.setProps({ modelValue: newStats })
      expect(wrapper.props('modelValue').abvString).toBe('7.0%')
    })

    it('should handle null model value transitions', async () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      
      expect(wrapper.find('.col-md-12').exists()).toBe(true)
      
      await wrapper.setProps({ modelValue: null })
      expect(wrapper.find('.col-md-12').exists()).toBe(false)
      
      await wrapper.setProps({ modelValue: sampleGravityStats })
      expect(wrapper.find('.col-md-12').exists()).toBe(true)
    })

    it('should preserve model state through prop updates', async () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      
      const updates = [
        { ...sampleGravityStats, readings: '20' },
        { ...sampleGravityStats, readings: '25' },
        { ...sampleGravityStats, readings: '30' }
      ]
      
      for (const update of updates) {
        await wrapper.setProps({ modelValue: update })
        const inputs = wrapper.findAll('input[type="text"]')
        expect(inputs[3].element.value).toBe(update.readings)
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing temperature data', () => {
      const incompleteStats = {
        ...sampleGravityStats,
        temperature: { maxString: '—', minString: '—' }
      }
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: incompleteStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.find('.col-md-12').exists()).toBe(true)
    })

    it('should handle zero readings', () => {
      const zeroReadingsStats = {
        ...sampleGravityStats,
        readings: '0'
      }
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: zeroReadingsStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[3].element.value).toContain('0')
    })

    it('should handle very high gravity values', () => {
      const highGravityStats = {
        ...sampleGravityStats,
        gravity: {
          maxString: '1.120',
          minString: '1.020'
        }
      }
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: highGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[0].element.value).toContain('1.120')
    })
  })

  describe('Component Structure - Branch Coverage', () => {
    it('should render all 9 input fields when data provided', () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      // Count all BsInputReadonly components
      const inputs = wrapper.findAllComponents(BsInputReadonly)
      expect(inputs.length).toBe(9)
    })

    it('should render outer col-md-12 wrapper', () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const colMd12 = wrapper.find('.col-md-12')
      expect(colMd12.exists()).toBe(true)
    })

    it('should have row div inside col-md-12', () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const row = wrapper.find('.col-md-12 .row')
      expect(row.exists()).toBe(true)
    })

    it('should render each field in appropriate column widths', () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      // Check for col-md-1 (most fields) and col-md-2 (date fields)
      const colMd1 = wrapper.findAll('.col-md-1')
      const colMd2 = wrapper.findAll('.col-md-2')
      expect(colMd1.length).toBe(7) // OG, FG, ABV, #, Ave Int, High, Low
      expect(colMd2.length).toBe(2) // First, Last dates
    })

    it('should pass correct label props to all inputs', () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const inputs = wrapper.findAllComponents(BsInputReadonly)
      const labels = inputs.map(input => input.props('label'))
      expect(labels).toContain('OG')
      expect(labels).toContain('FG')
      expect(labels).toContain('ABV')
      expect(labels).toContain('#')
      expect(labels).toContain('Ave Int')
      expect(labels).toContain('High')
      expect(labels).toContain('Low')
      expect(labels).toContain('First')
      expect(labels).toContain('Last')
    })

    it('should conditionally render based on gravityStats being null', () => {
      const wrapperWithData = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const wrapperWithNull = mount(GravityStatsFragment, {
        props: { modelValue: null },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapperWithData.find('.col-md-12').exists()).toBe(true)
      expect(wrapperWithNull.find('.col-md-12').exists()).toBe(false)
    })

    it('should render each BsInputReadonly with v-model binding', () => {
      const wrapper = mount(GravityStatsFragment, {
        props: { modelValue: sampleGravityStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const inputs = wrapper.findAllComponents(BsInputReadonly)
      // Verify each input has the correct v-model binding
      expect(inputs[0].props('modelValue')).toBe('1.050') // OG
      expect(inputs[1].props('modelValue')).toBe('1.010') // FG
      expect(inputs[2].props('modelValue')).toBe('5.2%')  // ABV
      expect(inputs[3].props('modelValue')).toBe('15')    // Readings
      expect(inputs[4].props('modelValue')).toBe('1.2 days') // Ave Int
    })
  })
})
