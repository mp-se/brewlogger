import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FermentationStepFragment from '../FermentationStepFragment.vue'
import BsInputReadonly from '../../components/BsInputReadonly.vue'
import BsInputBase from '../../components/BsInputBase.vue'

describe('FermentationStepFragment - Fermentation Steps Table', () => {
  const sampleFermentationSteps = [
    {
      order: 0,
      date: '2024-01-15 to 2024-01-20',
      temp: '20°C',
      days: '5',
      name: 'Primary',
      type: 'Mash'
    },
    {
      order: 1,
      date: '2024-01-20 to 2024-01-25',
      temp: '20°C',
      days: '5',
      name: 'Secondary',
      type: 'Boil'
    },
    {
      order: 2,
      date: '2024-01-25 to 2024-02-01',
      temp: '18°C',
      days: '7',
      name: 'Conditioning',
      type: 'Yeast'
    }
  ]

  describe('Basic Rendering', () => {
    it('should render when fermentationSteps is provided', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: sampleFermentationSteps },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.find('table').exists()).toBe(true)
    })

    it('should not render when fermentationSteps is empty', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: [] },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(0)
    })

    it('should render table headers', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: sampleFermentationSteps },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const headers = wrapper.findAll('th')
      expect(headers.length).toBeGreaterThan(0)
    })
  })

  describe('Table Headers', () => {
    it('should display column headers', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: sampleFermentationSteps },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const headerText = wrapper.text()
      expect(headerText).toContain('Step')
      expect(headerText).toContain('Name')
      expect(headerText).toContain('Type')
    })

    it('should have table header tags', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: sampleFermentationSteps },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const thead = wrapper.find('thead')
      expect(thead.exists()).toBe(true)
    })
  })

  describe('Table Rows', () => {
    it('should render row for each fermentation step', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: sampleFermentationSteps },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(sampleFermentationSteps.length)
    })

    it('should display step names in rows', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: sampleFermentationSteps },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const tableText = wrapper.text()
      expect(tableText).toContain('Primary')
      expect(tableText).toContain('Secondary')
      expect(tableText).toContain('Conditioning')
    })

    it('should display step types in rows', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: sampleFermentationSteps },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const tableText = wrapper.text()
      expect(tableText).toContain('Mash')
      expect(tableText).toContain('Boil')
      expect(tableText).toContain('Yeast')
    })
  })

  describe('Table Styling', () => {
    it('should have appropriate table classes', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: sampleFermentationSteps },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const table = wrapper.find('table')
      expect(table.exists()).toBe(true)
    })

    it('should render thead element', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: sampleFermentationSteps },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.find('thead').exists()).toBe(true)
    })

    it('should render tbody element', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: sampleFermentationSteps },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.find('tbody').exists()).toBe(true)
    })
  })

  describe('V-Model Binding', () => {
    it('should accept fermentationSteps prop', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: sampleFermentationSteps },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.props('fermentationSteps')).toEqual(sampleFermentationSteps)
    })

    it('should update when fermentationSteps changes', async () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: sampleFermentationSteps },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const newSteps = [
        {
          order: 0,
          date: '2024-02-01 to 2024-02-05',
          temp: '22°C',
          days: '4',
          name: 'Updated',
          type: 'Updated Type'
        }
      ]
      await wrapper.setProps({ fermentationSteps: newSteps })
      expect(wrapper.text()).toContain('Updated')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty fermentation steps array', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: [] },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(0)
    })

    it('should handle single fermentation step', () => {
      const singleStep = [sampleFermentationSteps[0]]
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: singleStep },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(1)
    })

    it('should render table with correct structure', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: sampleFermentationSteps },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      expect(wrapper.find('table.table.table-striped').exists()).toBe(true)
    })

    it('should handle many fermentation steps', () => {
      const manySteps = Array.from({ length: 50 }, (_, i) => ({
        order: i,
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        temp: `${20 + (i % 5)}°C`,
        days: `${i + 1}`,
        name: `Step ${i + 1}`,
        type: `Type ${i % 3}`
      }))
      const wrapper = mount(FermentationStepFragment, {
        props: { fermentationSteps: manySteps },
        global: {
          components: { BsInputReadonly, BsInputBase }
        }
      })
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(50)
    })
  })
})
