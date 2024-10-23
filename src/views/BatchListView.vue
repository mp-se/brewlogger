<template>
  <div class="container">
    <div class="row">
      <div class="col-md-6">
        <p></p>
        <p class="h3">Batch List</p>
      </div>
      <div class="col-md-4">
        <BsSelect
          v-model="global.batchListFilterDevice"
          :options="deviceList"
          label="Device filter"
          help=""
          :disabled="global.disabled"
        >
        </BsSelect>
      </div>
      <div class="col-md-1">
        <BsInputSwitch
          v-model="global.batchListFilterActive"
          label="Active"
          help=""
          :disabled="global.disabled"
        >
        </BsInputSwitch>
      </div>
      <div class="col-md-1">
        <BsInputSwitch
          v-model="global.batchListFilterData"
          label="Data"
          help=""
          :disabled="global.disabled"
        >
        </BsInputSwitch>
      </div>
    </div>

    <hr />
    <table class="table table-striped">
      <thead>
        <tr>
          <th scope="col" class="col-sm-2">Name</th>
          <th scope="col" class="col-sm-2">Brewdate</th>
          <th scope="col" class="col-sm-1">Active</th>
          <th scope="col" class="col-sm-1">TapList</th>
          <th scope="col" class="col-sm-2"># Grav / Press / Pour</th>
          <th scope="col" class="col-sm-3">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in batchList" :key="b.id">
          <td class="fs-5">{{ b.name }}</td>
          <td class="fs-5">{{ b.brewDate }}</td>
          <td><div class="form-check"><input class="form-check-input" v-model="b.active" type="checkbox" @click="toggleBatchActive(b.id)" /></div></td>
          <td><div class="form-check"><input class="form-check-input" v-model="b.tapList" type="checkbox" @click="toggleBatchTapList(b.id)" /></div></td>
          <td class="fs-5">{{ b.gravityCount }} / {{ b.pressureCount }} / {{ b.pourCount }}</td>
          <td>
            <router-link :to="{ name: 'batch', params: { id: b.id } }">
              <button type="button" class="btn btn-primary btn-sm">
                <i class="bi bi-pencil-square"></i>
              </button> </router-link
            >&nbsp;
            <button
              type="button"
              class="btn btn-danger btn-sm"
              @click.prevent="deleteBatch(b.id, b.name)"
            >
              <i class="bi bi-file-x"></i></button
            >&nbsp;
            <template v-if="b.gravityCount > 0">
              <router-link :to="{ name: 'batch-gravity-graph', params: { id: b.id } }">
                <button type="button" class="btn btn-success btn-sm">
                  <i class="bi bi-graph-down"></i>
                </button> </router-link
              >&nbsp;
              <router-link :to="{ name: 'batch-gravity-list', params: { id: b.id } }">
                <button type="button" class="btn btn-success btn-sm">
                  <i class="bi bi-list"></i>
                </button> </router-link
              >&nbsp;
              <button @click="exportBatchJSON(b.id)" type="button" class="btn btn-info btn-sm">
                <i class="bi bi-filetype-json"></i></button
              >&nbsp;
              <button @click="exportBatchCSV(b.id)" type="button" class="btn btn-info btn-sm">
                <i class="bi bi-filetype-csv"></i></button
              >&nbsp;
            </template>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="row">
      <div class="col-md-12">
        <router-link :to="{ name: 'batch', params: { id: 'new' } }">
          <button type="button" class="btn btn-secondary">Add Batch</button> </router-link
        >&nbsp;
      </div>
    </div>

    <BsModalConfirm
      :callback="confirmDeleteCallback"
      :message="confirmDeleteMessage"
      id="deleteBatch"
      title="Delete batch"
      :disabled="global.disabled"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { global, batchStore, deviceStore } from '@/modules/pinia'
import { storeToRefs } from 'pinia'
import router from '@/modules/router'
import { download } from '@/modules/utils'
import { logDebug, logError } from '@/modules/logger'

const confirmDeleteMessage = ref(null)
const confirmDeleteId = ref(null)

const batchList = ref(null)
const deviceList = ref([])
const { batchListFilterDevice, batchListFilterActive, batchListFilterData } = storeToRefs(global)

const { updatedBatchData } = storeToRefs(global)

watch(updatedBatchData, () => {
  updateBatchList()
})

onMounted(() => {
  logDebug('BatchListView.onMounted()')
  updateBatchList()
  var query = router.currentRoute.value.query

  if (Object.prototype.hasOwnProperty.call(query, 'chipId')) {
    logDebug('BatchListView.onMounted()', 'Filter by chipId', query.chipId)
    global.batchListFilterDevice = query.chipId
  }

  filterBatchList()

  deviceList.value.push({ label: 'All', value: '*' })
  deviceStore.deviceList.forEach((d) => {
    deviceList.value.push({ label: d.chipId + ' (' + d.mdns + ')', value: d.chipId })
  })
})

