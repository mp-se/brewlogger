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
              <a class="icon-link icon-link-hover" @click="sortBatchList('brewDate', 'date')">
                <i :class="sortedIconClass"></i>
              </a>
            </div>
          </th>
          <th scope="col" class="col-sm-3">
            <div :class="sortedClass('name')">
              Name&nbsp;
              <a class="icon-link icon-link-hover" @click="sortBatchList('name', 'str')">
                <i :class="sortedIconClass"></i>
              </a>
            </div>
          </th>
          <th scope="col" class="col-sm-3">
            <div :class="sortedClass('style')">
              Style‹&nbsp;
              <a class="icon-link icon-link-hover" @click="sortBatchList('style', 'str')">
                <i :class="sortedIconClass"></i>
              </a>
            </div>
          </th>
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
            <template v-if="b.pourCount > 0">
              <router-link :to="{ name: 'tap-pour-list', params: { id: b.id } }">
                <button type="button" class="btn btn-success btn-sm">
                  <i class="bi bi-list"></i>
                </button> </router-link
              >&nbsp;
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
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { global, batchStore } from '@/modules/pinia'
import { storeToRefs } from 'pinia'
import { logDebug } from '@/modules/logger'

const batchList = ref(null)

const { updatedBatchData } = storeToRefs(global)

const sorting = ref({ column: 'brewDate', type: 'date', order: false })

function sortedClass(column) {
  logDebug('BatchListView.sortedClass()', column)
  if (column == sorting.value.column) return 'text-primary'
  return ''
}

const sortedIconClass = computed(() => {
  return 'bi ' + (sorting.value.order ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up')
})

function sortBatchList(column, type) {
  // Type: str, num, date
  logDebug('TapListView.sortBatchList()', column, type)

  sorting.value.column = column
  sorting.value.type = type
  sorting.value.order = !sorting.value.order
  applySortBatchList()
}

function applySortBatchList() {
  logDebug('TapListView.applySortBatchList()')

  if (sorting.value.order) {
    if (sorting.value.type == 'str')
      batchList.value.sort((a, b) => a[sorting.value.column].localeCompare(b[sorting.value.column]))
    else if (sorting.value.type == 'date')
      batchList.value.sort(
        (a, b) => Date.parse(a[sorting.value.column]) - Date.parse(b[sorting.value.column])
      )
    else batchList.value.sort((a, b) => a[sorting.value.column] - b[sorting.value.column])
  } else {
    if (sorting.value.type == 'str')
      batchList.value.sort((a, b) => b[sorting.value.column].localeCompare(a[sorting.value.column]))
    else if (sorting.value.type == 'date')
      batchList.value.sort(
        (a, b) => Date.parse(b[sorting.value.column]) - Date.parse(a[sorting.value.column])
      )
    else batchList.value.sort((a, b) => b[sorting.value.column] - a[sorting.value.column])
  }
}

watch(updatedBatchData, () => {
  updateBatchList()
})

onMounted(() => {
  logDebug('TapListView.onMounted()')
  updateBatchList()
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

  applySortBatchList()
}

function updateBatchList() {
  logDebug('TapListView.updateBatchList()')

  batchStore.getBatchList((success) => {
    if (success) {
      filterBatchList()
    } else {
      global.messageError = 'Failed to load batch list'
    }
  })
}
</script>
