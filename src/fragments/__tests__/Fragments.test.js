import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FermentationStepFragment from '../FermentationStepFragment.vue'
import GravityStatsFragment from '../GravityStatsFragment.vue'
import PressureStatsFragment from '../PressureStatsFragment.vue'
import BsInputReadonly from '../../components/BsInputReadonly.vue'
import BsInputBase from '../../components/BsInputBase.vue'

describe('FermentationStepFragment - Fermentation Steps Table', () => {
  const sampleSteps = [
    {
      order: 0,
      date: '2024-01-15',
      temp: '68°F',
      days: 5,
      name: 'Mash In',
      type: 'Mashing'
    },
    {
      order: 1,
      date: '2024-01-20',
      temp: '70°F',
      days: 3,
      name: 'Fermentation',
      type: 'Primary'
    },
    {
      order: 2,
      date: '2024-01-23',
      temp: '65°F',
      days: 7,
      name: 'Conditioning',
      type: 'Secondary'
    }
  ]

  describe('Basic Rendering', () => {
    it('should render table element', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { model: { fermentationSteps: sampleSteps } }
      })
      const table = wrapper.find('table')
      expect(table.exists()).toBe(true)
    })

    it('should have table-striped class', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { 'fermentationSteps': sampleSteps }
      })
      const table = wrapper.find('table')
      expect(table.classes()).toContain('table-striped')
    })

    it('should have table class', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { 'fermentationSteps': sampleSteps }
      })
      const table = wrapper.find('table')
      expect(table.classes()).toContain('table')
    })
  })

  describe('Table Headers', () => {
    it('should render thead with headers', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { 'fermentationSteps': sampleSteps }
      })
      const thead = wrapper.find('thead')
      expect(thead.exists()).toBe(true)
    })

    it('should render all 6 header columns', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { 'fermentationSteps': sampleSteps }
      })
      const headers = wrapper.findAll('thead th')
      expect(headers.length).toBe(6)
    })

    it('should have correct header texts', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { 'fermentationSteps': sampleSteps }
      })
      const headerTexts = wrapper.findAll('thead th').map(h => h.text())
      expect(headerTexts).toContain('Step')
      expect(headerTexts).toContain('Date')
      expect(headerTexts).toContain('Temperature')
      expect(headerTexts).toContain('Days')
      expect(headerTexts).toContain('Name')
      expect(headerTexts).toContain('Type')
    })

    it('should have scope="col" on headers', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { 'fermentationSteps': sampleSteps }
      })
      const headers = wrapper.findAll('thead th')
      headers.forEach(header => {
        expect(header.attributes('scope')).toBe('col')
      })
    })
  })

  describe('Table Body Rows', () => {
    it('should render tbody element', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { 'fermentationSteps': sampleSteps }
      })
      const tbody = wrapper.find('tbody')
      expect(tbody.exists()).toBe(true)
    })

    it('should render one row per fermentation step', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { 'fermentationSteps': sampleSteps }
      })
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(sampleSteps.length)
    })

    it('should display step order starting from 1', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { 'fermentationSteps': sampleSteps }
      })
      const firstRow = wrapper.find('tbody tr')
      expect(firstRow.text()).toContain('1')
    })

    it('should display all step data correctly', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { 'fermentationSteps': sampleSteps }
      })
      const firstRow = wrapper.find('tbody tr')
      expect(firstRow.text()).toContain('2024-01-15')
      expect(firstRow.text()).toContain('68°F')
      expect(firstRow.text()).toContain('5')
      expect(firstRow.text()).toContain('Mash In')
      expect(firstRow.text()).toContain('Mashing')
    })
  })

  describe('Column Styling', () => {
    it('should have col-sm classes for width', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { 'fermentationSteps': sampleSteps }
      })
      const headers = wrapper.findAll('thead th')
      expect(headers[0].classes().join(' ')).toContain('col-sm')
    })
  })

  describe('V-Model Binding', () => {
    it('should accept fermentationSteps model', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: sampleSteps }
      })
      expect(wrapper.props('fermentationSteps')).toEqual(sampleSteps)
    })

    it('should update when fermentationSteps changes', async () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: sampleSteps }
      })
      const newSteps = [
        {
          order: 0,
          date: '2024-02-01',
          temp: '72°F',
          days: 2,
          name: 'Test',
          type: 'Test'
        }
      ]
      await wrapper.setProps({ fermentationSteps: newSteps })
      expect(wrapper.findAll('tbody tr').length).toBe(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty array', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: [] }
      })
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(0)
    })

    it('should handle single fermentation step', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: [sampleSteps[0]] }
      })
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(1)
    })

    it('should handle many fermentation steps', () => {
      const manySteps = Array.from({ length: 100 }, (_, i) => ({
        order: i,
        date: `2024-01-${(i % 28) + 1}`,
        temp: '68°F',
        days: i + 1,
        name: `Step ${i + 1}`,
        type: 'Test'
      }))
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: manySteps }
      })
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(100)
    })

    it('should handle special characters in step name', () => {
      const stepsWithSpecialChars = [{
        order: 0,
        date: '2024-01-15',
        temp: '68°F',
        days: 5,
        name: 'Test & Mash',
        type: 'Mashing & Cooling'
      }]
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: stepsWithSpecialChars }
      })
      expect(wrapper.text()).toContain('Test & Mash')
    })
  })
})

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
})

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
