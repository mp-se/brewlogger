<template>
  <div class="container">
    <p></p>
    <p class="h3">Batch Pressure Graph - '{{ batchName }}'</p>
    <hr />

    <div class="row">
      <PressureStatsFragment v-model="pressureStats"></PressureStatsFragment>
      <!-- 

      <div class="row" v-if="gravityList != null">

        <div class="col-md-2" v-if="graphOptions.velocity">
          <BsInputNumber
            v-model="outlierLimit"
            label="Outlier limit"
            step="0.0001"
            :disabled="global.disabled"
          ></BsInputNumber>
        </div>

        <div class="col-md-1">
          <BsInputBase label="&nbsp;"
            ><button
              @click="apply()"
              type="button"
              class="btn btn-secondary btn-sm"
              :disabled="global.disabled"
            >
              Apply
            </button></BsInputBase
          >
        </div>
      </div> -->

      <div class="col-md-11">
        <canvas id="pressureChart"></canvas>
      </div>
      <div class="col-md-1" v-if="pressureList != null">
        <!-- Right toolbar for controlling contents -->

        <div class="row p-2">
          <p class="fw-bold">Data</p>
          <div class="btn-group-vertical" role="group" aria-label="Vertical button group">
            <button
              @click="filterPressure()"
              type="button"
              class="btn btn-outline-secondary btn-sm"
              :disabled="global.disabled"
            >
              Pressure
            </button>
            <button
              @click="filterTemp()"
              type="button"
              class="btn btn-outline-secondary btn-sm"
              :disabled="global.disabled"
            >
              Temp
            </button>
          </div>
        </div>

        <div class="row p-2">
          <p class="fw-bold">Time</p>
          <div class="btn-group-vertical" role="group" aria-label="Vertical button group">
            <button
              @click="filterAll()"
              type="button"
              class="btn btn-outline-secondary btn-sm"
              :disabled="global.disabled"
            >
              All
            </button>
            <button
              @click="filter24h()"
              type="button"
              class="btn btn-outline-secondary btn-sm"
              :disabled="global.disabled"
            >
              24h
            </button>
            <button
              @click="filter48h()"
              type="button"
              class="btn btn-outline-secondary btn-sm"
              :disabled="global.disabled"
            >
              48h
            </button>
            <button
              @click="filter7d()"
              type="button"
              class="btn btn-outline-secondary btn-sm"
              :disabled="global.disabled"
            >
              7d
            </button>
          </div>
        </div>
        <div class="row p-2">
          <p class="fw-bold">Points</p>
          <p>{{ currentDataCount }}</p>
        </div>
      </div>
    </div>

    <template v-if="pressureList != null">
      <div class="row gy-2">
        <div class="col-md-12"></div>
        <router-link :to="{ name: 'batch-list' }">
          <button type="button" class="btn btn-secondary w-2">
            <i class="bi bi-list"></i>
            Batch list
          </button> </router-link
        >&nbsp;
      </div>
    </template>

    <template v-else>
      <div class="row gy-2">
        <div class="col-md-12"></div>
        <div class="col-md-12">
          <router-link :to="{ name: 'batch-list' }">
            <button type="button" class="btn btn-secondary w-2">Batch list</button> </router-link
          >&nbsp;
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import 'date-fns'
import 'chartjs-adapter-date-fns'
import { config, pressureStore, batchStore, global } from '@/modules/pinia'
import { getPressureDataAnalytics, pressureToBAR, pressureToKPA, tempToF } from '@/modules/utils'
import router from '@/modules/router'
import { logDebug, logError } from '@/modules/logger'

var chart = null // Do not use ref for this, will cause stack overflow...

Chart.register(...registerables, zoomPlugin)

const infoFirstDay = ref(null)
const infoLastDay = ref(null)
const currentDataCount = ref(0)
const batchName = ref('')

watch(infoFirstDay, async (selected) => {
  logDebug('BatchPressureGraphView.watch(infoFirstDay)', selected)
  chart.options.scales.x.min = selected
  chart.update()
})

