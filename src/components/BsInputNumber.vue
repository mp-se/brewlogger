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
      <div class="input-group">
        <input
          v-model="model"
          :id="inputId"
          class="form-control"
          :class="{ 'is-invalid': isInvalid }"
          type="number"
          v-bind="$attrs"
          data-bs-toggle="tooltip"
          data-bs-custom-class="custom-tooltip"
          :data-bs-title="help"
          :disabled="disabled"
        />
        <span v-if="unit !== undefined" class="input-group-text">{{ unit }}</span>
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
 * Purpose: Provide an inputfield for numbers
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
 * Unit is displayed to the right of the input field to provide guidance (optional).
 */
const unit = defineModel('unit')
/**
 * Ref that steers if this component is enabled or not (required).
 */
const disabled = defineModel('disabled')
/**
 * Specify if an badge should be shown to guide the user (optional).
 */
const badge = defineModel('badge')
</script>
