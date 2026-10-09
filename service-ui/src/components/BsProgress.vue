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
