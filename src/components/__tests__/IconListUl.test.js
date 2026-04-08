// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconListUl from '../IconListUl.vue'

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
