<!--
BrewLogger
Copyright (c) 2021-2026 Magnus

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Alternatively, this software may be used under the terms of a
commercial license. See LICENSE_COMMERCIAL for details.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->
<template>
  <div class="container">
    <div class="row">
      <BsPageHeader title="Home - Overview">
        <div class="row">
          <div class="col-md-6">
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
          <div class="col-md-6">
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
        </div>
      </BsPageHeader>
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
          <div v-if="getPrediction(b)" class="text-center">
            Fermentation prediction: <span :class="getPrediction(b) === 'DONE' ? 'text-success fw-bold' : ''">{{ getPrediction(b) }}</span>
          </div>
          <div class="text-center">Gravity: {{ getGravityOG(b) }} - {{ getLastGravity(b) }}</div>
          <div class="text-center">Pressure {{ getLastPressure(b) }}</div>
          <div class="text-center">Temperature {{ getLastTemperature(b) }}</div>
        </BsCard>
      </div>
    </div>

    <div class="row gy-4 mt-1">
      <div class="col-md-4" v-for="(d, index) in chamberTemps" :key="index">
        <BsCard v-if="d.error === undefined" :header="'Chamber: ' + d.mdns" color="info" title="">
          <div class="text-center" v-if="d?.pid_fridge_temp_connected">
            Fridge temp: {{ d?.pid_fridge_temp }} °{{ d?.pid_temp_format }}
          </div>
          <div class="text-center" v-if="d?.pid_beer_temp_connected">
            Beer temp: {{ d?.pid_beer_temp }} °{{ d?.pid_temp_format }}
          </div>
          <div class="text-center" v-if="d?.pid_mode == 'b'">
            Mode: Beer target => {{ d?.pid_beer_target_temp }} °{{ d?.pid_temp_format }}
          </div>
          <div class="text-center" v-if="d?.pid_mode == 'f'">
            Mode: Fridge target => {{ d?.pid_fridge_target_temp }} °{{ d?.pid_temp_format }}
          </div>
          <div class="text-center" v-if="d?.pid_mode == 'o'">Mode: Off</div>
        </BsCard>
        <BsCard v-else :header="'Chamber: ' + d.mdns" color="danger" title="">
          <div class="text-center">
            {{ d.error }}
          </div>
        </BsCard>
      </div>

      <div class="col-md-4" v-for="(d, index) in kegmonTaps" :key="index">
        <BsCard v-if="d.error === undefined" :header="'Kegmon: ' + d.mdns" color="info" title="">
          <div class="text-center">
            Tap1: {{ Number(d?.beer_volume1 / 100).toFixed(1) }} L, ({{ d?.glass1 }} glasses)
          </div>
          <div class="text-center">
            Tap2: {{ Number(d?.beer_volume2 / 100).toFixed(1) }} L, ({{ d?.glass2 }} glasses)
          </div>
          <div class="text-center">Temp: {{ d?.temperature }} °{{ d?.temp_format }}</div>
        </BsCard>
        <BsCard v-else :header="'Kegmon: ' + d.mdns" color="danger" title="">
          <div class="text-center">
            {{ d.error }}
          </div>
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
      <LatestReadingsFragment
        title="Latest Gravity Readings"
        :readings="latestGravityReadings"
      >
        <template #headers>
          <th>Gravity</th>
          <th>Velocity</th>
          <th>Temp</th>
          <th>Battery</th>
        </template>
        <template #row="{ reading }">
          <td>{{ Number(reading.gravity).toFixed(4) }}</td>
          <td>
            {{ reading.velocity !== null ? Number(reading.velocity).toFixed(4) : '--' }}
          </td>
          <td>{{ getFormattedTemperature(reading.temperature) }}</td>
          <td>{{ Number(reading.battery).toFixed(2) }}V</td>
        </template>
      </LatestReadingsFragment>

      <LatestReadingsFragment
        title="Latest Pressure Readings"
        :readings="latestPressureReadings"
      >
        <template #headers>
          <th>Pressure</th>
          <th>Pressure1</th>
          <th>Temp</th>
          <th>Battery</th>
        </template>
        <template #row="{ reading }">
          <td>{{ getFormattedPressure(reading.pressure) }}</td>
          <td>{{ getFormattedPressure(reading.pressure1) }}</td>
          <td>{{ getFormattedTemperature(reading.temperature) }}</td>
          <td>{{ Number(reading.battery).toFixed(2) }}V</td>
        </template>
      </LatestReadingsFragment>

      <LatestReadingsFragment
        title="Latest Pour Readings"
        :readings="latestPourReadings"
      >
        <template #headers>
          <th>Volume (L)</th>
          <th>Pour (cl)</th>
          <th></th>
          <th></th>
        </template>
        <template #row="{ reading }">
          <td>{{ getFormattedVolume(reading.volume) }}</td>
          <td>{{ getFormattedPourVolume(reading.pour * 100) }}</td>
          <td></td>
          <td></td>
        </template>
      </LatestReadingsFragment>
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
  getFormattedPourVolume
} from '@/modules/utils'
import { logDebug, logError } from '@/modules/logger'
import BsPageHeader from '@/components/BsPageHeader.vue'
import LatestReadingsFragment from '@/fragments/LatestReadingsFragment.vue'


const ticker = ref(null)
const readingsTicker = ref(null)


const activeBatchList = ref([])


