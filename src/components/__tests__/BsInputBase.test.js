import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BsInputBase from '../BsInputBase.vue'

describe('BsInputBase - Form Input Wrapper Component', () => {
  describe('Basic Rendering', () => {
    it('should render main wrapper div', () => {
      const wrapper = mount(BsInputBase)
      const mainDiv = wrapper.find('div.pt-2')
      expect(mainDiv.exists()).toBe(true)
    })

    it('should have pt-2 padding class', () => {
      const wrapper = mount(BsInputBase)
      const mainDiv = wrapper.find('div.pt-2')
      expect(mainDiv.classes()).toContain('pt-2')
    })

    it('should have has-validation class when errorMessage is provided', () => {
      const wrapper = mount(BsInputBase, {
        props: { errorMessage: 'Error' }
      })
      const validationDiv = wrapper.find('.has-validation')
      expect(validationDiv.exists()).toBe(true)
    })

    it('should accept label prop', () => {
      const wrapper = mount(BsInputBase, {
        props: { label: 'Username' }
      })
      expect(wrapper.props('label')).toBe('Username')
    })

    it('should accept help prop', () => {
      const wrapper = mount(BsInputBase, {
        props: { help: 'Enter your username' }
      })
      expect(wrapper.props('help')).toBe('Enter your username')
    })

    it('should accept badge prop', () => {
      const wrapper = mount(BsInputBase, {
        props: { badge: true }
      })
      expect(wrapper.props('badge')).toBe(true)
    })

    it('should accept width prop', () => {
      const wrapper = mount(BsInputBase, {
        props: { width: 'lg' }
      })
      expect(wrapper.props('width')).toBe('lg')
    })
  })

  describe('Label Display', () => {
    it('should render label when provided and not undefined', () => {
      const wrapper = mount(BsInputBase, {
        props: { label: 'Email' }
      })
      const label = wrapper.find('label')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('Email')
    })

    it('should not render label when undefined', () => {
      const wrapper = mount(BsInputBase, {
        props: { label: undefined }
      })
      expect(wrapper.findAll('label').length).toBe(0)
    })

    it('should have form-label class', () => {
      const wrapper = mount(BsInputBase, {
        props: { label: 'Field' }
      })
      const label = wrapper.find('label')
      expect(label.classes()).toContain('form-label')
    })

    it('should have fw-bold class on label', () => {
      const wrapper = mount(BsInputBase, {
        props: { label: 'Important' }
      })
      const label = wrapper.find('label')
      expect(label.classes()).toContain('fw-bold')
    })
  })

  describe('Badge Display', () => {
    it('should render badge when badge prop is truthy', () => {
      const wrapper = mount(BsInputBase, {
        props: { label: 'Field', badge: true }
      })
      const badge = wrapper.find('.badge')
      expect(badge.exists()).toBe(true)
    })

    it('should render badge with "1" as text', () => {
      const wrapper = mount(BsInputBase, {
        props: { label: 'Field', badge: true }
      })
      const badge = wrapper.find('.badge')
      expect(badge.text()).toBe('1')
    })

    it('should have badge class', () => {
      const wrapper = mount(BsInputBase, {
        props: { label: 'Field', badge: true }
      })
      const badge = wrapper.find('.badge')
      expect(badge.classes()).toContain('badge')
    })

    it('should have text-bg-danger class', () => {
      const wrapper = mount(BsInputBase, {
        props: { label: 'Field', badge: true }
      })
      const badge = wrapper.find('.badge')
      expect(badge.classes().join(' ')).toContain('text-bg-danger')
    })

    it('should have rounded-circle class', () => {
      const wrapper = mount(BsInputBase, {
        props: { label: 'Field', badge: true }
      })
      const badge = wrapper.find('.badge')
      expect(badge.classes()).toContain('rounded-circle')
    })

    it('should not render badge when falsy', () => {
      const wrapper = mount(BsInputBase, {
        props: { label: 'Field', badge: false }
      })
      expect(wrapper.findAll('.badge').length).toBe(0)
    })
  })

  describe('Help Text Display', () => {
    it('should always render form-text div', () => {
      const wrapper = mount(BsInputBase)
      const help = wrapper.find('.form-text')
      expect(help.exists()).toBe(true)
    })

    it('should render help text when provided', () => {
      const wrapper = mount(BsInputBase, {
        props: { help: 'This is helpful' }
      })
      expect(wrapper.text()).toContain('This is helpful')
    })

    it('should be empty when help not provided', () => {
      const wrapper = mount(BsInputBase)
      const help = wrapper.find('.form-text')
      expect(help.text()).toBe('')
    })

    it('should handle long help text', () => {
      const longHelp = 'Lorem ipsum dolor sit amet. '.repeat(30)
      const wrapper = mount(BsInputBase, {
        props: { help: longHelp }
      })
      expect(wrapper.find('.form-text').text()).toContain('Lorem')
    })
  })

  describe('Width Prop', () => {
    it('should apply col-lg when width is lg', () => {
      const wrapper = mount(BsInputBase, {
        props: { width: 'lg' }
      })
      const widthDiv = wrapper.find('div.col-lg')
      expect(widthDiv.exists()).toBe(true)
    })

    it('should apply col-md when width is md', () => {
      const wrapper = mount(BsInputBase, {
        props: { width: 'md' }
      })
      const widthDiv = wrapper.find('div.col-md')
      expect(widthDiv.exists()).toBe(true)
    })

    it('should apply col-sm when width is sm', () => {
      const wrapper = mount(BsInputBase, {
        props: { width: 'sm' }
      })
      const widthDiv = wrapper.find('div.col-sm')
      expect(widthDiv.exists()).toBe(true)
    })

    it('should not apply col class when width is undefined', () => {
      const wrapper = mount(BsInputBase, {
        props: { width: undefined }
      })
      const slotDiv = wrapper.findAll('div').find((el) => el.classes().length === 0)
      expect(slotDiv).toBeTruthy()
    })
  })

  describe('Slot Content', () => {
    it('should render slot content', () => {
      const wrapper = mount(BsInputBase, {
        slots: {
          default: '<input type="text" class="form-control" />'
        }
      })
      const input = wrapper.find('input[type="text"]')
      expect(input.exists()).toBe(true)
    })

    it('should render label and slot together', () => {
      const wrapper = mount(BsInputBase, {
        props: { label: 'Email' },
        slots: {
          default: '<input type="email" />'
        }
      })
      const label = wrapper.find('label')
      const input = wrapper.find('input[type="email"]')
      expect(label.exists()).toBe(true)
      expect(input.exists()).toBe(true)
    })

    it('should render badge and slot together', () => {
      const wrapper = mount(BsInputBase, {
        props: { label: 'Field', badge: true },
        slots: {
          default: '<input />'
        }
      })
      const badge = wrapper.find('.badge')
      const input = wrapper.find('input')
      expect(badge.exists()).toBe(true)
      expect(input.exists()).toBe(true)
    })
  })

  describe('Combined Props', () => {
    it('should render label, badge, help, width, and slot', () => {
      const wrapper = mount(BsInputBase, {
        props: {
          label: 'Username',
          badge: true,
          help: 'Enter your username',
          width: 'lg'
        },
        slots: {
          default: '<input type="text" />'
        }
      })
      expect(wrapper.find('label').exists()).toBe(true)
      expect(wrapper.find('.badge').exists()).toBe(true)
      expect(wrapper.find('.form-text').exists()).toBe(true)
      expect(wrapper.find('input').exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle special characters in label', () => {
      const wrapper = mount(BsInputBase, {
        props: { label: 'Email & Phone' }
      })
      expect(wrapper.find('label').html()).toContain('Email')
    })

    it('should handle special characters in help', () => {
      const wrapper = mount(BsInputBase, {
        props: { help: 'Format: user@domain.com' }
      })
      expect(wrapper.text()).toContain('user@domain.com')
    })

    it('should handle very long label', () => {
      const longLabel = 'A'.repeat(100)
      const wrapper = mount(BsInputBase, {
        props: { label: longLabel }
      })
      expect(wrapper.find('label').exists()).toBe(true)
    })

    it('should maintain structure without any props', () => {
      const wrapper = mount(BsInputBase)
      expect(wrapper.find('.pt-2').exists()).toBe(true)
      expect(wrapper.find('.form-text').exists()).toBe(true)
    })
  })
})