watch(infoLastDay, async (selected) => {
  logDebug('BatchPressureGraphView.watch(infoLastDay)', selected)
  chart.options.scales.x.max = selected
  chart.update()
})

const pressureList = ref(null)
const pressureStats = ref(null)

const pressureData = ref([])
const batteryData = ref([])
const temperatureData = ref([])

const graphOptions = ref({
  pressure: true,
  temperature: true,
  battery: false
})

function filterPressure() {
  logDebug('BatchPressureGraphView.filterPressure()')
  graphOptions.value = {
    pressure: true,
    temperature: true,
    battery: false
  }
  apply()
}

function filterTemp() {
  logDebug('BatchPressureGraphView.filterTemp()')
  graphOptions.value = {
    pressure: false,
    temperature: true,
    battery: false
  }
  apply()
}

onMounted(async () => {
  logDebug('BatchPressureGraphView.onMounted()')

  pressureList.value = null

  const batch = await batchStore.getBatch(router.currentRoute.value.params.id)
  if (batch) batchName.value = batch.name
  else global.messageError = 'Failed to load batch ' + router.currentRoute.value.params.id

  const gl = await pressureStore.getPressureListForBatch(router.currentRoute.value.params.id)
  if (gl && gl.length > 0) {
    pressureList.value = gl

    // Calculate statistics for the full dataset
    pressureStats.value = getPressureDataAnalytics(pressureList.value)
    infoFirstDay.value = pressureStats.value.date.firstDate
    infoLastDay.value = pressureStats.value.date.lastDate

    pressureList.value.sort((a, b) => Date.parse(a.created) - Date.parse(b.created))

    try {
      const chartOptions = {
        type: 'line',
        data: { datasets: [] },
        options: {
          scales: {},
          animation: false,
          plugins: {
            tooltip: {
              enabled: true
            },
            zoom: {
              pan: {
                enabled: true,
                mode: 'xy'
              },
              zoom: {
                wheel: {
                  enabled: true
                },
                pinch: {
                  enabled: true
                },
                mode: 'xy'
              }
            }
          }
        }
      }

      logDebug('BatchPressureGraphView.onMounted()', 'Creating chart')

      if (document.getElementById('pressureChart') == null) {
        logError('BatchPressureGraphView.onMounted()', 'Unable to find the chart canvas')
      } else {
        // Create the chart
        chart = new Chart(document.getElementById('pressureChart').getContext('2d'), chartOptions)
        updateDataSet()
        chart.update()
        setTimeout(() => {
          filterAll()
        }, 100) // Quick fix so that data is always shown
      }
    } catch (err) {
      logDebug('BatchPressureGraphView.onMounted()', err)
    }
  }
})

function mapPressureData(pList) {
  var result = []

  pList.forEach((p) => {
    result.push({
      x: p.created,
      y: parseFloat(
        new Number(
          config.isPressurePSI
            ? p.pressure
            : config.isPressureBAR
              ? pressureToBAR(p.pressure)
              : pressureToKPA(p.pressure)
        ).toFixed(2)
      )
    })
  })

  return result
}

function mapBatteryData(pList) {
  var result = []

  pList.forEach((p) => {
    result.push({
      x: p.created,
      y: parseFloat(new Number(p.battery).toFixed(2))
    })
  })

  return result
}

function mapTemperatureData(pList) {
  var result = []

  pList.forEach((p) => {
    // -273 refers to invalid temperature or missing temperature sensor
    if (p.temperature > -270) {
      result.push({
        x: p.created,
        y: parseFloat(
          new Number(config.isTempC ? p.temperature : tempToF(p.temperature)).toFixed(2)
        )
      })
    }
  })

  return result
}

function apply() {
  logDebug('BatchPressureGraphView.apply()')
  updateDataSet()
  chart.update()
}

function updateDataSet() {
  logDebug('BatchPressureGraphView.updateDataSet()')

  const filteredPressureList = pressureList.value.filter((p) => p.active)

  pressureStats.value = getPressureDataAnalytics(filteredPressureList)

  pressureData.value = mapPressureData(filteredPressureList)
  batteryData.value = mapBatteryData(filteredPressureList)
  temperatureData.value = mapTemperatureData(filteredPressureList)

  currentDataCount.value = pressureData.value.length
  configureChart(graphOptions.value)
}

