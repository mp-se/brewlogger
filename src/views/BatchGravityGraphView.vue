<template>
  <div class="container">
    <p></p>
    <p class="h3">Batch Gravity Graph</p>
    <hr>

    <div class="row">

      <template v-if="gravityStats != null">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-1">
              <BsInputReadonly v-model="gravityStats.gravity.maxString" label="OG"></BsInputReadonly>
            </div>
            <div class="col-md-1">
              <BsInputReadonly v-model="gravityStats.gravity.minString" label="FG"></BsInputReadonly>
            </div>
            <div class="col-md-1">
              <BsInputReadonly v-model="gravityStats.abvString" label="ABV"></BsInputReadonly>
            </div>
            <div class="col-md-1">
              <BsInputReadonly v-model="gravityStats.temperature.maxString" label="Temp"></BsInputReadonly>
            </div>
            <div class="col-md-1">
              <BsInputReadonly v-model="gravityStats.temperature.minString" label="Temp"></BsInputReadonly>
            </div>
            <div class="col-md-1">
              <BsInputReadonly v-model="gravityStats.readings" label="#"></BsInputReadonly>
            </div>
            <div class="col-md-2">
              <BsInputDate v-model="infoFirstDay" label="First date"></BsInputDate>
            </div>
            <div class="col-md-2">
              <BsInputDate v-model="infoLastDay" label="Last date"></BsInputDate>
            </div>
            <!-- 
            <div class="col-md-1">
              <BsInputReadonly v-model="gravityStats.date.firstDate" label="First date"></BsInputReadonly>
            </div>
            <div class="col-md-1">
              <BsInputReadonly v-model="gravityStats.date.lastDate" label="Last date"></BsInputReadonly>
            </div>-->
          </div>
        </div>
      </template>

      <div class="row">
        <div class="col-md-2">
          <BsInputNumber v-model="infoOG" label="Filter OG" step="0.001"></BsInputNumber>
        </div>
        <div class="col-md-2">
          <BsInputNumber v-model="infoFG" label="Filter FG" step="0.001"></BsInputNumber>
        </div>
        <div class="col-md-1">
          <BsInputBase label="&nbsp;"><button @click="apply()" type="button" class="btn btn-secondary btn-sm">
              Apply
            </button></BsInputBase>
        </div>
      </div>

      <div class="col-md-11">
        <canvas id="gravityChart"></canvas>
      </div>
      <div class="col-md-1">
        <div class="row p-2">
          Time
        </div>
        <div class="row p-2">
          <button @click="filterAll()" type="button" class="btn btn-secondary btn-sm">
            All
          </button>
        </div>
        <div class="row p-2">
          <button @click="filter24h()" type="button" class="btn btn-secondary btn-sm">
            24h
          </button>
        </div>
        <div class="row p-2">
          <button @click="filter48h()" type="button" class="btn btn-secondary btn-sm">
            48h
          </button>
        </div>
        <div class="row p-2">
          <button @click="filter7d()" type="button" class="btn btn-secondary btn-sm">
            7d
          </button>
        </div>
        <div class="row p-2">
          Filters
        </div>
        <div class="row p-2">
          <button @click="filterDownsampleLTTB()" type="button" class="btn btn-secondary btn-sm">
            LTTB
          </button>
        </div>
        <div class="row p-2">
          <button @click="filterDownsampleLTD()" type="button" class="btn btn-secondary btn-sm">
            LTD
          </button>
        </div>
        <div class="row p-2">
          <button @click="filterKalman()" type="button" class="btn btn-secondary btn-sm">
            Kalman
          </button>
        </div>
      </div>
    </div>

    <template v-if="gravityList != null">
      <div class="row gy-2">
        <div class="col-md-12">
        </div>
        <router-link :to="{ name: 'batch-list' }">
          <button type="button" class="btn btn-secondary w-2"> <i class="bi bi-list"></i>
            Batch list
          </button>
        </router-link>&nbsp;
      </div>
    </template>

    <template v-else>
      <BsMessage :dismissable="false" :message="'Unable to find gravity for batch with id ' + $route.params.id"
        alert="danger" />
      <div class="row gy-2">
        <div class="col-md-12">
        </div>
        <div class="col-md-12">
          <router-link :to="{ name: 'batch-list' }">
            <button type="button" class="btn btn-secondary w-2">
              Batch list
            </button>
          </router-link>&nbsp;
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from "vue"
import { Chart as ChartJS, Tooltip, Legend, LinearScale, TimeScale, LineController, PointElement, LineElement } from 'chart.js'
import 'date-fns'
import 'chartjs-adapter-date-fns'
import zoomPlugin from 'chartjs-plugin-zoom'
import { config, gravityStore } from "@/modules/pinia"
import { router } from '@/modules/router'
import { gravityToPlato, tempToF, getGravityDataAnalytics } from "@/modules/utils"
import { logDebug, logError, logInfo } from '@/modules/logger'
import { ASAP, SMA, LTOB, LTTB, LTD } from 'downsample';
import { KalmanFilter } from 'kalman-filter'

