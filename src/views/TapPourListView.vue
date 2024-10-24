<template>
  <div class="container">
    <p></p>
    <p class="h3">Tap Pour List - '{{ batchName }}'</p>
    <hr />

    <table class="table table-striped">
      <thead>
        <tr>
          <th scope="col" class="col-sm-2">Date</th>
          <th scope="col" class="col-sm-2">Pour</th>
          <th scope="col" class="col-sm-2">Volume</th>
          <th scope="col" class="col-sm-2">Max Volume</th>
        </tr>
      </thead>

      <tbody :key="forceRender">
        <tr v-for="p in pourList" :key="p.id">
          <td class="fs-5">{{ p.created.substring(0, 10) }} {{ p.created.substring(11, 19) }}</td>
          <td class="fs-5">{{ new Number(p.pour).toFixed(3) }}</td>
          <td class="fs-5">{{ new Number(p.volume).toFixed(3) }}</td>
          <td class="fs-5">{{ new Number(p.maxVolume).toFixed(3) }}</td>
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
import { pourStore, batchStore } from '@/modules/pinia'
import router from '@/modules/router'
import { logDebug, logError } from '@/modules/logger'

// TODO: Show data in selected volume unit

const pourList = ref(null)
const forceRender = ref(0)
const batchName = ref('')

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
