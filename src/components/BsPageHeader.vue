<template>
  <div class="row align-items-center">
    <div :class="titleColClass">
      <p v-if="compact" class="h5 mb-0">{{ title }}</p>
      <p v-else class="h3">{{ title }}</p>
    </div>
    <div v-if="$slots.default" :class="contentColClass">
      <slot></slot>
    </div>
  </div>
  <hr />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const titleColClass = computed(() => {
  return props.compact ? 'col-md-4' : 'col-md-6'
})

const contentColClass = computed(() => {
  return props.compact ? 'col-md-8' : 'col-md-6'
})
</script>
