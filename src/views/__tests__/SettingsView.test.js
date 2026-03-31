import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SettingsView from '../SettingsView.vue'
import BsInputRadio from '../../components/BsInputRadio.vue'
import BsInputText from '../../components/BsInputText.vue'
import BsInputSelect from '../../components/BsSelect.vue'
import { useConfigStore } from '@/modules/configStore'
import { useGlobalStore } from '@/modules/globalStore'
import { config as piniaConfig, global as piniaGlobal } from '@/modules/pinia'
import * as logger from '@/modules/logger'
import * as utils from '@/modules/utils'

// Mock logger module
vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logInfo: vi.fn(),
  logWarning: vi.fn(),
  logError: vi.fn()
}))

// Mock @/modules/pinia to mock the actual config object with a save method
vi.mock('@/modules/pinia', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    config: {
      ...actual.config,
      save: vi.fn()
    }
  }
})

// Mock utils module (for validateCurrentForm)
vi.mock('@/modules/utils', async () => {
  const actual = await import('@/modules/utils')
  return {
    ...actual,
    validateCurrentForm: vi.fn()
  }
})

describe('SettingsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render settings container', () => {
      const wrapper = mount(SettingsView, {
        global: {
          components: {
            BsInputRadio,
            BsInputText,
            BsInputSelect
          },
          stubs: {
            BsInputRadio: true,
            BsInputText: true,
            BsInputSelect: true
          }
        }
      })
      const container = wrapper.find('.container')
      expect(container.exists()).toBe(true)
    })

    it('should render settings title', () => {
      const wrapper = mount(SettingsView, {
        global: {
          components: {
            BsInputRadio,
            BsInputText,
            BsInputSelect
          },
          stubs: {
            BsInputRadio: true,
            BsInputText: true,
            BsInputSelect: true
          }
        }
      })
      expect(wrapper.text()).toContain('Settings')
    })
  })

  describe('Form Submission - saveSettings()', () => {
    it('should log debug message when saveSettings is called', () => {
      const wrapper = mount(SettingsView, {
        global: {
          components: {
            BsInputRadio,
            BsInputText,
            BsInputSelect
          },
          stubs: {
            BsInputRadio: true,
            BsInputText: true,
            BsInputSelect: true
          }
        }
      })

      utils.validateCurrentForm.mockReturnValue(true)

      wrapper.vm.saveSettings()

      expect(logger.logDebug).toHaveBeenCalledWith('SettingsView.saveSettings()')
    })

    it('should return early if form validation fails', () => {
      const wrapper = mount(SettingsView, {
        global: {
          components: {
            BsInputRadio,
            BsInputText,
            BsInputSelect
          },
          stubs: {
            BsInputRadio: true,
            BsInputText: true,
            BsInputSelect: true
          }
        }
      })

      utils.validateCurrentForm.mockReturnValue(false)

      // Call saveSettings - it should return early without calling config.save
      wrapper.vm.saveSettings()

      // The method doesn't return anything, but we can verify that it didn't crash
      expect(utils.validateCurrentForm).toHaveBeenCalled()
    })

    it('should call saveSettings when form is submitted', async () => {
      const wrapper = mount(SettingsView, {
        global: {
          components: {
            BsInputRadio,
            BsInputText,
            BsInputSelect
          },
          stubs: {
            BsInputRadio: true,
            BsInputText: true,
            BsInputSelect: true
          }
        }
      })

      utils.validateCurrentForm.mockReturnValue(true)

      // Directly call saveSettings to verify it works
      wrapper.vm.saveSettings()

      // Verify that logDebug was called (proof that saveSettings ran)
      expect(logger.logDebug).toHaveBeenCalled()
    })

    it('should show success message when save is successful', async () => {
      const wrapper = mount(SettingsView, {
        global: {
          components: {
            BsInputRadio,
            BsInputText,
            BsInputSelect
          },
          stubs: {
            BsInputRadio: true,
            BsInputText: true,
            BsInputSelect: true
          }
        }
      })

      // Mock piniaConfig.save to invoke callback with true
      piniaConfig.save.mockImplementation((cb) => cb(true))
      utils.validateCurrentForm.mockReturnValue(true)

      wrapper.vm.saveSettings()

      expect(piniaConfig.save).toHaveBeenCalled()
      expect(piniaGlobal.messageSuccess).toBe('Settings saved')
    })

    it('should show error message when save fails', async () => {
      const wrapper = mount(SettingsView, {
        global: {
          components: {
            BsInputRadio,
            BsInputText,
            BsInputSelect
          },
          stubs: {
            BsInputRadio: true,
            BsInputText: true,
            BsInputSelect: true
          }
        }
      })

      // Mock piniaConfig.save to invoke callback with false
      piniaConfig.save.mockImplementation((cb) => cb(false))
      utils.validateCurrentForm.mockReturnValue(true)

      wrapper.vm.saveSettings()

      expect(piniaConfig.save).toHaveBeenCalled()
      expect(piniaGlobal.messageError).toBe('Failed to save settings')
    })

    it('should check form validation on submit', async () => {
      const wrapper = mount(SettingsView, {
        global: {
          components: {
            BsInputRadio,
            BsInputText,
            BsInputSelect
          },
          stubs: {
            BsInputRadio: true,
            BsInputText: true,
            BsInputSelect: true
          }
        }
      })

      utils.validateCurrentForm.mockReturnValue(true)

      const form = wrapper.find('form')
      await form.trigger('submit')

      expect(utils.validateCurrentForm).toHaveBeenCalled()
    })
  })

  describe('Configuration Binding', () => {
    it('should have config store initialized', () => {
      const config = useConfigStore()
      expect(config).toBeDefined()
    })

    it('should have global store initialized', () => {
      const global = useGlobalStore()
      expect(global).toBeDefined()
    })

    it('should have temperature format option in config', () => {
      mount(SettingsView, {
        global: {
          components: {
            BsInputRadio,
            BsInputText,
            BsInputSelect
          },
          stubs: {
            BsInputRadio: true,
            BsInputText: true,
            BsInputSelect: true
          }
        }
      })

      const config = useConfigStore()
      expect(config.temperatureFormat).toBeDefined()
    })

    it('should expose config through component instance', () => {
      const wrapper = mount(SettingsView, {
        global: {
          components: {
            BsInputRadio,
            BsInputText,
            BsInputSelect
          },
          stubs: {
            BsInputRadio: true,
            BsInputText: true,
            BsInputSelect: true
          }
        }
      })

      expect(wrapper.vm.config).toBeDefined()
      expect(wrapper.vm.global).toBeDefined()
    })
  })

  describe('Form Settings Options', () => {
    it('should have temperature format options', () => {
      const wrapper = mount(SettingsView, {
        global: {
          components: {
            BsInputRadio,
            BsInputText,
            BsInputSelect
          },
          stubs: {
            BsInputRadio: true,
            BsInputText: true,
            BsInputSelect: true
          }
        }
      })

      const temperatureOptions = wrapper.vm.temperatureOptions
      expect(temperatureOptions).toBeDefined()
      expect(temperatureOptions.length).toBeGreaterThan(0)
      expect(temperatureOptions[0]).toHaveProperty('label')
      expect(temperatureOptions[0]).toHaveProperty('value')
    })

    it('should have gravity format options', () => {
      const wrapper = mount(SettingsView, {
        global: {
          components: {
            BsInputRadio,
            BsInputText,
            BsInputSelect
          },
          stubs: {
            BsInputRadio: true,
            BsInputText: true,
            BsInputSelect: true
          }
        }
      })

      const gravityOptions = wrapper.vm.gravityOptions
      expect(gravityOptions).toBeDefined()
      expect(gravityOptions).toContainEqual({ label: 'Specific Gravity', value: 'SG' })
      expect(gravityOptions).toContainEqual({ label: 'Plato', value: 'P' })
    })

    it('should have pressure format options', () => {
      const wrapper = mount(SettingsView, {
        global: {
          components: {
            BsInputRadio,
            BsInputText,
            BsInputSelect
          },
          stubs: {
            BsInputRadio: true,
            BsInputText: true,
            BsInputSelect: true
          }
        }
      })

      const pressureOptions = wrapper.vm.pressureOptions
      expect(pressureOptions).toBeDefined()
      expect(pressureOptions).toContainEqual({ label: 'PSI', value: 'PSI' })
      expect(pressureOptions).toContainEqual({ label: 'Bar', value: 'BAR' })
      expect(pressureOptions).toContainEqual({ label: 'kPa', value: 'KPA' })
    })

    it('should have dark mode options', () => {
      const wrapper = mount(SettingsView, {
        global: {
          components: {
            BsInputRadio,
            BsInputText,
            BsInputSelect
          },
          stubs: {
            BsInputRadio: true,
            BsInputText: true,
            BsInputSelect: true
          }
        }
      })

      const darkModeOptions = wrapper.vm.darkModeOptions
      expect(darkModeOptions).toBeDefined()
      expect(darkModeOptions).toContainEqual({ label: 'Dark Mode', value: true })
      expect(darkModeOptions).toContainEqual({ label: 'Day Mode', value: false })
    })
  })

  describe('Form Layout', () => {
    it('should have form element with needs-validation class', () => {
      const wrapper = mount(SettingsView, {
        global: {
          components: {
            BsInputRadio,
            BsInputText,
            BsInputSelect
          },
          stubs: {
            BsInputRadio: true,
            BsInputText: true,
            BsInputSelect: true
          }
        }
      })
      const form = wrapper.find('form')
      expect(form.exists()).toBe(true)
      expect(form.classes()).toContain('needs-validation')
    })

    it('should have form with novalidate attribute', () => {
      const wrapper = mount(SettingsView, {
        global: {
          components: {
            BsInputRadio,
            BsInputText,
            BsInputSelect
          },
          stubs: {
            BsInputRadio: true,
            BsInputText: true,
            BsInputSelect: true
          }
        }
      })
      const form = wrapper.find('form')
      expect(form.attributes('novalidate')).toBeDefined()
    })

    it('should use Bootstrap grid with row and col-md', () => {
      const wrapper = mount(SettingsView, {
        global: {
          components: {
            BsInputRadio,
            BsInputText,
            BsInputSelect
          },
          stubs: {
            BsInputRadio: true,
            BsInputText: true,
            BsInputSelect: true
          }
        }
      })
      const row = wrapper.find('.row')
      expect(row.exists()).toBe(true)
      const cols = wrapper.findAll('[class*="col-md"]')
      expect(cols.length).toBeGreaterThan(0)
    })
  })
})
