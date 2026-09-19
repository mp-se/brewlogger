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
