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
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in batchList" :key="b.id">
          <td class="fs-5">{{ b.brewDate }}</td>
          <td class="fs-5">{{ b.name }}</td>
          <td class="fs-5">{{ b.style }}</td>
          <td class="fs-5"> <!-- <BsProgress progress="50" style="height: 26px"></BsProgress> TODO: Add way to get volume used --></td>
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

function filterBatchList() {
  logDebug('TapListView.filterBatchList()')

  batchList.value = []
  batchStore.batchList.forEach((b) => {
    if (b.tapList)
      batchList.value.push(b)
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
