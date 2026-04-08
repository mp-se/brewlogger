// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

<template>
  <BsInputBase
    ref="inputBase"
    :id="id"
    :width="width"
    :label="label"
    :help="help"
    :badge="badge"
    :error-message="errorMessage"
  >
    <template #default="{ id: inputId, isInvalid }">
      <div class="input-group">
        <input
          v-model="model"
          :id="inputId"
          class="form-control"
          :class="{ 'is-invalid': isInvalid }"
          :type="type === undefined || flag ? 'text' : type"
          v-bind="$attrs"
          data-bs-toggle="tooltip"
          data-bs-custom-class="custom-tooltip"
          :data-bs-title="help"
        />
        <span v-if="type === 'password'" class="input-group-text">
          <IconEye v-if="!flag" @click="toggle" width="1rem" height="1rem"></IconEye>
          <IconEyeSlash v-if="flag" @click="toggle" width="1rem" height="1rem"></IconEyeSlash>
        </span>
      </div>
    </template>
  </BsInputBase>
</template>

<script setup>
import IconEyeSlash from './IconEyeSlash.vue'
import IconEye from './IconEye.vue'
import BsInputBase from './BsInputBase.vue'
/**
 * 2024-05-28 Bootstrap VueJS wrapper, Magnus Persson
 */

import { ref } from 'vue'
/**
 * Purpose: Proviude an input field
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
 * This is the v-model field that will be used to bind the component to (required).
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
 * Type of the input field, defaults to 'text' (optional, 'password' or 'text').
 */
const type = defineModel('type')
/**
 * Specify if an badge should be shown to guide the user (optional).
 */
const badge = defineModel('badge')
/**
 * Used internally to toggle field visibility between text / password
 */
const flag = ref(false)
function toggle() {
  flag.value = !flag.value
}
</script>
