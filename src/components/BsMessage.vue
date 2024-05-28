<template>
  <div :class="classNames()" role="alert">
    <BsIcon v-if="alert === 'danger'" icon="bi-x-circle" height="20" width="20"></BsIcon>
    <BsIcon v-if="alert === 'warning'" icon="bi-exclamation-triangle" height="20" width="20"></BsIcon>
    <BsIcon v-if="alert === 'info'" icon="bi-info-circle" height="20" width="20"></BsIcon>
    <BsIcon v-if="alert === 'success'" icon="bi-check-circle" height="20" width="20"></BsIcon> &nbsp;{{ message }}
    <!-- @slot mesage can be provided using a slot or message attribute -->
    <slot />
    <button v-if="dismissable && close!==undefined" @click="close(alert)" type="button" class="btn-close" aria-label="Close"></button>
    <button v-if="dismissable && close===undefined" type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>
</template>

<script setup>
/**
 * 2024-05-28 Bootstrap VueJS wrapper, Magnus Persson
 */

/**
 * Purpose: Show a alert with a message
 */
defineOptions({
  inheritAttrs: false
})
/**
 * Text message to show in alert (required).
 */
const message = defineModel('message')
/**
 * If set to 'true' then the message can be closed by the user (optional).
 */
const dismissable = defineModel('dismissable')
/**
 * The type of the alert (Danger|Success|Warning|Info) (required).
 */
const alert = defineModel('alert')
/**
 * Function to call when close button is used (optional).
 */
const close = defineModel('close')

function classNames() {
  const cn = dismissable.value ? "alert alert-" + alert.value + " align-items-center alert-dismissible fade show" : "alert alert-" + alert.value + " align-items-center"
  return cn
}
</script>
