import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BsInputNumber from '../BsInputNumber.vue'
import BsSelect from '../BsSelect.vue'
import BsInputSwitch from '../BsInputSwitch.vue'

describe('BsInputNumber - Numeric Form Component', () => {
  describe('Basic Rendering', () => {
    it('should render number input field', () => {
      const wrapper = mount(BsInputNumber)
      const input = wrapper.find('input[type="number"]')
      expect(input.exists()).toBe(true)
    })

    it('should accept label prop', () => {
      const wrapper = mount(BsInputNumber, {
        props: { label: 'Temperature' }
      })
      expect(wrapper.props('label')).toBe('Temperature')
    })

    it('should accept help prop', () => {
      const wrapper = mount(BsInputNumber, {
        props: { help: 'Enter temperature in Celsius' }
      })
      expect(wrapper.props('help')).toBe('Enter temperature in Celsius')
    })
  })

  describe('V-Model Binding', () => {
    it('should update model when numeric input changes', async () => {
      const wrapper = mount(BsInputNumber, {
        props: { modelValue: 0 }
      })
      const input = wrapper.find('input')
      await input.setValue('42.5')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('should display initial numeric value', () => {
      const wrapper = mount(BsInputNumber, {
        props: { modelValue: 68 }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('68')
    })

    it('should handle decimal numbers', () => {
      const wrapper = mount(BsInputNumber, {
        props: { modelValue: 98.6 }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('98.6')
    })

    it('should handle negative numbers', () => {
      const wrapper = mount(BsInputNumber, {
        props: { modelValue: -10 }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('-10')
    })

    it('should handle zero', () => {
      const wrapper = mount(BsInputNumber, {
        props: { modelValue: 0 }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('0')
    })
  })

  describe('Number Constraints', () => {
    it('should support min attribute', () => {
      const wrapper = mount(BsInputNumber, {
        attrs: { min: 0 }
      })
      const input = wrapper.find('input')
      expect(input.attributes('min')).toBe('0')
    })

    it('should support max attribute', () => {
      const wrapper = mount(BsInputNumber, {
        attrs: { max: 100 }
      })
      const input = wrapper.find('input')
      expect(input.attributes('max')).toBe('100')
    })

    it('should support step attribute for precision', () => {
      const wrapper = mount(BsInputNumber, {
        attrs: { step: '0.1' }
      })
      const input = wrapper.find('input')
      expect(input.attributes('step')).toBe('0.1')
    })

    it('should support step as integer', () => {
      const wrapper = mount(BsInputNumber, {
        attrs: { step: 5 }
      })
      const input = wrapper.find('input')
      expect(input.attributes('step')).toBe('5')
    })
  })

  describe('Form Structure', () => {
    it('should render wrapper structure', () => {
      const wrapper = mount(BsInputNumber)
      const html = wrapper.html()
      expect(html).toContain('form-control')
    })

    it('should have form-control class on input', () => {
      const wrapper = mount(BsInputNumber)
      const input = wrapper.find('input')
      expect(input.classes()).toContain('form-control')
    })

    it('should apply width through props when specified', () => {
      const wrapper = mount(BsInputNumber, {
        props: { width: 'md-4' }
      })
      // Width is passed but rendered by BsInputBase
      expect(wrapper.props('width')).toBe('md-4')
    })
  })

  describe('Edge Cases', () => {
    it('should handle scientific notation', () => {
      const wrapper = mount(BsInputNumber, {
        props: { modelValue: 1e10 }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('10000000000')
    })

    it('should handle very large numbers', () => {
      const wrapper = mount(BsInputNumber, {
        props: { modelValue: 999999999 }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('999999999')
    })

    it('should handle very small decimals', () => {
      const wrapper = mount(BsInputNumber, {
        props: { modelValue: 0.0001 }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toContain('0.0001')
    })

    it('should support disabled state', () => {
      const wrapper = mount(BsInputNumber, {
        attrs: { disabled: true }
      })
      const input = wrapper.find('input')
      expect(input.attributes('disabled')).toBeDefined()
    })
  })
})

describe('BsSelect - Selection Component', () => {
  const defaultOptions = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3' }
  ]

  describe('Basic Rendering', () => {
    it('should render select element', () => {
      const wrapper = mount(BsSelect, {
        props: { options: defaultOptions }
      })
      const select = wrapper.find('select')
      expect(select.exists()).toBe(true)
    })

    it('should render all options from array', () => {
      const wrapper = mount(BsSelect, {
        props: { options: defaultOptions }
      })
      const options = wrapper.findAll('option')
      expect(options).toHaveLength(3)
    })

    it('should display option labels correctly', () => {
      const wrapper = mount(BsSelect, {
        props: { options: defaultOptions }
      })
      const optionTexts = wrapper.findAll('option').map(el => el.text())
      expect(optionTexts).toContain('Option 1')
      expect(optionTexts).toContain('Option 2')
      expect(optionTexts).toContain('Option 3')
    })

    it('should accept label prop', () => {
      const wrapper = mount(BsSelect, {
        props: {
          label: 'Choose Device',
          options: defaultOptions
        }
      })
      expect(wrapper.props('label')).toBe('Choose Device')
    })
  })

  describe('V-Model Binding', () => {
    it('should update model when selection changes', async () => {
      const wrapper = mount(BsSelect, {
        props: {
          modelValue: 'opt1',
          options: defaultOptions
        }
      })
      const select = wrapper.find('select')
      await select.setValue('opt2')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('should display selected option', () => {
      const wrapper = mount(BsSelect, {
        props: {
          modelValue: 'opt2',
          options: defaultOptions
        }
      })
      const select = wrapper.find('select')
      expect(select.element.value).toBe('opt2')
    })

    it('should update when modelValue prop changes', async () => {
      const wrapper = mount(BsSelect, {
        props: {
          modelValue: 'opt1',
          options: defaultOptions
        }
      })
      await wrapper.setProps({ modelValue: 'opt3' })
      const select = wrapper.find('select')
      expect(select.element.value).toBe('opt3')
    })

    it('should handle empty selection', () => {
      const wrapper = mount(BsSelect, {
        props: {
          modelValue: '',
          options: defaultOptions
        }
      })
      const select = wrapper.find('select')
      expect(select.element.value).toBe('')
    })
  })

  describe('Option Handling', () => {
    it('should handle single-item options array', () => {
      const wrapper = mount(BsSelect, {
        props: {
          options: [{ label: 'Only Option', value: 'only' }]
        }
      })
      const options = wrapper.findAll('option')
      expect(options).toHaveLength(1)
    })

    it('should handle options with numeric values', () => {
      const wrapper = mount(BsSelect, {
        props: {
          options: [
            { label: 'First', value: 1 },
            { label: 'Second', value: 2 }
          ]
        }
      })
      const options = wrapper.findAll('option')
      expect(options[0].element.value).toBe('1')
    })

    it('should render option elements', () => {
      const wrapper = mount(BsSelect, {
        props: {
          modelValue: 'opt1',
          options: defaultOptions
        }
      })
      const options = wrapper.findAll('option')
      expect(options.length).toBeGreaterThan(0)
    })
  })

  describe('Disabled State', () => {
    it('should disable select when disabled prop is true', () => {
      const wrapper = mount(BsSelect, {
        props: {
          disabled: true,
          options: defaultOptions
        }
      })
      const select = wrapper.find('select')
      expect(select.attributes('disabled')).toBeDefined()
    })

    it('should enable select when disabled prop is false', () => {
      const wrapper = mount(BsSelect, {
        props: {
          disabled: false,
          options: defaultOptions
        }
      })
      const select = wrapper.find('select')
      expect(select.attributes('disabled')).toBeUndefined()
    })

    it('should toggle disabled state dynamically', async () => {
      const wrapper = mount(BsSelect, {
        props: {
          disabled: false,
          options: defaultOptions
        }
      })
      let select = wrapper.find('select')
      expect(select.attributes('disabled')).toBeUndefined()
      
      await wrapper.setProps({ disabled: true })
      select = wrapper.find('select')
      expect(select.attributes('disabled')).toBeDefined()
    })
  })

  describe('Form Structure', () => {
    it('should render wrapper structure', () => {
      const wrapper = mount(BsSelect, {
        props: { options: defaultOptions }
      })
      const html = wrapper.html()
      expect(html).toContain('form-select')
    })

    it('should have form-select class on select', () => {
      const wrapper = mount(BsSelect, {
        props: { options: defaultOptions }
      })
      const select = wrapper.find('select')
      expect(select.classes()).toContain('form-select')
    })

    it('should apply width through props when specified', () => {
      const wrapper = mount(BsSelect, {
        props: {
          width: 'lg-8',
          options: defaultOptions
        }
      })
      // Width is passed to BsInputBase
      expect(wrapper.props('width')).toBe('lg-8')
    })
  })

  describe('Edge Cases', () => {
    it('should handle options with special characters in label', () => {
      const wrapper = mount(BsSelect, {
        props: {
          options: [
            { label: 'Option with & special < chars >', value: 'special' }
          ]
        }
      })
      const optionText = wrapper.find('option').text()
      expect(optionText).toContain('Option with & special')
    })

    it('should handle very long option labels', () => {
      const longLabel = 'A'.repeat(100)
      const wrapper = mount(BsSelect, {
        props: {
          options: [{ label: longLabel, value: 'long' }]
        }
      })
      const option = wrapper.find('option')
      expect(option.text()).toBe(longLabel)
    })

    it('should handle empty options array gracefully', () => {
      const wrapper = mount(BsSelect, {
        props: { options: [] }
      })
      const options = wrapper.findAll('option')
      expect(options).toHaveLength(0)
    })
  })
})

describe('BsInputSwitch - Toggle Component', () => {
  describe('Basic Rendering', () => {
    it('should render checkbox input', () => {
      const wrapper = mount(BsInputSwitch)
      const input = wrapper.find('input[type="checkbox"]')
      expect(input.exists()).toBe(true)
    })

    it('should accept label prop', () => {
      const wrapper = mount(BsInputSwitch, {
        props: { label: 'Enabled' }
      })
      expect(wrapper.props('label')).toBe('Enabled')
    })

    it('should render form structure', () => {
      const wrapper = mount(BsInputSwitch)
      const formCheck = wrapper.find('.form-check')
      expect(formCheck.exists()).toBe(true)
    })
  })

  describe('V-Model Binding', () => {
    it('should update model when checkbox is toggled', async () => {
      const wrapper = mount(BsInputSwitch, {
        props: { modelValue: false }
      })
      const input = wrapper.find('input')
      await input.setValue(true)
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('should display checked state for true value', () => {
      const wrapper = mount(BsInputSwitch, {
        props: { modelValue: true }
      })
      const input = wrapper.find('input')
      expect(input.element.checked).toBe(true)
    })

    it('should display unchecked state for false value', () => {
      const wrapper = mount(BsInputSwitch, {
        props: { modelValue: false }
      })
      const input = wrapper.find('input')
      expect(input.element.checked).toBe(false)
    })
  })

  describe('Form Structure', () => {
    it('should render wrapper structure', () => {
      const wrapper = mount(BsInputSwitch)
      const html = wrapper.html()
      expect(html).toContain('form-check')
    })

    it('should have form-check class for layout', () => {
      const wrapper = mount(BsInputSwitch)
      const formCheck = wrapper.find('.form-check')
      expect(formCheck.exists()).toBe(true)
    })
  })

  describe('Disabled State', () => {
    it('should disable switch when disabled prop is true', () => {
      const wrapper = mount(BsInputSwitch, {
        props: { disabled: true }
      })
      const input = wrapper.find('input')
      expect(input.attributes('disabled')).toBeDefined()
    })

    it('should enable switch when disabled prop is false', () => {
      const wrapper = mount(BsInputSwitch, {
        props: { disabled: false }
      })
      const input = wrapper.find('input')
      expect(input.attributes('disabled')).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid toggling', async () => {
      const wrapper = mount(BsInputSwitch, {
        props: { modelValue: false }
      })
      const input = wrapper.find('input')
      
      await input.setValue(true)
      await input.setValue(false)
      await input.setValue(true)
      
      expect(input.element.checked).toBe(true)
    })

    it('should accept badge prop', () => {
      const wrapper = mount(BsInputSwitch, {
        props: { badge: true }
      })
      expect(wrapper.props('badge')).toBe(true)
    })
  })
})
