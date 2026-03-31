import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BsMessage from '../BsMessage.vue'
import IconXCircle from '../IconXCircle.vue'
import IconCheckCircle from '../IconCheckCircle.vue'
import IconInfoCircle from '../IconInfoCircle.vue'
import IconExclamationTriangle from '../IconExclamationTriangle.vue'

describe('BsMessage - Alert/Message Component', () => {
  describe('Display', () => {
    it('should render error message', () => {
      const wrapper = mount(BsMessage, {
        props: {
          message: 'Error message',
          alert: 'danger'
        },
        global: {
          components: { IconXCircle, IconCheckCircle, IconInfoCircle, IconExclamationTriangle }
        }
      })

      expect(wrapper.text()).toContain('Error message')
      expect(wrapper.classes()).toContain('alert-danger')
    })

    it('should render success message', () => {
      const wrapper = mount(BsMessage, {
        props: {
          message: 'Success!',
          alert: 'success'
        },
        global: {
          components: { IconXCircle, IconCheckCircle, IconInfoCircle, IconExclamationTriangle }
        }
      })

      expect(wrapper.text()).toContain('Success!')
      expect(wrapper.classes()).toContain('alert-success')
    })

    it('should render warning message', () => {
      const wrapper = mount(BsMessage, {
        props: {
          message: 'Warning!',
          alert: 'warning'
        },
        global: {
          components: { IconXCircle, IconCheckCircle, IconInfoCircle, IconExclamationTriangle }
        }
      })

      expect(wrapper.text()).toContain('Warning!')
      expect(wrapper.classes()).toContain('alert-warning')
    })

    it('should render info message', () => {
      const wrapper = mount(BsMessage, {
        props: {
          message: 'Info',
          alert: 'info'
        },
        global: {
          components: { IconXCircle, IconCheckCircle, IconInfoCircle, IconExclamationTriangle }
        }
      })

      expect(wrapper.text()).toContain('Info')
      expect(wrapper.classes()).toContain('alert-info')
    })
  })

  describe('Icons', () => {
    it('should show danger icon for danger alert', () => {
      const wrapper = mount(BsMessage, {
        props: {
          message: 'Error',
          alert: 'danger'
        },
        global: {
          components: { IconXCircle, IconCheckCircle, IconInfoCircle, IconExclamationTriangle }
        }
      })

      expect(wrapper.findComponent(IconXCircle).exists()).toBe(true)
    })

    it('should show success icon for success alert', () => {
      const wrapper = mount(BsMessage, {
        props: {
          message: 'Success',
          alert: 'success'
        },
        global: {
          components: { IconXCircle, IconCheckCircle, IconInfoCircle, IconExclamationTriangle }
        }
      })

      expect(wrapper.findComponent(IconCheckCircle).exists()).toBe(true)
    })

    it('should show warning icon for warning alert', () => {
      const wrapper = mount(BsMessage, {
        props: {
          message: 'Warning',
          alert: 'warning'
        },
        global: {
          components: { IconXCircle, IconCheckCircle, IconInfoCircle, IconExclamationTriangle }
        }
      })

      expect(wrapper.findComponent(IconExclamationTriangle).exists()).toBe(true)
    })

    it('should show info icon for info alert', () => {
      const wrapper = mount(BsMessage, {
        props: {
          message: 'Info',
          alert: 'info'
        },
        global: {
          components: { IconXCircle, IconCheckCircle, IconInfoCircle, IconExclamationTriangle }
        }
      })

      expect(wrapper.findComponent(IconInfoCircle).exists()).toBe(true)
    })
  })

  describe('Message Updates', () => {
    it('should update message content when prop changes', async () => {
      const wrapper = mount(BsMessage, {
        props: {
          message: 'Original',
          alert: 'info'
        },
        global: {
          components: { IconXCircle, IconCheckCircle, IconInfoCircle, IconExclamationTriangle }
        }
      })

      expect(wrapper.text()).toContain('Original')

      await wrapper.setProps({ message: 'Updated' })
      expect(wrapper.text()).toContain('Updated')
    })

    it('should change alert type when alert prop changes', async () => {
      const wrapper = mount(BsMessage, {
        props: {
          message: 'Message',
          alert: 'info'
        },
        global: {
          components: { IconXCircle, IconCheckCircle, IconInfoCircle, IconExclamationTriangle }
        }
      })

      expect(wrapper.classes()).toContain('alert-info')

      await wrapper.setProps({ alert: 'danger' })
      expect(wrapper.classes()).toContain('alert-danger')
    })
  })

  describe('Styling', () => {
    it('should have alert classes', () => {
      const wrapper = mount(BsMessage, {
        props: {
          message: 'Message',
          alert: 'success'
        },
        global: {
          components: { IconXCircle, IconCheckCircle, IconInfoCircle, IconExclamationTriangle }
        }
      })

      expect(wrapper.classes()).toContain('alert')
      expect(wrapper.classes()).toContain('alert-success')
    })

    it('should have align-items-center class', () => {
      const wrapper = mount(BsMessage, {
        props: {
          message: 'Message',
          alert: 'success'
        },
        global: {
          components: { IconXCircle, IconCheckCircle, IconInfoCircle, IconExclamationTriangle }
        }
      })

      expect(wrapper.classes()).toContain('align-items-center')
    })

    it('should have dismissible styling when dismissable is true', () => {
      const wrapper = mount(BsMessage, {
        props: {
          message: 'Message',
          alert: 'success',
          dismissable: true
        },
        global: {
          components: { IconXCircle, IconCheckCircle, IconInfoCircle, IconExclamationTriangle }
        }
      })

      expect(wrapper.classes()).toContain('alert-dismissible')
      expect(wrapper.classes()).toContain('fade')
      expect(wrapper.classes()).toContain('show')
    })

    it('should not have dismissible styling when dismissable is false', () => {
      const wrapper = mount(BsMessage, {
        props: {
          message: 'Message',
          alert: 'success',
          dismissable: false
        },
        global: {
          components: { IconXCircle, IconCheckCircle, IconInfoCircle, IconExclamationTriangle }
        }
      })

      expect(wrapper.classes()).not.toContain('alert-dismissible')
    })
  })

  describe('Close Button', () => {
    it('should not show close button when dismissable is false', () => {
      const wrapper = mount(BsMessage, {
        props: {
          message: 'Message',
          alert: 'success',
          dismissable: false
        },
        global: {
          components: { IconXCircle, IconCheckCircle, IconInfoCircle, IconExclamationTriangle }
        }
      })

      const closeButton = wrapper.find('.btn-close')
      expect(closeButton.exists()).toBe(false)
    })
  })

  describe('Slot Content', () => {
    it('should render slot content', () => {
      const wrapper = mount(BsMessage, {
        props: {
          message: 'Message',
          alert: 'success'
        },
        slots: {
          default: '<strong>Extra info</strong>'
        },
        global: {
          components: { IconXCircle, IconCheckCircle, IconInfoCircle, IconExclamationTriangle }
        }
      })

      expect(wrapper.html()).toContain('Extra info')
    })
  })

  describe('Role Attribute', () => {
    it('should have role="alert"', () => {
      const wrapper = mount(BsMessage, {
        props: {
          message: 'Message',
          alert: 'success'
        },
        global: {
          components: { IconXCircle, IconCheckCircle, IconInfoCircle, IconExclamationTriangle }
        }
      })

      expect(wrapper.attributes('role')).toBe('alert')
    })
  })
})
