import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BsProgress from '../BsProgress.vue'

describe('BsProgress - Progress Bar Component', () => {
  describe('Basic Rendering', () => {
    it('should render progress bar container', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: 50 }
      })
      const progress = wrapper.find('.progress')
      expect(progress.exists()).toBe(true)
    })

    it('should render progress bar fill', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: 50 }
      })
      const bar = wrapper.find('.progress-bar')
      expect(bar.exists()).toBe(true)
    })

    it('should have role progressbar', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: 50 }
      })
      const progress = wrapper.find('.progress')
      expect(progress.attributes('role')).toBe('progressbar')
    })
  })

  describe('Progress Value Display', () => {
    it('should set width based on progress value', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: 50 }
      })
      const bar = wrapper.find('.progress-bar')
      expect(bar.attributes('style')).toContain('50')
    })

    it('should display 0% progress', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: 0 }
      })
      const bar = wrapper.find('.progress-bar')
      expect(bar.element.textContent).toContain('0%')
    })

    it('should display 100% progress', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: 100 }
      })
      const bar = wrapper.find('.progress-bar')
      expect(bar.attributes('style')).toContain('100')
      expect(bar.element.textContent).toContain('100%')
    })

    it('should handle mid-range values', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: 33 }
      })
      const bar = wrapper.find('.progress-bar')
      expect(bar.element.textContent).toContain('33%')
    })

    it('should display percentage text', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: 50 }
      })
      expect(wrapper.text()).toContain('50%')
    })

    it('should display formatted percentage', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: 75 }
      })
      expect(wrapper.element.textContent).toContain('75%')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-valuenow set to progress', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: 50 }
      })
      const progress = wrapper.find('.progress')
      expect(progress.attributes('aria-valuenow')).toBe('50')
    })

    it('should have aria-valuemin set to 0', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: 50 }
      })
      const progress = wrapper.find('.progress')
      expect(progress.attributes('aria-valuemin')).toBe('0')
    })

    it('should have aria-valuemax set to 100', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: 50 }
      })
      const progress = wrapper.find('.progress')
      expect(progress.attributes('aria-valuemax')).toBe('100')
    })
  })

  describe('Progress Bar Styling', () => {
    it('should have progress-bar class', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: 50 }
      })
      const bar = wrapper.find('.progress-bar')
      expect(bar.classes()).toContain('progress-bar')
    })

    it('should render in container', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: 50 }
      })
      const container = wrapper.find('.progress')
      expect(container.exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle value over 100', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: 150 }
      })
      const bar = wrapper.find('.progress-bar')
      expect(bar.exists()).toBe(true)
    })

    it('should handle decimal values', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: 33.33 }
      })
      const bar = wrapper.find('.progress-bar')
      expect(bar.element.textContent).toContain('33%')
    })

    it('should handle negative values', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: -10 }
      })
      const bar = wrapper.find('.progress-bar')
      expect(bar.exists()).toBe(true)
    })

    it('should support v-bind attrs', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: 50 },
        attrs: { 'data-test': 'progress' }
      })
      const progress = wrapper.find('.progress')
      expect(progress.attributes('data-test')).toBe('progress')
    })
  })

  describe('Format Handling', () => {
    it('should round decimal to integer percentage', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: 33.7 }
      })
      expect(wrapper.element.textContent).toContain('34%')
    })

    it('should handle very small values', () => {
      const wrapper = mount(BsProgress, {
        props: { progress: 0.5 }
      })
      // 0.5 rounds to 1 when using toFixed(0)
      expect(wrapper.element.textContent).toContain('1%')
    })
  })
})
