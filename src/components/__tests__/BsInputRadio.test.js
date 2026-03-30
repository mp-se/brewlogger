import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BsInputRadio from '../BsInputRadio.vue'

describe('BsInputRadio - Radio Button Component', () => {
  const testOptions = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3' }
  ]

  describe('Basic Rendering', () => {
    it('should render radio inputs', () => {
      const wrapper = mount(BsInputRadio, {
        props: { options: testOptions }
      })
      const radios = wrapper.findAll('input[type="radio"]')
      expect(radios.length).toBe(3)
    })

    it('should render all option labels', () => {
      const wrapper = mount(BsInputRadio, {
        props: { options: testOptions }
      })
      testOptions.forEach(option => {
        expect(wrapper.html()).toContain(option.label)
      })
    })

    it('should accept label prop for group', () => {
      const wrapper = mount(BsInputRadio, {
        props: {
          label: 'Choose One',
          options: testOptions
        }
      })
      expect(wrapper.props('label')).toBe('Choose One')
    })
  })

  describe('V-Model Binding', () => {
    it('should update model when radio is selected', async () => {
      const wrapper = mount(BsInputRadio, {
        props: {
          modelValue: 'opt1',
          options: testOptions
        }
      })
      const radios = wrapper.findAll('input[type="radio"]')
      await radios[1].setValue('opt2')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('should display selected radio', () => {
      const wrapper = mount(BsInputRadio, {
        props: {
          modelValue: 'opt2',
          options: testOptions
        }
      })
      const radios = wrapper.findAll('input[type="radio"]')
      const selectedRadio = radios.find(r => r.element.value === 'opt2')
      expect(selectedRadio?.element.checked).toBe(true)
    })

    it('should handle empty selection', () => {
      const wrapper = mount(BsInputRadio, {
        props: {
          modelValue: '',
          options: testOptions
        }
      })
      const radios = wrapper.findAll('input[type="radio"]')
      radios.forEach(radio => {
        expect(radio.element.checked).toBe(false)
      })
    })
  })

  describe('Options Handling', () => {
    it('should handle single option', () => {
      const wrapper = mount(BsInputRadio, {
        props: {
          options: [{ label: 'Only', value: 'only' }]
        }
      })
      const radios = wrapper.findAll('input[type="radio"]')
      expect(radios).toHaveLength(1)
    })

    it('should handle numeric values', () => {
      const wrapper = mount(BsInputRadio, {
        props: {
          options: [
            { label: 'One', value: 1 },
            { label: 'Two', value: 2 }
          ]
        }
      })
      const radios = wrapper.findAll('input[type="radio"]')
      expect(radios[0].element.value).toBe('1')
    })

    it('should have button structure for each radio', () => {
      const wrapper = mount(BsInputRadio, {
        props: { options: testOptions }
      })
      const checks = wrapper.findAll('.btn-check')
      expect(checks.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Disabled State', () => {
    it('should support disabled attribute', () => {
      const wrapper = mount(BsInputRadio, {
        props: {
          options: testOptions,
          disabled: true
        }
      })
      const radios = wrapper.findAll('input[type="radio"]')
      radios.forEach(radio => {
        expect(radio.attributes('disabled')).toBeDefined()
      })
    })

    it('should toggle disabled state', async () => {
      const wrapper = mount(BsInputRadio, {
        props: {
          options: testOptions,
          disabled: false
        }
      })
      let radios = wrapper.findAll('input[type="radio"]')
      radios.forEach(radio => {
        expect(radio.attributes('disabled')).toBeUndefined()
      })

      await wrapper.setProps({ disabled: true })
      radios = wrapper.findAll('input[type="radio"]')
      radios.forEach(radio => {
        expect(radio.attributes('disabled')).toBeDefined()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle options with special characters', () => {
      const wrapper = mount(BsInputRadio, {
        props: {
          options: [
            { label: 'Option & Special', value: 'special' }
          ]
        }
      })
      expect(wrapper.html()).toContain('&')
    })

    it('should handle empty options array', () => {
      const wrapper = mount(BsInputRadio, {
        props: { options: [] }
      })
      const radios = wrapper.findAll('input[type="radio"]')
      expect(radios).toHaveLength(0)
    })
  })
})
