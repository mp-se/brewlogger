// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

<template>
  <div class="col-md-12" v-if="readings.length > 0">
    <BsCard :header="title" color="info" title="">
      <table class="table table-sm table-striped">
        <colgroup>
          <col style="width: 25%" />
          <col style="width: 15%" />
          <col style="width: 15%" />
          <col style="width: 15%" />
          <col style="width: 15%" />
          <col style="width: 15%" />
        </colgroup>
        <thead>
          <tr>
            <th>Batch</th>
            <slot name="headers"></slot>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(reading, index) in readings" :key="index">
            <td>{{ truncateString(reading.batchName, 30) }}</td>
            <slot name="row" :reading="reading"></slot>
            <td>{{ getTimeSincePosted(reading.created) }}</td>
          </tr>
        </tbody>
      </table>
    </BsCard>
  </div>
</template>

<script setup>
import BsCard from '@/components/BsCard.vue'
import { truncateString, getTimeSincePosted } from '@/modules/utils'

defineProps({
  title: {
    type: String,
    required: true
  },
  readings: {
    type: Array,
    required: true,
    default: () => []
  }
})
</script>
