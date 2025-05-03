<template>
  <div class="container">
    <p></p>
    <p class="h3">Batch Gravity Graph - '{{ batchName }}'</p>
    <hr />

    <div class="row">
      <GravityStatsFragment v-model="gravityStats"></GravityStatsFragment>

      <div class="row" v-if="gravityList != null">
        <div class="col-md-2">
          <BsInputNumber
            v-model="infoOG"
            label="Filter OG"
            step="0.001"
            :disabled="global.disabled"
          ></BsInputNumber>
        </div>
        <div class="col-md-2">
          <BsInputNumber
            v-model="infoFG"
            label="Filter FG"
            step="0.001"
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
      </div>

      <div class="col-md-11">
        <canvas id="gravityChart"></canvas>
      </div>
      <div class="col-md-1" v-if="gravityList != null">
        <!-- Right toolbar for controlling contents -->

        <div class="row p-2">
          <p class="fw-bold">Data</p>
          <div class="btn-group-vertical" role="group" aria-label="Vertical button group">
            <button
              @click="filterGravity()"
              type="button"
              class="btn btn-outline-secondary btn-sm"
              :disabled="global.disabled"
            >
              Gravity
            </button>
            <button
              @click="filterTemp()"
              type="button"
              class="btn btn-outline-secondary btn-sm"
              :disabled="global.disabled"
            >
              Temp
            </button>
            <button
              @click="filterDevice()"
              type="button"
              class="btn btn-outline-secondary btn-sm"
              :disabled="global.disabled"
            >
              Device
            </button>
            <button
              @click="filterVelocity()"
              type="button"
              class="btn btn-outline-secondary btn-sm"
              :disabled="global.disabled"
            >
              Velocity
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
          <p class="fw-bold">Filters</p>
          <div class="btn-group-vertical" role="group" aria-label="Vertical button group">
            <button
              @click="filterAll()"
              type="button"
              class="btn btn-outline-secondary btn-sm"
              :disabled="global.disabled"
            >
              Clear
            </button>

            <input
              v-model="lowpass"
              class="form-control form-control-sm"
              type="number"
              :disabled="global.disabled"
            />

            <button
              @click="filterLowPass()"
              type="button"
              class="btn btn-outline-secondary btn-sm"
              :disabled="global.disabled"
            >
              Lowpass
            </button>          
          </div>
        </div>
        <div class="row p-2">
          <p class="fw-bold">Points</p>
          <p>{{ currentDataCount }}</p>
        </div>
      </div>
    </div>

    <template v-if="gravityList != null">
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
import { config, gravityStore, batchStore, global } from '@/modules/pinia'
import router from '@/modules/router'
import { gravityToPlato, tempToF, getGravityDataAnalytics, abv } from '@/modules/utils'
import { logDebug, logError } from '@/modules/logger'
import LowpassFilter from 'lowpassf'

var chart = null // Do not use ref for this, will cause stack overflow...

Chart.register(...registerables, zoomPlugin)

const infoFirstDay = ref(null)
const infoLastDay = ref(null)
const infoOG = ref(null)
const infoFG = ref(null)
const currentDataCount = ref(0)
const batchName = ref('')

// For testing lowpass
const lowpass = ref(4)

watch(infoFirstDay, async (selected) => {
  logDebug('BatchGravityGraphView.watch(infoFirstDay)', selected)
  chart.options.scales.x.min = selected
  chart.update()
})

watch(infoLastDay, async (selected) => {
  logDebug('BatchGravityGraphView.watch(infoLastDay)', selected)
  chart.options.scales.x.max = selected
  chart.update()
})

const gravityList = ref(null)
const gravityStats = ref(null)

const gravityData = ref([])
const gravityVelocityData = ref([])
const gravityVelocityData1 = ref([])
const alcoholData = ref([])
const batteryData = ref([])
const temperatureData = ref([])
const chamberData = ref([])

const graphOptions = ref({
  gravity: true,
  temperature: true,
  battery: false,
  alcohol: true,
  chamber: false,
  velocity: false
})

function filterGravity() {
  logDebug('BatchGravityGraphView.filterGravity()')
  graphOptions.value = {
    gravity: true,
    temperature: true,
    battery: false,
    alcohol: true,
    chamber: false,
    velocity: false
  }
  apply()
}