var chart = null // Do not use ref for this, will cause stack overflow...

const infoFirstDay = ref(null)
const infoLastDay = ref(null)
const infoOG = ref(null)
const infoFG = ref(null)

watch(infoFirstDay, async (selected, previous) => {
  logDebug("BatchGravityView.watch(infoFirstDay)", selected)
  chart.options.scales.x.min = selected
  chart.update()
})

watch(infoLastDay, async (selected, previous) => {
  logDebug("BatchGravityView.watch(infoLastDay)", selected)
  chart.options.scales.x.max = selected
  chart.update()
})

const gravityList = ref(null)
const gravityStats = ref(null)

const gravityData = ref([])
//const pressureData = ref([])
const batteryData = ref([])
const temperatureData = ref([])
const chartData = ref({
  datasets: [{
    label: "Gravity",
    data: gravityData.value,
    borderColor: 'green',
    backgroundColor: 'green',
    yAxisID: 'y1',
    pointRadius: 0,
  }, {
    label: "Temperature",
    data: temperatureData.value,
    borderColor: 'blue',
    backgroundColor: 'blue',
    yAxisID: 'y2',
    pointRadius: 0,
  }, {
    label: "Battery",
    data: batteryData.value,
    borderColor: 'orange',
    backgroundColor: 'orange',
    yAxisID: 'y3',
    pointRadius: 0,
  }/*{
    label: "Pressure",
    data: pressureData.value,
    borderColor: 'red',
    backgroundColor: 'red',
    yAxisID: 'y4',
    pointRadius: 0,
  }, */]
})

const scaleOptions = ref({
  x: {
    type: 'time',
    time: {
      unit: 'hour',
      displayFormats: {
        hour: 'E HH:mm',
        day: 'HH:mm',
        week: 'E HH:mm',
        month: 'd HH:mm',
      }
    },
    min: 0,
    max: 0,
  },
  y1: {
    type: 'linear',
    position: 'left',
    title: {
      display: true,
      text: 'Gravity',
    },
  },
  y2: {
    type: 'linear',
    position: 'right',
    title: {
      display: true,
      text: 'Temperataure',
    },
  },
  y3: {
    type: 'linear',
    position: 'right',
    title: {
      display: true,
      text: 'Voltage',
    },
  },
  /*y4: {
    type: 'linear',
    position: 'left',
    title: {
      display: true,
      text: 'Pressure',
    },
  }*/
})

const chartOptions = ref({
  type: 'line',
  data: chartData.value,
  options: {
    scales: scaleOptions.value,
    animation: false,
  },
  plugins: {
    tooltip: {
      enabled: false,
    },
    zoom: {
      pan: {
        enabled: true,
        mode: 'xy',
        modifierKey: 'ctrl',
      },
      zoom: {
        drag: {
          enabled: true
        },
        mode: 'xy',
      },
    }
  },
})

