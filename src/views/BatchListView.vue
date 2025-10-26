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
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Show only active batches"
          aria-label="Show only active batches"
        >
        </BsInputSwitch>
      </div>
      <div class="col-md-1">
        <BsInputSwitch
          v-model="global.batchListFilterData"
          label="Data"
          help=""
          :disabled="global.disabled"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Show only batches with data"
          aria-label="Show only batches with data"
        >
        </BsInputSwitch>
      </div>
    </div>

    <hr />
    <template v-if="batchList != null">
      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col" class="col-sm-2">
              <div :class="sortedClass('name')">
                Name&nbsp;
                <a class="icon-link icon-link-hover" @click="sortList(batchList, 'name', 'str')">
                  <i :class="sortedIconClass"></i>
                </a>
              </div>
            </th>
            <th scope="col" class="col-sm-2">
              <div :class="sortedClass('brewDate')">
                Brewdate&nbsp;
                <a
                  class="icon-link icon-link-hover"
                  @click="sortList(batchList, 'brewDate', 'date')"
                >
                  <i :class="sortedIconClass"></i>
                </a>
              </div>
            </th>
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
            <td>
              <div class="form-check">
                <input
                  class="form-check-input"
                  v-model="b.active"
                  type="checkbox"
                  @click="toggleBatchActive(b.id)"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Active batch (shown on home)"
                  aria-label="Active batch (shown on home)"
                />
              </div>
            </td>
            <td>
              <div class="form-check">
                <input
                  class="form-check-input"
                  v-model="b.tapList"
                  type="checkbox"
                  @click="toggleBatchTapList(b.id)"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Include in taplist"
                  aria-label="Include in taplist"
                />
              </div>
            </td>
            <td class="fs-5">{{ b.gravityCount }} / {{ b.pressureCount }} / {{ b.pourCount }}</td>
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
              <button
                type="button"
                class="btn btn-danger btn-sm"
                @click.prevent="deleteBatch(b.id, b.name)"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Delete batch"
                aria-label="Delete batch"
              >
                <i class="bi bi-file-x"></i></button
              >&nbsp;

              <!-- Links to batch filter -->

              <template v-if="b.gravityCount > 0">
                <router-link :to="{ name: 'batch-gravity-graph', params: { id: b.id } }">
                  <button
                    type="button"
                    class="btn btn-success btn-sm"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Show gravity graph"
                    aria-label="Show gravity graph"
                  >
                    <i class="bi bi-graph-down"></i>
                  </button> </router-link
                >&nbsp;
                <router-link :to="{ name: 'batch-gravity-list', params: { id: b.id } }">
                  <button
                    type="button"
                    class="btn btn-success btn-sm"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Show gravity data as list"
                    aria-label="Show gravity data as list"
                  >
                    <i class="bi bi-list"></i>
                  </button> </router-link
                >&nbsp;
              </template>

              <template v-if="b.pressureCount > 0">
                <router-link :to="{ name: 'batch-pressure-graph', params: { id: b.id } }">
                  <button
                    type="button"
                    class="btn btn-warning btn-sm"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Show pressure graph"
                    aria-label="Show pressure graph"
                  >
                    <i class="bi bi-graph-down"></i>
                  </button> </router-link
                >&nbsp;

                <router-link :to="{ name: 'batch-pressure-list', params: { id: b.id } }">
                  <button
                    type="button"
                    class="btn btn-warning btn-sm"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Show pressure data as list"
                    aria-label="Show pressure data as list"
                  >
                    <i class="bi bi-list"></i>
                  </button> </router-link
                >&nbsp;
              </template>

              <!-- Export data -->

              <template v-if="b.gravityCount">
                <button
                  @click="exportBatchGravityCSV(b.id)"
                  type="button"
                  class="btn btn-success btn-sm"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Export gravity data as CSV"
                  aria-label="Export gravity data as CSV"
                >
                  <i class="bi bi-filetype-csv"></i></button
                >&nbsp;
              </template>

              <template v-if="b.pressureCount">
                <button
                  @click="exportBatchPressureCSV(b.id)"
                  type="button"
                  class="btn btn-warning btn-sm"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Export pressure data as CSV"
                  aria-label="Export pressure data as CSV"
                >
                  <i class="bi bi-filetype-csv"></i></button
                >&nbsp;
              </template>

              <template v-if="b.gravityCount > 0 || b.pressureCount > 0 || b.pourCount > 0">
                <button
                  @click="exportBatchJSON(b.id)"
                  type="button"
                  class="btn btn-info btn-sm"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Export batch data as JSON"
                  aria-label="Export batch data as JSON"
                >
                  <i class="bi bi-filetype-json"></i></button
                >&nbsp;
              </template>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="row">
        <div class="col-md-12">
          <router-link :to="{ name: 'batch', params: { id: 'new' } }">
            <button type="button" class="btn btn-secondary" :disabled="global.disabled">
              Add Batch
            </button> </router-link
          >&nbsp;
        </div>
      </div>
    </template>

    <template v-else>
      <div class="row gy-2">
        <div class="col-md-12">
          <p class="h4">Loading...</p>
        </div>
      </div>
    </template>

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
import {
  sortedIconClass,
  setSortingDefault,
  sortedClass,
  sortList,
  applySortList
} from '@/modules/ui'

const confirmDeleteMessage = ref(null)
const confirmDeleteId = ref(null)

const batchList = ref(null)
const deviceList = ref([])
const { batchListFilterDevice, batchListFilterActive, batchListFilterData } = storeToRefs(global)

const { updatedBatchData } = storeToRefs(global)

watch(updatedBatchData, () => {
  filterBatchList()
  applySortList(batchList.value)
})