function filterTemp() {
  logDebug('BatchGravityGraphView.filterTemp()')
  graphOptions.value = {
    gravity: false,
    temperature: true,
    battery: false,
    alcohol: false,
    chamber: true,
    velocity: false
  }
  apply()
}

function filterDevice() {
  logDebug('BatchGravityGraphView.filterDevice()')
  graphOptions.value = {
    gravity: false,
    temperature: false,
    battery: true,
    alcohol: false,
    chamber: false,
    velocity: false
  }
  apply()
}

function filterVelocity() {
  logDebug('BatchGravityGraphView.filterVelocity()')
  graphOptions.value = {
    gravity: true,
    temperature: false,
    battery: false,
    alcohol: false,
    chamber: false,
    velocity: true
  }
  apply()
}

onMounted(() => {
  logDebug('BatchGravityGraphView.onMounted()')

  gravityList.value = null

  batchStore.getBatch(router.currentRoute.value.params.id, (success, b) => {
    if (success) batchName.value = b.name
    else global.messageError = 'Failed to load batch ' + router.currentRoute.value.params.id
  })

  gravityStore.getGravityListForBatch(router.currentRoute.value.params.id, (success, gl) => {
    if (success) {
      gravityList.value = gl

      // Calculate statistics for the full dataset
      gravityStats.value = getGravityDataAnalytics(gravityList.value)
      infoFirstDay.value = gravityStats.value.date.firstDate
      infoLastDay.value = gravityStats.value.date.lastDate
      infoOG.value = Number.parseFloat(
        new Number(gravityStats.value.gravity.max).toFixed(config.isGravitySG ? 3 : 2)
      )
      infoFG.value = Number.parseFloat(
        new Number(gravityStats.value.gravity.min).toFixed(config.isGravitySG ? 3 : 2)
      )

      gravityList.value.sort((a, b) => Date.parse(a.created) - Date.parse(b.created))

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

        logDebug('BatchGravityGraphView.onMounted()', 'Creating chart')

        if (document.getElementById('gravityChart') == null) {
          logError('BatchGravityGraphView.onMounted()', 'Unable to find the chart canvas')
        } else {
          // Create the chart
          chart = new Chart(document.getElementById('gravityChart').getContext('2d'), chartOptions)
          updateDataSet()
          chart.update()
          setTimeout(() => {
            filterAll()
          }, 100) // Quick fix so that data is always shown
        }
      } catch (err) {
        logDebug('BatchGravityGraphView.onMounted()', err)
      }
    }
  })
})

function mapGravityData(gList) {
  var result = []

  gList.forEach((g) => {
    result.push({
      x: g.created,
      y: parseFloat(
        new Number(config.isGravitySG ? g.gravity : gravityToPlato(g.gravity)).toFixed(4)
      )
    })
  })

  return result
}

function mapBatteryData(gList) {
  var result = []

  gList.forEach((g) => {
    result.push({
      x: g.created,
      y: parseFloat(new Number(g.battery).toFixed(2))
    })
  })

  return result
}

function mapTemperatureData(gList) {
  var result = []

  gList.forEach((g) => {
    result.push({
      x: g.created,
      y: parseFloat(new Number(config.isTempC ? g.temperature : tempToF(g.temperature)).toFixed(2))
    })
  })

  return result
}

function mapAlcoholData(gList) {
  var result = []
  const og = Math.max(...gList.map((g) => g.gravity))

  gList.forEach((g) => {
    result.push({
      x: g.created,
      y: parseFloat(new Number(abv(og, g.gravity)).toFixed(2))
    })
  })

  return result
}

function mapChamberData(gList) {
  var result = []

  gList
    .filter((g) => g.chamberTemperature !== undefined)
    .forEach((g) => {
      result.push({
        x: g.created,
        y: new Number(
          config.isTempC ? g.chamberTemperature : tempToF(g.chamberTemperature)
        ).toFixed(2)
      })
    })

  return result
}

function average(arr) {
  if (arr.length === 0) return 0; 
  const sum = arr.reduce((acc, val) => acc + val, 0);
  return sum / arr.length;
}