onMounted(() => {
  logDebug("BatchGravityView.onMounted()")

  ChartJS.register(Legend, LinearScale, TimeScale, PointElement, LineController, LineElement, zoomPlugin)

  gravityList.value = null

  gravityStore.getGravityListForBatch(router.currentRoute.value.params.id, (success, gl) => {
    if (success) {
      gravityList.value = gl
      logDebug("BatchGravityView.onMounted()", gravityList.value)

      // Calculate statistics for the full dataset
      gravityStats.value = getGravityDataAnalytics(gravityList.value)
      infoFirstDay.value = gravityStats.value.date.firstDate
      infoLastDay.value = gravityStats.value.date.lastDate
      infoOG.value = Number.parseFloat(new Number(gravityStats.value.gravity.max).toFixed(config.isGravitySG ? 3 : 2))
      infoFG.value = Number.parseFloat(new Number(gravityStats.value.gravity.min).toFixed(config.isGravitySG ? 3 : 2))

      // Map the data to chartJS format
      updateDataset()

      try {
        logDebug("BatchGravityView.onMounted()", chartOptions.value)

        if (document.getElementById('gravityChart') == null) {
          logError("BatchGravityView.onMounted()", "Unable to find the chart canvas")
        } else {
          // Create the chart
          scaleOptions.value.x.min = infoFirstDay.value
          scaleOptions.value.x.max = infoLastDay.value
          chart = new ChartJS(document.getElementById('gravityChart'), chartOptions.value)
          logDebug("BatchGravityView.onMounted()", chart)
        }
      } catch (err) {
        logDebug("BatchGravityView.onMounted()", err)
      }
    } else {
      // global.messageError = "Failed to load gravity " + id
    }
  })
})

function apply() {
  logDebug("BatchGravityView.apply()")

  // Sort the gravity data so its in date order
  // gravityList.value.sort((a, b) => Date.parse(a.created) - Date.parse(b.created))

  gravityData.value = []
  batteryData.value = []
  temperatureData.value = []
  var gList = []

  gravityList.value.forEach(g => {
    if (g.gravity > infoFG.value && g.gravity < infoOG.value) {
      // Map the attributes into datasets
      var gravity = config.isGravitySG ? g.gravity : gravityToPlato(g.gravity)
      var temperature = config.isTempC ? g.temperature : tempToF(g.temperature)

      gravityData.value.push({ x: g.created, y: gravity })
      batteryData.value.push({ x: g.created, y: g.battery })
      temperatureData.value.push({ x: g.created, y: temperature })

      gList.push(g)
    }
  })

  gravityStats.value = getGravityDataAnalytics(gList)

  chart.data.datasets[0].data = gravityData.value
  chart.data.datasets[1].data = temperatureData.value
  chart.data.datasets[2].data = batteryData.value
  chart.update()
}

function updateDataset() {
  logDebug("BatchGravityView.updateDataset()")

  if (gravityList.value == null)
    return

  // Sort the gravity data so its in date order
  gravityList.value.sort((a, b) => Date.parse(a.created) - Date.parse(b.created))

  // Process the gravity readings
  gravityList.value.forEach(g => {
    // Validate the datapoints if they are withing reasonable 
    var valid = false

    if (g.gravity > 1.0 && g.gravity < 1.1)
      valid = true

    if (valid) {
      // Map the attributes into datasets
      var gravity = config.isGravitySG ? g.gravity : gravityToPlato(g.gravity)
      var temperature = config.isTempC ? g.temperature : tempToF(g.temperature)

      gravityData.value.push({ x: g.created, y: gravity })
      batteryData.value.push({ x: g.created, y: g.battery })
      temperatureData.value.push({ x: g.created, y: temperature })
    }
  })
}

function filter24h() {
  logDebug("BatchGravityView.filter24h()")

  var d = Date.parse(gravityStats.value.date.last.substring(0, 10)) - (86400000 * 1)
  infoFirstDay.value = new Date(d).toISOString().substring(0, 10)
  chart.options.scales.x.max = Date.parse(gravityStats.value.date.last)
  chart.update()
}

