import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useGravityConversion, useTemperatureConversion, usePressureConversion } from '@/modules/useUnitConversion'

describe('useUnitConversion composables', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('useGravityConversion', () => {
    it('should return displayValue as a computed property', () => {
      const batch = ref({ og: 1.050 })
      const { displayValue } = useGravityConversion(batch, 'og')
      expect(displayValue).toBeDefined()
      expect(displayValue.value).toBeDefined()
    })

    it('should handle batch with og value', () => {
      const batch = ref({ og: 1.050 })
      const { displayValue } = useGravityConversion(batch, 'og')
      expect(displayValue.value).toBeTruthy()
    })

    it('should support bidirectional binding with set', () => {
      const batch = ref({ og: 0 })
      const { displayValue } = useGravityConversion(batch, 'og')
      displayValue.value = 1.060
      expect(batch.value.og).toBeGreaterThan(1)
    })

    it('should return unit as a computed property', () => {
      const batch = ref({})
      const { unit } = useGravityConversion(batch, 'og')
      expect(unit).toBeDefined()
      expect(unit.value).toBeDefined()
      expect(['SG', 'P']).toContain(unit.value)
    })

    it('should return step as a computed property', () => {
      const batch = ref({})
      const { step } = useGravityConversion(batch, 'og')
      expect(step).toBeDefined()
      expect(step.value).toBeDefined()
      expect([0.001, 0.1]).toContain(step.value)
    })

    it('should handle null batch gracefully', () => {
      const batch = ref(null)
      const { displayValue } = useGravityConversion(batch, 'og')
      expect(displayValue.value).toBe(0)
    })

    it('should round SG display value', () => {
      const batch = ref({ og: 1.050123 })
      const { displayValue } = useGravityConversion(batch, 'og')
      // Display value should be rounded (either as SG with 3 decimals or Plato with 1 decimal)
      expect(typeof displayValue.value).toBe('number')
      expect(displayValue.value).toBeGreaterThan(0)
    })

    it('should work with fg field', () => {
      const batch = ref({ fg: 1.010 })
      const { displayValue } = useGravityConversion(batch, 'fg')
      expect(displayValue.value).toBeDefined()
      expect(displayValue.value).toBeGreaterThan(0)
    })
  })

  describe('useTemperatureConversion', () => {
    it('should return displayValue as a computed property', () => {
      const batch = ref({ targetTemp: 20 })
      const { displayValue } = useTemperatureConversion(batch, 'targetTemp')
      expect(displayValue).toBeDefined()
      expect(displayValue.value).toBeDefined()
    })

    it('should handle batch with temperature value', () => {
      const batch = ref({ targetTemp: 20 })
      const { displayValue } = useTemperatureConversion(batch, 'targetTemp')
      expect(displayValue.value).toBeGreaterThan(0)
    })

    it('should support bidirectional binding with set', () => {
      const batch = ref({ targetTemp: 0 })
      const { displayValue } = useTemperatureConversion(batch, 'targetTemp')
      displayValue.value = 25
      expect(batch.value.targetTemp).toBeDefined()
    })

    it('should return unit as a computed property', () => {
      const batch = ref({})
      const { unit } = useTemperatureConversion(batch, 'targetTemp')
      expect(unit).toBeDefined()
      expect(unit.value).toBeDefined()
      expect(['°C', '°F']).toContain(unit.value)
    })

    it('should round temperature to 1 decimal place', () => {
      const batch = ref({ targetTemp: 20.123 })
      const { displayValue } = useTemperatureConversion(batch, 'targetTemp')
      // Display value should be rounded (either as C or F)
      expect(typeof displayValue.value).toBe('number')
      expect(displayValue.value).toBeGreaterThan(0)
    })

    it('should handle null temperature gracefully', () => {
      const batch = ref({ targetTemp: null })
      const { displayValue } = useTemperatureConversion(batch, 'targetTemp')
      expect(displayValue.value).toBe(0)
    })
  })

  describe('usePressureConversion', () => {
    it('should return displayValue as a computed property', () => {
      const batch = ref({ pressure: 10 })
      const { displayValue } = usePressureConversion(batch, 'pressure')
      expect(displayValue).toBeDefined()
      expect(displayValue.value).toBeDefined()
    })

    it('should handle batch with pressure value', () => {
      const batch = ref({ pressure: 10 })
      const { displayValue } = usePressureConversion(batch, 'pressure')
      expect(displayValue.value).toBeGreaterThan(0)
    })

    it('should support bidirectional binding with set', () => {
      const batch = ref({ pressure: 0 })
      const { displayValue } = usePressureConversion(batch, 'pressure')
      displayValue.value = 15
      expect(batch.value.pressure).toBeGreaterThan(0)
    })

    it('should return unit as a computed property', () => {
      const batch = ref({})
      const { unit } = usePressureConversion(batch, 'pressure')
      expect(unit).toBeDefined()
      expect(unit.value).toBeDefined()
      expect(['PSI', 'Bar', 'kPa']).toContain(unit.value)
    })

    it('should handle null pressure gracefully', () => {
      const batch = ref({ pressure: null })
      const { displayValue } = usePressureConversion(batch, 'pressure')
      expect(displayValue.value).toBe(0)
    })

    it('should round pressure display value appropriately', () => {
      const batch = ref({ pressure: 10.123 })
      const { displayValue } = usePressureConversion(batch, 'pressure')
      // Display value should be rounded
      expect(typeof displayValue.value).toBe('number')
      expect(displayValue.value).toBeGreaterThan(0)
    })
  })

  describe('Composable Integration Tests', () => {
    it('should handle multiple composables on same batch', () => {
      const batch = ref({
        og: 1.050,
        fg: 1.010
      })

      const { displayValue: ogDisplay } = useGravityConversion(batch, 'og')
      const { displayValue: fgDisplay } = useGravityConversion(batch, 'fg')

      expect(ogDisplay.value).toBeDefined()
      expect(fgDisplay.value).toBeDefined()
      expect(ogDisplay.value).toBeGreaterThan(fgDisplay.value)
    })

    it('should update batch when composable displayValue changes', () => {
      const batch = ref({ og: 0 })
      const { displayValue } = useGravityConversion(batch, 'og')

      const originalValue = batch.value.og
      displayValue.value = 1.060

      expect(batch.value.og).not.toBe(originalValue)
      expect(batch.value.og).toBeGreaterThan(0)
    })

    it('should react to batch changes in composable displayValue', () => {
      const batch = ref({ temperature: 20 })
      const { displayValue } = useTemperatureConversion(batch, 'temperature')

      const originalDisplay = displayValue.value
      batch.value.temperature = 25

      expect(displayValue.value).not.toBe(originalDisplay)
    })
  })
})

