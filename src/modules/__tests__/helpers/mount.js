/**
 * Shared test mount helpers to reduce boilerplate
 * Supports views, fragments, and component tests
 */

import { mount as vtuMount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { vi } from 'vitest'

/**
 * Mount a component with fresh Pinia instance
 * @param {Component} component - Vue component to mount
 * @param {Object} options - Vue Test Utils mount options
 * @returns {Object} wrapper from vue test utils
 */
export const mountWithPinia = (component, options = {}) => {
  setActivePinia(createPinia())
  return vtuMount(component, options)
}

/**
 * Mount a view with common stubs and options
 * @param {Component} component - View component
 * @param {Array<string>} stubNames - Component names to stub
 * @param {Object} options - Additional mount options
 * @returns {Object} wrapper
 */
export const mountView = (component, stubNames = [], options = {}) => {
  const stubs = {}
  stubNames.forEach((name) => {
    stubs[name] = true
  })

  return mountWithPinia(component, {
    ...options,
    global: {
      ...options.global,
      stubs: {
        ...stubs,
        ...options.global?.stubs
      }
    }
  })
}

/**
 * Mount a stateless component (fragment or simple UI component)
 * @param {Component} component - UI component
 * @param {Object} props - Component props
 * @param {Object} options - Mount options
 * @returns {Object} wrapper
 */
export const mountComponent = (component, props = {}, options = {}) => {
  return vtuMount(component, {
    ...options,
    props
  })
}

/**
 * Flush all promises and component updates
 * Use after testing async operations
 * @returns {Promise} resolves when all promises flushed
 */
export const flush = () => flushPromises()

/**
 * Create standard mock for global Pinia store
 * @param {Object} overrides - Custom values
 * @returns {Object} mock object
 */
export const mockGlobalStore = (overrides = {}) => ({
  disabled: false,
  messageError: '',
  messageSuccess: '',
  baseURL: 'http://localhost/',
  token: 'test-token',
  clearMessages: vi.fn(),
  ...overrides
})

/**
 * Standard list of BS component stubs for view tests
 * @returns {Array<string>} component names
 */
export const BS_COMPONENT_STUBS = [
  'BsInputText',
  'BsInputNumber',
  'BsInputDate',
  'BsInputRadio',
  'BsSelect',
  'BsCard',
  'BsInputSwitch',
  'BsInputBase',
  'BsModalConfirm',
  'BsInputReadonly',
  'BsInputTextArea',
  'BsModal',
  'BsMessage',
  'BsProgress',
  'BsDropdown',
  'BsFileUpload',
  'BsMenuBar',
  'BsFooter',
  'BsInputTextAreaFormat'
]
