// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

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
      <textarea
        v-model="model"
        :id="inputId"
        class="form-control"
        :class="{ 'is-invalid': isInvalid }"
        v-bind="$attrs"
        data-bs-toggle="tooltip"
        data-bs-custom-class="custom-tooltip"
        :data-bs-title="help"
      ></textarea>
    </template>
  </BsInputBase>
</template>

<script setup>
import BsInputBase from './BsInputBase.vue'
/**
 * 2024-05-28 Bootstrap VueJS wrapper, Magnus Persson
 */

/**
 * Purpose: Use as a building block for providing a text area that can allow for multiple lines of text.
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
 * Specify if an badge should be shown to guide the user (optional).
 */
const badge = defineModel('badge')
</script>
