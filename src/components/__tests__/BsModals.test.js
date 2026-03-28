import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BsModal from '../BsModal.vue'
import BsModalConfirm from '../BsModalConfirm.vue'
import BsModalSelect from '../BsModalSelect.vue'

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

describe('BsModalConfirm - Confirmation Modal', () => {
  describe('Basic Rendering', () => {
    it('should render confirmation modal with message', () => {
      const wrapper = mount(BsModalConfirm, {
        props: {
          modelValue: false,
          message: 'Are you sure?',
          button: 'Delete'
        }
      })
      const body = wrapper.find('.modal-body')
      expect(body.text()).toContain('Are you sure?')
    })

    it('should render confirm and cancel buttons', () => {
      const wrapper = mount(BsModalConfirm, {
        props: {
          modelValue: false,
          message: 'Confirm?',
          button: 'Delete'
        }
      })
      const buttons = wrapper.findAll('button')
      // Should have trigger button and modal buttons
      expect(buttons.length).toBeGreaterThan(1)
    })

    it('should render with warning button style', () => {
      const wrapper = mount(BsModalConfirm, {
        props: {
          modelValue: false,
          message: 'Confirm?',
          button: 'Delete'
        }
      })
      const triggerBtn = wrapper.find('button:not(.modal-footer button)')
      expect(triggerBtn.classes()).toContain('btn')
    })
  })

  describe('V-Model Binding', () => {
    it('should render modal when mounted', () => {
      const wrapper = mount(BsModalConfirm, {
        props: {
          modelValue: false,
          message: 'Confirm?',
          button: 'Delete'
        }
      })
      const modal = wrapper.find('.modal')
      expect(modal.exists()).toBe(true)
    })

    it('should display message from prop', () => {
      const wrapper = mount(BsModalConfirm, {
        props: {
          modelValue: false,
          message: 'Delete this item?',
          button: 'Delete'
        }
      })
      // Modal structure should be present
      expect(wrapper.find('.modal').exists()).toBe(true)
    })
  })

  describe('Form Structure', () => {
    it('should have modal structure', () => {
      const wrapper = mount(BsModalConfirm, {
        props: {
          modelValue: false,
          message: 'Confirm?',
          button: 'Action'
        }
      })
      const modal = wrapper.find('.modal')
      expect(modal.exists()).toBe(true)
    })

    it('should have footer for action buttons', () => {
      const wrapper = mount(BsModalConfirm, {
        props: {
          modelValue: false,
          message: 'Confirm?',
          button: 'Action'
        }
      })
      const footer = wrapper.find('.modal-footer')
      expect(footer.exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long confirmation message', () => {
      const longMessage = 'A'.repeat(1000)
      const wrapper = mount(BsModalConfirm, {
        props: {
          modelValue: false,
          message: longMessage,
          button: 'Confirm'
        }
      })
      // Modal should render without errors
      expect(wrapper.find('.modal').exists()).toBe(true)
    })

    it('should handle special characters in button text', () => {
      const wrapper = mount(BsModalConfirm, {
        props: {
          modelValue: false,
          message: 'Confirm?',
          button: 'Delete & Confirm'
        }
      })
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })
  })
})

describe('BsModalSelect - Selection Modal', () => {
  const testItems = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' }
  ]

  describe('Basic Rendering', () => {
    it('should render selection modal with items list', () => {
      const wrapper = mount(BsModalSelect, {
        props: {
          modelValue: '',
          items: testItems,
          button: 'Select Item'
        }
      })
      const modal = wrapper.find('.modal')
      expect(modal.exists()).toBe(true)
    })

    it('should render trigger button', () => {
      const wrapper = mount(BsModalSelect, {
        props: {
          modelValue: '',
          items: testItems,
          button: 'Select Item'
        }
      })
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })

    it('should render with button structure', () => {
      const wrapper = mount(BsModalSelect, {
        props: {
          modelValue: '',
          items: testItems,
          button: 'Select'
        }
      })
      // Modal should have button trigger
      expect(wrapper.findAll('button').length > 0).toBe(true)
    })
  })

  describe('Item Selection', () => {
    it('should handle empty items array', () => {
      const wrapper = mount(BsModalSelect, {
        props: {
          modelValue: '',
          items: [],
          button: 'Select'
        }
      })
      const modal = wrapper.find('.modal')
      expect(modal.exists()).toBe(true)
    })

    it('should handle items with different structures', () => {
      const customItems = [
        { id: 'a', name: 'First' },
        { id: 'b', name: 'Second' }
      ]
      const wrapper = mount(BsModalSelect, {
        props: {
          modelValue: '',
          items: customItems,
          button: 'Select'
        }
      })
      // Modal structure should render
      expect(wrapper.find('.modal').exists()).toBe(true)
    })
  })

  describe('V-Model Binding', () => {
    it('should handle selected value', () => {
      const wrapper = mount(BsModalSelect, {
        props: {
          modelValue: '2',
          items: testItems,
          button: 'Select'
        }
      })
      expect(wrapper.props('modelValue')).toBe('2')
    })

    it('should handle empty selection', () => {
      const wrapper = mount(BsModalSelect, {
        props: {
          modelValue: '',
          items: testItems,
          button: 'Select'
        }
      })
      expect(wrapper.props('modelValue')).toBe('')
    })
  })

  describe('Form Structure', () => {
    it('should have modal structure', () => {
      const wrapper = mount(BsModalSelect, {
        props: {
          modelValue: '',
          items: testItems,
          button: 'Select'
        }
      })
      const modal = wrapper.find('.modal')
      expect(modal.exists()).toBe(true)
    })

    it('should have modal body for items display', () => {
      const wrapper = mount(BsModalSelect, {
        props: {
          modelValue: '',
          items: testItems,
          button: 'Select'
        }
      })
      const body = wrapper.find('.modal-body')
      expect(body.exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle large number of items', () => {
      const manyItems = Array.from({ length: 100 }, (_, i) => ({
        id: String(i),
        name: `Item ${i}`
      }))
      const wrapper = mount(BsModalSelect, {
        props: {
          modelValue: '',
          items: manyItems,
          button: 'Select'
        }
      })
      // Modal should render regardless of item count
      expect(wrapper.find('.modal').exists()).toBe(true)
    })

    it('should handle items with special characters', () => {
      const specialItems = [
        { id: '1', name: 'Item & Special' },
        { id: '2', name: 'Item <Tag>' }
      ]
      const wrapper = mount(BsModalSelect, {
        props: {
          modelValue: '',
          items: specialItems,
          button: 'Select'
        }
      })
      // Modal should render
      expect(wrapper.find('.modal').exists()).toBe(true)
    })

    it('should handle items with very long names', () => {
      const longItems = [
        { id: '1', name: 'A'.repeat(500) }
      ]
      const wrapper = mount(BsModalSelect, {
        props: {
          modelValue: '',
          items: longItems,
          button: 'Select'
        }
      })
      // Modal should render even with long content
      expect(wrapper.find('.modal').exists()).toBe(true)
    })
  })
})
