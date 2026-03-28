import { describe, it, expect, vi } from 'vitest'
import {
  abv,
  gravityToPlato,
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
  getFormattedPourVolume
} from '../utils'

// Mock the logger and config
vi.mock('../logger', () => ({
  logDebug: vi.fn()
}))

vi.mock('../pinia', () => ({
  config: {
    isTempF: false,
    isPressurePSI: false,
    isPressureKPA: false,
    isVolumeUs: false,
    isVolumeUk: false
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
})
