<template>
  <div class="container">
    <div class="row">
      <div class="col-md-5">
        <p></p>
        <p class="h3">Batch List</p>
      </div>
      <div class="col-md-4">
        <BsSelect v-model="global.batchListFilterDevice" :options="deviceList" help="" :disabled="global.disabled">
        </BsSelect>
      </div>
      <div class="col-md-1">
        <BsInputSwitch v-model="global.batchListFilterActive" help="" :disabled="global.disabled"></BsInputSwitch>
      </div>
    </div>

    <hr>
    <table class="table table-striped">
      <thead>
        <tr>
          <th scope="col-sm-1">ID</th>
          <th scope="col-sm-2">Name</th>
          <th scope="col-sm-1">Brewdate</th>
          <th scope="col-sm-1">Device</th>
          <th scope="col-sm-1">Active</th>
          <th scope="col-sm-1">Gravity #</th>
          <th scope="col-sm-2">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in batchList" :key="b.id">
          <th scope="row">{{ b.id }}</th>
          <td>{{ b.name }}</td>
          <td>{{ b.brewDate }}</td>
          <td><pre>{{ b.chipId }}</pre></td>
          <td>{{ b.active }}</td>
          <td>{{ b.gravityCount }}</td>
          <td>
            <router-link :to="{ name: 'batch', params: { id: b.id } }">
              <button type="button" class="btn btn-primary btn-sm"><i class="bi bi-pencil-square"></i></button>
            </router-link>&nbsp;
            <button type="button" class="btn btn-danger btn-sm" @click.prevent="deleteBatch(b.id, b.name)"><i
                class="bi bi-file-x"></i></button>&nbsp;
            <template v-if="b.gravityCount>0">
              <router-link :to="{ name: 'batch-gravity', params: { id: b.id } }">
              <button type="button" class="btn btn-success btn-sm"><i class="bi bi-graph-down"></i></button>
            </router-link>&nbsp;

            </template>
            <button @click="exportBatch(b.id)" type="button" class="btn btn-info btn-sm"><i class="bi bi-box-arrow-down"></i></button>&nbsp;

            <!-- 
              <button type="button" class="btn btn-info btn-sm"><i class="bi bi-eye"></i></button>&nbsp;
              <button type="button" class="btn btn-dark btn-sm"><i class="bi bi-boxes"></i></button>&nbsp;
            -->
          </td>
        </tr>
      </tbody>
    </table>

    <div class="row">
      <div class="col-md-12">
        <router-link :to="{ name: 'batch', params: { id: 'new' } }">
          <button type="button" class="btn btn-secondary">Add Batch</button>
        </router-link>&nbsp;
        <button @click="synchronizeBrewfather()" type="button" class="btn btn-secondary">Fetch from Brewfather</button>&nbsp;
        <button @click="updateBatchList()" type="button" class="btn btn-secondary">Refresh</button>&nbsp;
      </div>
    </div>

    <BsModalConfirm :callback="confirmDeleteCallback" :message="confirmDeleteMessage" id="deleteBatch"
      title="Delete batch" :disabled="global.disabled" />

  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { global, batchStore, deviceStore } from "@/modules/pinia"
import { storeToRefs } from 'pinia'
import { router } from '@/modules/router'
import { download } from '@/modules/utils'
import { logDebug, logError, logInfo } from '@/modules/logger'

const confirmDeleteMessage = ref(null)
const confirmDeleteId = ref(null)

const batchList = ref(null);
const deviceList = ref([])
const { batchListFilterDevice, batchListFilterActive } = storeToRefs(global)

onMounted(() => {
  logDebug("BatchListView.onMounted()")

  var query = router.currentRoute.value.query

  if(query.hasOwnProperty("chipId")) {
    logDebug("BatchListView.onMounted()", "Filter by chipId", query.chipId)
    global.batchListFilterDevice = query.chipId
  }

  filterBatchList()

  deviceList.value.push({ label: 'All', value: '*' })
  deviceStore.deviceList.forEach(d => {
    deviceList.value.push({ label: d.chipId + ' (' + d.mdns + ')', value: d.chipId })
  })
})