const chamberTemps = ref([])
const kegmonTaps = ref([])


const schedulerStatus = ref(null)
const fermentationControlList = ref([])


const latestGravityReadings = ref([])
const latestPressureReadings = ref([])
const latestPourReadings = ref([])

function prettySchedulerName(n) {
  switch (n) {
    case 'task_process_prediction_queue':
      return 'Fermentation ready prediction'
    case 'task_fetch_chamberctrl_temps':
      return 'Fetch chamber control temps'
    case 'task_fermentation_control':
      return 'Chamber control'
    case 'task_forward_gravity':
      return 'Forward gravity data'
    case 'task_check_database':
      return 'Database maintenance'
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

  if (batch.gravityCount >= 2 && batch.gravity && batch.gravity.length >= 2 && batch.gravity[1]?.created) {
    var last = Date.parse(batch.gravity[1].created)
    var now = new Date()
    return formatTime(Math.floor((now - last) / 1000))
  }

  return ''
}

function getPressureReadingAge(batch) {
  logDebug('HomeView.getPressureReadingAge()')

  if (batch.pressureCount >= 2 && batch.pressure && batch.pressure.length >= 2 && batch.pressure[1]?.created) {
    var last = Date.parse(batch.pressure[1].created)
    var now = new Date()
    return formatTime(Math.floor((now - last) / 1000))
  }

  return ''
}

/**
 * Calculate and format the fermentation completion prediction.
 * If the predicted time left is less than 0.5 hours, returns "DONE".
 * Adjusts the prediction based on the time elapsed since the prediction was made.
 *
 * @param {Batch} batch - The batch object containing prediction data.
 * @returns {string|null} - Formatted remaining time, "DONE", or null if no valid prediction.
 */
function getPrediction(batch) {
  logDebug('HomeView.getPrediction()', batch)

  // Check if batch and prediction data exist
  if (!batch) {
    return null
  }

  if (
    batch.predictionHoursLeft === undefined ||
    batch.predictionHoursLeft === null ||
    batch.predictionAtTimestamp === undefined ||
    batch.predictionAtTimestamp === null ||
    batch.predictionAtTimestamp === ''
  ) {
    logDebug('HomeView.getPrediction() - No prediction data available', {
      predictionHoursLeft: batch.predictionHoursLeft,
      predictionAtTimestamp: batch.predictionAtTimestamp
    })
    return null
  }

  const predictionAt = Date.parse(batch.predictionAtTimestamp)
  if (isNaN(predictionAt)) {
    logError('HomeView.getPrediction() - Invalid prediction timestamp', {
      predictionAtTimestamp: batch.predictionAtTimestamp
    })
    return null
  }

  const now = new Date()
  const elapsedHours = (now - predictionAt) / (1000 * 60 * 60)
  const remainingHours = batch.predictionHoursLeft - elapsedHours

  if (remainingHours < 0.5) {
    logDebug('HomeView.getPrediction() - Prediction completed', {
      remainingHours: remainingHours
    })
    return 'DONE'
  }

  logDebug('HomeView.getPrediction() - Remaining hours calculated', {
    remainingHours: remainingHours
  })
  return remainingHours.toFixed(1) + ' h'
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
    if (device.software == 'Chamber-Controller' && device.id > 0) {
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

async function fetchChamber() {
  logDebug('HomeView.fetchChamber()')

  if (!global.showChamberTemps) {
    chamberTemps.value = []
    return
  }

  const chamberList = deviceStore.deviceList.filter((d) => {
    return d.software == 'Chamber-Controller'
  })

  try {
    const results = await Promise.allSettled(
      chamberList.map(async (device) => {
        return deviceStore.proxyRequest(
          'GET',
          device.url + 'api/status',
          'Content-Type: application/json',
          ''
        )
      })
    )

    chamberTemps.value = results.map((result, index) => {
      if (result.value !== null) {
        return result.value
      } else {
        const device = chamberList[index]
        logError(
          'HomeView.fetchChamber()',
          `Failed to fetch chamber data from ${device.mdns} (${device.url})`,
          result.reason
        )
        return {
          mdns: device.mdns,
          url: device.url,
          error: 'Failed to fetch data'
        }
      }
    })
  } catch (err) {
    logError('HomeView.fetchChamber()', 'Unexpected error fetching chamber data', err)
  }
}

async function fetchKegmon() {
  logDebug('HomeView.fetchKegmon()')

  if (!global.showKegmonTaps) {
    kegmonTaps.value = []
    return
  }

  const kegmonList = deviceStore.deviceList.filter((d) => {
    return d.software == 'Kegmon'
  })

  try {
    const results = await Promise.allSettled(
      kegmonList.map(async (device) => {
        return deviceStore.proxyRequest(
          'GET',
          device.url + 'api/status',
          'Content-Type: application/json',
          ''
        )
      })
    )

    kegmonTaps.value = results.map((result, index) => {
      if (result.value !== null) {
        return result.value
      } else {
        const device = kegmonList[index]
        logError(
          'HomeView.fetchKegmon()',
          `Failed to fetch kegmon data from ${device.mdns} (${device.url})`,
          result.reason
        )
        return {
          mdns: device.mdns,
          url: device.url,
          error: 'Failed to fetch data'
        }
      }
    })
  } catch (err) {
    logError('HomeView.fetchKegmon()', 'Unexpected error fetching kegmon data', err)
  }
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
