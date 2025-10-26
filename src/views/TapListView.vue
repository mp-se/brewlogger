<template>
  <div class="container">
    <div class="row">
      <div class="col-md-12">
        <p></p>
        <p class="h3">Tap List</p>
      </div>
    </div>

    <hr />
    <table class="table table-striped" v-if="batchList != null">
      <thead>
        <tr>
          <th scope="col" class="col-sm-2">
            <div :class="sortedClass('brewDate')">
              Brewdate&nbsp;
              <a class="icon-link icon-link-hover" @click="sortList(batchList, 'brewDate', 'date')">
                <i :class="sortedIconClass"></i>
              </a>
            </div>
          </th>
          <th scope="col" class="col-sm-4">
            <div :class="sortedClass('name')">
              Name&nbsp;
              <a class="icon-link icon-link-hover" @click="sortList(batchList, 'name', 'str')">
                <i :class="sortedIconClass"></i>
              </a>
            </div>
          </th>
          <!-- 
          <th scope="col" class="col-sm-3">
            <div :class="sortedClass('style')">
              Style‹&nbsp;
              <a class="icon-link icon-link-hover" @click="sortList(batchList, 'style', 'str')">
                <i :class="sortedIconClass"></i>
              </a>
            </div>
          </th>
          -->
          <th scope="col" class="col-sm-4">Volume</th>
          <th scope="col" class="col-sm-2"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in batchList" :key="b.id">
          <td class="fs-5">{{ b.brewDate }}</td>
          <td class="fs-5">{{ b.name }}</td>
          <!-- 
          <td class="fs-5">{{ b.style }}</td>
          -->
          <td class="fs-5">
            <BsProgress :progress="calculateProgress(b)" style="height: 26px"></BsProgress>
          </td>
          <td>
            <router-link :to="{ name: 'batch', params: { id: b.id } }">
              <button
                type="button"
                class="btn btn-primary btn-sm"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Edit batch"
                aria-label="Edit batch"
              >
                <i class="bi bi-pencil-square"></i>
              </button> </router-link
            >&nbsp;
            <template v-if="b.pourCount > 0">
              <router-link :to="{ name: 'tap-pour-list', params: { id: b.id } }">
                <button
                  type="button"
                  class="btn btn-success btn-sm"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Show pour data"
                  aria-label="Show pour data"
                >
                  <i class="bi bi-list"></i>
                </button> </router-link
              >&nbsp;
            </template>
            <template v-if="calculateProgress(b) > 0">
              <button
                type="button"
                class="btn btn-success btn-sm"
                @click.prevent="emptyBatch(b.id)"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Clear pour data for batch"
                aria-label="Clear pour data for batch"
              >
                <i class="bi bi-chevron-bar-down"></i>
              </button>
              &nbsp;
            </template>
          </td>
        </tr>
      </tbody>
    </table>
    <template v-else>
      <div class="row gy-2">
        <div class="col-md-12">
          <p class="h4">Loading...</p>
        </div>
      </div>
    </template>

    <BsModalConfirm
      :callback="confirmEmptyCallback"
      message="Do you want to mark this batch as empty?"
      id="emptyBatch"
      title="Empty batch"
      :disabled="global.disabled"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { global, batchStore, pourStore } from '@/modules/pinia'
import { storeToRefs } from 'pinia'
import { logDebug } from '@/modules/logger'
import {
  sortedIconClass,
  setSortingDefault,
  sortedClass,
  sortList,
  applySortList
} from '@/modules/ui'
import { Pour } from '@/modules/pourStore'

const batchList = ref(null)

const { updatedBatchData } = storeToRefs(global)

const confirmEmptyId = ref(null)

watch(updatedBatchData, () => {
  filterBatchList()
  applySortList(batchList.value)
})

onMounted(() => {
  logDebug('TapListView.onMounted()')
  setSortingDefault('brewDate', 'date', false)
  filterBatchList()
  applySortList(batchList.value)
})

function calculateProgress(b) {
  logDebug('TapListView.calculateProgress()', b.name, b.lastPourMaxVolume, b.lastPourVolume)
  if (
    b.lastPourMaxVolume === undefined ||
    b.lastPourMaxVolume == 0 ||
    b.lastPourVolume === undefined
  )
    return 0
  return Number((b.lastPourVolume / b.lastPourMaxVolume) * 100).toFixed(0)
}

function filterBatchList() {
  logDebug('TapListView.filterBatchList()')

  batchList.value = []
  batchStore.batchList.forEach((b) => {
    if (b.tapList) batchList.value.push(b)
  })
}

const confirmEmptyCallback = async (result) => {
  logDebug('TapListView.confirmEmptyCallback()', result)

  if (result) {
    global.clearMessages()

    const pour = new Pour(0, 0, 0, 0, new Date().toISOString(), confirmEmptyId.value, true)

    const success = await pourStore.addPour(pour)
    if (success) global.messageSuccess = 'Marked batch as empty'
    else global.messageError = 'Failed to update pour data'
  }
}

const emptyBatch = (id) => {
  logDebug('TapListView.emptyBatch()', id)
  confirmEmptyId.value = id
  document.getElementById('emptyBatch').click()
}
</script>
