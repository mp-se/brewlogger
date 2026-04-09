<!--
BrewLogger
Copyright (c) 2021-2026 Magnus

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Alternatively, this software may be used under the terms of a
commercial license. See LICENSE_COMMERCIAL for details.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->
<template>
  <div class="pt-2">
    <label v-if="label !== undefined" :for="id" class="form-label fw-bold">{{ label }}</label>
    &nbsp;<span v-if="badge" class="badge text-bg-danger rounded-circle">1</span>
    <div
      :class="[
        width === undefined ? '' : 'col-' + width,
        errorMessage ? 'has-validation' : ''
      ]"
    >
      <!-- @slot this is where the main component is located -->
      <slot :id="id" :is-invalid="!!errorMessage"></slot>
      <div v-if="errorMessage" class="invalid-feedback d-block">
        {{ errorMessage }}
      </div>
    </div>
    <div class="form-text">{{ help }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 2024-05-28 Bootstrap VueJS wrapper, Magnus Persson
 */

/**
 * Purpose: Basic layout of a form component with label on top and help text below.
 *
 * Note! Should not be used directly, this is a base class for form components.
 */
defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  /**
   * Optional unique ID for the input. If not provided, one will be generated.
   */
  id: {
    type: String,
    default: () => `bs-input-${Math.random().toString(36).substring(2, 9)}`
  },
  /**
   * Error message to display. If present, the field is marked as invalid.
   */
  errorMessage: {
    type: String,
    default: ''
  }
})

/**
 * This text is shown above the form component (optional).
 */
const label = defineModel('label')
/**
 * Help text is shown below the field to provide user help with input (optional).
 */
const help = defineModel('help')
/**
 * Specify the width to force a specific size (optional).
 */
const width = defineModel('width')
/**
 * Specify if an badge should be shown to guide the user (optional).
 */
const badge = defineModel('badge')
</script>
