<template>
  <div class="container">
    <div class="row">
      <div class="col-md-12">
        <p></p>
        <p class="h3">Tap List</p>
      </div>
    </div>

    <hr />
    <table class="table table-striped">
      <thead>
        <tr>
          <th scope="col" class="col-sm-2">Brewdate</th>
          <th scope="col" class="col-sm-2">Name</th>
          <th scope="col" class="col-sm-3">Style</th>
          <th scope="col" class="col-sm-3">Volume</th>
          <th scope="col" class="col-sm-1"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in batchList" :key="b.id">
          <td class="fs-5">{{ b.brewDate }}</td>
          <td class="fs-5">{{ b.name }}</td>
          <td class="fs-5">{{ b.style }}</td>
          <td class="fs-5">
            <BsProgress :progress="calculateProgress(b)" style="height: 26px"></BsProgress>
          </td>
          <td>
            <router-link :to="{ name: 'batch', params: { id: b.id } }">
              <button type="button" class="btn btn-primary btn-sm">
                <i class="bi bi-pencil-square"></i>
              </button> </router-link
            >&nbsp;
            <router-link :to="{ name: 'tap-pour-list', params: { id: b.id } }">
              <button type="button" class="btn btn-success btn-sm">
                <i class="bi bi-list"></i>
              </button> </router-link
            >&nbsp;
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { global, batchStore } from '@/modules/pinia'
import { storeToRefs } from 'pinia'
import { logDebug } from '@/modules/logger'

const batchList = ref(null)

const { updatedBatchData } = storeToRefs(global)

watch(updatedBatchData, () => {
  updateBatchList()
})

onMounted(() => {
  logDebug('TapListView.onMounted()')
  updateBatchList()
  filterBatchList()
})

function calculateProgress(b) {
  if (b.lastPourMaxVolume === undefined || b.lastPourVolume === undefined) return 0

  return Number((b.lastPourVolume / b.lastPourMaxVolume) * 100).toFixed(0)
}

function filterBatchList() {
  logDebug('TapListView.filterBatchList()')

  batchList.value = []
  batchStore.batchList.forEach((b) => {
    if (b.tapList) batchList.value.push(b)
  })
}

function updateBatchList() {
  logDebug('TapListView.updateBatchList()')

  batchStore.getBatchList((success, bl) => {
    if (success) {
      batchList.value = bl
      filterBatchList()
    } else {
      global.messageError = 'Failed to load batch list'
    }
  })
}
</script>
