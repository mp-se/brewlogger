// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconEyeSlash from '../IconEyeSlash.vue'

describe('IconEyeSlash - Eye Slash Icon Component', () => {
  it('should render eye slash icon', () => {
    const wrapper = mount(IconEyeSlash)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('should emit click event', async () => {
    const wrapper = mount(IconEyeSlash)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('should render SVG icon', () => {
    const wrapper = mount(IconEyeSlash)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('should accept width and height props', () => {
    const wrapper = mount(IconEyeSlash, {
      props: {
        width: '20',
        height: '20'
      }
    })

    const svg = wrapper.find('svg')
    expect(svg.attributes('width')).toBe('20')
    expect(svg.attributes('height')).toBe('20')
  })

  it('should have viewBox for scaling', () => {
    const wrapper = mount(IconEyeSlash)
    const viewBox = wrapper.find('svg').attributes('viewBox')
    expect(viewBox).toBeDefined()
    expect(viewBox).toMatch(/^0 0 \d+ \d+$/)
  })

  it('should render icon with small size', () => {
    const wrapper = mount(IconEyeSlash, {
      props: {
        width: '12',
        height: '12'
      }
    })

    expect(wrapper.find('svg').attributes('width')).toBe('12')
  })

  it('should render icon with medium size', () => {
    const wrapper = mount(IconEyeSlash, {
      props: {
        width: '24',
        height: '24'
      }
    })

    expect(wrapper.find('svg').attributes('width')).toBe('24')
  })

  it('should render icon with large size', () => {
    const wrapper = mount(IconEyeSlash, {
      props: {
        width: '48',
        height: '48'
      }
    })

    expect(wrapper.find('svg').attributes('width')).toBe('48')
  })

  it('should render icon with rem units', () => {
    const wrapper = mount(IconEyeSlash, {
      props: {
        width: '1.5rem',
        height: '1.5rem'
      }
    })

    expect(wrapper.find('svg').attributes('width')).toBe('1.5rem')
  })

  it('should propagate click events from interactive icons', async () => {
    const wrapper = mount(IconEyeSlash)
    await wrapper.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('click')
  })

  it('should pass through attributes', () => {
    const wrapper = mount(IconEyeSlash, {
      attrs: {
        class: 'custom-class',
        'data-test': 'icon-test'
      }
    })

    expect(wrapper.attributes('data-test')).toBe('icon-test')
  })
})
