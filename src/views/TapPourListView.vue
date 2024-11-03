<template>
  <div class="container">
    <p></p>
    <p class="h3">Tap Pour List - '{{ batchName }}'</p>
    <hr />

    <table class="table table-striped">
      <thead>
        <tr>
          <th scope="col" class="col-sm-2">
            Date&nbsp;
            <a class="icon-link icon-link-hover" @click="sortPourList('created', 'date')">
              <i class="bi bi-sort-alpha-down"></i>
            </a>
          </th>
          <th scope="col" class="col-sm-2">
            Pour ({{ config.isVolumeMetric ? 'cl' : 'fl. oz.' }})&nbsp;
            <a class="icon-link icon-link-hover" @click="sortPourList('pour', 'num')">
              <i class="bi bi-sort-alpha-down"></i>
            </a>
          </th>
          <th scope="col" class="col-sm-2">
            Volume ({{ config.isVolumeMetric ? 'Liters' : 'Gallon' }})&nbsp;
            <a class="icon-link icon-link-hover" @click="sortPourList('volume', 'num')">
              <i class="bi bi-sort-alpha-down"></i>
            </a>
          </th>
          <th scope="col" class="col-sm-2">
            Max Volume ({{ config.isVolumeMetric ? 'Liters' : 'Gallon' }})
          </th>
        </tr>
      </thead>

      <tbody :key="forceRender">
        <tr v-for="p in pourList" :key="p.id">
          <td class="fs-5">{{ p.created.substring(0, 10) }} {{ p.created.substring(11, 19) }}</td>
          <td class="fs-5">{{ convertCL(p.pour) }}</td>
          <td class="fs-5">{{ convertL(p.volume) }}</td>
          <td class="fs-5">{{ convertL(p.maxVolume) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="col-md-12"></div>

    <router-link :to="{ name: 'tap-list' }">
      <button type="button" class="btn btn-secondary w-2">
        <i class="bi bi-list"></i>
        Tap list
      </button> </router-link
    >&nbsp;
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { pourStore, batchStore, config } from '@/modules/pinia'
import router from '@/modules/router'
import { logDebug, logError } from '@/modules/logger'
import {
  volumeLtoUSGallon,
  volumeLtoUKGallon,
  volumeCLtoUSOZ,
  volumeCLtoUKOZ
} from '@/modules/utils'

const pourList = ref(null)
const forceRender = ref(0)
const batchName = ref('')

const sortDirection = ref(true)

function sortPourList(column, type) {
  // Type: str, num, date
  logDebug('TapPourListView.sortBatches()', column, sortDirection.value)

  if (sortDirection.value) {
    if (type == 'str') pourList.value.sort((a, b) => a[column].localeCompare(b[column]))
    else if (type == 'date')
      pourList.value.sort((a, b) => Date.parse(a[column]) - Date.parse(b[column]))
    else pourList.value.sort((a, b) => a[column] - b[column])
  } else {
    if (type == 'str') pourList.value.sort((a, b) => b[column].localeCompare(a[column]))
    else if (type == 'date')
      pourList.value.sort((a, b) => Date.parse(b[column]) - Date.parse(a[column]))
    else pourList.value.sort((a, b) => b[column] - a[column])
  }

  sortDirection.value = !sortDirection.value
}

function convertCL(v) {
  v = v / 100 // Convert to CL
  return Number(
    config.isVolumeMetric ? v : config.isVolumeUk ? volumeCLtoUKOZ(v) : volumeCLtoUSOZ(v)
  ).toFixed(0)
}

function convertL(v) {
  return Number(
    config.isVolumeMetric ? v : config.isVolumeUk ? volumeLtoUKGallon(v) : volumeLtoUSGallon(v)
  ).toFixed(2)
}

onMounted(() => {
  logDebug('TapPourListView.onMounted()')

  pourList.value = null

  batchStore.getBatch(router.currentRoute.value.params.id, (success, b) => {
    if (success) batchName.value = b.name
  })

  pourStore.getPourListForBatch(router.currentRoute.value.params.id, (success, pl) => {
    if (success) {
      pourList.value = pl
      logDebug('TapPourListView.onMounted()', pourList.value)
    } else {
      logError(
        'TapPourListView.onMounted()',
        'Failed to load pour',
        router.currentRoute.value.params.id
      )
    }
  })
})
</script>
