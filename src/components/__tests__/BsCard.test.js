import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BsCard from '../BsCard.vue'

describe('BsCard - Layout Container Component', () => {
  describe('Basic Rendering', () => {
    it('should render card structure', () => {
      const wrapper = mount(BsCard, {
        slots: {
          default: 'Card Content'
        }
      })
      const card = wrapper.find('.card')
      expect(card. exists()).toBe(true)
    })

    it('should render card body', () => {
      const wrapper = mount(BsCard, {
        slots: {
          default: 'Content'
        }
      })
      const body = wrapper.find('.card-body')
      expect(body.exists()).toBe(true)
    })

    it('should render card with text content', () => {
      const wrapper = mount(BsCard, {
        slots: {
          default: 'Card text content here'
        }
      })
      expect(wrapper.text()).toContain('Card text content')
    })

    it('should apply card class to root element', () => {
      const wrapper = mount(BsCard, {
        slots: { default: 'Content' }
      })
      const card = wrapper.find('.card')
      expect(card.classes()).toContain('card')
    })
  })

  describe('Title Handling', () => {
    it('should render title element when provided', () => {
      const wrapper = mount(BsCard, {
        props: { title: 'My Title' },
        slots: { default: 'Body' }
      })
      const titleEl = wrapper.find('.card-title')
      expect(titleEl.exists()).toBe(true)
    })

    it('should display provided title text', () => {
      const wrapper = mount(BsCard, {
        props: { title: 'Test Title' },
        slots: { default: 'Body' }
      })
      expect(wrapper.text()).toContain('Test Title')
    })
  })

  describe('Content Slots', () => {
    it('should render default slot content', () => {
      const wrapper = mount(BsCard, {
        slots: {
          default: 'Main content'
        }
      })
      expect(wrapper.text()).toContain('Main content')
    })

    it('should handle HTML in slots', () => {
      const wrapper = mount(BsCard, {
        slots: {
          default: '<div class="custom">Custom HTML</div>'
        }
      })
      expect(wrapper.html()).toContain('custom')
    })
  })

  describe('Card Styling', () => {
    it('should have card and card-body classes', () => {
      const wrapper = mount(BsCard, {
        slots: { default: 'Content' }
      })
      const card = wrapper.find('.card')
      expect(card.classes()).toContain('card')

      const body = wrapper.find('.card-body')
      expect(body.classes()).toContain('card-body')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const wrapper = mount(BsCard, {
        props: { title: 'Title' },
        slots: { default: '' }
      })
      const card = wrapper.find('.card')
      expect(card.exists()).toBe(true)
    })

    it('should render without any slots', () => {
      const wrapper = mount(BsCard)
      const card = wrapper.find('.card')
      expect(card.exists()).toBe(true)
    })
  })

  describe('Header Styling - Branch Coverage', () => {
    it('should apply error style when iserr is true', () => {
      const wrapper = mount(BsCard, {
        props: { 
          header: 'Error Header',
          title: 'Title',
          iserr: true
        },
        slots: { default: 'Content' }
      })
      const header = wrapper.find('.card-header')
      expect(header.classes()).toContain('bg-danger-subtle')
    })

    it('should apply primary style when iserr is false', () => {
      const wrapper = mount(BsCard, {
        props: { 
          header: 'Normal Header',
          title: 'Title',
          iserr: false
        },
        slots: { default: 'Content' }
      })
      const header = wrapper.find('.card-header')
      expect(header.classes()).toContain('bg-primary-subtle')
    })

    it('should apply primary style when iserr is undefined', () => {
      const wrapper = mount(BsCard, {
        props: { 
          header: 'Default Header',
          title: 'Title'
        },
        slots: { default: 'Content' }
      })
      const header = wrapper.find('.card-header')
      expect(header.classes()).toContain('bg-primary-subtle')
    })

    it('should apply default primary color when headerColor is undefined', () => {
      const wrapper = mount(BsCard, {
        props: { 
          header: 'Header',
          title: 'Title',
          iserr: false
        },
        slots: { default: 'Content' }
      })
      const header = wrapper.find('.card-header')
      expect(header.classes()).toContain('bg-primary-subtle')
    })

    it('should apply custom color when headerColor is provided', () => {
      const wrapper = mount(BsCard, {
        props: { 
          header: 'Header',
          title: 'Title',
          color: 'success'
        },
        slots: { default: 'Content' }
      })
      const header = wrapper.find('.card-header')
      expect(header.classes()).toContain('bg-success-subtle')
    })

    it('should prefer error color over custom color when iserr is true', () => {
      const wrapper = mount(BsCard, {
        props: { 
          header: 'Header',
          title: 'Title',
          iserr: true,
          color: 'success'
        },
        slots: { default: 'Content' }
      })
      const header = wrapper.find('.card-header')
      expect(header.classes()).toContain('bg-danger-subtle')
      expect(header.classes()).not.toContain('bg-success-subtle')
    })

    it('should display header text correctly', () => {
      const wrapper = mount(BsCard, {
        props: { 
          header: 'Test Header Text',
          title: 'Title'
        },
        slots: { default: 'Content' }
      })
      const header = wrapper.find('.card-header')
      expect(header.text()).toContain('Test Header Text')
    })

    it('should apply info color when headerColor is info', () => {
      const wrapper = mount(BsCard, {
        props: { 
          header: 'Header',
          title: 'Title',
          color: 'info'
        },
        slots: { default: 'Content' }
      })
      const header = wrapper.find('.card-header')
      expect(header.classes()).toContain('bg-info-subtle')
    })

    it('should apply warning color when headerColor is warning', () => {
      const wrapper = mount(BsCard, {
        props: { 
          header: 'Header',
          title: 'Title',
          color: 'warning'
        },
        slots: { default: 'Content' }
      })
      const header = wrapper.find('.card-header')
      expect(header.classes()).toContain('bg-warning-subtle')
    })
  })
})
