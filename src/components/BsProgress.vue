<template>
  <div
    class="progress"
    role="progressbar"
    aria-label="testing"
    :aria-valuenow="progress"
    aria-valuemin="0"
    aria-valuemax="100"
    v-bind="$attrs"
  >
    <div class="progress-bar" :style="progressStyle">{{ Number(progress).toFixed(0) }}%</div>
  </div>
</template>

<script setup>
/**
 * 2024-05-28 Bootstrap VueJS wrapper, Magnus Persson
 * 2024-10-23 Updated with value for BrewLogger
 */

import { computed } from 'vue'
/**
 * Purpose: Show a progress bar
 */

/**
 * Ref that contains the value of the progress bar (0-100) (required).
 */
const progress = defineModel('progress')

const progressStyle = computed(() => {
  return 'width: ' + progress.value + '%'
})
</script>
