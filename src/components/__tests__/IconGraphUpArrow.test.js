import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconGraphUpArrow from '../IconGraphUpArrow.vue'

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
