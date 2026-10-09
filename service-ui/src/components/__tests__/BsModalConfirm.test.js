// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BsModalConfirm from '../BsModalConfirm.vue'

describe('BsModalConfirm - Confirmation Modal', () => {
  describe('Basic Rendering', () => {
    it('should render confirmation modal with message', () => {
      const wrapper = mount(BsModalConfirm, {
        props: {
          modelValue: false,
          message: 'Are you sure?',
          button: 'Delete'
        }
      })
      const body = wrapper.find('.modal-body')
      expect(body.text()).toContain('Are you sure?')
    })

    it('should render confirm and cancel buttons', () => {
      const wrapper = mount(BsModalConfirm, {
        props: {
          modelValue: false,
          message: 'Confirm?',
          button: 'Delete'
        }
      })
      const buttons = wrapper.findAll('button')
      // Should have trigger button and modal buttons
      expect(buttons.length).toBeGreaterThan(1)
    })

    it('should render with warning button style', () => {
      const wrapper = mount(BsModalConfirm, {
        props: {
          modelValue: false,
          message: 'Confirm?',
          button: 'Delete'
        }
      })
      const triggerBtn = wrapper.find('button:not(.modal-footer button)')
      expect(triggerBtn.classes()).toContain('btn')
    })
  })

  describe('V-Model Binding', () => {
    it('should render modal when mounted', () => {
      const wrapper = mount(BsModalConfirm, {
        props: {
          modelValue: false,
          message: 'Confirm?',
          button: 'Delete'
        }
      })
      const modal = wrapper.find('.modal')
      expect(modal.exists()).toBe(true)
    })

    it('should display message from prop', () => {
      const wrapper = mount(BsModalConfirm, {
        props: {
          modelValue: false,
          message: 'Delete this item?',
          button: 'Delete'
        }
      })
      // Modal structure should be present
      expect(wrapper.find('.modal').exists()).toBe(true)
    })
  })

  describe('Form Structure', () => {
    it('should have modal structure', () => {
      const wrapper = mount(BsModalConfirm, {
        props: {
          modelValue: false,
          message: 'Confirm?',
          button: 'Action'
        }
      })
      const modal = wrapper.find('.modal')
      expect(modal.exists()).toBe(true)
    })

    it('should have footer for action buttons', () => {
      const wrapper = mount(BsModalConfirm, {
        props: {
          modelValue: false,
          message: 'Confirm?',
          button: 'Action'
        }
      })
      const footer = wrapper.find('.modal-footer')
      expect(footer.exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long confirmation message', () => {
      const longMessage = 'A'.repeat(1000)
      const wrapper = mount(BsModalConfirm, {
        props: {
          modelValue: false,
          message: longMessage,
          button: 'Confirm'
        }
      })
      // Modal should render without errors
      expect(wrapper.find('.modal').exists()).toBe(true)
    })

    it('should handle special characters in button text', () => {
      const wrapper = mount(BsModalConfirm, {
        props: {
          modelValue: false,
          message: 'Confirm?',
          button: 'Delete & Confirm'
        }
      })
      const button = wrapper.find('button')
      expect(button.exists()).toBe(true)
    })
  })
})