async function toggleBatchTapList(id) {
  logDebug('BatchListView.toggleBatchTapList()', id)

  batchList.value.forEach((b) => {
    if (b.id == id) {
      logDebug('BatchListView.toggleBatchTapList()', 'Found Record', b)

      b.tapList = !b.tapList
      batchStore.updateBatch(b, (success) => {
        if (success) {
          logDebug('BatchListView.toggleBatchTapList()', 'Success')
        } else {
          global.messageError = 'Failed to load batch ' + id
        }
      })
    }
  })
}

async function toggleBatchActive(id) {
  logDebug('BatchListView.toggleBatchActive()', id)

  batchList.value.forEach((b) => {
    if (b.id == id) {
      logDebug('BatchListView.toggleBatchActive()', 'Found Record', b)

      b.active = !b.active
      batchStore.updateBatch(b, (success) => {
        if (success) {
          logDebug('BatchListView.toggleBatchActive()', 'Success')
        } else {
          global.messageError = 'Failed to load batch ' + id
        }
      })
    }
  })
}

function filterBatchList() {
  logDebug(
    'BatchListView.filterBatchList()',
    global.batchListFilterDevice,
    global.batchListFilterActive,
    global.batchListFilterData
  )

  batchList.value = []
  batchStore.batchList.forEach((b) => {
    var include = true

    if (global.batchListFilterDevice != '*' && global.batchListFilterDevice != b.chipId) {
      logDebug('BatchListView.filterBatchList()', 'exclude device: ', b.id, b.chipId)
      include = false
    }

    if (global.batchListFilterActive) {
      if (!b.active) {
        logDebug('BatchListView.filterBatchList()', 'exclude active: ', b.id, b.active)
        include = false
      }
    }

    if (global.batchListFilterData) {
      if (!b.gravityCount) {
        logDebug('BatchListView.filterBatchList()', 'exclude data: ', b.id, b.gravityCount)
        include = false
      }
    }

    if (include) batchList.value.push(b)
  })
}

watch(batchListFilterDevice, async (selected) => {
  logDebug('BatchListView.watch(filterDevice)', selected)
  filterBatchList()
})

watch(batchListFilterActive, async (selected) => {
  logDebug('BatchListView.watch(filterActive)', selected)
  filterBatchList()
})

watch(batchListFilterData, async (selected) => {
  logDebug('BatchListView.watch(filterData)', selected)
  filterBatchList()
})

function updateBatchList() {
  logDebug('BatchListView.updateBatchList()')

  batchStore.getBatchList((success, bl) => {
    if (success) {
      batchList.value = bl
      filterBatchList()
    } else {
      global.messageError = 'Failed to load batch list'
    }
  })
}

const confirmDeleteCallback = (result) => {
  logDebug('BatchListView.confirmDeleteCallback()', result)

  if (result) {
    global.disabled = true
    global.clearMessages()

    batchStore.deleteBatch(confirmDeleteId.value, (success) => {
      if (success) global.messageSuccess = 'Deleted batch'
      else global.messageError = 'Failed to batch device'

      global.disabled = false
    })
  }
}

const deleteBatch = (id, name) => {
  logDebug('BatchListView.deleteBatch()', id, name)

  confirmDeleteMessage.value = "Do you really want to delete batch ''" + name + "''"
  confirmDeleteId.value = id
  document.getElementById('deleteBatch').click()
}

function exportBatchJSON(id) {
  logDebug('BatchListView.exportBatchJSON()', id)

  getBatch(id, (success, b) => {
    if (success) {
      logDebug('BatchListView.exportBatchJSON()', 'Collected batch')
      var s = JSON.stringify(b, null, 2)
      download(s, 'text/plain', 'brewlogger_batch_' + id + '.json')
    } else {
      global.messageError = 'Failed to fetch batch with id ' + id
      global.disabled = false
    }
  })
}

function exportBatchCSV(id) {
  logDebug('BatchListView.exportBatchCSV()', id)

  getBatch(id, (success, b) => {
    if (success) {
      logDebug('BatchListView.exportBatchCSV()', 'Collected batch')
      var s = 'Name,Created,Temperature,Gravity,Angle,Battery,RSSI,CorrGravity,RunTime,ChamberTemperature,BeerTemperature\n'
      b.gravity.forEach((g) => {
        s +=
          b.name +
          ',' +
          g.created +
          ',' +
          g.temperature +
          ',' +
          g.gravity +
          ',' +
          g.angle +
          ',' +
          g.battery +
          ',' +
          g.rssi +
          ',' +
          g.corrGravity +
          ',' +
          g.runTime +
          ',' +
          g.chamberTemperature +
          ',' +
          g.beerTemperature +
          '\n'
      })

      download(s, 'text/plain', 'brewlogger_batch_' + id + '.csv')
    } else {
      global.messageError = 'Failed to fetch batch with id ' + id
      global.disabled = false
    }
  })
}

function getBatch(id, callback) {
  fetch(global.baseURL + 'api/batch/' + id, {
    method: 'GET',
    headers: { Authorization: global.token },
    signal: AbortSignal.timeout(global.fetchTimout)
  })
    .then((res) => {
      logDebug('BatchListView.getBatch()', res.status)
      if (!res.ok) throw res
      return res.json()
    })
    .then((json) => {
      callback(true, json)
    })
    .catch((err) => {
      logError('BatchListView.getBatch()', err)
      callback(false, {})
    })
}
</script>
