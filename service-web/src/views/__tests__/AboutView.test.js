// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AboutView from '../AboutView.vue'

describe('AboutView', () => {
  describe('Basic Rendering', () => {
    it('should render about view container', () => {
      const wrapper = mount(AboutView)
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })

    it('should render the title heading', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('About - Brewlogger')
    })

    it('should have h3 class for title', () => {
      const wrapper = mount(AboutView)
      const h3 = wrapper.find('.h3')
      expect(h3.exists()).toBe(true)
      expect(h3.text()).toContain('About - Brewlogger')
    })

    it('should render the horizontal rule', () => {
      const wrapper = mount(AboutView)
      const hr = wrapper.find('hr')
      expect(hr.exists()).toBe(true)
    })

    it('should render initial empty paragraph', () => {
      const wrapper = mount(AboutView)
      const paragraphs = wrapper.findAll('p')
      expect(paragraphs.length).toBeGreaterThan(0)
    })
  })

  describe('Main Description', () => {
    it('should display the project purpose', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain(
        'This project was created to help me develop my beer brewing projects'
      )
    })

    it('should mention device management', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('manage devices')
    })

    it('should mention data collection', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('collect data from the devices')
    })

    it('should mention analysis', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('analysis')
    })

    it('should have fw-normal class for body text', () => {
      const wrapper = mount(AboutView)
      const normal = wrapper.findAll('.fw-normal')
      expect(normal.length).toBeGreaterThan(0)
    })
  })

  describe('License Section', () => {
    it('should display Dual License heading', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('Dual License')
    })

    it('should have h4 class for license heading', () => {
      const wrapper = mount(AboutView)
      const h4 = wrapper.find('.h4')
      expect(h4.exists()).toBe(true)
      expect(h4.text()).toContain('Dual License')
    })

    it('should display license text', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('BrewLogger UI is available under two licenses')
    })

    it('should include GPL v3 license information', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('GNU General Public License v3.0')
      expect(wrapper.text()).toContain('GPL v3')
    })

    it('should include Commercial license information', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('Commercial License')
      expect(wrapper.text()).toContain('company')
    })

    it('should mention personal/non-commercial use', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('personal')
      expect(wrapper.text()).toContain('non-commercial')
    })

    it('should mention open source requirements', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('open source')
    })

    it('should include contact information for commercial license', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('mpersson42')
    })

    it('should mention hobbyist distribution limits', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('100 units')
    })

    it('should reference LICENSE and LICENSE_COMMERCIAL files', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('LICENSE_COMMERCIAL')
    })
  })

  describe('License Permissions and Rights', () => {
    it('should mention source code publication', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('source code')
    })

    it('should mention modify rights', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('modify')
    })

    it('should mention distribute rights', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('distribute')
    })

    it('should mention publish rights', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('publish')
    })
  })

  describe('Layout and Structure', () => {
    it('should have multiple paragraphs', () => {
      const wrapper = mount(AboutView)
      const paragraphs = wrapper.findAll('p')
      expect(paragraphs.length).toBeGreaterThanOrEqual(3)
    })

    it('should have correct ordering of elements', () => {
      const wrapper = mount(AboutView)
      const text = wrapper.text()
      const aboutIndex = text.indexOf('About - Brewlogger')
      const licenseIndex = text.indexOf('Dual License')
      expect(aboutIndex).toBeLessThan(licenseIndex)
    })

    it('should have proper DOM structure', () => {
      const wrapper = mount(AboutView)
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
      const paragraphs = container.findAll('p')
      expect(paragraphs.length).toBeGreaterThan(0)
    })
  })

  describe('Styling Classes', () => {
    it('should use heading classes for visual hierarchy', () => {
      const wrapper = mount(AboutView)
      const headings = wrapper.findAll('.h3, .h4')
      expect(headings.length).toBeGreaterThanOrEqual(2)
    })

    it('should use fw-normal for regular text', () => {
      const wrapper = mount(AboutView)
      const normalText = wrapper.findAll('.fw-normal')
      expect(normalText.length).toBeGreaterThan(0)
    })
  })

  describe('Content Completeness', () => {
    it('should contain all expected license clauses', () => {
      const wrapper = mount(AboutView)
      const text = wrapper.text()
      const expectedPhrases = [
        'Dual License',
        'GNU General Public License',
        'Commercial License',
        'source code',
        'GPL v3'
      ]
      expectedPhrases.forEach((phrase) => {
        expect(text).toContain(phrase)
      })
    })

    it('should be static content without interactivity', () => {
      const wrapper = mount(AboutView)
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBe(0)
    })
  })
})
