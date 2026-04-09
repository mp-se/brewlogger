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
