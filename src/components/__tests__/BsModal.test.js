// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BsModal from '../BsModal.vue'

describe('BsModal - Information Display Modal', () => {
  describe('Basic Rendering', () => {
    it('should render trigger button with text', () => {
      const wrapper = mount(BsModal, {
        props: {
          modelValue: 'Modal Content',
          button: 'View Details',
          title: 'Details'
        }
      })
      const button = wrapper.find('button')
      expect(button.text()).toContain('View Details')
    })

    it('should render modal structure with title', () => {
      const wrapper = mount(BsModal, {
        props: {
          modelValue: 'Content',
          button: 'Open',
          title: 'Modal Title'
        }
      })
      const title = wrapper.find('.modal-title')
      expect(title.text()).toContain('Modal Title')
    })

    it('should render modal with body content', () => {
      const wrapper = mount(BsModal, {
        props: {
          modelValue: 'Test Content',
          button: 'Open',
          title: 'Test'
        }
      })
      const body = wrapper.find('.modal-body')
      expect(body.text()).toContain('Test Content')
    })

    it('should render close button in footer', () => {
      const wrapper = mount(BsModal, {
        props: {
          modelValue: 'Content',
          button: 'Open',
          title: 'Test'
        }
      })
      const closeBtn = wrapper.find('[data-bs-dismiss="modal"]')
      expect(closeBtn.exists()).toBe(true)
    })

    it('should have correct modal classes', () => {
      const wrapper = mount(BsModal, {
        props: {
          modelValue: 'Content',
          button: 'Open',
          title: 'Test'
        }
      })
      const modal = wrapper.find('.modal')
      expect(modal.classes()).toContain('fade')
      expect(modal.classes()).toContain('modal-lg')
    })
  })

  describe('V-Model Binding', () => {
    it('should display content from modelValue', () => {
      const wrapper = mount(BsModal, {
        props: {
          modelValue: 'Important Data',
          button: 'View',
          title: 'Data'
        }
      })
      const body = wrapper.find('.modal-body')
      expect(body.text()).toContain('Important Data')
    })

    it('should update content when modelValue changes', async () => {
      const wrapper = mount(BsModal, {
        props: {
          modelValue: 'Initial',
          button: 'View',
          title: 'Data'
        }
      })
      await wrapper.setProps({ modelValue: 'Updated' })
      const body = wrapper.find('.modal-body')
      expect(body.text()).toContain('Updated')
    })

    it('should handle empty modelValue', () => {
      const wrapper = mount(BsModal, {
        props: {
          modelValue: '',
          button: 'View',
          title: 'Data'
        }
      })
      const body = wrapper.find('.modal-body')
      expect(body.text()).toBe('')
    })
  })

  describe('JSON Formatting', () => {
    it('should format valid JSON content with indentation', () => {
      const jsonContent = '{"key":"value","nested":{"prop":"data"}}'
      const wrapper = mount(BsModal, {
        props: {
          modelValue: jsonContent,
          button: 'View',
          title: 'JSON Data'
        }
      })
      const body = wrapper.find('.modal-body')
      // Formatted JSON should have newlines and indentation
      expect(body.html()).toContain('pre')
    })

    it('should render non-JSON content as plain text', () => {
      const wrapper = mount(BsModal, {
        props: {
          modelValue: 'Plain text content',
          button: 'View',
          title: 'Text'
        }
      })
      const body = wrapper.find('.modal-body')
      expect(body.text()).toContain('Plain text content')
    })

    it('should handle FormData format', () => {
      const formData = 'field1=value1&field2=value2'
      const wrapper = mount(BsModal, {
        props: {
          modelValue: formData,
          button: 'View',
          title: 'Form'
        }
      })
      const body = wrapper.find('.modal-body')
      expect(body.text()).toContain('field1')
    })
  })

  describe('Modal Properties', () => {
    it('should update button text when button prop changes', async () => {
      const wrapper = mount(BsModal, {
        props: {
          modelValue: 'Content',
          button: 'Initial Text',
          title: 'Test'
        }
      })
      await wrapper.setProps({ button: 'New Text' })
      const button = wrapper.find('button')
      expect(button.text()).toContain('New Text')
    })

    it('should update title when title prop changes', async () => {
      const wrapper = mount(BsModal, {
        props: {
          modelValue: 'Content',
          button: 'Open',
          title: 'Initial Title'
        }
      })
      await wrapper.setProps({ title: 'New Title' })
      const title = wrapper.find('.modal-title')
      expect(title.text()).toContain('New Title')
    })
  })

  describe('Trigger Button', () => {
    it('should have Bootstrap button styling', () => {
      const wrapper = mount(BsModal, {
        props: {
          modelValue: 'Content',
          button: 'Open',
          title: 'Test'
        }
      })
      const button = wrapper.find('button')
      expect(button.classes()).toContain('btn')
      expect(button.classes()).toContain('btn-secondary')
    })

    it('should have correct data attributes for Bootstrap toggle', () => {
      const wrapper = mount(BsModal, {
        props: {
          modelValue: 'Content',
          button: 'Open',
          title: 'Test'
        }
      })
      const button = wrapper.find('button')
      expect(button.attributes('data-bs-toggle')).toBe('modal')
      expect(button.attributes('data-bs-target')).toContain('modal')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long content', () => {
      const longContent = 'A'.repeat(10000)
      const wrapper = mount(BsModal, {
        props: {
          modelValue: longContent,
          button: 'View',
          title: 'Long'
        }
      })
      const body = wrapper.find('.modal-body')
      expect(body.text()).toContain('AAAA')
    })

    it('should handle HTML-like strings safely', () => {
      const htmlLike = '<div>Not HTML</div>'
      const wrapper = mount(BsModal, {
        props: {
          modelValue: htmlLike,
          button: 'View',
          title: 'Test'
        }
      })
      const body = wrapper.find('.modal-body')
      expect(body.text()).toContain('<div>')
    })

    it('should handle special characters in button and title', () => {
      const wrapper = mount(BsModal, {
        props: {
          modelValue: 'Content',
          button: 'Button with & special < chars',
          title: 'Title with "quotes"'
        }
      })
      const button = wrapper.find('button')
      const title = wrapper.find('.modal-title')
      expect(button.text()).toContain('&')
      expect(title.text()).toContain('quotes')
    })
  })

  describe('Modal Accessibility', () => {
    it('should have modal structure for screen readers', () => {
      const wrapper = mount(BsModal, {
        props: {
          modelValue: 'Content',
          button: 'Open',
          title: 'Test'
        }
      })
      const modal = wrapper.find('.modal')
      expect(modal.attributes('tabindex')).toBe('-1')
      expect(modal.attributes('aria-hidden')).toBe('true')
    })

    it('should have close button aria label', () => {
      const wrapper = mount(BsModal, {
        props: {
          modelValue: 'Content',
          button: 'Open',
          title: 'Test'
        }
      })
      const closeBtn = wrapper.find('.btn-close')
      expect(closeBtn.attributes('aria-label')).toContain('Close')
    })
  })
})