function mapGravityVelocityData(gList) {
  gravityVelocityData1.value = []

  const pointsPerWindow = 4*4 // Assume 15 minute interval, window of 1 hour
  // const pointsPerWindow = 4*4 // Assume 15 minute interval, window of 4 hour
  // const pointsPerWindow = 4*6 // Assume 15 minute interval, window of 6 hour
  var temp = []
  var result = []

  var filter = new LowpassFilter()
  // filter.setLogic(filter.LinearWeightAverage);
  filter.setLogic(filter.SimpleAverage);
  filter.setSamplingRange(4);

  // First get the average value per window
  for (var i = 0; i < gList.length - pointsPerWindow; i++) {
      const list = gList.slice(i, i + pointsPerWindow)
      var lowpass = []

      // Run the data through the lowpass filter
      list.forEach(g => {
        filter.putValue(g.gravity)
        lowpass.push(filter.getFilteredValue())
      })

      temp.push({
      x: new Date(list[list.length - 1].created),
      // y: parseFloat(new Number(average(list.map((g) => g.gravity)) * 1000).toFixed(2))
      y: average(list.map((g) => g.gravity))
      // y: average(lowpass)
    })      

    // logDebug("Lowpass", average(lowpass), average(list.map((g) => g.gravity)))
  }

  // gravityVelocityData1.value = temp

  // Calculate the average velocity
  filter = new LowpassFilter()
  filter.setLogic(filter.SimpleAverage);
  filter.setSamplingRange(4);

  for (i = 1; i < temp.length; i++) {
    filter.putValue(temp[i].y - temp[i - 1].y)

    result.push({
      x: temp[i].x,
      // y: (temp[i].y - temp[i - 1].y) * 10000
      y: filter.getFilteredValue() * 10000
    })      
  }

  return result
}


function apply() {
  logDebug('BatchGravityGraphView.apply()')
  updateDataSet()
  chart.update()
}

function updateDataSet() {
  logDebug('BatchGravityGraphView.updateDataSet()')

  const filteredGravityList = gravityList.value.filter(
    (g) => g.active && g.gravity >= infoFG.value && g.gravity <= infoOG.value
  )

  gravityStats.value = getGravityDataAnalytics(filteredGravityList)

  gravityData.value = mapGravityData(filteredGravityList)
  batteryData.value = mapBatteryData(filteredGravityList)
  temperatureData.value = mapTemperatureData(filteredGravityList)
  alcoholData.value = mapAlcoholData(filteredGravityList)
  chamberData.value = mapChamberData(filteredGravityList)

  gravityVelocityData.value = mapGravityVelocityData(
    filteredGravityList
  )

  currentDataCount.value = gravityData.value.length
  configureChart(graphOptions.value)
}

