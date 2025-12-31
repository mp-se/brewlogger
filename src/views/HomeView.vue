<template>
  <div class="container">
    <div class="row gy-4">
      <div class="col-md-8">
        <p>&nbsp;</p>
        <p class="h3">Home - Overview</p>
      </div>
      <div class="col-md-2">
        <BsInputSwitch
          v-model="global.showChamberTemps"
          label="Chamber"
          help=""
          :disabled="global.disabled"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Show data from chamber controllers on dashboard"
          aria-label="Show data from chamber controllers on dashboard"
        >
        </BsInputSwitch>
      </div>
      <div class="col-md-2">
        <BsInputSwitch
          v-model="global.showKegmonTaps"
          label="Kegmon"
          help=""
          :disabled="global.disabled"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Show data from Kegmon taps on dashboard"
          aria-label="Show data from Kegmon taps on dashboard"
        >
        </BsInputSwitch>
      </div>
      <hr />
    </div>

    <div class="row gy-4">
      <div class="col-md-4" v-for="b in activeBatchList" :key="b.id">
        <BsCard :header="'Batch: ' + b.name" color="primary" title="">
          <p class="text-center">
            <template v-if="b.gravityCount > 0">
              <router-link :to="{ name: 'batch-gravity-graph', params: { id: b.id } }">
                <button type="button" class="btn btn-success btn-sm">
                  <i class="bi bi-graph-down"></i>
                </button> </router-link
              >&nbsp;
            </template>

            <template v-if="b.pressureCount > 0">
              <router-link :to="{ name: 'batch-pressure-graph', params: { id: b.id } }">
                <button type="button" class="btn btn-warning btn-sm">
                  <i class="bi bi-graph-down"></i>
                </button> </router-link
              >&nbsp;
            </template>

            Age: {{ b.gravityCount > 0 ? getGravityReadingAge(b) : getPressureReadingAge(b) }}
          </p>
          <div class="text-center">Gravity: {{ getGravityOG(b) }} - {{ getLastGravity(b) }}</div>
          <div class="text-center">Pressure {{ getLastPressure(b) }}</div>
          <div class="text-center">Temperature {{ getLastTemperature(b) }}</div>
        </BsCard>
      </div>
    </div>

    <div class="row gy-4 mt-1">
      <div class="col-md-4" v-for="(d, index) in chamberTemps" :key="index">
        <BsCard :header="'Chamber: ' + d.mdns" color="info" title="">
          <div class="text-center" v-if="d.pid_fridge_temp_connected">
            Fridge temp: {{ d.pid_fridge_temp }} °{{ d.pid_temp_format }}
          </div>
          <div class="text-center" v-if="d.pid_beer_temp_connected">
            Beer temp: {{ d.pid_beer_temp }} °{{ d.pid_temp_format }}
          </div>
          <div class="text-center" v-if="d.pid_mode == 'b'">
            Mode: Beer target => {{ d.pid_beer_target_temp }} °{{ d.pid_temp_format }}
          </div>
          <div class="text-center" v-if="d.pid_mode == 'f'">
            Mode: Fridge target => {{ d.pid_fridge_target_temp }} °{{ d.pid_temp_format }}
          </div>
          <div class="text-center" v-if="d.pid_mode == 'o'">Mode: Off</div>
        </BsCard>
      </div>

      <div class="col-md-4" v-for="(d, index) in kegmonTaps" :key="index">
        <BsCard :header="'Kegmon: ' + d.mdns" color="info" title="">
          <div class="text-center">
            Tap1: {{ Number(d.beer_volume1 / 100).toFixed(1) }} L, ({{ d.glass1 }} glasses)
          </div>
          <div class="text-center">
            Tap2: {{ Number(d.beer_volume2 / 100).toFixed(1) }} L, ({{ d.glass2 }} glasses)
          </div>
          <div class="text-center">Temp: {{ d.temperature }} °{{ d.temp_format }}</div>
        </BsCard>
      </div>

      <div class="col-md-4" v-for="(d, index) in fermentationControlList" :key="index">
        <BsCard :header="'Fermentation: ' + d.mdns + ', ' + d.description" color="info" title="">
          <div class="text-center">Controller has assigned profile</div>
        </BsCard>
      </div>

      <div class="col-md-4" v-if="schedulerStatus != null">
        <BsCard header="Scheduler" color="secondary" title="">
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
        <BsCard header="Database Metrics" color="secondary" title="">
          <div class="text-center">{{ deviceCount }} devices in database</div>
          <div class="text-center">{{ batchCount }} batches in database</div>
          <div class="text-center">{{ gravityCount }} gravity points in database</div>
          <div class="text-center">{{ pourCount }} pour points in database</div>
          <div class="text-center">{{ pressureCount }} pressure points in database</div>
        </BsCard>
      </div>
    </div>

    <div class="row gy-4 mt-1">
      <div class="col-md-12" v-if="latestGravityReadings.length > 0">
        <BsCard header="Latest Gravity Readings" color="info" title="">
          <table class="table table-sm table-striped">
            <colgroup>
              <col style="width: 25%" />
              <col style="width: 15%" />
              <col style="width: 15%" />
              <col style="width: 15%" />
              <col style="width: 15%" />
              <col style="width: 15%" />
            </colgroup>
            <thead>
              <tr>
                <th>Batch</th>
                <th>Gravity</th>
                <th>Velocity</th>
                <th>Temp</th>
                <th>Battery</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(reading, index) in latestGravityReadings" :key="index">
                <td>{{ truncateString(reading.batchName, 30) }}</td>
                <td>{{ Number(reading.gravity).toFixed(4) }}</td>
                <td>
                  {{ reading.velocity !== null ? Number(reading.velocity).toFixed(4) : '--' }}
                </td>
                <td>{{ getFormattedTemperature(reading.temperature) }}</td>
                <td>{{ Number(reading.battery).toFixed(2) }}V</td>
                <td>{{ getTimeSincePosted(reading.created) }}</td>
              </tr>
            </tbody>
          </table>
        </BsCard>
      </div>

      <div class="col-md-12" v-if="latestPressureReadings.length > 0">
        <BsCard header="Latest Pressure Readings" color="info" title="">
          <table class="table table-sm table-striped">
            <colgroup>
              <col style="width: 25%" />
              <col style="width: 15%" />
              <col style="width: 15%" />
              <col style="width: 15%" />
              <col style="width: 15%" />
              <col style="width: 15%" />
            </colgroup>
            <thead>
              <tr>
                <th>Batch</th>
                <th>Pressure</th>
                <th>Pressure1</th>
                <th>Temp</th>
                <th>Battery</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(reading, index) in latestPressureReadings" :key="index">
                <td>{{ truncateString(reading.batchName, 30) }}</td>
                <td>{{ getFormattedPressure(reading.pressure) }}</td>
                <td>{{ getFormattedPressure(reading.pressure1) }}</td>
                <td>{{ getFormattedTemperature(reading.temperature) }}</td>
                <td>{{ Number(reading.battery).toFixed(2) }}V</td>
                <td>{{ getTimeSincePosted(reading.created) }}</td>
              </tr>
            </tbody>
          </table>
        </BsCard>
      </div>

      <div class="col-md-12" v-if="latestPourReadings.length > 0">
        <BsCard header="Latest Pour Readings" color="info" title="">
          <table class="table table-sm table-striped">
            <colgroup>
              <col style="width: 25%" />
              <col style="width: 15%" />
              <col style="width: 15%" />
              <col style="width: 15%" />
              <col style="width: 15%" />
              <col style="width: 15%" />
            </colgroup>
            <thead>
              <tr>
                <th>Batch</th>
                <th>Volume (L)</th>
                <th>Pour (cl)</th>
                <th></th>
                <th></th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(reading, index) in latestPourReadings" :key="index">
                <td>{{ truncateString(reading.batchName, 30) }}</td>
                <td>{{ getFormattedVolume(reading.volume) }}</td>
                <td>{{ getFormattedPourVolume(reading.pour * 100) }}</td>
                <td></td>
                <td></td>
                <td>{{ getTimeSincePosted(reading.created) }}</td>
              </tr>
            </tbody>
          </table>
        </BsCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import {
  config,
  global,
  batchStore,
  deviceStore,
  gravityStore,
  pressureStore,
  pourStore
} from '@/modules/pinia'
import {
  gravityToPlato,
  formatTime,
  getFormattedTemperature,
  getFormattedPressure,
  getFormattedVolume,
  getFormattedPourVolume,
  truncateString,
  getTimeSincePosted
} from '@/modules/utils'
import { logDebug, logError } from '@/modules/logger'

