// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconTools from '../IconTools.vue'

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
