import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconUpArrow from '../IconUpArrow.vue'

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
