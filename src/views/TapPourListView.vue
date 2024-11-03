<template>
  <div class="container">
    <p></p>
    <p class="h3">Tap Pour List - '{{ batchName }}'</p>
    <hr />

    <table class="table table-striped">
      <thead>
        <tr>
          <th scope="col" class="col-sm-2">
            <div :class="sortedClass('created')">
              Date&nbsp;
            <a class="icon-link icon-link-hover" @click="sortPourList('created', 'date')">
              <i :class="sortedIconClass"></i>
            </a>
            </div>
          </th>
          <th scope="col" class="col-sm-2">
            <div :class="sortedClass('pour')">
              Pour ({{ config.isVolumeMetric ? 'cl' : 'fl. oz.' }})&nbsp;
            <a class="icon-link icon-link-hover" @click="sortPourList('pour', 'num')">
              <i :class="sortedIconClass"></i>
            </a>
            </div>
          </th>
          <th scope="col" class="col-sm-2">
            <div :class="sortedClass('volume')">
              Volume ({{ config.isVolumeMetric ? 'Liters' : 'Gallon' }})&nbsp;
            <a class="icon-link icon-link-hover" @click="sortPourList('volume', 'num')">
              <i :class="sortedIconClass"></i>
            </a>
            </div>
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
import { onMounted, ref, computed } from 'vue'
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

const sorting = ref({ column: 'created', type: 'date', order: true })

function sortedClass(column) {
  logDebug('TapPourListView.sortedClass()', column)
  if (column == sorting.value.column) return 'text-primary'
  return ''
}

const sortedIconClass = computed(() => {
  return 'bi ' + (sorting.value.order ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up')
})

function sortPourList(column, type) {
  // Type: str, num, date
  logDebug('PourListView.sortPourList()', column, type)

  sorting.value.column = column
  sorting.value.type = type
  sorting.value.order = !sorting.value.order
  applySortPourList()
}

function applySortPourList() {
  logDebug('LogListView.applySortPourList()')

  if (sorting.value.order) {
    if (sorting.value.type == 'str')
    pourList.value.sort((a, b) => a[sorting.value.column].localeCompare(b[sorting.value.column]))
    else if (sorting.value.type == 'date')
    pourList.value.sort(
        (a, b) => Date.parse(a[sorting.value.column]) - Date.parse(b[sorting.value.column])
      )
    else pourList.value.sort((a, b) => a[sorting.value.column] - b[sorting.value.column])
  } else {
    if (sorting.value.type == 'str')
    pourList.value.sort((a, b) => b[sorting.value.column].localeCompare(a[sorting.value.column]))
    else if (sorting.value.type == 'date')
    pourList.value.sort(
        (a, b) => Date.parse(b[sorting.value.column]) - Date.parse(a[sorting.value.column])
      )
    else pourList.value.sort((a, b) => b[sorting.value.column] - a[sorting.value.column])
  }
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
