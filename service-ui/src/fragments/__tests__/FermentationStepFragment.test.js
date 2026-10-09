// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FermentationStepFragment from '../FermentationStepFragment.vue'

describe('FermentationStepFragment - Inline Editor', () => {
  const sampleSteps = [
    {
      order: 0,
      date: '',
      temp: 20,
      days: 5,
      type: 'Primary'
    },
    {
      order: 1,
      date: '',
      temp: 18,
      days: 7,
      type: 'Secondary'
    }
  ]

  describe('Empty State', () => {
    it('should display empty message when no steps', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: [],
          tempUnit: 'C'
        }
      })
      expect(wrapper.find('.alert-info').exists()).toBe(true)
      expect(wrapper.text()).toContain('No fermentation steps defined yet.')
    })

    it('should not display table when no steps', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: [],
          tempUnit: 'C'
        }
      })
      expect(wrapper.find('table').exists()).toBe(false)
    })
  })

  describe('Rendering with Steps', () => {
    it('should render table with steps', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: sampleSteps,
          tempUnit: 'C'
        }
      })
      expect(wrapper.find('table').exists()).toBe(true)
      expect(wrapper.findAll('tbody tr').length).toBe(2)
    })

    it('should display correct column headers', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: sampleSteps,
          tempUnit: 'C'
        }
      })
      const headers = wrapper.findAll('th')
      const headerTexts = headers.map((h) => h.text())
      expect(headerTexts).toContain('Step')
      expect(headerTexts).toContain('Type')
      expect(headerTexts).toContain('Temp')
      expect(headerTexts).toContain('Days')
    })

    it('should display step numbers starting from 1', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: sampleSteps,
          tempUnit: 'C'
        }
      })
      const rows = wrapper.findAll('tbody tr')
      expect(rows[0].text()).toContain('1')
      expect(rows[1].text()).toContain('2')
    })
  })

  describe('Editing Functionality', () => {
    it('should render input fields for type', async () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: sampleSteps,
          tempUnit: 'C'
        }
      })
      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('should render editable temperature field', async () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: sampleSteps,
          tempUnit: 'C'
        }
      })
      const tempInputs = wrapper.findAll('input[type="number"]')
      const tempFields = tempInputs.filter((input) => {
        const parent = input.element.parentElement
        return parent?.classList.contains('input-group')
      })
      expect(tempFields.length).toBe(2)
    })

    it('should render editable days field', async () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: sampleSteps,
          tempUnit: 'C'
        }
      })
      const numberInputs = wrapper.findAll('input[type="number"]')
      expect(numberInputs.length).toBeGreaterThan(0)
    })

    it('should update step type on input change', async () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: sampleSteps,
          tempUnit: 'C'
        }
      })
      const typeInputs = wrapper.findAll('input[type="text"]')
      await typeInputs[0].setValue('Tertiary')
      await wrapper.vm.$nextTick()
      expect(typeInputs[0].element.value).toBe('Tertiary')
    })
  })

  describe('Temperature Unit Display', () => {
    it('should display °C when tempUnit is C', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: sampleSteps,
          tempUnit: 'C'
        }
      })
      const unitBadges = wrapper.findAll('.input-group-text')
      expect(unitBadges[0].text()).toContain('°C')
    })

    it('should display °F when tempUnit is F', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: sampleSteps,
          tempUnit: 'F'
        }
      })
      const unitBadges = wrapper.findAll('.input-group-text')
      expect(unitBadges[0].text()).toContain('°F')
    })

    it('should have temperature input with correct bounds', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: sampleSteps,
          tempUnit: 'C'
        }
      })
      const tempInputs = wrapper.findAll('input[type="number"]')
      const tempInput = tempInputs.find((input) => {
        const parent = input.element.parentElement
        return parent?.classList.contains('input-group')
      })
      expect(tempInput?.attributes('min')).toBe('0')
      expect(tempInput?.attributes('max')).toBe('99')
    })
  })

  describe('Add Step Button', () => {
    it('should render add step button', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: [],
          tempUnit: 'C'
        }
      })
      const addBtn = wrapper.find('.btn-secondary')
      expect(addBtn.exists()).toBe(true)
      expect(addBtn.text()).toContain('Add Step')
    })

    it('should add new step when button clicked', async () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: [],
          tempUnit: 'C'
        }
      })
      const addBtn = wrapper.find('.btn-secondary')
      await addBtn.trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('update:fermentationSteps')).toBeTruthy()
      const emitted = wrapper.emitted('update:fermentationSteps')[0]
      expect(emitted[0].length).toBe(1)
    })

    it('should add step with default values', async () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: [],
          tempUnit: 'C'
        }
      })
      const addBtn = wrapper.find('.btn-secondary')
      await addBtn.trigger('click')
      await wrapper.vm.$nextTick()
      const emitted = wrapper.emitted('update:fermentationSteps')[0]
      const newStep = emitted[0][0]
      expect(newStep.order).toBe(0)
      expect(newStep.type).toBe('')
      expect(newStep.temp).toBe(0)
      expect(newStep.days).toBe(1)
    })

    it('should increment order correctly for new steps', async () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: sampleSteps,
          tempUnit: 'C'
        }
      })
      const addBtn = wrapper.find('.btn-secondary')
      await addBtn.trigger('click')
      await wrapper.vm.$nextTick()
      const emitted = wrapper.emitted('update:fermentationSteps')[0]
      const newStep = emitted[0][2]
      expect(newStep.order).toBe(2)
    })
  })

  describe('Delete Step Button', () => {
    it('should render delete button for each step', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: sampleSteps,
          tempUnit: 'C'
        }
      })
      const deleteButtons = wrapper.findAll('.btn-danger')
      expect(deleteButtons.length).toBe(2)
    })

    it('should delete step when button clicked', async () => {
      const steps = JSON.parse(JSON.stringify(sampleSteps))
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: steps,
          tempUnit: 'C'
        }
      })
      const deleteButtons = wrapper.findAll('.btn-danger')
      await deleteButtons[0].trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('update:fermentationSteps')).toBeTruthy()
      const emitted = wrapper.emitted('update:fermentationSteps')[0]
      expect(emitted[0].length).toBe(1)
    })

    it('should reorder remaining steps after deletion', async () => {
      const steps = JSON.parse(JSON.stringify(sampleSteps))
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: steps,
          tempUnit: 'C'
        }
      })
      const deleteButtons = wrapper.findAll('.btn-danger')
      await deleteButtons[0].trigger('click')
      await wrapper.vm.$nextTick()
      const emitted = wrapper.emitted('update:fermentationSteps')[0]
      const remainingSteps = emitted[0]
      expect(remainingSteps[0].order).toBe(0)
    })
  })

  describe('v-model Integration', () => {
    it('should sync initial model value', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: sampleSteps,
          tempUnit: 'C'
        }
      })
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(2)
    })

    it('should update when parent model changes', async () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: sampleSteps,
          tempUnit: 'C'
        }
      })
      const newSteps = [
        {
          order: 0,
          date: '',
          temp: 25,
          days: 3,
          type: 'New Step'
        }
      ]
      await wrapper.setProps({ fermentationSteps: newSteps })
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(1)
    })

    it('should handle undefined and null gracefully', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: null,
          tempUnit: 'C'
        }
      })
      expect(wrapper.find('.alert-info').exists()).toBe(true)
    })
  })

  describe('Data Preservation', () => {
    it('should handle steps with missing fields', async () => {
      const incompleteSteps = [
        {
          order: 0,
          type: 'Primary'
        },
        {
          order: 1,
          days: 5
        }
      ]
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: incompleteSteps,
          tempUnit: 'C'
        }
      })
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(2)
    })
  })

  describe('Input Validation', () => {
    it('should enforce days minimum of 1', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: sampleSteps,
          tempUnit: 'C'
        }
      })
      const numberInputs = wrapper.findAll('input[type="number"]')
      const daysInputs = numberInputs.filter((input) => {
        const parent = input.element.parentElement
        return !parent?.classList.contains('input-group')
      })
      expect(daysInputs[0]?.attributes('min')).toBe('1')
    })

    it('should enforce days maximum of 365', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: sampleSteps,
          tempUnit: 'C'
        }
      })
      const numberInputs = wrapper.findAll('input[type="number"]')
      const daysInputs = numberInputs.filter((input) => {
        const parent = input.element.parentElement
        return !parent?.classList.contains('input-group')
      })
      expect(daysInputs[0]?.attributes('max')).toBe('365')
    })

    it('should allow temperature step of 0.1', () => {
      const wrapper = mount(FermentationStepFragment, {
        props: {
          fermentationSteps: sampleSteps,
          tempUnit: 'C'
        }
      })
      const tempInputs = wrapper.findAll('input[type="number"]')
      const tempField = tempInputs.find((input) => {
        const parent = input.element.parentElement
        return parent?.classList.contains('input-group')
      })
      expect(tempField?.attributes('step')).toBe('0.1')
    })
  })
})