onMounted(() => {
  logDebug('BatchListView.onMounted()')
  setSortingDefault('brewDate', 'date', false)

  var query = router.currentRoute.value.query

  if (Object.prototype.hasOwnProperty.call(query, 'chipId')) {
    logDebug('BatchListView.onMounted()', 'Filter by chipId', query.chipId)
    global.batchListFilterDevice = query.chipId
  }

  filterBatchList()
  applySortList(batchList.value)

  deviceList.value.push({ label: 'All', value: '*' })
  deviceStore.deviceList.forEach((d) => {
    deviceList.value.push({ label: d.chipId + ' (' + d.mdns + ')', value: d.chipId })
  })
})

async function toggleBatchTapList(id) {
  logDebug('BatchListView.toggleBatchTapList()', id)

  for (const b of batchList.value) {
    if (b.id == id) {
      logDebug('BatchListView.toggleBatchTapList()', 'Found Record', b)

      b.tapList = !b.tapList
      const success = await batchStore.updateBatch(b)
      if (success) {
        logDebug('BatchListView.toggleBatchTapList()', 'Success')
      } else {
        global.messageError = 'Failed to load batch ' + id
      }
      break
    }
  }
}

async function toggleBatchActive(id) {
  logDebug('BatchListView.toggleBatchActive()', id)

  for (const b of batchList.value) {
    if (b.id == id) {
      logDebug('BatchListView.toggleBatchActive()', 'Found Record', b)

      b.active = !b.active
      const success = await batchStore.updateBatch(b)
      if (success) {
        logDebug('BatchListView.toggleBatchActive()', 'Success')
      } else {
        global.messageError = 'Failed to load batch ' + id
      }
      break
    }
  }
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

    if (
      global.batchListFilterDevice != '*' &&
      global.batchListFilterDevice != b.chipIdGravity &&
      global.batchListFilterDevice != b.chipIdPressure
    ) {
      logDebug(
        'BatchListView.filterBatchList()',
        'exclude device: ',
        b.id,
        b.chipIdGravity,
        b.chipIdPressure
      )
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
  applySortList(batchList.value)
})

watch(batchListFilterActive, async (selected) => {
  logDebug('BatchListView.watch(filterActive)', selected)
  filterBatchList()
  applySortList(batchList.value)
})

watch(batchListFilterData, async (selected) => {
  logDebug('BatchListView.watch(filterData)', selected)
  applySortList(batchList.value)
  filterBatchList()
})

const confirmDeleteCallback = async (result) => {
  logDebug('BatchListView.confirmDeleteCallback()', result)

  if (result) {
    global.disabled = true
    global.clearMessages()

    const success = await batchStore.deleteBatch(confirmDeleteId.value)
    if (success) global.messageSuccess = 'Deleted batch'
    else global.messageError = 'Failed to batch device'

    global.disabled = false
  }
}

const deleteBatch = (id, name) => {
  logDebug('BatchListView.deleteBatch()', id, name)

  confirmDeleteMessage.value = "Do you really want to delete batch ''" + name + "''"
  confirmDeleteId.value = id
  document.getElementById('deleteBatch').click()
}

async function exportBatchJSON(id) {
  logDebug('BatchListView.exportBatchJSON()', id)

  const b = await getBatch(id)
  if (b) {
    logDebug('BatchListView.exportBatchJSON()', 'Collected batch')
    var s = JSON.stringify(b, null, 2)
    download(s, 'text/plain', 'brewlogger_batch_' + id + '.json')
  } else {
    global.messageError = 'Failed to fetch batch with id ' + id
    global.disabled = false
  }
}

async function exportBatchGravityCSV(id) {
  logDebug('BatchListView.exportBatchGravityCSV()', id)

  const b = await getBatch(id)
  if (b) {
    logDebug('BatchListView.exportBatchGravityCSV()', 'Collected batch')
    var s =
      'Name,Created,Temperature,Gravity,Angle,Battery,RSSI,CorrGravity,RunTime,ChamberTemperature,BeerTemperature,GravityVelocity\n'
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
        (g.chamberTemperature === null ? '' : g.chamberTemperature) +
        ',' +
        (g.beerTemperature === null ? '' : g.beerTemperature) +
        ',' +
        g.velocity +
        '\n'
    })

    download(s, 'text/plain', 'brewlogger_gravity_batch_' + id + '.csv')
  } else {
    global.messageError = 'Failed to fetch batch with id ' + id
    global.disabled = false
  }
}

async function exportBatchPressureCSV(id) {
  logDebug('BatchListView.exportBatchPressureCSV()', id)

  const b = await getBatch(id)
  if (b) {
    logDebug('BatchListView.exportBatchPressureCSV()', 'Collected batch')
    var s = 'Name,Created,Temperature,Pressure,Pressure1,Battery,RSSI,RunTime\n'
    b.pressure.forEach((g) => {
      s +=
        b.name +
        ',' +
        g.created +
        ',' +
        g.temperature +
        ',' +
        g.pressure +
        ',' +
        g.pressure1 +
        ',' +
        g.battery +
        ',' +
        g.rssi +
        ',' +
        g.runTime +
        '\n'
    })

    download(s, 'text/plain', 'brewlogger_pressure_batch_' + id + '.csv')
  } else {
    global.messageError = 'Failed to fetch batch with id ' + id
    global.disabled = false
  }
}

async function getBatch(id) {
  try {
    const res = await fetch(global.baseURL + 'api/batch/' + id, {
      method: 'GET',
      headers: { Authorization: global.token },
      signal: AbortSignal.timeout(global.fetchTimout)
    })
    logDebug('BatchListView.getBatch()', res.status)
    if (!res.ok) throw res
    const json = await res.json()
    return json
  } catch (err) {
    logError('BatchListView.getBatch()', err)
    return false
  }
}
</script>
