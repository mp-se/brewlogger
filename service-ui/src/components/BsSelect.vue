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
  <BsInputBase
    :id="id"
    :width="width"
    :label="label"
    :help="help"
    :badge="badge"
    :error-message="errorMessage"
  >
    <template #default="{ id: inputId, isInvalid }">
      <select
        v-model="model"
        :id="inputId"
        class="form-select"
        :class="{ 'is-invalid': isInvalid }"
        :disabled="disabled"
        v-bind="$attrs"
      >
        <template v-for="o in options" :key="o.value">
          <option v-if="o.value === model" selected :value="o.value">
            <IconWifi />{{ o.label }}
          </option>
          <option v-else :value="o.value">{{ o.label }}</option>
        </template>
      </select>
    </template>
  </BsInputBase>
</template>

<script setup>
import IconWifi from '@/components/IconWifi.vue'
import BsInputBase from './BsInputBase.vue'
/**
 * 2024-05-28 Bootstrap VueJS wrapper, Magnus Persson
 */

/**
 * Purpose: Provide a select option
 */
defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  /**
   * Optional unique ID for the input.
   */
  id: {
    type: String,
    default: undefined
  },
  /**
   * Error message to display.
   */
  errorMessage: {
    type: String,
    default: ''
  }
})

/**
 * Ref to bind value to (required).
 */
const model = defineModel()
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
 * Options for the dropdown in the format [ { label: "label", value: "value" } ]
 * Label is displayed in the list and value is stored in the bound ref (required).
 */
const options = defineModel('options')
/**
 * Ref that steers if this component is enabled or not (optional).
 */
const disabled = defineModel('disabled')
/**
 * Specify if an badge should be shown to guide the user (optional).
 */
const badge = defineModel('badge')
</script>