function filter48h() {
  logDebug("BatchGravityView.filter48h()")

  var d = Date.parse(gravityStats.value.date.last.substring(0, 10)) - (86400000 * 2)
  infoFirstDay.value = new Date(d).toISOString().substring(0, 10)
  chart.options.scales.x.max = Date.parse(gravityStats.value.date.last)
  chart.update()
}

function filter7d() {
  logDebug("BatchGravityView.filter7d()")

  var d = Date.parse(gravityStats.value.date.last.substring(0, 10)) - (86400000 * 7)
  infoFirstDay.value = new Date(d).toISOString().substring(0, 10)
  infoLastDay.value = gravityStats.value.date.last.substring(0, 10)
  chart.update()
}

function filterAll() {
  logDebug("BatchGravityView.filterAll()")

  infoFirstDay.value = gravityStats.value.date.first.substring(0, 10)
  infoLastDay.value = gravityStats.value.date.last.substring(0, 10)

  chart.data.datasets[0].data = gravityData.value
  chart.data.datasets[1].data = temperatureData.value
  chart.data.datasets[2].data = batteryData.value
  chart.update()
}

function filterDownsampleLTTB() {
  logDebug("BatchGravityView.filterDownsampleLTTB()")

  var count = chart.data.datasets[0].data.length / 2
  chart.data.datasets[0].data = applyLTTB(chart.data.datasets[0].data, count)
  chart.data.datasets[1].data = applyLTTB(chart.data.datasets[1].data, count)
  chart.data.datasets[2].data = applyLTTB(chart.data.datasets[2].data, count)
  chart.update()
}

function filterDownsampleLTD() {
  logDebug("BatchGravityView.filterDownsampleLTD()")

  var count = chart.data.datasets[0].data.length / 2
  chart.data.datasets[0].data = applyLTD(chart.data.datasets[0].data, count)
  chart.data.datasets[1].data = applyLTD(chart.data.datasets[1].data, count)
  chart.data.datasets[2].data = applyLTD(chart.data.datasets[2].data, count)
  chart.update()
}

function filterKalman() {
  logDebug("BatchGravityView.filterKalman()")

  chart.data.datasets[0].data = applyKalman(chart.data.datasets[0].data)
  chart.data.datasets[1].data = applyKalman(chart.data.datasets[1].data)
  chart.data.datasets[2].data = applyKalman(chart.data.datasets[2].data)
  chart.update()
}

function applyLTTB(input, points) {
  logDebug("BatchGravityView.applyLTTB()")

  var data = []

  // Map data to a format that can be handled by the library
  input.forEach(i => {
    data.push([new Date(i.x), i.y])
  })

  const downsampled = LTTB(data, points)

  // Map data back to chart format
  data = []
  downsampled.forEach(d => {
    data.push({ x: d[0].toISOString(), y: d[1] })
  })

  return data
}

function applyLTD(input, points) {
  logDebug("BatchGravityView.applyLTD()")

  var data = []

  // Map data to a format that can be handled by the library
  input.forEach(i => {
    data.push([new Date(i.x), i.y])
  })

  const downsampled = LTD(data, points)

  // Map data back to chart format
  data = []
  downsampled.forEach(d => {
    logDebug(d)
    data.push({ x: d[0].toISOString(), y: d[1] })
  })

  return data
}

function applyKalman(input) {
  logDebug("BatchGravityView.applyKalman()")

  var data = []

  // Map data to a format that can be handled by the library
  input.forEach(i => {
    data.push([Date.parse(i.x), i.y])
  })

  const filtered = new KalmanFilter({ observation: 2, dynamic: 'constant-speed' }).filterAll(data)

  // Map data back to chart format
  data = []
  filtered.forEach(f => {
    data.push({ x: new Date(f[0]).toISOString(), y: f[1] })
  })

  return data
}
</script>