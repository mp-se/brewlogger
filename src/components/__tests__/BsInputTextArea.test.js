import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BsInputTextArea from '../BsInputTextArea.vue'

describe('BsInputTextArea - Multi-line Text Input', () => {
  describe('Basic Rendering', () => {
    it('should render textarea element', () => {
      const wrapper = mount(BsInputTextArea)
      const textarea = wrapper.find('textarea')
      expect(textarea.exists()).toBe(true)
    })

    it('should have form-control class', () => {
      const wrapper = mount(BsInputTextArea)
      const textarea = wrapper.find('textarea')
      expect(textarea.classes()).toContain('form-control')
    })

    it('should accept label prop', () => {
      const wrapper = mount(BsInputTextArea, {
        props: { label: 'Comments' }
      })
      expect(wrapper.props('label')).toBe('Comments')
    })

    it('should accept help prop', () => {
      const wrapper = mount(BsInputTextArea, {
        props: { help: 'Enter multiple lines' }
      })
      expect(wrapper.props('help')).toBe('Enter multiple lines')
    })
  })

  describe('V-Model Binding', () => {
    it('should update model when textarea changes', async () => {
      const wrapper = mount(BsInputTextArea, {
        props: { modelValue: '' }
      })
      const textarea = wrapper.find('textarea')
      await textarea.setValue('Multi\nline\ntext')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('should display initial value', () => {
      const wrapper = mount(BsInputTextArea, {
        props: { modelValue: 'Initial text' }
      })
      const textarea = wrapper.find('textarea')
      expect(textarea.element.value).toBe('Initial text')
    })

    it('should handle multiline content', () => {
      const multiline = 'Line 1\nLine 2\nLine 3'
      const wrapper = mount(BsInputTextArea, {
        props: { modelValue: multiline }
      })
      const textarea = wrapper.find('textarea')
      expect(textarea.element.value).toBe(multiline)
    })
  })

  describe('TextArea Properties', () => {
    it('should support rows attribute', () => {
      const wrapper = mount(BsInputTextArea, {
        attrs: { rows: 10 }
      })
      const textarea = wrapper.find('textarea')
      expect(textarea.attributes('rows')).toBe('10')
    })

    it('should support cols attribute', () => {
      const wrapper = mount(BsInputTextArea, {
        attrs: { cols: 50 }
      })
      const textarea = wrapper.find('textarea')
      expect(textarea.attributes('cols')).toBe('50')
    })

    it('should support placeholder', () => {
      const wrapper = mount(BsInputTextArea, {
        attrs: { placeholder: 'Enter text here' }
      })
      const textarea = wrapper.find('textarea')
      expect(textarea.attributes('placeholder')).toBe('Enter text here')
    })

    it('should support disabled state', () => {
      const wrapper = mount(BsInputTextArea, {
        attrs: { disabled: true }
      })
      const textarea = wrapper.find('textarea')
      expect(textarea.attributes('disabled')).toBeDefined()
    })

    it('should support readonly state', () => {
      const wrapper = mount(BsInputTextArea, {
        attrs: { readonly: true }
      })
      const textarea = wrapper.find('textarea')
      expect(textarea.attributes('readonly')).toBeDefined()
    })
  })

  describe('Text Handling', () => {
    it('should handle very long text', () => {
      const longText = 'A'.repeat(5000)
      const wrapper = mount(BsInputTextArea, {
        props: { modelValue: longText }
      })
      const textarea = wrapper.find('textarea')
      expect(textarea.element.value).toBe(longText)
    })

    it('should preserve line breaks', () => {
      const textWithBreaks = 'Line 1\r\nLine 2\r\nLine 3'
      const wrapper = mount(BsInputTextArea, {
        props: { modelValue: textWithBreaks }
      })
      const textarea = wrapper.find('textarea')
      expect(textarea.element.value).toContain('\n')
    })

    it('should handle special characters', () => {
      const specialText = 'Text with <html> & special "chars"'
      const wrapper = mount(BsInputTextArea, {
        props: { modelValue: specialText }
      })
      const textarea = wrapper.find('textarea')
      expect(textarea.element.value).toContain('&')
    })

    it('should handle empty string', () => {
      const wrapper = mount(BsInputTextArea, {
        props: { modelValue: '' }
      })
      const textarea = wrapper.find('textarea')
      expect(textarea.element.value).toBe('')
    })
  })

  describe('Edge Cases', () => {
    it('should handle update while typing', async () => {
      const wrapper = mount(BsInputTextArea, {
        props: { modelValue: 'Start' }
      })
      const textarea = wrapper.find('textarea')
      
      await textarea.setValue('Start\nMiddle')
      await textarea.setValue('Start\nMiddle\nEnd')
      
      expect(textarea.element.value).toContain('End')
    })

    it('should allow resize based on rows/cols', () => {
      const wrapper = mount(BsInputTextArea, {
        attrs: { rows: 20, cols: 80 }
      })
      const textarea = wrapper.find('textarea')
      expect(textarea.attributes('rows')).toBe('20')
      expect(textarea.attributes('cols')).toBe('80')
    })
  })
})
