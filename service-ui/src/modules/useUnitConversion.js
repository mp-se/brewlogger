// BrewLogger
// Copyright (c) 2021-2026 Magnus
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Alternatively, this software may be used under the terms of a
// commercial license. See LICENSE_COMMERCIAL for details.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//
import { computed } from 'vue'
import { config } from '@/modules/pinia'
import {
  gravityToPlato,
  platoToGravity,
  tempToF,
  tempToC,
  pressureToKPA,
  pressureToBAR,
  roundValue
} from '@/modules/utils'


const GRAVITY_SG_DECIMALS = 3
const GRAVITY_PLATO_DECIMALS = 1
const GRAVITY_SG_STEP = 0.001
const GRAVITY_PLATO_STEP = 0.1


const TEMPERATURE_STEP = 0.1


const PRESSURE_PSI_DECIMALS = 1
const PRESSURE_BAR_DECIMALS = 2
const PRESSURE_KPA_DECIMALS = 0
const PSI_TO_BAR_FACTOR = 0.0689475729
const PSI_TO_KPA_FACTOR = 6.8947572932

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
      return roundValue(
        displayValue,
        config.isGravitySG ? GRAVITY_SG_DECIMALS : GRAVITY_PLATO_DECIMALS
      )
    },
    set(displayedValue) {
      if (batch.value) {
        batch.value[field] = config.isGravitySG ? displayedValue : platoToGravity(displayedValue)
      }
    }
  })

  const unit = computed(() => (config.isGravitySG ? 'SG' : 'P'))
  const step = computed(() => (config.isGravitySG ? GRAVITY_SG_STEP : GRAVITY_PLATO_STEP))

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

  const unit = computed(() => (config.isTempC ? '°C' : '°F'))
  const step = computed(() => TEMPERATURE_STEP)

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
        decimals = PRESSURE_PSI_DECIMALS
      } else if (config.isPressureBAR) {
        displayValue = pressureToBAR(psiValue)
        decimals = PRESSURE_BAR_DECIMALS
      } else {
        displayValue = pressureToKPA(psiValue)
        decimals = PRESSURE_KPA_DECIMALS
      }
      return roundValue(displayValue, decimals)
    },
    set(displayedValue) {
      if (batch.value) {
        if (config.isPressurePSI) {
          batch.value[field] = displayedValue
        } else if (config.isPressureBAR) {
          batch.value[field] = displayedValue / PSI_TO_BAR_FACTOR
        } else {
          batch.value[field] = displayedValue / PSI_TO_KPA_FACTOR
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