function configureChart(config) {
  chart.data.datasets = []

  if (config.pressure) {
    chart.data.datasets.push({
      label: 'Pressure',
      data: pressureData.value,
      borderColor: 'green',
      backgroundColor: 'green',
      yAxisID: 'yPressure',
      pointRadius: 0,
      cubicInterpolationMode: 'monotone',
      tension: 0.4
    })
  }

  if (config.pressure) {
    chart.config.options.scales.yPressure = {
      type: 'linear',
      position: 'left',
      title: {
        display: true,
        text: 'Pressure'
      }
    }
  } else {
    if (chart.config.options.scales.yPressure) {
      delete chart.config.options.scales.yPressure
    }
  }

  if (config.temperature) {
    chart.data.datasets.push({
      label: 'Temperature',
      data: temperatureData.value,
      borderColor: 'blue',
      backgroundColor: 'blue',
      yAxisID: 'yTemp',
      pointRadius: 0,
      cubicInterpolationMode: 'monotone',
      tension: 0.4
    })
  }

  if (config.temperature) {
    chart.config.options.scales.yTemp = {
      type: 'linear',
      position: 'right',
      title: {
        display: true,
        text: 'Temperataure'
      }
    }
  } else {
    if (chart.config.options.scales.yTemp) {
      delete chart.config.options.scales.yTemp
    }
  }

  if (config.battery) {
    chart.data.datasets.push({
      label: 'Battery',
      data: batteryData.value,
      borderColor: 'orange',
      backgroundColor: 'orange',
      yAxisID: 'yVolt',
      pointRadius: 0,
      cubicInterpolationMode: 'monotone',
      tension: 0.4
    })
  }

  if (config.battery) {
    chart.config.options.scales.yVolt = {
      type: 'linear',
      position: 'right',
      title: {
        display: true,
        text: 'Voltage'
      }
    }
  } else {
    if (chart.config.options.scales.yVolt) {
      delete chart.config.options.scales.yVolt
    }
  }

  chart.config.options.scales.x = {
    type: 'time',
    time: {
      unit: 'hour',
      displayFormats: {
        hour: 'E HH:mm',
        day: 'HH:mm',
        week: 'E HH:mm',
        month: 'd HH:mm'
      }
    },
    min: pressureStats.value.date.first,
    max: pressureStats.value.date.last
  }

  logDebug('AAAA:', chart.getInitialScaleBounds())
  logDebug('AAAA:', chart.getZoomedScaleBounds(), chart.isZoomedOrPanned())
}

function filter24h() {
  logDebug('BatchPressureGraphView.filter24h()')

  var d = Date.parse(pressureStats.value.date.last.substring(0, 10)) - 86400000 * 1
  infoFirstDay.value = new Date(d).toISOString().substring(0, 10)
  updateDataSet()
  chart.update()
}

function filter48h() {
  logDebug('BatchPressureGraphView.filter48h()')

  var d = Date.parse(pressureStats.value.date.last.substring(0, 10)) - 86400000 * 2
  infoFirstDay.value = new Date(d).toISOString().substring(0, 10)
  updateDataSet()
  chart.update()
}

function filter7d() {
  logDebug('BatchPressureGraphView.filter7d()')

  var d = Date.parse(pressureStats.value.date.last.substring(0, 10)) - 86400000 * 7
  infoFirstDay.value = new Date(d).toISOString().substring(0, 10)
  infoLastDay.value = pressureStats.value.date.last.substring(0, 10)
  updateDataSet()
  chart.update()
}

function filterAll() {
  logDebug('BatchPressureGraphView.filterAll()')

  infoFirstDay.value = pressureStats.value.date.first.substring(0, 10)
  infoLastDay.value = pressureStats.value.date.last.substring(0, 10)
  updateDataSet()
  chart.update()
}
</script>
