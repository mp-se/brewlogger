import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconHome from '../IconHome.vue'
import IconCheckCircle from '../IconCheckCircle.vue'
import IconExclamationTriangle from '../IconExclamationTriangle.vue'
import IconXCircle from '../IconXCircle.vue'
import IconInfoCircle from '../IconInfoCircle.vue'
import IconEye from '../IconEye.vue'
import IconEyeSlash from '../IconEyeSlash.vue'
import IconWifi from '../IconWifi.vue'
import IconCpu from '../IconCpu.vue'

describe('Icon Components - SVG Rendering', () => {
  describe('IconHome', () => {
    it('should render svg element', () => {
      const wrapper = mount(IconHome)
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('should accept width and height props', () => {
      const wrapper = mount(IconHome, {
        props: {
          width: '24',
          height: '24'
        }
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('width')).toBe('24')
      expect(svg.attributes('height')).toBe('24')
    })

    it('should have viewBox attribute', () => {
      const wrapper = mount(IconHome)
      expect(wrapper.find('svg').attributes('viewBox')).toBeDefined()
    })
  })

  describe('IconCheckCircle', () => {
    it('should render check circle icon', () => {
      const wrapper = mount(IconCheckCircle)
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('should support size props', () => {
      const wrapper = mount(IconCheckCircle, {
        props: {
          width: '32',
          height: '32'
        }
      })

      expect(wrapper.find('svg').attributes('width')).toBe('32')
    })
  })

  describe('IconExclamationTriangle', () => {
    it('should render triangle icon', () => {
      const wrapper = mount(IconExclamationTriangle)
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('should accept custom dimensions', () => {
      const wrapper = mount(IconExclamationTriangle, {
        props: {
          width: '16',
          height: '16'
        }
      })

      expect(wrapper.find('svg').attributes('width')).toBe('16')
      expect(wrapper.find('svg').attributes('height')).toBe('16')
    })
  })

  describe('IconXCircle', () => {
    it('should render X circle icon', () => {
      const wrapper = mount(IconXCircle)
      expect(wrapper.find('svg').exists()).toBe(true)
    })
  })

  describe('IconInfoCircle', () => {
    it('should render info circle icon', () => {
      const wrapper = mount(IconInfoCircle)
      expect(wrapper.find('svg').exists()).toBe(true)
    })
  })

  describe('IconEye', () => {
    it('should render eye icon', () => {
      const wrapper = mount(IconEye)
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('should be clickable', async () => {
      const wrapper = mount(IconEye, {
        props: {
          width: '1rem',
          height: '1rem'
        }
      })

      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })
  })

  describe('IconEyeSlash', () => {
    it('should render eye slash icon', () => {
      const wrapper = mount(IconEyeSlash)
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('should emit click event', async () => {
      const wrapper = mount(IconEyeSlash)
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })
  })

  describe('IconWifi', () => {
    it('should render wifi icon', () => {
      const wrapper = mount(IconWifi)
      expect(wrapper.find('svg').exists()).toBe(true)
    })
  })

  describe('IconCpu', () => {
    it('should render CPU icon', () => {
      const wrapper = mount(IconCpu)
      expect(wrapper.find('svg').exists()).toBe(true)
    })
  })

  describe('Common Icon Properties', () => {
    const icons = [
      IconHome,
      IconCheckCircle,
      IconExclamationTriangle,
      IconXCircle,
      IconInfoCircle,
      IconEye,
      IconEyeSlash,
      IconWifi,
      IconCpu
    ]

    it.each(icons)('should render SVG for all icon components', (Icon) => {
      const wrapper = mount(Icon)
      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it.each(icons)('should accept width and height props', (Icon) => {
      const wrapper = mount(Icon, {
        props: {
          width: '20',
          height: '20'
        }
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('width')).toBe('20')
      expect(svg.attributes('height')).toBe('20')
    })

    it.each(icons)('should have viewBox for scaling', (Icon) => {
      const wrapper = mount(Icon)
      const viewBox = wrapper.find('svg').attributes('viewBox')
      expect(viewBox).toBeDefined()
      expect(viewBox).toMatch(/^0 0 \d+ \d+$/)
    })
  })

  describe('Size Variants', () => {
    it('should render icon with small size', () => {
      const wrapper = mount(IconHome, {
        props: {
          width: '12',
          height: '12'
        }
      })

      expect(wrapper.find('svg').attributes('width')).toBe('12')
    })

    it('should render icon with medium size', () => {
      const wrapper = mount(IconHome, {
        props: {
          width: '24',
          height: '24'
        }
      })

      expect(wrapper.find('svg').attributes('width')).toBe('24')
    })

    it('should render icon with large size', () => {
      const wrapper = mount(IconHome, {
        props: {
          width: '48',
          height: '48'
        }
      })

      expect(wrapper.find('svg').attributes('width')).toBe('48')
    })

    it('should render icon with rem units', () => {
      const wrapper = mount(IconHome, {
        props: {
          width: '1.5rem',
          height: '1.5rem'
        }
      })

      expect(wrapper.find('svg').attributes('width')).toBe('1.5rem')
    })
  })

  describe('Event Handling', () => {
    it('should propagate click events from interactive icons', async () => {
      const wrapper = mount(IconEye)
      await wrapper.trigger('click')
      expect(wrapper.emitted()).toHaveProperty('click')
    })

    it('should pass through attributes', () => {
      const wrapper = mount(IconHome, {
        attrs: {
          class: 'custom-class',
          'data-test': 'icon-test'
        }
      })

      expect(wrapper.attributes('data-test')).toBe('icon-test')
    })
  })
})
