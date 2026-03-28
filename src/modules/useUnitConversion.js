import { computed } from 'vue'
import { config } from '@/modules/pinia'
import { gravityToPlato, platoToGravity, tempToF, tempToC, pressureToKPA, pressureToBAR, roundValue } from '@/modules/utils'

/**
 * Composable for handling dual-unit display/edit for Gravity
 * Data is always stored as SG internally, displays based on config
 * 
 * @param {Ref} batch - Reference to batch object
 * @param {string} field - Field name ('og' or 'fg')
 * @returns {Object} - { displayValue (computed), unit (computed), step (computed) }
 */
export function useGravityConversion(batch, field) {
  const displayValue = computed({
    get() {
      if (!batch.value || !batch.value[field]) return 0
      const sgValue = batch.value[field]
      const displayValue = config.isGravitySG ? sgValue : gravityToPlato(sgValue)
      return roundValue(displayValue, config.isGravitySG ? 3 : 1)
    },
    set(displayedValue) {
      if (batch.value) {
        batch.value[field] = config.isGravitySG ? displayedValue : platoToGravity(displayedValue)
      }
    }
  })

  const unit = computed(() => config.isGravitySG ? 'SG' : 'P')
  const step = computed(() => config.isGravitySG ? 0.001 : 0.1)

  return { displayValue, unit, step }
}

/**
 * Composable for handling dual-unit display for Temperature
 * Data is stored as Celsius, can display as Celsius or Fahrenheit
 * 
 * @param {Ref} batch - Reference to batch object
 * @param {string} field - Field name
 * @returns {Object} - { displayValue (computed), unit (computed) }
 */
export function useTemperatureConversion(batch, field) {
  const displayValue = computed({
    get() {
      if (!batch.value || batch.value[field] === null || batch.value[field] === undefined) return 0
      const celsiusValue = batch.value[field]
      const displayValue = config.isTempC ? celsiusValue : tempToF(celsiusValue)
      return roundValue(displayValue, 1)
    },
    set(displayedValue) {
      if (batch.value) {
        batch.value[field] = config.isTempC ? displayedValue : tempToC(displayedValue)
      }
    }
  })

  const unit = computed(() => config.isTempC ? '°C' : '°F')
  const step = computed(() => 0.1)

  return { displayValue, unit, step }
}

/**
 * Composable for handling dual-unit display for Pressure
 * Data is stored as PSI, can display as PSI, BAR, or kPa
 * 
 * @param {Ref} batch - Reference to batch object
 * @param {string} field - Field name
 * @returns {Object} - { displayValue (computed), unit (computed), decimals (computed) }
 */
export function usePressureConversion(batch, field) {
  const displayValue = computed({
    get() {
      if (!batch.value || !batch.value[field]) return 0
      const psiValue = batch.value[field]
      let displayValue, decimals
      
      if (config.isPressurePSI) {
        displayValue = psiValue
        decimals = 1
      } else if (config.isPressureBAR) {
        displayValue = pressureToBAR(psiValue)
        decimals = 2
      } else {
        displayValue = pressureToKPA(psiValue)
        decimals = 0
      }
      return roundValue(displayValue, decimals)
    },
    set(displayedValue) {
      if (batch.value) {
        if (config.isPressurePSI) {
          batch.value[field] = displayedValue
        } else if (config.isPressureBAR) {
          batch.value[field] = displayedValue / 0.0689475729
        } else {
          batch.value[field] = displayedValue / 6.8947572932
        }
      }
    }
  })

  const unit = computed(() => {
    if (config.isPressurePSI) return 'PSI'
    if (config.isPressureBAR) return 'Bar'
    return 'kPa'
  })

  return { displayValue, unit }
}

/**
 * Generic rounding function exported from utils for use in composables
 * (See utils.js for the actual implementation)
 */
export { roundValue } from '@/modules/utils'

