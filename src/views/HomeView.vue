<template>
  <div class="container">
    <p></p>
    <p class="h3">Home - Overview</p>
    <hr />

    <div class="row gy-4">
      <div class="col-md-4" v-for="b in activeBatchList" :key="b.id">
        <BsCard :header="'Batch: ' + b.name" color="info" title="">
          <p class="text-center">
            <template v-if="b.gravityCount > 0">
              <router-link :to="{ name: 'batch-gravity-graph', params: { id: b.id } }">
                <button type="button" class="btn btn-success btn-sm">
                  <i class="bi bi-graph-down"></i>
                </button> </router-link
              >&nbsp;
            </template>
            Age: {{ getGravityReadingAge(b) }}
          </p>
          <div class="text-center">Gravity: {{ getGravityOG(b) }} - {{ getLastGravity(b) }}</div>
          <div class="text-center">Temperature {{ getLastTemperature(b) }}</div>
        </BsCard>
      </div>

      <div class="col-md-4" v-for="(d, index) in fermentationControlList" :key="index">
        <BsCard :header="'Fermentation: ' + d.mdns + ', ' + d.description" color="info" title="">
          <BrewpiDisplayFragment :url="d.url" refresh="5"></BrewpiDisplayFragment>
          <div class="text-center">Controller has assigned profile</div>
        </BsCard>
      </div>

      <div class="col-md-4" v-if="schedulerStatus != null">
        <BsCard header="Scheduler" color="info" title="">
          <template v-if="schedulerStatus.length == 0">
            <div class="text-center">Scheduler disabled</div>
          </template>
          <template v-for="(task, index) in schedulerStatus" :key="index">
            <div class="text-center">
              {{ prettySchedulerName(task.name) }}: {{ prettySeconds(task.nextRunIn) }}
            </div>
          </template>
        </BsCard>
      </div>

      <div class="col-md-4">
        <BsCard header="Database Metrics" color="info" title="">
          <div class="text-center">{{ deviceCount }} devices in database</div>
          <div class="text-center">{{ batchCount }} batches in database</div>
          <div class="text-center">{{ gravityCount }} gravity points in database</div>
          <div class="text-center">{{ pourCount }} pour points in database</div>
          <div class="text-center">{{ pressureCount }} pressure points in database</div>
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
import BrewpiDisplayFragment from '@/fragments/BrewpiDisplayFragment.vue'

const activeBatchList = ref([])
const schedulerStatus = ref(null)
const ticker = ref(null)
const fermentationControlList = ref([])

function prettySchedulerName(n) {
  switch (n) {
    case 'task_fetch_chamberctrl_temps':
      return 'Fetch ChamberControl Temps'
    case 'task_fetch_brewpi_temps':
      return 'Fetch Brewpi Temps'
    case 'task_fermentation_control':
      return 'Brewpi Control'
    case 'task_forward_gravity':
      return 'Forward gravity'
    case 'task_check_database':
      return 'Database Maintenance'
  }

  return 'Unknown mapping'
}

function prettySeconds(t) {
  if (t < 60) {
    return t + ' s'
  } else if (t < 3600) {
    return Math.round(t / 60) + ' m'
  }

  return Math.round(t / 3600) + ' h'
}

const gravityCount = computed(() => {
  var l = 0

  batchStore.batchList.forEach((b) => {
    l += b.gravityCount
  })

  return l
})

const pourCount = computed(() => {
  var l = 0

  batchStore.batchList.forEach((b) => {
    l += b.pourCount
  })

  return l
})

const pressureCount = computed(() => {
  var l = 0

  batchStore.batchList.forEach((b) => {
    l += b.pressureCount
  })

  return l
})

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

  activeBatchList.value = []
  fermentationControlList.value = []

  batchStore.batchList.forEach((batch) => {
    if (batch.active) {
      batchStore.getBatchDashboard(batch.id, (success, b) => {
        logDebug('HomeView.onMounted()', success, b)
        if (success) activeBatchList.value.push(b)
      })
    }
  })

  deviceStore.deviceList.forEach((device) => {
    if (device.software == 'Brewpi') {
      deviceStore.getDevice(device.id, (success, d, fs) => {
        if (success && fs.length > 0) {
          d.fermentationSteps = fs
          fermentationControlList.value.push(d)
        }
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
