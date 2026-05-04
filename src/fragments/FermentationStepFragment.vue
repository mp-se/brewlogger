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
  <div>
    <table class="table table-striped" v-if="localSteps.length > 0">
      <thead>
        <tr>
          <th scope="col" class="col-1">Step</th>
          <th scope="col" class="col-2">Type</th>
          <th scope="col" class="col-1">Temp</th>
          <th scope="col" class="col-1">Days</th>
          <th scope="col" class="col-1"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(step, index) in localSteps" :key="index">
          <td class="align-middle">{{ step.order + 1 }}</td>
          <td><input v-model="step.type" class="form-control form-control-sm" type="text" placeholder="e.g., Primary" />
          </td>
          <td>
            <div class="input-group input-group-sm">
              <input v-model="step.temp" class="form-control form-control-sm" type="number" step="0.1" min="0"
                max="99" />
              <span class="input-group-text">°{{ props.tempUnit }}</span>
            </div>
          </td>
          <td><input v-model="step.days" class="form-control form-control-sm" type="number" step="1" min="1"
              max="365" /></td>
          <td class="align-middle">
            <button type="button" class="btn btn-danger btn-sm" @click="deleteStep(index)" title="Delete step">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="alert alert-info">
      No fermentation steps defined yet.
    </div>

    <button type="button" class="btn btn-secondary w-2" @click="addStep">
      <i class="bi bi-plus"></i>
      Add Step
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  tempUnit: { type: String, default: 'C' }
})

const fermentationSteps = defineModel('fermentationSteps', {
  type: Array,
  default: () => []
})

const localSteps = ref([])
let syncing = false

// Convert incoming step (class instance or plain object) to a reactive plain object
const toPlain = (step) => ({
  order: step.order ?? 0,
  type: step.type ?? '',
  date: step.date ?? '',
  temp: step.temp ?? 0,
  days: step.days ?? 1
})

watch(
  fermentationSteps,
  (steps) => {
    if (syncing) return
    localSteps.value = Array.isArray(steps) && steps.length > 0 ? steps.map(toPlain) : []
  },
  { immediate: true }
)

const syncToModel = () => {
  syncing = true
  fermentationSteps.value = localSteps.value.map((s) => ({ ...s }))
  syncing = false
}

const addStep = () => {
  localSteps.value.push({
    order: localSteps.value.length,
    type: '',
    date: '',
    temp: 0,
    days: 1
  })
  syncToModel()
}

const deleteStep = (index) => {
  localSteps.value.splice(index, 1)
  localSteps.value.forEach((step, idx) => {
    step.order = idx
  })
  syncToModel()
}
</script>
