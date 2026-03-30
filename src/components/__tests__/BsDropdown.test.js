import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BsDropdown from '../BsDropdown.vue'

describe('BsDropdown - Dropdown Menu Component', () => {
  const testOptions = [
    { label: 'Action 1', value: 'action1' },
    { label: 'Action 2', value: 'action2' },
    { label: 'Action 3', value: 'action3' }
  ]

  describe('Basic Rendering', () => {
    it('should render dropdown button', () => {
      const wrapper = mount(BsDropdown, {
        props: { options: testOptions, button: 'Menu' }
      })
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })

    it('should render button text', () => {
      const wrapper = mount(BsDropdown, {
        props: { options: testOptions, button: 'Actions' }
      })
      expect(wrapper.text()).toContain('Actions')
    })

    it('should render dropdown menu', () => {
      const wrapper = mount(BsDropdown, {
        props: { options: testOptions, button: 'Menu' }
      })
      const menu = wrapper.find('.dropdown-menu')
      expect(menu.exists()).toBe(true)
    })

    it('should render dropdown items', () => {
      const wrapper = mount(BsDropdown, {
        props: { options: testOptions, button: 'Menu' }
      })
      const items = wrapper.findAll('.dropdown-item')
      expect(items.length).toBeGreaterThanOrEqual(testOptions.length)
    })
  })

  describe('Item Display', () => {
    it('should display all item labels', () => {
      const wrapper = mount(BsDropdown, {
        props: { options: testOptions, button: 'Menu' }
      })
      testOptions.forEach(option => {
        expect(wrapper.html()).toContain(option.label)
      })
    })

    it('should handle empty options array', () => {
      const wrapper = mount(BsDropdown, {
        props: { options: [], button: 'Menu' }
      })
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })

    it('should handle single option', () => {
      const wrapper = mount(BsDropdown, {
        props: {
          options: [{ label: 'Only Option', value: 'only' }],
          button: 'Menu'
        }
      })
      expect(wrapper.html()).toContain('Only Option')
    })
  })

  describe('Button Styling', () => {
    it('should have btn classes', () => {
      const wrapper = mount(BsDropdown, {
        props: { options: testOptions, button: 'Menu' }
      })
      const button = wrapper.find('button')
      expect(button.classes()).toContain('btn')
    })

    it('should have dropdown toggle attribute', () => {
      const wrapper = mount(BsDropdown, {
        props: { options: testOptions, button: 'Menu' }
      })
      const button = wrapper.find('button')
      expect(button.attributes('data-bs-toggle')).toBe('dropdown')
    })

    it('should have dropdown-toggle class', () => {
      const wrapper = mount(BsDropdown, {
        props: { options: testOptions, button: 'Menu' }
      })
      const button = wrapper.find('button')
      expect(button.classes().join(' ')).toContain('dropdown-toggle')
    })
  })

  describe('Menu Properties', () => {
    it('should expose aria-expanded', () => {
      const wrapper = mount(BsDropdown, {
        props: { options: testOptions, button: 'Menu' }
      })
      const button = wrapper.find('button')
      expect(button.attributes('aria-expanded')).toBe('false')
    })

    it('should have menu type button', () => {
      const wrapper = mount(BsDropdown, {
        props: { options: testOptions, button: 'Menu' }
      })
      const button = wrapper.find('button')
      expect(button.attributes('type')).toBe('button')
    })
  })

  describe('Disabled State', () => {
    it('should support disabled state', () => {
      const wrapper = mount(BsDropdown, {
        props: { options: testOptions, button: 'Menu', disabled: true }
      })
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('should not be disabled by default', () => {
      const wrapper = mount(BsDropdown, {
        props: { options: testOptions, button: 'Menu' }
      })
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle special characters in labels', () => {
      const wrapper = mount(BsDropdown, {
        props: {
          options: [{ label: 'Edit & Delete', value: 'edit' }],
          button: 'Menu'
        }
      })
      expect(wrapper.html()).toContain('&')
    })

    it('should handle very long button text', () => {
      const longText = 'A'.repeat(100)
      const wrapper = mount(BsDropdown, {
        props: { options: testOptions, button: longText }
      })
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })

    it('should handle many options', () => {
      const manyOptions = Array.from({ length: 50 }, (_, i) => ({
        label: `Option ${i + 1}`,
        value: `opt${i + 1}`
      }))
      const wrapper = mount(BsDropdown, {
        props: { options: manyOptions, button: 'Menu' }
      })
      const items = wrapper.findAll('.dropdown-item')
      expect(items.length).toBeGreaterThanOrEqual(manyOptions.length)
    })
  })
})
