<template>
  <div class="container">
    <p></p>
    <p class="h3">Home - Active Batches</p>
    <hr />

    <div class="row gy-4">
      <div class="col-md-4" v-for="b in batchList" :key="b.id">
        <BsCard :header="'Batch: ' + b.name" color="info" title="">
          <p class="text-center">
            <template v-if="b.gravityCount > 0">
              <router-link :to="{ name: 'batch-gravity-graph', params: { id: b.id } }">
                <button type="button" class="btn btn-success btn-sm">
                  <i class="bi bi-graph-down"></i>
                </button> </router-link>&nbsp;
            </template>
            Age: {{ getGravityReadingAge(b) }}
          </p>
          <div class="text-center">Gravity: {{ getGravityOG(b) }} - {{ getLastGravity(b) }}</div>
          <div class="text-center">Temperature {{ getLastTemperature(b) }}</div>
        </BsCard>
      </div>

      <div class="col-md-4" v-if="schedulerStatus != null">
        <BsCard header="Scheduler" color="info" title="">
          <template v-for="(task, index) in schedulerStatus" :key="index">
            <div class="text-center">{{ prettySchedulerName(task.name) }}: {{ task.nextRunIn }} s</div>
          </template>
        </BsCard>
      </div>

      <div class="col-md-4" v-if="batchList.length == 0">
        <BsCard header="No active batches" color="warning" title="">
          <p class="text-center">No active batches in the system</p>
        </BsCard>
      </div>

      <div class="col-md-4">
        <BsCard header="Metrics" color="info" title="Device">
          <p class="text-center">{{ deviceCount }} devices in database</p>
        </BsCard>
      </div>

      <div class="col-md-4">
        <BsCard header="Metrics" color="info" title="Batch">
          <p class="text-center">{{ batchCount }} batches in database</p>
        </BsCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { config, global, batchStore, deviceStore } from '@/modules/pinia'
import { gravityToPlato, tempToF, formatTime } from '@/modules/utils'
import { logDebug, logError } from '@/modules/logger'

const batchList = ref([])
const schedulerStatus = ref(null)
const ticker = ref(null)

function prettySchedulerName(n) {
  switch(n) {
    case 'task_scan_mdns': return "MDNS Scanning";
    case 'task_fetch_brewpi_temps': return "Fetch Brewpi Temps";
    case 'task_fermentation_control': return "Brewpi Control";
    case 'task_forward_gravity': return "Forward gravity";
      }

  return "Unknown mapping"
}

const deviceCount = computed(() => {
  return deviceStore.deviceList.length
})

const batchCount = computed(() => {
  return batchStore.batchList.length
})

function getGravityReadingAge(batch) {
  logDebug('HomeView.getGravityReadingAge()')

  if (batch.gravityCount == 2) {
    var last = Date.parse(batch.gravity[1].created)
    var now = new Date()
    return formatTime(Math.floor((now - last) / 1000))
  }

  return ''
}

function getGravityOG(batch) {
  logDebug('HomeView.getGravityOG()')

  if (batch.gravityCount > 1) {
    var g = batch.gravity[0].gravity

    if (config.isGravityP) return new Number(gravityToPlato(g)).toFixed(2)

    return new Number(g).toFixed(4)
  }

  return 0.0
}

function getLastGravity(batch) {
  logDebug('HomeView.getLastGravity()')

  if (batch.gravityCount == 2) {
    var g = batch.gravity[1].gravity

    if (config.isGravityP) return new Number(gravityToPlato(g)).toFixed(2)

    return new Number(g).toFixed(4)
  }

  return 'N/A'
}

function getLastTemperature(batch) {
  logDebug('HomeView.getLastTemperature()')

  if (batch.gravityCount == 2) {
    var t = batch.gravity[1].temperature

    if (config.isTempF) return new Number(tempToF(t)).toFixed(2) + ' F'

    return new Number(t).toFixed(2) + ' C'
  }

  return 'N/A'
}

onUnmounted(() => {
  logDebug('HomeView.onUnmounted()')

  if (ticker.value != null) clearInterval(ticker.value)
})

onMounted(() => {
  logDebug('HomeView.onMounted()')

  batchList.value = []

  batchStore.batchList.forEach((batch) => {
    if (batch.active) {
      batchStore.getBatchDashboard(batch.id, (success, b) => {
        console.log(success, b)
        if (success) batchList.value.push(b)
      })
    }
  })

  ticker.value = setInterval(() => {
    fetchScheduler()
  }, 2000)
})

function fetchScheduler() {
  logDebug('HomeView.fetchScheduler()')

  fetch(global.baseURL + 'api/system/scheduler/', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: global.token },
    signal: AbortSignal.timeout(global.fetchTimout)
    })
    .then((res) => {
      return res.json()
    })
  .then((json) => {
    schedulerStatus.value = json
  })
  .catch((err) => {
    logError('HomeView.fetchScheduler()', err)
  })
}
</script>
