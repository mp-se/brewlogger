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
          <th scope="col" class="col-sm-3">
            <div :class="sortedClass('name')">
              Name&nbsp;
              <a class="icon-link icon-link-hover" @click="sortList(batchList, 'name', 'str')">
                <i :class="sortedIconClass"></i>
              </a>
            </div>
          </th>
          <th scope="col" class="col-sm-3">
            <div :class="sortedClass('style')">
              Style‹&nbsp;
              <a class="icon-link icon-link-hover" @click="sortList(batchList, 'style', 'str')">
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
import { onMounted, ref, watch } from 'vue'
import { global, batchStore } from '@/modules/pinia'
import { storeToRefs } from 'pinia'
import { logDebug } from '@/modules/logger'
import {
  sortedIconClass,
  setSortingDefault,
  sortedClass,
  sortList,
  applySortList
} from '@/modules/ui'

const batchList = ref(null)

const { updatedBatchData } = storeToRefs(global)

watch(updatedBatchData, () => {
  updateBatchList()
})

onMounted(() => {
  logDebug('TapListView.onMounted()')
  setSortingDefault('brewDate', 'date', false)
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

  applySortList(batchList.value)
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
