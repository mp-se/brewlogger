<template>
  <div class="container">
    <p></p>
    <p class="h3">Tap Pour List - '{{ batchName }}'</p>
    <hr />

    <table class="table table-striped">
      <thead>
        <tr>
          <th scope="col" class="col-sm-2">Date</th>
          <th scope="col" class="col-sm-2">Pour ({{ config.isVolumeMetric ? 'cl' : 'fl. oz.' }})</th>
          <th scope="col" class="col-sm-2">Volume ({{ config.isVolumeMetric ? 'Liters' : 'Gallon' }})</th>
          <th scope="col" class="col-sm-2">Max Volume ({{ config.isVolumeMetric ? 'Liters' : 'Gallon' }})</th>
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
import { volumeLtoUSGallon, volumeLtoUKGallon, volumeCLtoUSOZ, volumeCLtoUKOZ } from '@/modules/utils' 

const pourList = ref(null)
const forceRender = ref(0)
const batchName = ref('')

function convertCL(v) {
  v = v / 100 // Convert to CL
  return Number(config.isVolumeMetric ? v : (config.isVolumeUk ? volumeCLtoUKOZ(v) : volumeCLtoUSOZ(v) )).toFixed(0)
}

function convertL(v) {
  return Number(config.isVolumeMetric ? v : (config.isVolumeUk ? volumeLtoUKGallon(v) : volumeLtoUSGallon(v) )).toFixed(2)
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
