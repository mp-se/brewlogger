// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BsFileUpload from '../BsFileUpload.vue'

describe('BsFileUpload - File Input Component', () => {
  describe('Basic Rendering', () => {
    it('should render file input', () => {
      const wrapper = mount(BsFileUpload)
      const input = wrapper.find('input[type="file"]')
      expect(input.exists()).toBe(true)
    })

    it('should be wrapped in button group', () => {
      const wrapper = mount(BsFileUpload)
      const group = wrapper.find('.btn-group')
      expect(group.exists()).toBe(true)
    })

    it('should have form-control class', () => {
      const wrapper = mount(BsFileUpload)
      const input = wrapper.find('input[type="file"]')
      expect(input.classes()).toContain('form-control')
    })

    it('should accept label via model', () => {
      const wrapper = mount(BsFileUpload, {
        props: { label: 'Upload File' }
      })
      expect(wrapper.props('label')).toBe('Upload File')
    })

    it('should accept help via model', () => {
      const wrapper = mount(BsFileUpload, {
        props: { help: 'Select a file to upload' }
      })
      expect(wrapper.props('help')).toBe('Select a file to upload')
    })
  })

  describe('Disabled State', () => {
    it('should support disabled attribute', () => {
      const wrapper = mount(BsFileUpload, {
        props: { disabled: true }
      })
      const input = wrapper.find('input[type="file"]')
      expect(input.attributes('disabled')).toBeDefined()
    })

    it('should not be disabled by default', () => {
      const wrapper = mount(BsFileUpload)
      const input = wrapper.find('input[type="file"]')
      expect(input.attributes('disabled')).toBeUndefined()
    })
  })

  describe('File Input Properties', () => {
    it('should support accept attribute via attrs', () => {
      const wrapper = mount(BsFileUpload, {
        attrs: { accept: '.pdf,.doc' }
      })
      const input = wrapper.find('input[type="file"]')
      expect(input.attributes('accept')).toBe('.pdf,.doc')
    })

    it('should support multiple files', () => {
      const wrapper = mount(BsFileUpload, {
        attrs: { multiple: true }
      })
      const input = wrapper.find('input[type="file"]')
      expect(input.attributes('multiple')).toBeDefined()
    })

    it('should support single file by default', () => {
      const wrapper = mount(BsFileUpload)
      const input = wrapper.find('input[type="file"]')
      expect(input.attributes('multiple')).toBeUndefined()
    })

    it('should support disabled state', () => {
      const wrapper = mount(BsFileUpload, {
        props: { disabled: true }
      })
      const input = wrapper.find('input[type="file"]')
      expect(input.attributes('disabled')).toBeDefined()
    })
  })

  describe('Image Files', () => {
    it('should accept image files', () => {
      const wrapper = mount(BsFileUpload, {
        attrs: { accept: 'image/*' }
      })
      const input = wrapper.find('input[type="file"]')
      expect(input.attributes('accept')).toContain('image')
    })

    it('should accept multiple file types', () => {
      const wrapper = mount(BsFileUpload, {
        attrs: { accept: '.json,.xml,.csv' }
      })
      const input = wrapper.find('input[type="file"]')
      expect(input.attributes('accept')).toContain('json')
    })

    it('should accept all files by default', () => {
      const wrapper = mount(BsFileUpload)
      const input = wrapper.find('input[type="file"]')
      expect(input.exists()).toBe(true)
    })
  })

  describe('Mobile Features', () => {
    it('should support capture for mobile', () => {
      const wrapper = mount(BsFileUpload, {
        attrs: { capture: true }
      })
      const input = wrapper.find('input[type="file"]')
      expect(input.attributes('capture')).toBeDefined()
    })

    it('should support camera input', () => {
      const wrapper = mount(BsFileUpload, {
        attrs: { accept: 'image/*', capture: 'environment' }
      })
      const input = wrapper.find('input[type="file"]')
      expect(input.attributes('capture')).toBe('environment')
    })

    it('should support user-facing camera', () => {
      const wrapper = mount(BsFileUpload, {
        attrs: { capture: 'user' }
      })
      const input = wrapper.find('input[type="file"]')
      expect(input.attributes('capture')).toBe('user')
    })
  })

  describe('Badge Support', () => {
    it('should accept badge via model', () => {
      const wrapper = mount(BsFileUpload, {
        props: { badge: 'Optional' }
      })
      expect(wrapper.props('badge')).toBe('Optional')
    })

    it('should accept width via model', () => {
      const wrapper = mount(BsFileUpload, {
        props: { width: 'lg' }
      })
      expect(wrapper.props('width')).toBe('lg')
    })
  })

  describe('Edge Cases', () => {
    it('should handle component without label', () => {
      const wrapper = mount(BsFileUpload)
      expect(wrapper.find('input[type="file"]').exists()).toBe(true)
    })

    it('should handle multiple attributes', () => {
      const wrapper = mount(BsFileUpload, {
        attrs: {
          accept: 'image/*',
          capture: 'environment',
          multiple: true
        }
      })
      const input = wrapper.find('input[type="file"]')
      expect(input.attributes('accept')).toContain('image')
      expect(input.attributes('capture')).toBe('environment')
      expect(input.attributes('multiple')).toBeDefined()
    })
  })
})
