import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BsInputSwitch from '../BsInputSwitch.vue'

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