const activeBatchList = ref([])
const schedulerStatus = ref(null)
const ticker = ref(null)
const readingsTicker = ref(null)
const fermentationControlList = ref([])
const latestGravityReadings = ref([])
const latestPressureReadings = ref([])
const latestPourReadings = ref([])

function prettySchedulerName(n) {
  switch (n) {
    case 'task_fetch_chamberctrl_temps':
      return 'Fetch ChamberControl Temps'
    case 'task_fermentation_control':
      return 'Chamber Control'
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

function getPressureReadingAge(batch) {
  logDebug('HomeView.getPressureReadingAge()')

  if (batch.pressureCount == 2) {
    var last = Date.parse(batch.pressure[1].created)
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
    return getFormattedTemperature(batch.gravity[1].temperature)
  } else if (batch.pressureCount == 2) {
    return getFormattedTemperature(batch.pressure[1].temperature)
  }

  return 'N/A'
}

function getLastPressure(batch) {
  logDebug('HomeView.getLastPressure()')

  if (batch.pressureCount == 2) {
    return getFormattedPressure(batch.pressure[1].pressure)
  }

  return 'N/A'
}

onUnmounted(() => {
  logDebug('HomeView.onUnmounted()')

  if (ticker.value != null) clearInterval(ticker.value)
  if (readingsTicker.value != null) clearInterval(readingsTicker.value)
})

onMounted(async () => {
  logDebug('HomeView.onMounted()')

  activeBatchList.value = []
  fermentationControlList.value = []

  for (const batch of batchStore.batchList) {
    if (batch.active) {
      const b = await batchStore.getBatchDashboard(batch.id)
      logDebug('HomeView.onMounted()', b)
      if (b) activeBatchList.value.push(b)
    }
  }

  for (const device of deviceStore.deviceList) {
    if (device.software == 'Chamber-Controller') {
      const result = await deviceStore.getDevice(device.id)
      if (result && result.stepList && result.stepList.length > 0) {
        result.device.fermentationSteps = result.stepList
        fermentationControlList.value.push(result.device)
      }
    }
  }

  ticker.value = setInterval(async () => {
    await Promise.all([fetchScheduler(), fetchChamber(), fetchKegmon()])
  }, 5000)

  readingsTicker.value = setInterval(async () => {
    logDebug('HomeView.readingsTicker()', 'Fetching latest readings')
    await fetchLatestReadings()
  }, 300000) // 5 minutes

  // Fetch immediately on mount
  await fetchLatestReadings()
})

const chamberTemps = ref([])
const kegmonTaps = ref([])

async function fetchChamber() {
  logDebug('HomeView.fetchChamber()')

  if (!global.showChamberTemps) {
    chamberTemps.value = []
    return
  }

  var chamberList = deviceStore.deviceList.filter((d) => {
    return d.software == 'Chamber-Controller'
  })

  await Promise.all(
    chamberList.map(async (device) => {
      return deviceStore.proxyRequest(
        'GET',
        device.url + 'api/status',
        'Content-Type: application/json',
        ''
      )
    })
  )
    .then((values) => {
      logDebug('HomeView.fetchChamber()', values)
      chamberTemps.value = values.filter((v) => v !== null)
    })
    .catch((err) => {
      logError('HomeView.fetchChamber()', err)
    })
}

async function fetchKegmon() {
  logDebug('HomeView.fetchKegmon()')

  if (!global.showKegmonTaps) {
    kegmonTaps.value = []
    return
  }
  var chamberList = deviceStore.deviceList.filter((d) => {
    return d.software == 'Kegmon'
  })

  await Promise.all(
    chamberList.map(async (device) => {
      return deviceStore.proxyRequest(
        'GET',
        device.url + 'api/status',
        'Content-Type: application/json',
        ''
      )
    })
  )
    .then((values) => {
      kegmonTaps.value = values.filter((v) => v !== null)
    })
    .catch((err) => {
      logError('HomeView.fetchKegmon()', err)
    })
}

async function fetchLatestReadings() {
  logDebug('HomeView.fetchLatestReadings()')

  try {
    const [gravityResults, pressureResults, pourResults] = await Promise.all([
      gravityStore.getLatestGravity(5),
      pressureStore.getLatestPressure(5),
      pourStore.getLatestPour(5)
    ])

    if (gravityResults) {
      latestGravityReadings.value = gravityResults
      logDebug(
        'HomeView.fetchLatestReadings()',
        'Gravity readings:',
        latestGravityReadings.value.length
      )
    }

    if (pressureResults) {
      latestPressureReadings.value = pressureResults
      logDebug(
        'HomeView.fetchLatestReadings()',
        'Pressure readings:',
        latestPressureReadings.value.length
      )
    }

    if (pourResults) {
      latestPourReadings.value = pourResults
      logDebug('HomeView.fetchLatestReadings()', 'Pour readings:', latestPourReadings.value.length)
    }
  } catch (err) {
    logError('HomeView.fetchLatestReadings()', 'Error fetching readings', err)
  }
}

async function fetchScheduler() {
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
