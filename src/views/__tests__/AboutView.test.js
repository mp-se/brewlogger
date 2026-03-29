import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import AboutView from '../AboutView.vue'
import NotFoundView from '../NotFoundView.vue'
import BsMessage from '../../components/BsMessage.vue'

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
      expect(wrapper.text()).toContain('This project was created to help me develop my beer brewing projects')
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
    it('should display MIT License heading', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('MIT License')
    })

    it('should have h4 class for license heading', () => {
      const wrapper = mount(AboutView)
      const h4 = wrapper.find('.h4')
      expect(h4.exists()).toBe(true)
      expect(h4.text()).toContain('MIT License')
    })

    it('should display license text', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('Permission is hereby granted')
    })

    it('should include permission grant language', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('Permission is hereby granted')
      expect(wrapper.text()).toContain('free of charge')
    })

    it('should include conditions text', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('copyright notice')
      expect(wrapper.text()).toContain('permission notice')
    })

    it('should include warranty disclaimer', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('WITHOUT WARRANTY')
      expect(wrapper.text()).toContain('IMPLIED')
    })

    it('should include liability disclaimer', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('LIABLE')
      expect(wrapper.text()).toContain('ANY CLAIM')
    })

    it('should include reference to software dealings', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('IN CONNECTION WITH THE SOFTWARE')
    })
  })

  describe('License Permissions and Rights', () => {
    it('should mention obtaining permission', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('obtaining')
    })

    it('should mention use rights', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('without restriction')
    })

    it('should mention merge rights', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('merge')
    })

    it('should mention publish rights', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('publish')
    })

    it('should mention modify rights', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('modify')
    })

    it('should mention distribute rights', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('distribute')
    })

    it('should mention sublicense rights', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('sublicense')
    })

    it('should mention sell rights', () => {
      const wrapper = mount(AboutView)
      expect(wrapper.text()).toContain('sell copies')
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
      const licenseIndex = text.indexOf('MIT License')
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
        'Permission is hereby granted',
        'copyright notice',
        'THE SOFTWARE IS PROVIDED',
        'WITHOUT WARRANTY',
        'FITNESS',
        'PARTICULAR PURPOSE'
      ]
      expectedPhrases.forEach(phrase => {
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
