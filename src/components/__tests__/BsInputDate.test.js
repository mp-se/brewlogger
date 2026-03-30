import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BsInputDate from '../BsInputDate.vue'

describe('BsInputDate - Date Input Component', () => {
  describe('Basic Rendering', () => {
    it('should render date input field', () => {
      const wrapper = mount(BsInputDate)
      const input = wrapper.find('input[type="date"]')
      expect(input.exists()).toBe(true)
    })

    it('should have form-control class', () => {
      const wrapper = mount(BsInputDate)
      const input = wrapper.find('input')
      expect(input.classes()).toContain('form-control')
    })

    it('should accept label prop', () => {
      const wrapper = mount(BsInputDate, {
        props: { label: 'Birth Date' }
      })
      expect(wrapper.props('label')).toBe('Birth Date')
    })

    it('should accept help prop', () => {
      const wrapper = mount(BsInputDate, {
        props: { help: 'Enter your birth date' }
      })
      expect(wrapper.props('help')).toBe('Enter your birth date')
    })
  })

  describe('V-Model Binding', () => {
    it('should update model when date input changes', async () => {
      const wrapper = mount(BsInputDate, {
        props: { modelValue: '2024-01-15' }
      })
      const input = wrapper.find('input')
      await input.setValue('2024-06-20')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('should display initial date value', () => {
      const wrapper = mount(BsInputDate, {
        props: { modelValue: '2024-01-15' }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('2024-01-15')
    })

    it('should handle empty date value', () => {
      const wrapper = mount(BsInputDate, {
        props: { modelValue: '' }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('')
    })

    it('should update when modelValue prop changes', async () => {
      const wrapper = mount(BsInputDate, {
        props: { modelValue: '2024-01-01' }
      })
      await wrapper.setProps({ modelValue: '2024-12-31' })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('2024-12-31')
    })
  })

  describe('Date Format Handling', () => {
    it('should handle ISO date format', () => {
      const wrapper = mount(BsInputDate, {
        props: { modelValue: '2024-03-15' }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('2024-03-15')
    })

    it('should handle year 2000', () => {
      const wrapper = mount(BsInputDate, {
        props: { modelValue: '2000-01-01' }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('2000-01-01')
    })

    it('should handle future dates', () => {
      const wrapper = mount(BsInputDate, {
        props: { modelValue: '2099-12-31' }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('2099-12-31')
    })
  })

  describe('Disabled State', () => {
    it('should support disabled attribute', () => {
      const wrapper = mount(BsInputDate, {
        attrs: { disabled: true }
      })
      const input = wrapper.find('input')
      expect(input.attributes('disabled')).toBeDefined()
    })

    it('should support min date constraint', () => {
      const wrapper = mount(BsInputDate, {
        attrs: { min: '2024-01-01' }
      })
      const input = wrapper.find('input')
      expect(input.attributes('min')).toBe('2024-01-01')
    })

    it('should support max date constraint', () => {
      const wrapper = mount(BsInputDate, {
        attrs: { max: '2024-12-31' }
      })
      const input = wrapper.find('input')
      expect(input.attributes('max')).toBe('2024-12-31')
    })
  })

  describe('Edge Cases', () => {
    it('should handle leap year date', () => {
      const wrapper = mount(BsInputDate, {
        props: { modelValue: '2024-02-29' }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('2024-02-29')
    })

    it('should handle component without label', () => {
      const wrapper = mount(BsInputDate)
      expect(wrapper.props('label')).toBeUndefined()
    })

    it('should render input-group structure', () => {
      const wrapper = mount(BsInputDate)
      const group = wrapper.find('.input-group')
      expect(group.exists()).toBe(true)
    })
  })
})
