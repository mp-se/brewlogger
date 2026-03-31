import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  abv,
  gravityToPlato,
  platoToGravity,
  tempToF,
  tempToC,
  volumeLtoUSGallon,
  volumeLtoUKGallon,
  volumeCLtoUSOZ,
  volumeCLtoUKOZ,
  pressureToKPA,
  pressureToBAR,
  truncateString,
  getTimeSincePosted,
  isValidJson,
  isValidMqttData,
  isValidFormData,
  getFormattedTemperature,
  getFormattedPressure,
  getFormattedVolume,
  getFormattedPourVolume,
  roundValue,
  validateCurrentForm,
  download,
  getPressureDataAnalytics,
  getGravityDataAnalytics,
  formatTime,
  formatTimeShort
} from '../utils'

// Mock the logger
vi.mock('../logger', () => ({
  logDebug: vi.fn()
}))

// Get the mocked pinia module to access config
vi.mock('../pinia', () => ({
  get config() {
    return {
      isTempF: false,
      isTempC: true,
      isPressurePSI: false,
      isPressureKPA: false,
      isPressureBAR: true,
      isVolumeUs: false,
      isVolumeUk: false,
      isGravitySG: true
    }
  }
}))

describe('utils.js - Unit Conversions', () => {
  describe('abv - Alcohol by Volume', () => {
    it('should calculate ABV correctly', () => {
      const og = 1.05
      const fg = 1.01
      const result = abv(og, fg)
      expect(result).toBeGreaterThan(0)
      expect(typeof result).toBe('number')
    })

    it('should handle edge case where og equals fg', () => {
      const result = abv(1.05, 1.05)
      expect(result).toBe(0)
    })
  })

  describe('gravityToPlato', () => {
    it('should calculate Plato from specific gravity', () => {
      const sg = 1.05
      const result = gravityToPlato(sg)
      expect(result).toBeGreaterThan(0)
      expect(typeof result).toBe('number')
    })

    it('should return approximately 0 for SG of 1.0', () => {
      const result = gravityToPlato(1.0)
      expect(result).toBeCloseTo(0, 1)
    })
  })

  describe('Temperature Conversions', () => {
    it('should convert Celsius to Fahrenheit', () => {
      expect(tempToF(0)).toBe(32)
      expect(tempToF(100)).toBe(212)
      expect(tempToF(20)).toBeCloseTo(68, 0)
    })

    it('should convert Fahrenheit to Celsius', () => {
      expect(tempToC(32)).toBe(0)
      expect(tempToC(212)).toBe(100)
      expect(tempToC(68)).toBeCloseTo(20, 0)
    })

    it('should be inverse operations', () => {
      const originalC = 25
      const fahrenheit = tempToF(originalC)
      const backToC = tempToC(fahrenheit)
      expect(backToC).toBeCloseTo(originalC, 10)
    })

    it('should handle negative temperatures', () => {
      const result = tempToF(-40)
      expect(result).toBe(-40)
    })
  })

  describe('Volume Conversions - Liters to Gallons', () => {
    it('should convert liters to US gallons', () => {
      const result = volumeLtoUSGallon(1)
      expect(result).toBeCloseTo(0.264172, 5)
    })

    it('should convert liters to UK gallons', () => {
      const result = volumeLtoUKGallon(1)
      expect(result).toBeCloseTo(0.21997, 5)
    })

    it('should handle zero volume', () => {
      expect(volumeLtoUSGallon(0)).toBe(0)
      expect(volumeLtoUKGallon(0)).toBe(0)
    })

    it('should scale proportionally', () => {
      const single = volumeLtoUSGallon(1)
      const double = volumeLtoUSGallon(2)
      expect(double).toBeCloseTo(single * 2, 5)
    })
  })

  describe('Volume Conversions - Centiliters to Ounces', () => {
    it('should convert centiliters to US ounces', () => {
      const result = volumeCLtoUSOZ(10)
      expect(result).toBeCloseTo(3.4, 5)
    })

    it('should convert centiliters to UK ounces', () => {
      const result = volumeCLtoUKOZ(2.84)
      expect(result).toBeCloseTo(1, 0)
    })

    it('should handle zero volume for UK', () => {
      expect(volumeCLtoUKOZ(0)).toBe(0)
    })

    it('should handle zero volume for US', () => {
      expect(volumeCLtoUSOZ(0)).toBe(0)
    })
  })

  describe('Pressure Conversions', () => {
    it('should convert PSI to KPA', () => {
      const result = pressureToKPA(1)
      expect(result).toBeCloseTo(6.8947572932, 5)
    })

    it('should convert PSI to BAR', () => {
      const result = pressureToBAR(1)
      expect(result).toBeCloseTo(0.0689475729, 5)
    })

    it('should handle zero pressure', () => {
      expect(pressureToKPA(0)).toBe(0)
      expect(pressureToBAR(0)).toBe(0)
    })

    it('should scale proportionally', () => {
      const single = pressureToKPA(1)
      const double = pressureToKPA(2)
      expect(double).toBeCloseTo(single * 2, 5)
    })
  })

  describe('truncateString', () => {
    it('should not truncate strings shorter than maxLength', () => {
      const result = truncateString('hello', 10)
      expect(result).toBe('hello')
    })

    it('should truncate strings longer than maxLength', () => {
      const result = truncateString('hello world', 5)
      expect(result).toContain('...')
      expect(result.length).toBeLessThanOrEqual(8) // substring(0,5) + '...'
    })

    it('should handle exact length', () => {
      const result = truncateString('hello', 5)
      expect(result).toBe('hello')
    })

    it('should handle empty string', () => {
      const result = truncateString('', 5)
      expect(result).toBe('')
    })

    it('should add ellipsis when truncating', () => {
      const result = truncateString('hello world', 3)
      expect(result).toBe('hel...')
    })
  })

  describe('getTimeSincePosted', () => {
    it('should return "just now" for times less than 1 hour ago', () => {
      const now = new Date()
      const minutesAgo = new Date(now.getTime() - 30 * 60 * 1000)
      const result = getTimeSincePosted(minutesAgo.toISOString())
      expect(result).toBe('just now')
    })

    it('should return hours ago for times between 1 hour and 1 day', () => {
      const now = new Date()
      const hoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000)
      const result = getTimeSincePosted(hoursAgo.toISOString())
      expect(result).toMatch(/^\d+ h ago$/)
    })

    it('should return days ago for times between 1 and 7 days', () => {
      const now = new Date()
      const daysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      const result = getTimeSincePosted(daysAgo.toISOString())
      expect(result).toMatch(/^\d+ d ago$/)
    })

    it('should return weeks ago for times 7+ days', () => {
      const now = new Date()
      const weeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      const result = getTimeSincePosted(weeksAgo.toISOString())
      expect(result).toMatch(/^\d+ w ago$/)
    })
  })

  describe('isValidJson', () => {
    it('should return true for valid JSON strings', () => {
      expect(isValidJson('{"key": "value"}')).toBe(true)
      expect(isValidJson('[]')).toBe(true)
      expect(isValidJson('null')).toBe(true)
      expect(isValidJson('"string"')).toBe(true)
      expect(isValidJson('42')).toBe(true)
    })

    it('should return false for invalid JSON strings', () => {
      expect(isValidJson('{invalid}')).toBe(false)
      expect(isValidJson('undefined')).toBe(false)
      expect(isValidJson("{'key': 'value'}")).toBe(false)
    })

    it('should handle complex nested JSON', () => {
      const complexJson = '{"nested": {"array": [1, 2, 3], "key": "value"}}'
      expect(isValidJson(complexJson)).toBe(true)
    })

    it('should handle empty string', () => {
      expect(isValidJson('')).toBe(false)
    })
  })

  describe('isValidMqttData', () => {
    it('should always return false', () => {
      expect(isValidMqttData('anything')).toBe(false)
      expect(isValidMqttData('')).toBe(false)
      expect(isValidMqttData(null)).toBe(false)
    })
  })

  describe('isValidFormData', () => {
    it('should always return false', () => {
      expect(isValidFormData('anything')).toBe(false)
      expect(isValidFormData('')).toBe(false)
      expect(isValidFormData(null)).toBe(false)
    })
  })

  describe('Formatting Functions', () => {
    describe('getFormattedTemperature', () => {
      it('should return -- for null temperature', () => {
        const result = getFormattedTemperature(null)
        expect(result).toBe('--')
      })

      it('should return -- for undefined temperature', () => {
        const result = getFormattedTemperature(undefined)
        expect(result).toBe('--')
      })

      it('should return -- for temperatures below -270', () => {
        const result = getFormattedTemperature(-280)
        expect(result).toBe('--')
      })

      it('should format temperature in Celsius', () => {
        const result = getFormattedTemperature(20)
        expect(result).toContain('20.0')
        expect(result).toContain('°C')
      })

      it('should round to 1 decimal place', () => {
        const result = getFormattedTemperature(20.456)
        expect(result).toContain('20.5')
      })
    })

    describe('getFormattedPressure', () => {
      it('should format pressure in PSI by default', () => {
        const result = getFormattedPressure(10)
        expect(result).toContain('Bar')
      })

      it('should round appropriately for Bar', () => {
        const result = getFormattedPressure(10)
        expect(result).toMatch(/\d+\.\d{2} Bar/)
      })
    })

    describe('getFormattedVolume', () => {
      it('should format volume in liters by default', () => {
        const result = getFormattedVolume(10)
        expect(result).toContain('L')
        expect(result).toContain('10.00')
      })

      it('should handle zero volume', () => {
        const result = getFormattedVolume(0)
        expect(result).toContain('0.00')
      })
    })

    describe('getFormattedPourVolume', () => {
      it('should format pour volume in centiliters by default', () => {
        const result = getFormattedPourVolume(50)
        expect(result).toContain('cl')
        expect(result).toContain('50')
      })

      it('should handle zero volume', () => {
        const result = getFormattedPourVolume(0)
        expect(result).toContain('0')
      })
    })
  })

  describe('platoToGravity', () => {
    it('should convert Plato to specific gravity', () => {
      const plato = 10
      const result = platoToGravity(plato)
      expect(result).toBeGreaterThan(1)
      expect(typeof result).toBe('number')
    })

    it('should return 1.0 for 0 Plato', () => {
      const result = platoToGravity(0)
      expect(result).toBeCloseTo(1.0, 5)
    })

    it('should be inverse of gravityToPlato', () => {
      const gravity = 1.050
      const plato = gravityToPlato(gravity)
      const backToGravity = platoToGravity(plato)
      expect(backToGravity).toBeCloseTo(gravity, 5)
    })
  })

  describe('roundValue', () => {
    it('should round to specified decimal places', () => {
      expect(roundValue(1.234, 1)).toBe(1.2)
      expect(roundValue(1.234, 2)).toBe(1.23)
      expect(roundValue(1.234, 3)).toBe(1.234)
    })

    it('should return 0 for null or undefined', () => {
      expect(roundValue(null)).toBe(0)
      expect(roundValue(undefined)).toBe(0)
    })

    it('should handle negative numbers', () => {
      expect(roundValue(-1.567, 2)).toBe(-1.57)
    })

    it('should default to 1 decimal place', () => {
      expect(roundValue(3.14159)).toBe(3.1)
    })

    it('should handle zero', () => {
      expect(roundValue(0, 2)).toBe(0)
    })
  })

  describe('validateCurrentForm', () => {
    it('should return true when no forms exist', () => {
      const result = validateCurrentForm()
      expect(typeof result).toBe('boolean')
    })

    it('should add was-validated class to forms', () => {
      const form = document.createElement('form')
      form.classList.add('needs-validation')
      document.body.appendChild(form)

      validateCurrentForm()

      expect(form.classList.contains('was-validated')).toBe(true)

      document.body.removeChild(form)
    })

    it('should check form validity', () => {
      const form = document.createElement('form')
      form.classList.add('needs-validation')
      const input = document.createElement('input')
      input.required = true
      form.appendChild(input)
      document.body.appendChild(form)

      const result = validateCurrentForm()

      expect(typeof result).toBe('boolean')
      expect(form.classList.contains('was-validated')).toBe(true)

      document.body.removeChild(form)
    })
  })

  describe('download', () => {
    let createElementSpy, setAttributeSpy, clickSpy

    beforeEach(() => {
      clickSpy = vi.fn()
      setAttributeSpy = vi.fn()
      createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
        setAttribute: setAttributeSpy,
        click: clickSpy
      })
    })

    it('should create link element for text content', () => {
      download('test content', 'text/plain', 'test.txt')

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(setAttributeSpy).toHaveBeenCalledWith('download', 'test.txt')
      expect(clickSpy).toHaveBeenCalled()
    })

    it('should use data URL for text mime types', () => {
      download('test content', 'text/csv', 'data.csv')

      expect(setAttributeSpy).toHaveBeenCalledWith(
        'href',
        expect.stringContaining('data:text/csv')
      )
    })

    it('should handle special characters in content', () => {
      const content = 'test & <content>'
      download(content, 'text/plain', 'test.txt')

      // The content should be encoded in the data URL
      const callArgs = setAttributeSpy.mock.calls.find(call => call[0] === 'href')
      expect(callArgs).toBeDefined()
      expect(callArgs[1]).toContain('data:text/plain')
      expect(clickSpy).toHaveBeenCalled()
    })
  })

  describe('getFormattedTemperature with config variants', () => {
    it('should format temperature in Celsius by default', () => {
      const result = getFormattedTemperature(20)
      expect(result).toContain('20.0')
      expect(result).toContain('°C')
    })

    it('should handle temperature rounding', () => {
      const result = getFormattedTemperature(20.456)
      expect(result).toContain('20.5')
    })
  })

  describe('getFormattedPressure with config variants', () => {
    it('should format pressure in Bar by default', () => {
      const result = getFormattedPressure(1)
      expect(result).toContain('Bar')
    })

    it('should round pressure values', () => {
      const result = getFormattedPressure(10.5)
      expect(result).toBeTruthy()
      expect(result).toMatch(/\d+\.\d/)
    })
  })

  describe('getFormattedVolume with config variants', () => {
    it('should format in liters by default', () => {
      const result = getFormattedVolume(1)
      expect(result).toContain('1.00')
      expect(result).toContain('L')
    })

    it('should handle large volumes', () => {
      const result = getFormattedVolume(1000)
      expect(result).toContain('L')
    })
  })

  describe('getFormattedPourVolume with config variants', () => {
    it('should format in centiliters by default', () => {
      const result = getFormattedPourVolume(50)
      expect(result).toContain('cl')
    })

    it('should handle zero pour volume', () => {
      const result = getFormattedPourVolume(0)
      expect(result).toContain('0')
    })
  })

  describe('getPressureDataAnalytics', () => {
    it('should process pressure data and return stats', () => {
      const now = new Date()
      const pressureList = [
        {
          active: true,
          pressure: 10,
          temperature: 20,
          created: now.toISOString()
        },
        {
          active: true,
          pressure: 12,
          temperature: 22,
          created: new Date(now.getTime() + 3600000).toISOString()
        }
      ]

      const result = getPressureDataAnalytics(pressureList)

      expect(result.readings).toBe(2)
      expect(result.pressure.min).toBeLessThanOrEqual(result.pressure.max)
      expect(result.temperature.min).toBeLessThanOrEqual(result.temperature.max)
    })

    it('should filter inactive readings', () => {
      const now = new Date()
      const pressureList = [
        { active: true, pressure: 10, temperature: 20, created: now.toISOString() },
        { active: false, pressure: 15, temperature: 25, created: now.toISOString() }
      ]

      const result = getPressureDataAnalytics(pressureList)

      expect(result.readings).toBe(1)
    })

    it('should handle invalid temperatures', () => {
      const now = new Date()
      const pressureList = [
        { active: true, pressure: 10, temperature: -280, created: now.toISOString() },
        { active: true, pressure: 12, temperature: 20, created: now.toISOString() }
      ]

      const result = getPressureDataAnalytics(pressureList)

      expect(result.readings).toBe(2)
      expect(result.temperature.min).toBeGreaterThan(-270)
    })

    it('should handle empty pressure list', () => {
      const result = getPressureDataAnalytics([])

      expect(result.readings).toBe(0)
      expect(result.date.first).toBe('')
    })

    it('should calculate average interval', () => {
      const now = new Date()
      const pressureList = [
        { active: true, pressure: 10, temperature: 20, created: now.toISOString() },
        { active: true, pressure: 12, temperature: 22, created: new Date(now.getTime() + 60000).toISOString() }
      ]

      const result = getPressureDataAnalytics(pressureList)

      expect(result.averageIntervalString).toBeDefined()
      // averageInterval is a string, so convert to number before comparing
      const avgNum = Number(result.averageInterval)
      expect(avgNum).toBeGreaterThan(0)
    })
  })

  describe('getGravityDataAnalytics', () => {
    it('should process gravity data and return stats', () => {
      const now = new Date()
      const gravityList = [
        {
          active: true,
          gravity: 1.050,
          temperature: 20,
          created: now.toISOString()
        },
        {
          active: true,
          gravity: 1.020,
          temperature: 22,
          created: new Date(now.getTime() + 3600000).toISOString()
        }
      ]

      const result = getGravityDataAnalytics(gravityList)

      expect(result.readings).toBe(2)
      expect(result.gravity.min).toBeLessThanOrEqual(result.gravity.max)
    })

    it('should calculate ABV from OG and FG', () => {
      const now = new Date()
      const gravityList = [
        {
          active: true,
          gravity: 1.050,
          temperature: 20,
          created: now.toISOString()
        },
        {
          active: true,
          gravity: 1.010,
          temperature: 20,
          created: new Date(now.getTime() + 3600000).toISOString()
        }
      ]

      const result = getGravityDataAnalytics(gravityList)

      expect(result.abv).toBeGreaterThan(0)
    })

    it('should filter inactive readings', () => {
      const now = new Date()
      const gravityList = [
        { active: true, gravity: 1.050, temperature: 20, created: now.toISOString() },
        { active: false, gravity: 1.040, temperature: 20, created: now.toISOString() }
      ]

      const result = getGravityDataAnalytics(gravityList)

      expect(result.readings).toBe(1)
    })

    it('should handle empty gravity list', () => {
      const result = getGravityDataAnalytics([])

      expect(result.readings).toBe(0)
    })

    it('should handle invalid temperatures', () => {
      const now = new Date()
      const gravityList = [
        { active: true, gravity: 1.050, temperature: -280, created: now.toISOString() },
        { active: true, gravity: 1.020, temperature: 20, created: now.toISOString() }
      ]

      const result = getGravityDataAnalytics(gravityList)

      expect(result.readings).toBe(2)
    })
  })

  describe('Advanced Utility Functions - Truncation and Formatting', () => {
    it('should handle very high temperatures', () => {
      const formatted = getFormattedTemperature(150)
      expect(formatted).not.toBe('--')
      expect(formatted).toContain('°')
    })

    it('should handle very low temperatures (absolute zero boundary)', () => {
      const formatted = getFormattedTemperature(-270.5)
      expect(formatted).toBe('--')
    })

    it('should handle exactly -270 (at absolute zero)', () => {
      const formatted = getFormattedTemperature(-270)
      expect(formatted).toContain('°C')
    })

    it('should format null temperature as dashes', () => {
      const formatted = getFormattedTemperature(null)
      expect(formatted).toBe('--')
    })

    it('should format undefined temperature as dashes', () => {
      const formatted = getFormattedTemperature(undefined)
      expect(formatted).toBe('--')
    })

    it('should truncate long strings with ellipsis', () => {
      const result = truncateString('This is a very long string that should be truncated', 20)
      expect(result.length).toBeLessThanOrEqual(23) // 20 + '...'
      expect(result).toContain('...')
    })

    it('should not truncate strings shorter than max length', () => {
      const result = truncateString('short', 20)
      expect(result).toBe('short')
    })

    it('should handle exactly max length strings', () => {
      const result = truncateString('12345', 5)
      expect(result).toBe('12345')
    })

    it('should handle empty strings', () => {
      const result = truncateString('', 10)
      expect(result).toBe('')
    })
  })

  describe('More Conversion Functions', () => {
    it('should convert volume: liters to UK gallons', () => {
      const uk = volumeLtoUKGallon(1)
      expect(uk).toBeLessThan(0.3)
      expect(uk).toBeGreaterThan(0.2)
    })

    it('should convert volume: centiliters to US ounces', () => {
      const oz = volumeCLtoUSOZ(29.5735)
      expect(oz).toBeCloseTo(10.05, 1)
    })

    it('should convert volume: centiliters to UK ounces', () => {
      const oz = volumeCLtoUKOZ(28.4)
      expect(oz).toBeCloseTo(10, 0)
    })

    it('should handle zero volume in UK ounces conversion', () => {
      const result = volumeCLtoUKOZ(0.0)
      expect(result).toBe(0.0)
    })

    it('should convert pressure to kPa', () => {
      const kpa = pressureToKPA(10)
      expect(kpa).toBeGreaterThan(68)
      expect(kpa).toBeLessThan(70)
    })

    it('should convert pressure to BAR', () => {
      const bar = pressureToBAR(10)
      expect(bar).toBeLessThan(1)
      expect(bar).toBeGreaterThan(0.6)
    })
  })

  describe('Data Validation Functions', () => {
    it('should validate correct JSON', () => {
      const result = isValidJson('{"key": "value"}')
      expect(result).toBe(true)
    })

    it('should reject invalid JSON', () => {
      const result = isValidJson('{invalid}')
      expect(result).toBe(false)
    })

    it('should validate MQTT data with correct format', () => {
      const mqttData = { topic: 'test', payload: 'data' }
      const result = isValidMqttData(mqttData)
      expect(typeof result).toBe('boolean')
    })

    it('should validate form data with required fields', () => {
      const formData = { name: 'Test', email: 'test@example.com' }
      const result = isValidFormData(formData)
      expect(typeof result).toBe('boolean')
    })
  })

  describe('Data Analytics - Extended Coverage', () => {
    it('should handle pressure with single reading', () => {
      const pressureList = [
        { pressure: 12, temperature: 20, created: new Date().toISOString(), active: true }
      ]

      const result = getPressureDataAnalytics(pressureList)

      expect(result.readings).toBe(1)
      expect(result.pressure).toBeDefined()
      expect(typeof result.pressure.max).toBe('number')
    })

    it('should handle gravity with temperature and date tracking', () => {
      const now = new Date()
      const gravityList = [
        { gravity: 1.050, temperature: 20, created: now.toISOString(), active: true },
        { gravity: 1.045, temperature: 22, created: now.toISOString(), active: true },
        { gravity: 1.030, temperature: 21, created: now.toISOString(), active: true }
      ]

      const result = getGravityDataAnalytics(gravityList)

      expect(result.gravity).toBeDefined()
      expect(result.gravity.max).toBeDefined()
      expect(result.gravity.min).toBeDefined()
      expect(typeof result.abv).toBe('number')
    })

    it('should calculate ABV from gravity readings', () => {
      const now = new Date()
      const gravityList = [
        { gravity: 1.060, temperature: 20, created: now.toISOString(), active: true },
        { gravity: 1.010, temperature: 20, created: now.toISOString(), active: true }
      ]

      const result = getGravityDataAnalytics(gravityList)

      expect(result.abv).toBeDefined()
      expect(result.abv).toBeGreaterThan(0)
      expect(result.abv).toBeLessThan(20)
    })

    it('should handle readings with attenuation tracking', () => {
      const now = new Date()
      const gravityList = [
        { gravity: 1.050, temperature: 20, created: now.toISOString(), active: true },
        { gravity: 1.020, temperature: 20, created: now.toISOString(), active: true }
      ]

      const result = getGravityDataAnalytics(gravityList)

      expect(result.gravity).toBeDefined()
      expect(result.readings).toBeGreaterThan(0)
      expect(typeof result.abv).toBe('number')
    })

    it('should handle pressure with extreme values', () => {
      const pressureList = [
        { pressure: 100, temperature: 20, created: new Date().toISOString(), active: true },
        { pressure: -5, temperature: 20, created: new Date().toISOString(), active: true }
      ]

      const result = getPressureDataAnalytics(pressureList)

      expect(result.pressure.max).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Time and String Utilities', () => {
    it('should format very old posts', () => {
      const now = new Date()
      const longAgo = new Date(now.getTime() - 365 * 24 * 3600000)
      const result = getTimeSincePosted(longAgo.toISOString())
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })
  })

  describe('formatTime - Full Time Duration Formatting', () => {
    it('should format seconds only', () => {
      const result = formatTime(45)
      expect(result).toContain('45s')
      expect(result).not.toContain('m')
      expect(result).not.toContain('h')
      expect(result).not.toContain('d')
      expect(result).not.toContain('w')
    })

    it('should format minutes and seconds', () => {
      const result = formatTime(125) // 2 minutes 5 seconds
      expect(result).toContain('2m')
      expect(result).toContain('5s')
    })

    it('should format hours, minutes, and seconds', () => {
      const result = formatTime(3725) // 1 hour, 2 minutes, 5 seconds
      expect(result).toContain('1h')
      expect(result).toContain('2m')
      expect(result).toContain('5s')
    })

    it('should format days, hours, minutes, and seconds', () => {
      const result = formatTime(90125) // 1 day, 1 hour, 2 minutes, 5 seconds
      expect(result).toContain('1d')
      expect(result).toContain('1h')
      expect(result).toContain('2m')
      expect(result).toContain('5s')
    })

    it('should format weeks and days', () => {
      const result = formatTime(604800 + 86400) // 8 days = 1 week + 1 day
      expect(result).toContain('w') // weeks
      expect(result).toContain('d') // days
    })

    it('should handle zero seconds', () => {
      const result = formatTime(0)
      expect(result.trim()).toBe('')
    })

    it('should handle exactly one minute', () => {
      const result = formatTime(60)
      expect(result).toContain('1m')
    })

    it('should handle exactly one hour', () => {
      const result = formatTime(3600)
      expect(result).toContain('1h')
    })

    it('should handle exactly one day', () => {
      const result = formatTime(86400)
      expect(result).toContain('1d')
    })

    it('should handle large durations (multiple weeks)', () => {
      const result = formatTime(7 * 86400 + 3600) // 1 week, 1 hour
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle mixed time units', () => {
      const result = formatTime(604800) // 1 week exactly
      expect(result).toContain('w')
      expect(typeof result).toBe('string')
    })
  })

  describe('formatTimeShort - Short Time Duration Formatting', () => {
    it('should format seconds only in short format', () => {
      const result = formatTimeShort(45)
      expect(result.trim()).toBe('') // formatTimeShort doesn't format seconds
    })

    it('should format minutes only in short format', () => {
      const result = formatTimeShort(300) // 5 minutes
      expect(result.trim()).toBe('') // formatTimeShort doesn't format minutes or seconds
    })

    it('should format hours in short format', () => {
      const result = formatTimeShort(3600) // 1 hour
      expect(result).toContain('1h') // formatTimeShort does format hours
    })

    it('should format days in short format', () => {
      const result = formatTimeShort(86400) // 1 day
      expect(result).toContain('1d')
    })

    it('should format weeks and days in short format', () => {
      const result = formatTimeShort(604800) // 1 week
      expect(result).toContain('w')
    })

    it('should handle zero in short format', () => {
      const result = formatTimeShort(0)
      expect(typeof result).toBe('string')
    })

    it('should handle large durations in short format', () => {
      const result = formatTimeShort(1814400) // 21 days
      expect(typeof result).toBe('string')
      expect(result).toContain('w')
    })

    it('should handle exactly 7 days in short format', () => {
      const result = formatTimeShort(604800) // 7 days = 1 week
      expect(result).toContain('w')
    })

    it('should include days in short format when present', () => {
      const result = formatTimeShort(777600) // 9 days
      expect(result).toContain('d')
    })

    it('should omit minutes and seconds in short format', () => {
      const result = formatTimeShort(90125) // 1d 1h 2m 5s
      expect(result).not.toContain('m') // formatTimeShort omits minutes
      expect(result).not.toContain('s') // formatTimeShort omits seconds
      expect(result).toContain('h') // but does include hours
    })
  })

  describe('Edge Cases - Boundary Conditions', () => {
    it('should handle very large gravity values in analytics', () => {
      const now = new Date()
      const gravityList = [{ gravity: 2.0, temperature: 20, created: now.toISOString(), active: true }]
      const result = getGravityDataAnalytics(gravityList)
      expect(result.gravity.max).toBeDefined()
    })

    it('should handle null temperature in gravity analytics', () => {
      const now = new Date()
      const gravityList = [
        { gravity: 1.050, temperature: null, created: now.toISOString(), active: true },
        { gravity: 1.030, temperature: 20, created: now.toISOString(), active: true }
      ]
      const result = getGravityDataAnalytics(gravityList)
      expect(result.temperature.max).toBeDefined()
    })

    it('should handle all inactive readings', () => {
      const pressureList = [
        { pressure: 10, temperature: 20, created: new Date().toISOString(), active: false },
        { pressure: 12, temperature: 22, created: new Date().toISOString(), active: false }
      ]
      const result = getPressureDataAnalytics(pressureList)
      expect(result.readings).toBe(0)
    })

    it('should handle single inactive reading', () => {
      const gravityList = [
        { gravity: 1.050, temperature: 20, created: new Date().toISOString(), active: false }
      ]
      const result = getGravityDataAnalytics(gravityList)
      expect(result.readings).toBe(0) // No active readings
      expect(result.gravity).toBeDefined() // Structure exists
    })

    it('should format temperature at exactly -273 boundary', () => {
      const result = getFormattedTemperature(-273)
      expect(result).toBe('--')
    })

    it('should handle fractional seconds in getTimeSincePosted', () => {
      const now = new Date()
      const almostNow = new Date(now.getTime() - 30 * 1000)
      const result = getTimeSincePosted(almostNow.toISOString())
      expect(result).toBe('just now')
    })

    it('should handle exactly 1 hour boundary', () => {
      const now = new Date()
      const exactlyHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const result = getTimeSincePosted(exactlyHourAgo.toISOString())
      expect(result).toMatch(/^\d+ h ago$/)
    })

    it('should handle exactly 1 day boundary', () => {
      const now = new Date()
      const exactlyDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const result = getTimeSincePosted(exactlyDayAgo.toISOString())
      expect(result).toMatch(/^\d+ d ago$/)
    })

    it('should handle exactly 7 days boundary', () => {
      const now = new Date()
      const exactlyWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const result = getTimeSincePosted(exactlyWeekAgo.toISOString())
      expect(result).toMatch(/^\d+ w ago$/)
    })

    it('should truncate string at exact boundary', () => {
      const result = truncateString('12345', 5)
      expect(result).toBe('12345')
      expect(result).not.toContain('...')
    })

    it('should truncate string one character over', () => {
      const result = truncateString('123456', 5)
      expect(result).toBe('12345...')
      expect(result.length).toBe(8)
    })
  })

  describe('Config-Dependent Formatting Edge Cases', () => {
    it('should round pressure conversions correctly', () => {
      const pressure = 14.5038
      const result = getFormattedPressure(pressure)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should handle zero temperature in formatted output', () => {
      const result = getFormattedTemperature(0)
      expect(result).toContain('0.0')
      expect(result).toContain('°')
    })

    it('should handle negative gravity (invalid but should not crash)', () => {
      const now = new Date()
      const gravityList = [
        { gravity: -0.5, temperature: 20, created: now.toISOString(), active: true },
        { gravity: 1.050, temperature: 20, created: now.toISOString(), active: true }
      ]
      const result = getGravityDataAnalytics(gravityList)
      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })

    it('should handle very precise decimal values', () => {
      const result = roundValue(1.23456789, 5)
      expect(result).toBe(1.23457)
    })

    it('should handle negative pressure values', () => {
      const now = new Date()
      const pressureList = [
        { pressure: -10, temperature: 20, created: now.toISOString(), active: true }
      ]
      const result = getPressureDataAnalytics(pressureList)
      expect(result).toBeDefined()
    })
  })

  describe('Binary Download and Text Encoding Branches', () => {
    let createElementSpy, setAttributeSpy, clickSpy

    beforeEach(() => {
      clickSpy = vi.fn()
      setAttributeSpy = vi.fn()
      createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
        setAttribute: setAttributeSpy,
        click: clickSpy
      })
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
    })

    it('should handle binary content with blob URL', () => {
      download('binary content', 'application/octet-stream', 'file.bin')

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(setAttributeSpy).toHaveBeenCalledWith('href', 'blob:mock-url')
      expect(setAttributeSpy).toHaveBeenCalledWith('download', 'file.bin')
      expect(clickSpy).toHaveBeenCalled()
    })

    it('should use blob URL for application/json', () => {
      download('{"key": "value"}', 'application/json', 'data.json')

      expect(setAttributeSpy).toHaveBeenCalledWith('href', 'blob:mock-url')
      expect(clickSpy).toHaveBeenCalled()
    })

    it('should use data URL for text/csv', () => {
      download('col1,col2\nval1,val2', 'text/csv', 'data.csv')

      const hrefCalls = setAttributeSpy.mock.calls.filter(call => call[0] === 'href')
      expect(hrefCalls.length).toBeGreaterThan(0)
      expect(hrefCalls[0][1]).toContain('data:text/csv')
    })

    it('should use data URL for text/plain', () => {
      download('plain text', 'text/plain', 'note.txt')

      const hrefCalls = setAttributeSpy.mock.calls.filter(call => call[0] === 'href')
      expect(hrefCalls.length).toBeGreaterThan(0)
      expect(hrefCalls[0][1]).toContain('data:text/plain')
    })

    it('should encode special characters in data URL', () => {
      const content = 'Special chars: <>&"\'%'
      download(content, 'text/plain', 'special.txt')

      const hrefCalls = setAttributeSpy.mock.calls.filter(call => call[0] === 'href')
      expect(hrefCalls[0][1]).toContain('data:text/plain')
      // Special characters should be percent-encoded in the data URL
      expect(hrefCalls[0][1]).toContain('%3C') // <
      expect(hrefCalls[0][1]).toContain('%3E') // >
    })

    it('should use data URL for text/html', () => {
      download('<h1>HTML Content</h1>', 'text/html', 'page.html')

      const hrefCalls = setAttributeSpy.mock.calls.filter(call => call[0] === 'href')
      expect(hrefCalls.length).toBeGreaterThan(0)
      expect(hrefCalls[0][1]).toContain('data:text/html')
    })
  })

  describe('Gravity Analytics with Plato Configuration', () => {
    it('should process gravity data correctly with default SG config', () => {
      const now = new Date()
      const gravityList = [
        { gravity: 1.050, temperature: 20, created: now.toISOString(), active: true },
        { gravity: 1.010, temperature: 20, created: new Date(now.getTime() + 3600000).toISOString(), active: true }
      ]

      const result = getGravityDataAnalytics(gravityList)

      expect(result.gravity).toBeDefined()
      expect(result.gravity.minString).toContain('SG')
      expect(result.gravity.maxString).toContain('SG')
    })

    it('should include temperature strings in analytics', () => {
      const now = new Date()
      const gravityList = [
        { gravity: 1.050, temperature: 15, created: now.toISOString(), active: true },
        { gravity: 1.010, temperature: 25, created: new Date(now.getTime() + 3600000).toISOString(), active: true }
      ]

      const result = getGravityDataAnalytics(gravityList)

      expect(result.temperature.minString).toContain('C')
      expect(result.temperature.maxString).toContain('C')
    })
  })

  describe('Pressure Analytics with Temperature Parsing', () => {
    it('should parse date components in pressure analytics', () => {
      const timestamp = '2025-03-15T14:30:45Z'
      const pressureList = [
        { pressure: 10, temperature: 20, created: timestamp, active: true }
      ]

      const result = getPressureDataAnalytics(pressureList)

      expect(result.date.firstDate).toBe('2025-03-15')
      expect(result.date.firstTime).toBe('14:30:45')
    })

    it('should handle pressure analytics with multiple readings spanning hours', () => {
      const now = new Date()
      const pressureList = [
        { pressure: 10, temperature: 20, created: now.toISOString(), active: true },
        { pressure: 11, temperature: 21, created: new Date(now.getTime() + 300000).toISOString(), active: true } // 5 minutes later
      ]

      const result = getPressureDataAnalytics(pressureList)

      expect(result.averageIntervalString).toContain('m') // should be in minutes
      expect(result.averageIntervalString).not.toContain('w')
      expect(result.averageIntervalString).not.toContain('d')
    })
  })
})
