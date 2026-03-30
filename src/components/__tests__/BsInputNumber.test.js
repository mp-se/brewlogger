import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BsInputNumber from '../BsInputNumber.vue'

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
