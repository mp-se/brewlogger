// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import IconCloudUpArrow from '@/components/IconCloudUpArrow.vue'

describe('IconCloudUpArrow.vue', () => {
  it('renders an SVG element', () => {
    const wrapper = mount(IconCloudUpArrow)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('has correct SVG namespace', () => {
    const wrapper = mount(IconCloudUpArrow)
    const svg = wrapper.find('svg')
    expect(svg.attributes('xmlns')).toBe('http://www.w3.org/2000/svg')
  })

  it('has viewBox attribute for scaling', () => {
    const wrapper = mount(IconCloudUpArrow)
    const svg = wrapper.find('svg')
    expect(svg.attributes('viewBox')).toBe('0 0 16 16')
  })

  it('has fill attribute set to currentColor', () => {
    const wrapper = mount(IconCloudUpArrow)
    const svg = wrapper.find('svg')
    expect(svg.attributes('fill')).toBe('currentColor')
  })

  it('contains path elements for icon shape', () => {
    const wrapper = mount(IconCloudUpArrow)
    const paths = wrapper.findAll('path')
    expect(paths.length).toBeGreaterThan(0)
  })

  it('has at least one path with d attribute', () => {
    const wrapper = mount(IconCloudUpArrow)
    const paths = wrapper.findAll('path')
    const hasPathWithD = paths.some((path) => path.attributes('d'))
    expect(hasPathWithD).toBe(true)
  })

  it('inherits attributes passed to component', () => {
    const wrapper = mount(IconCloudUpArrow, {
      attrs: {
        'data-testid': 'cloud-upload-icon',
        width: '24',
        height: '24'
      }
    })
    const svg = wrapper.find('svg')
    expect(svg.attributes('data-testid')).toBe('cloud-upload-icon')
    expect(svg.attributes('width')).toBe('24')
    expect(svg.attributes('height')).toBe('24')
  })

  it('does not have template text content', () => {
    const wrapper = mount(IconCloudUpArrow)
    const text = wrapper.text().trim()
    // SVG should only contain shape data, no readable text
    expect(text.length).toBe(0)
  })

  it('is correctly imported and mounted without errors', () => {
    expect(() => {
      mount(IconCloudUpArrow)
    }).not.toThrow()
  })
})