function configureChart(config) {
  chart.data.datasets = []

  if (config.gravity) {
    chart.data.datasets.push({
      label: 'Gravity',
      data: gravityData.value,
      borderColor: 'green',
      backgroundColor: 'green',
      yAxisID: 'yGravity',
      pointRadius: 0,
      cubicInterpolationMode: 'monotone',
      tension: 0.4
    })
  }

  if (config.gravity) {
    chart.config.options.scales.yGravity = {
      type: 'linear',
      position: 'left',
      title: {
        display: true,
        text: 'Gravity'
      }
    }
  } else {
    if (chart.config.options.scales.yGravity) {
      delete chart.config.options.scales.yGravity
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

  if (config.chamber) {
    chart.data.datasets.push({
      label: 'Chamber',
      data: chamberData.value,
      borderColor: 'pink',
      backgroundColor: 'pink',
      yAxisID: 'yTemp',
      pointRadius: 0,
      cubicInterpolationMode: 'monotone',
      tension: 0.4
    })
  }

  if (config.temperature || config.chamber) {
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

  if (config.alcohol) {
    chart.data.datasets.push({
      label: 'Alcohol',
      data: alcoholData.value,
      borderColor: 'red',
      backgroundColor: 'red',
      yAxisID: 'yAlcohol',
      pointRadius: 0,
      cubicInterpolationMode: 'monotone',
      tension: 0.4
    })
  }

  if (config.alcohol) {
    chart.config.options.scales.yAlcohol = {
      type: 'linear',
      position: 'left',
      title: {
        display: true,
        text: 'Alcohol'
      }
    }
  } else {
    if (chart.config.options.scales.yAlcohol) {
      delete chart.config.options.scales.yAlcohol
    }
  }

  if (config.velocity) {
    chart.data.datasets.push({
      label: 'Velocity',
      data: gravityVelocityData.value,
      borderColor: 'silver',
      backgroundColor: 'silver',
      yAxisID: 'yVelocity',
      pointRadius: 0,
      cubicInterpolationMode: 'monotone',
      tension: 0.4
    })
    chart.data.datasets.push({
      label: 'Development',
      data: gravityVelocityData1.value,
      borderColor: 'red',
      backgroundColor: 'red',
      yAxisID: 'yGravity',
      pointRadius: 0,
      cubicInterpolationMode: 'monotone',
      tension: 0.4
    })
  }

  if (config.velocity) {
    chart.config.options.scales.yVelocity = {
      type: 'linear',
      position: 'right',
      title: {
        display: true,
        text: 'Gravity velocity'
      }
    }
  } else {
    if (chart.config.options.scales.yVelocity) {
      delete chart.config.options.scales.yVelocity
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
    min: gravityStats.value.date.first,
    max: gravityStats.value.date.last
  }
}

function filter24h() {
  logDebug('BatchGravityGraphView.filter24h()')

  var d = Date.parse(gravityStats.value.date.last.substring(0, 10)) - 86400000 * 1
  infoFirstDay.value = new Date(d).toISOString().substring(0, 10)
  updateDataSet()
  chart.update()
}

function filter48h() {
  logDebug('BatchGravityGraphView.filter48h()')

  var d = Date.parse(gravityStats.value.date.last.substring(0, 10)) - 86400000 * 2
  infoFirstDay.value = new Date(d).toISOString().substring(0, 10)
  updateDataSet()
  chart.update()
}

function filter7d() {
  logDebug('BatchGravityGraphView.filter7d()')

  var d = Date.parse(gravityStats.value.date.last.substring(0, 10)) - 86400000 * 7
  infoFirstDay.value = new Date(d).toISOString().substring(0, 10)
  infoLastDay.value = gravityStats.value.date.last.substring(0, 10)
  updateDataSet()
  chart.update()
}

function filterAll() {
  logDebug('BatchGravityGraphView.filterAll()')

  infoFirstDay.value = gravityStats.value.date.first.substring(0, 10)
  infoLastDay.value = gravityStats.value.date.last.substring(0, 10)
  updateDataSet()
  chart.update()
}

function applyLowPass(input) {
  logDebug('BatchGravityGraphView.applyLowPass()')

  var filter = new LowpassFilter()
  filter.setLogic(filter.LinearWeightAverage);
  filter.setSamplingRange(lowpass.value);

  var data = []

  // Run the data through the lowpass filter
  input.forEach((i) => {
    filter.putValue(i.y)
    data.push({ x: i.x, y: filter.getFilteredValue() })
  })

  return data
}

function filterLowPass() {
  logDebug('BatchGravityGraphView.filterLowPass()', chart.data.datasets)

  for (var i = 0; i < chart.data.datasets.length; i++) {
    switch (chart.data.datasets[i].label) {
      case 'Gravity':
        chart.data.datasets[i].data = applyLowPass(chart.data.datasets[i].data, 20, 0.002) // Data, Window, Max Deviation limit
        break
      case 'Chamber':
      case 'Temperature':
        chart.data.datasets[i].data = applyLowPass(chart.data.datasets[i].data, 20, 0.4) // Data, Window, Max Deviation limit
        break
      case 'Velocity':
        // Dont filter this.
        break
      case 'Battery':
        chart.data.datasets[i].data = applyLowPass(chart.data.datasets[i].data, 20, 0.1) // Data, Window, Max Deviation limit
        break
      case 'Alcohol':
        chart.data.datasets[i].data = applyLowPass(chart.data.datasets[i].data, 20, 0.1) // Data, Window, Max Deviation limit
        break
    }
  }

  currentDataCount.value = chart.data.datasets[0].data.length
  chart.update()
}

</script>
