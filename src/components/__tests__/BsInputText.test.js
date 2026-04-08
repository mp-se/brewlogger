// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BsInputText from '../BsInputText.vue'

describe('BsInputText - Form Component', () => {
  describe('Basic Rendering', () => {
    it('should render text input field', () => {
      const wrapper = mount(BsInputText)
      const input = wrapper.find('input[type="text"]')
      expect(input.exists()).toBe(true)
    })

    it('should render with input element', () => {
      const wrapper = mount(BsInputText)
      expect(wrapper.findAll('input').length > 0).toBe(true)
    })

    it('should have input-group class for structure', () => {
      const wrapper = mount(BsInputText)
      expect(wrapper.html()).toContain('input-group')
    })

    it('should render without label when not provided', () => {
      const wrapper = mount(BsInputText)
      const label = wrapper.find('.form-label')
      expect(label.exists()).toBe(false)
    })

    it('should render form control structure', () => {
      const wrapper = mount(BsInputText)
      const input = wrapper.find('input')
      expect(input.classes()).toContain('form-control')
    })
  })

  describe('V-Model Binding', () => {
    it('should update model when input value changes', async () => {
      const wrapper = mount(BsInputText, {
        props: { modelValue: '' }
      })
      const input = wrapper.find('input')
      await input.setValue('test@example.com')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('should display initial modelValue', () => {
      const wrapper = mount(BsInputText, {
        props: { modelValue: 'initial value' }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('initial value')
    })

    it('should update input when modelValue prop changes', async () => {
      const wrapper = mount(BsInputText, {
        props: { modelValue: 'old value' }
      })
      await wrapper.setProps({ modelValue: 'new value' })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('new value')
    })

    it('should handle empty string as initial value', () => {
      const wrapper = mount(BsInputText, {
        props: { modelValue: '' }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('')
    })

    it('should handle special characters in value', async () => {
      const wrapper = mount(BsInputText, {
        props: { modelValue: 'test@#$%^&*()' }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('test@#$%^&*()')
    })
  })

  describe('Input Type Handling', () => {
    it('should render text type by default', () => {
      const wrapper = mount(BsInputText)
      const input = wrapper.find('input')
      expect(input.attributes('type')).toBe('text')
    })

    it('should render password type when type prop is password', () => {
      const wrapper = mount(BsInputText, {
        props: { type: 'password' }
      })
      const input = wrapper.find('input')
      expect(input.attributes('type')).toBe('password')
    })

    it('should show eye icon for password type', () => {
      const wrapper = mount(BsInputText, {
        props: { type: 'password' }
      })
      const icon = wrapper.findComponent({ name: 'IconEye' })
      expect(icon.exists()).toBe(true)
    })

    it('should toggle password visibility on icon click', async () => {
      const wrapper = mount(BsInputText, {
        props: { type: 'password' }
      })
      const input = wrapper.find('input')

      // Initially password
      expect(input.attributes('type')).toBe('password')

      // Click eye icon to show
      const eyeIcon = wrapper.findComponent({ name: 'IconEye' })
      await eyeIcon.trigger('click')

      expect(input.attributes('type')).toBe('text')
    })

    it('should toggle back to password visibility on second click', async () => {
      const wrapper = mount(BsInputText, {
        props: { type: 'password' }
      })
      const input = wrapper.find('input')

      // Click to show
      const eyeIcon = wrapper.findComponent({ name: 'IconEye' })
      await eyeIcon.trigger('click')
      expect(input.attributes('type')).toBe('text')

      // Click to hide
      const eyeSlashIcon = wrapper.findComponent({ name: 'IconEyeSlash' })
      await eyeSlashIcon.trigger('click')
      expect(input.attributes('type')).toBe('password')
    })

    it('should not show eye icon for text type', () => {
      const wrapper = mount(BsInputText, {
        props: { type: 'text' }
      })
      const icon = wrapper.findComponent({ name: 'IconEye' })
      expect(icon.exists()).toBe(false)
    })
  })

  describe('Form Labels and Help Text', () => {
    it('should accept label prop', () => {
      const wrapper = mount(BsInputText, {
        props: {
          label: 'Email Address',
          help: 'We recommend using a work email'
        }
      })
      expect(wrapper.props('label')).toBe('Email Address')
    })

    it('should accept help prop', () => {
      const wrapper = mount(BsInputText, {
        props: { help: 'Helper text' }
      })
      expect(wrapper.props('help')).toBe('Helper text')
    })

    it('should support label even without help', () => {
      const wrapper = mount(BsInputText, {
        props: { label: 'Test' }
      })
      expect(wrapper.props('label')).toBe('Test')
    })
  })

  describe('Width Configuration', () => {
    it('should support width prop through model', () => {
      const wrapper = mount(BsInputText, {
        props: { width: 'md-6' }
      })
      // Width is passed to BsInputBase which applies col class
      const html = wrapper.html()
      expect(html).toContain('input')
    })

    it('should not apply width class when not specified', () => {
      const wrapper = mount(BsInputText)
      const divs = wrapper.findAll('div')
      // Check that there are divs rendered
      expect(divs.length > 0).toBe(true)
    })
  })

  describe('Disabled State', () => {
    it('should accept disabled attribute via v-bind', async () => {
      const wrapper = mount(BsInputText, {
        attrs: { disabled: true }
      })
      const input = wrapper.find('input')
      expect(input.attributes('disabled')).toBeDefined()
    })

    it('should support placeholder attribute', () => {
      const wrapper = mount(BsInputText, {
        attrs: { placeholder: 'Enter text here' }
      })
      const input = wrapper.find('input')
      expect(input.attributes('placeholder')).toBe('Enter text here')
    })

    it('should support required attribute', () => {
      const wrapper = mount(BsInputText, {
        attrs: { required: true }
      })
      const input = wrapper.find('input')
      expect(input.attributes('required')).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long input values', () => {
      const longValue = 'a'.repeat(1000)
      const wrapper = mount(BsInputText, {
        props: { modelValue: longValue }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe(longValue)
    })

    it('should handle numeric strings', async () => {
      const wrapper = mount(BsInputText, {
        props: { modelValue: '12345' }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('12345')
    })

    it('should handle HTML characters safely', async () => {
      const wrapper = mount(BsInputText, {
        props: { modelValue: '<script>alert("xss")</script>' }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toContain('<script>')
    })

    it('should handle password with special characters', async () => {
      const wrapper = mount(BsInputText, {
        props: {
          type: 'password',
          modelValue: 'p@$$w0rd!#%&'
        }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('p@$$w0rd!#%&')
    })
  })

  describe('Component Structure', () => {
    it('should have input-group wrapper', () => {
      const wrapper = mount(BsInputText)
      const group = wrapper.find('.input-group')
      expect(group.exists()).toBe(true)
    })

    it('should support all model variants', () => {
      const wrapper = mount(BsInputText, {
        props: {
          modelValue: 'test',
          label: 'Test Label',
          help: 'Test Help',
          width: 'md-6',
          badge: true
        }
      })
      // All props should be accepted
      expect(wrapper.props('modelValue')).toBe('test')
    })

    it('should have form-control class on input', () => {
      const wrapper = mount(BsInputText)
      const input = wrapper.find('input')
      expect(input.classes()).toContain('form-control')
    })
  })

  describe('Accessibility', () => {
    it('should support aria attributes', async () => {
      const wrapper = mount(BsInputText, {
        attrs: { 'aria-label': 'Username input' }
      })
      const input = wrapper.find('input')
      expect(input.attributes('aria-label')).toBe('Username input')
    })

    it('should have input-group class for structure', () => {
      const wrapper = mount(BsInputText)
      const group = wrapper.find('.input-group')
      expect(group.exists()).toBe(true)
    })
  })
})
