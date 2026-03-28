import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BsInputBase from '../BsInputBase.vue'
import IconGraphUpArrow from '../IconGraphUpArrow.vue'
import IconListUl from '../IconListUl.vue'
import IconTools from '../IconTools.vue'
import IconUpArrow from '../IconUpArrow.vue'

describe('BsInputBase - Form Input Wrapper Component', () => {
  describe('Basic Rendering', () => {
    it('should render main wrapper div', () => {
      const wrapper = mount(BsInputBase)
      const mainDiv = wrapper.find('div.has-validation')
      expect(mainDiv.exists()).toBe(true)
    })

    it('should have has-validation class', () => {
      const wrapper = mount(BsInputBase)
      const mainDiv = wrapper.find('div.has-validation')
      expect(mainDiv.classes()).toContain('has-validation')
    })

    it('should have pt-2 padding class', () => {
      const wrapper = mount(BsInputBase)
      const mainDiv = wrapper.find('div.has-validation')
      expect(mainDiv.classes()).toContain('pt-2')
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
      const slotDiv = wrapper.findAll('div').find(el => el.classes().length === 0)
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
      expect(wrapper.find('.has-validation').exists()).toBe(true)
      expect(wrapper.find('.form-text').exists()).toBe(true)
    })
  })
})

describe('IconGraphUpArrow - Graph Up Arrow Icon', () => {
  describe('Basic Rendering', () => {
    it('should render SVG element', () => {
      const wrapper = mount(IconGraphUpArrow)
      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
    })

    it('should have viewBox attribute', () => {
      const wrapper = mount(IconGraphUpArrow)
      const svg = wrapper.find('svg')
      expect(svg.attributes('viewBox')).toBeTruthy()
    })

    it('should contain path element', () => {
      const wrapper = mount(IconGraphUpArrow)
      const path = wrapper.find('path')
      expect(path.exists()).toBe(true)
    })
  })

  describe('Sizing', () => {
    it('should render at default size', () => {
      const wrapper = mount(IconGraphUpArrow)
      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
    })

    it('should accept width attribute', () => {
      const wrapper = mount(IconGraphUpArrow, {
        attrs: { width: '24' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('width')).toBe('24')
    })

    it('should accept height attribute', () => {
      const wrapper = mount(IconGraphUpArrow, {
        attrs: { height: '24' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('height')).toBe('24')
    })
  })

  describe('Styling', () => {
    it('should accept custom classes', () => {
      const wrapper = mount(IconGraphUpArrow, {
        attrs: { class: 'custom-icon' }
      })
      const svg = wrapper.find('svg')
      expect(svg.classes()).toContain('custom-icon')
    })

    it('should accept style attributes', () => {
      const wrapper = mount(IconGraphUpArrow, {
        attrs: { style: 'color: red;' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('style')).toContain('color')
    })

    it('should inherit attributes via v-bind', () => {
      const wrapper = mount(IconGraphUpArrow, {
        attrs: { 'data-test': 'icon' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('data-test')).toBe('icon')
    })
  })

  describe('Accessibility', () => {
    it('should be accessible as icon', () => {
      const wrapper = mount(IconGraphUpArrow)
      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
    })

    it('should have proper fill for visibility', () => {
      const wrapper = mount(IconGraphUpArrow)
      const path = wrapper.find('path')
      expect(path.exists()).toBe(true)
    })
  })
})

describe('IconListUl - List Unordered Icon', () => {
  describe('Basic Rendering', () => {
    it('should render SVG element', () => {
      const wrapper = mount(IconListUl)
      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
    })

    it('should have viewBox attribute', () => {
      const wrapper = mount(IconListUl)
      const svg = wrapper.find('svg')
      expect(svg.attributes('viewBox')).toBeTruthy()
    })

    it('should contain path elements for bullets', () => {
      const wrapper = mount(IconListUl)
      const paths = wrapper.findAll('path')
      expect(paths.length).toBeGreaterThan(0)
    })
  })

  describe('Sizing', () => {
    it('should render at default size', () => {
      const wrapper = mount(IconListUl)
      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
    })

    it('should accept width attribute', () => {
      const wrapper = mount(IconListUl, {
        attrs: { width: '32' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('width')).toBe('32')
    })

    it('should accept height attribute', () => {
      const wrapper = mount(IconListUl, {
        attrs: { height: '32' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('height')).toBe('32')
    })
  })

  describe('Styling', () => {
    it('should accept custom classes', () => {
      const wrapper = mount(IconListUl, {
        attrs: { class: 'icon-list' }
      })
      const svg = wrapper.find('svg')
      expect(svg.classes()).toContain('icon-list')
    })

    it('should accept style attributes', () => {
      const wrapper = mount(IconListUl, {
        attrs: { style: 'color: blue;' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('style')).toContain('color')
    })

    it('should inherit user attributes', () => {
      const wrapper = mount(IconListUl, {
        attrs: { 'data-icon': 'list' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('data-icon')).toBe('list')
    })
  })
})

describe('IconTools - Tools Icon', () => {
  describe('Basic Rendering', () => {
    it('should render SVG element', () => {
      const wrapper = mount(IconTools)
      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
    })

    it('should have viewBox attribute', () => {
      const wrapper = mount(IconTools)
      const svg = wrapper.find('svg')
      expect(svg.attributes('viewBox')).toBeTruthy()
    })

    it('should contain path or circle elements', () => {
      const wrapper = mount(IconTools)
      const elements = wrapper.findAll('path, circle')
      expect(elements.length).toBeGreaterThan(0)
    })
  })

  describe('Sizing', () => {
    it('should render at default size', () => {
      const wrapper = mount(IconTools)
      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
    })

    it('should accept width attribute', () => {
      const wrapper = mount(IconTools, {
        attrs: { width: '28' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('width')).toBe('28')
    })

    it('should accept height attribute', () => {
      const wrapper = mount(IconTools, {
        attrs: { height: '28' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('height')).toBe('28')
    })
  })

  describe('Styling', () => {
    it('should support custom classes', () => {
      const wrapper = mount(IconTools, {
        attrs: { class: 'settings-icon' }
      })
      const svg = wrapper.find('svg')
      expect(svg.classes()).toContain('settings-icon')
    })

    it('should support data attributes', () => {
      const wrapper = mount(IconTools, {
        attrs: { 'data-name': 'tools' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('data-name')).toBe('tools')
    })

    it('should support color styling', () => {
      const wrapper = mount(IconTools, {
        attrs: { style: 'color: green;' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('style')).toContain('green')
    })
  })

  describe('Accessibility', () => {
    it('should be rendered as SVG', () => {
      const wrapper = mount(IconTools)
      const svg = wrapper.find('svg')
      expect(svg.element.tagName).toBe('svg')
    })

    it('should be scalable with attributes', () => {
      const wrapper = mount(IconTools, {
        attrs: { width: '100', height: '100' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('width')).toBe('100')
      expect(svg.attributes('height')).toBe('100')
    })
  })
})

describe('IconUpArrow - Up Arrow Icon', () => {
  describe('Basic Rendering', () => {
    it('should render SVG element', () => {
      const wrapper = mount(IconUpArrow)
      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
    })

    it('should have viewBox attribute', () => {
      const wrapper = mount(IconUpArrow)
      const svg = wrapper.find('svg')
      expect(svg.attributes('viewBox')).toBeTruthy()
    })

    it('should contain path element', () => {
      const wrapper = mount(IconUpArrow)
      const path = wrapper.find('path')
      expect(path.exists()).toBe(true)
    })
  })

  describe('Sizing', () => {
    it('should render at default size', () => {
      const wrapper = mount(IconUpArrow)
      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
    })

    it('should accept width attribute', () => {
      const wrapper = mount(IconUpArrow, {
        attrs: { width: '20' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('width')).toBe('20')
    })

    it('should accept height attribute', () => {
      const wrapper = mount(IconUpArrow, {
        attrs: { height: '20' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('height')).toBe('20')
    })

    it('should support large sizes', () => {
      const wrapper = mount(IconUpArrow, {
        attrs: { width: '64', height: '64' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('width')).toBe('64')
    })
  })

  describe('Styling', () => {
    it('should accept custom classes', () => {
      const wrapper = mount(IconUpArrow, {
        attrs: { class: 'arrow-icon' }
      })
      const svg = wrapper.find('svg')
      expect(svg.classes()).toContain('arrow-icon')
    })

    it('should accept custom styles', () => {
      const wrapper = mount(IconUpArrow, {
        attrs: { style: 'stroke: black;' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('style')).toContain('stroke')
    })

    it('should accept data attributes', () => {
      const wrapper = mount(IconUpArrow, {
        attrs: { 'data-direction': 'up' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('data-direction')).toBe('up')
    })
  })

  describe('Accessibility', () => {
    it('should be accessible for screen readers', () => {
      const wrapper = mount(IconUpArrow)
      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
    })

    it('should support aria attributes', () => {
      const wrapper = mount(IconUpArrow, {
        attrs: { 'aria-label': 'Scroll up' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('aria-label')).toBe('Scroll up')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very small sizes', () => {
      const wrapper = mount(IconUpArrow, {
        attrs: { width: '8', height: '8' }
      })
      const svg = wrapper.find('svg')
      expect(svg.attributes('width')).toBe('8')
    })

    it('should render consistently', () => {
      const wrapper1 = mount(IconUpArrow)
      const wrapper2 = mount(IconUpArrow)
      expect(wrapper1.find('svg').exists()).toBe(wrapper2.find('svg').exists())
    })
  })
})
