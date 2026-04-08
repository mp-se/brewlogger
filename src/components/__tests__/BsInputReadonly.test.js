// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BsInputReadonly from '../BsInputReadonly.vue'

describe('BsInputReadonly - Read-only Input Component', () => {
  describe('Basic Rendering', () => {
    it('should render readonly input', () => {
      const wrapper = mount(BsInputReadonly, {
        props: { modelValue: 'Read Only Value' }
      })
      const input = wrapper.find('input')
      expect(input.exists()).toBe(true)
    })

    it('should have readonly attribute', () => {
      const wrapper = mount(BsInputReadonly, {
        props: { modelValue: 'Test Value' }
      })
      const input = wrapper.find('input')
      expect(input.attributes('readonly')).toBeDefined()
    })

    it('should display value prop', () => {
      const wrapper = mount(BsInputReadonly, {
        props: { modelValue: 'Display Value' }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('Display Value')
    })

    it('should accept label prop', () => {
      const wrapper = mount(BsInputReadonly, {
        props: {
          modelValue: 'Value',
          label: 'Status'
        }
      })
      expect(wrapper.props('label')).toBe('Status')
    })
  })

  describe('Content Handling', () => {
    it('should display long text values', () => {
      const longText = 'A'.repeat(200)
      const wrapper = mount(BsInputReadonly, {
        props: { modelValue: longText }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe(longText)
    })

    it('should display special characters', () => {
      const wrapper = mount(BsInputReadonly, {
        props: { modelValue: 'Value with & special < chars >' }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toContain('&')
    })

    it('should handle numeric strings', () => {
      const wrapper = mount(BsInputReadonly, {
        props: { modelValue: '12345' }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('12345')
    })

    it('should handle empty string', () => {
      const wrapper = mount(BsInputReadonly, {
        props: { modelValue: '' }
      })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('')
    })
  })

  describe('Update Behavior', () => {
    it('should update when modelValue prop changes', async () => {
      const wrapper = mount(BsInputReadonly, {
        props: { modelValue: 'Initial' }
      })
      await wrapper.setProps({ modelValue: 'Updated' })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('Updated')
    })

    it('should not be editable by user', () => {
      const wrapper = mount(BsInputReadonly, {
        props: { modelValue: 'Protected' }
      })
      const input = wrapper.find('input')
      expect(input.attributes('readonly')).toBeDefined()
    })
  })

  describe('Styling', () => {
    it('should have form-control-plaintext class', () => {
      const wrapper = mount(BsInputReadonly, {
        props: { modelValue: 'Value' }
      })
      const input = wrapper.find('input')
      expect(input.classes()).toContain('form-control-plaintext')
    })

    it('should have appropriate disabled styling', () => {
      const wrapper = mount(BsInputReadonly, {
        props: { modelValue: 'Value' }
      })
      const input = wrapper.find('input')
      expect(input.attributes('readonly')).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle component without label', () => {
      const wrapper = mount(BsInputReadonly, {
        props: { modelValue: 'Value' }
      })
      expect(wrapper.props('label')).toBeUndefined()
    })

    it('should support help text', () => {
      const wrapper = mount(BsInputReadonly, {
        props: {
          modelValue: 'Value',
          help: 'This is readonly'
        }
      })
      expect(wrapper.props('help')).toBe('This is readonly')
    })

    it('should handle rapid prop updates', async () => {
      const wrapper = mount(BsInputReadonly, {
        props: { modelValue: 'Value 1' }
      })
      await wrapper.setProps({ modelValue: 'Value 2' })
      await wrapper.setProps({ modelValue: 'Value 3' })
      const input = wrapper.find('input')
      expect(input.element.value).toBe('Value 3')
    })
  })
})
