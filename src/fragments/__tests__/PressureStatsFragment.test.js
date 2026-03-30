import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PressureStatsFragment from '../PressureStatsFragment.vue'
import BsInputReadonly from '../../components/BsInputReadonly.vue'
import BsInputBase from '../../components/BsInputBase.vue'

describe('PressureStatsFragment - Pressure Statistics Display', () => {
  const samplePressureStats = {
    pressure: {
      maxString: '30 PSI',
      minString: '15 PSI'
    },
    readings: '12',
    averageIntervalString: '2.4 hours',
    temperature: {
      maxString: '68°F',
      minString: '62°F'
    },
    date: {
      firstDate: '2024-01-20',
      lastDate: '2024-01-25'
    }
  }

  describe('Basic Rendering', () => {
    it('should render when pressureStats is provided', () => {
      const wrapper = mount(PressureStatsFragment, {
        props: { modelValue: samplePressureStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const container = wrapper.find('.col-md-12')
      expect(container.exists()).toBe(true)
    })

    it('should not render when pressureStats is null', () => {
      const wrapper = mount(PressureStatsFragment, {
        props: { modelValue: null },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const container = wrapper.find('.col-md-12')
      expect(container.exists()).toBe(false)
    })

    it('should have row class for layout', () => {
      const wrapper = mount(PressureStatsFragment, {
        props: { modelValue: samplePressureStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const row = wrapper.find('.row')
      expect(row.exists()).toBe(true)
    })
  })

  describe('Display Fields', () => {
    it('should display high pressure', () => {
      const wrapper = mount(PressureStatsFragment, {
        props: { modelValue: samplePressureStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.text()).toContain('High')
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[0].element.value).toContain('30 PSI')
    })

    it('should display low pressure', () => {
      const wrapper = mount(PressureStatsFragment, {
        props: { modelValue: samplePressureStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.text()).toContain('Low')
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[1].element.value).toContain('15 PSI')
    })

    it('should display reading count', () => {
      const wrapper = mount(PressureStatsFragment, {
        props: { modelValue: samplePressureStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.text()).toContain('#')
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[2].element.value).toContain('12')
    })

    it('should display average interval', () => {
      const wrapper = mount(PressureStatsFragment, {
        props: { modelValue: samplePressureStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.text()).toContain('Ave Int')
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[3].element.value).toContain('2.4 hours')
    })

    it('should display temperature statistics', () => {
      const wrapper = mount(PressureStatsFragment, {
        props: { modelValue: samplePressureStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[4].element.value).toContain('68°F')
      expect(inputs[5].element.value).toContain('62°F')
    })

    it('should display first and last dates', () => {
      const wrapper = mount(PressureStatsFragment, {
        props: { modelValue: samplePressureStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.text()).toContain('First')
      expect(wrapper.text()).toContain('Last')
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[6].element.value).toContain('2024-01-20')
      expect(inputs[7].element.value).toContain('2024-01-25')
    })
  })

  describe('Grid Layout', () => {
    it('should use col-md columns for responsiveness', () => {
      const wrapper = mount(PressureStatsFragment, {
        props: { modelValue: samplePressureStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const columns = wrapper.findAll('[class*="col-md"]')
      expect(columns.length).toBeGreaterThan(0)
    })

    it('should have 8 field columns', () => {
      const wrapper = mount(PressureStatsFragment, {
        props: { modelValue: samplePressureStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const columns = wrapper.findAll('.col-md-1, .col-md-2')
      expect(columns.length).toBeGreaterThanOrEqual(8)
    })
  })

  describe('V-Model Binding', () => {
    it('should accept pressureStats model', () => {
      const wrapper = mount(PressureStatsFragment, {
        props: { modelValue: samplePressureStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.props('modelValue')).toEqual(samplePressureStats)
    })

    it('should update when pressureStats changes', async () => {
      const wrapper = mount(PressureStatsFragment, {
        props: { modelValue: samplePressureStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const newStats = {
        ...samplePressureStats,
        pressure: {
          maxString: '35 PSI',
          minString: '20 PSI'
        }
      }
      await wrapper.setProps({ modelValue: newStats })
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[0].element.value).toContain('35 PSI')
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero pressure readings', () => {
      const zeroPressureStats = {
        ...samplePressureStats,
        pressure: {
          maxString: '0 PSI',
          minString: '0 PSI'
        }
      }
      const wrapper = mount(PressureStatsFragment, {
        props: { modelValue: zeroPressureStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[0].element.value).toContain('0 PSI')
    })

    it('should handle high pressure values', () => {
      const highPressureStats = {
        ...samplePressureStats,
        pressure: {
          maxString: '60 PSI',
          minString: '45 PSI'
        }
      }
      const wrapper = mount(PressureStatsFragment, {
        props: { modelValue: highPressureStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[0].element.value).toContain('60 PSI')
    })

    it('should handle missing temperature data', () => {
      const incompletePressureStats = {
        ...samplePressureStats,
        temperature: { maxString: '—', minString: '—' }
      }
      const wrapper = mount(PressureStatsFragment, {
        props: { modelValue: incompletePressureStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.find('.col-md-12').exists()).toBe(true)
    })

    it('should handle many pressure readings', () => {
      const manyReadingStats = {
        ...samplePressureStats,
        readings: '1000'
      }
      const wrapper = mount(PressureStatsFragment, {
        props: { modelValue: manyReadingStats },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs[2].element.value).toContain('1000')
    })
  })
})
