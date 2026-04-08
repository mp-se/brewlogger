// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

<template>
  <BsInputBase :id="id" :width="width" :label="label" :help="help" :badge="badge">
    <template #default="{ id: inputId }">
      <div class="form-check form-switch" style="height: 38px">
        <input
          v-model="model"
          :id="inputId"
          class="form-check-input"
          type="checkbox"
          role="switch"
          v-bind="$attrs"
          :disabled="disabled"
          data-bs-toggle="tooltip"
          data-bs-custom-class="custom-tooltip"
          :data-bs-title="help"
        />
      </div>
    </template>
  </BsInputBase>
</template>

<script setup>
import BsInputBase from './BsInputBase.vue'
/**
 * 2024-05-28 Bootstrap VueJS wrapper, Magnus Persson
 */

/**
 * Purpose: Display a switch in for of a checkbox
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
 * Ref that steers if this component is enabled or not (required).
 */
const disabled = defineModel('disabled')
/**
 * Specify if an badge should be shown to guide the user (optional)
 */
const badge = defineModel('badge')
</script>

<style>
.form-check .form-check-input[type='checkbox'] {
  width: 50px;
  height: 25px;
}
</style>