function filterBatchList() {
  logDebug("BatchListView.filterBatchList()", global.batchListFilterDevice, global.batchListFilterActive)

  batchList.value = []
  batchStore.batchList.forEach(b => {

    if(global.batchListFilterDevice == '*' && global.batchListFilterActive == false) {
      batchList.value.push(b)
    } else if(global.batchListFilterDevice == '*' && global.batchListFilterActive == true) {
      if(b.active == true)
        batchList.value.push(b)
    } else if(global.batchListFilterDevice != '*' && global.batchListFilterActive == false) {
      if(b.chipId == global.batchListFilterDevice)
        batchList.value.push(b)
    } else if(global.batchListFilterDevice != '*' && global.batchListFilterActive == true) {
      if(b.chipId == global.batchListFilterDevice && b.active == true)
        batchList.value.push(b)
    }
  })
}

watch(batchListFilterDevice, async (selected, previous) => {
  logDebug("BatchListView.watch(filterDevice)", selected)
  filterBatchList()
})

watch(batchListFilterActive, async (selected, previous) => {
  logDebug("BatchListView.watch(filterActive)", selected)
  filterBatchList()
})

function updateBatchList() {
  logDebug("BatchListView.updateBatchList()")

  global.batchListFilterDevice = "*"
  global.batchListFilterActive = false

  batchStore.getBatchList((success, bl) => {
    if (success) {
      batchList.value = bl
    } else {
      global.messageError = "Failed to load batch list"
    }
  })
}

function synchronizeBrewfather() {
  logDebug("BatchListView.synchronizeBrewfather()")

  fetch(global.baseURL + 'api/batch/brewfather/', {
    method: "GET",
    headers: { "Authorization": global.token },
    signal: AbortSignal.timeout(global.fetchTimout),
  })
    .then(res => {
      logDebug("BatchListView.synchronizeBrewfather()", res.status)
      if (!res.ok) throw res
      return res.json()
    })
    .then(json => {
      logDebug("BatchListView.synchronizeBrewfather()", json)
    })
    .catch(err => {
      logError("BatchListView.synchronizeBrewfather()", err)
    })
}

const confirmDeleteCallback = (result) => {
  logDebug("BatchListView.confirmDeleteCallback()", result)

  if (result) {
    global.disabled = true
    global.clearMessages()

    batchStore.deleteBatch(confirmDeleteId.value, (success) => {
      if (success)
        global.messageSuccess = "Deleted batch"
      else
        global.messageError = "Failed to batch device"

      updateBatchList()
      global.disabled = false
    })
  }
}

const deleteBatch = (id, name) => {
  logDebug("BatchListView.deleteBatch()", id, name)

  confirmDeleteMessage.value = "Do you really want to delete batch ''" + name + "''"
  confirmDeleteId.value = id
  document.getElementById('deleteBatch').click()
}

function exportBatch(id) {
  logDebug("BatchListView.exportBatch()", id)

  getBatch(id, (success, b) => {
    if (success) {
      logDebug("BatchListView.exportBatch()", "Collected batch")
      var s = JSON.stringify(b, null, 2)
      download(s, "text/plain", "brewlogger_batch_" + id + ".txt")
    } else {
      global.messageError = "Failed to fetch batch with id " + id
      global.disabled = false
    }
  })
}

function getBatch(id, callback) {
  fetch(global.baseURL + 'api/batch/' + id, {
    method: "GET",
    headers: { "Authorization": global.token },
    signal: AbortSignal.timeout(global.fetchTimout),
  })
    .then(res => {
      logDebug("BatchListView.getBatch()", res.status)
      if (!res.ok) throw res
      return res.json()
    })
    .then(json => {
      callback(true, json)
    })
    .catch(err => {
      logError("BatchListView.getBatch()", err)
      callback(false, {})
    })
}
</script>