// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BsSelect from '../BsSelect.vue'

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
      const optionTexts = wrapper.findAll('option').map((el) => el.text())
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
          options: [{ label: 'Option with & special < chars >', value: 'special' }]
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
