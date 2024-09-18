<template>
  <div class="container">
    <p></p>
    <p class="h2">Gravity - Formula</p>
    <hr />

    <form @submit.prevent="save" class="needs-validation" novalidate>
      <div class="row" v-if="device">
        <div class="col-md-9">
          <BsInputText
            v-model="device.gravityFormula"
            maxlength="200"
            label="Gravity formula"
            help="Formula used to convert angle to gravity"
            :disabled="global.disabled"
          >
          </BsInputText>
        </div>

        <div class="col-md-3">
          <BsDropdown
            label="Formulas"
            button="Formula"
            :options="formulas"
            :callback="formulaCallback"
            :disabled="formulas == null"
          />
        </div>

        <div class="col-md-12">
          <hr />
        </div>

        <div class="col-md-12">
          <label class="form-label fw-bold">Data for gravity calculation (Angle and Gravity)</label>
        </div>

        <template v-for="(data, index) in devicePoly" :key="index">
          <div class="col-md-6">
            <div class="input-group has-validation">
              <span class="input-group-text">{{ index + 1 }}</span>
              <input
                v-model="devicePoly[index].a"
                class="form-control w-2"
                type="number"
                min="0"
                max="90"
                step=".001"
                :disabled="global.disabled"
              />
              <span class="input-group-text">{{ '°' }}</span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="input-group has-validation">
              <span class="input-group-text">{{ index + 1 }}</span>
              <input
                v-model="devicePoly[index].g"
                class="form-control"
                type="number"
                min="1"
                max="10"
                step=".0001"
                :disabled="global.disabled"
              />
              <span class="input-group-text">{{ config.gravityFormat }}</span>
            </div>
          </div>
        </template>

        <div class="form-text">
          Enter the data that is used to create a new formula. The most optimal formula will be
          selected and also validated towards these values.
        </div>
      </div>

      <div class="row gy-2">
        <div class="col-md-12">
          <hr />
        </div>
        <div class="col-md-12">
          <button type="submit" class="btn btn-primary w-2" :disabled="global.disabled">
            <span
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
              :hidden="!global.disabled"
            ></span>
            &nbsp;Save</button
          >&nbsp;

          <button
            @click.prevent="calcFormula"
            type="button"
            class="btn btn-primary w-2"
            :disabled="global.disabled"
          >
            <span
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
              :hidden="!global.disabled"
            ></span>
            &nbsp;Update graph</button
          >&nbsp;

          <router-link
            :to="{ name: 'device', params: { id: router.currentRoute.value.params.id } }"
          >
            <button type="button" class="btn btn-secondary w-2" :disabled="global.disabled">
              Back to device
            </button> </router-link
          >&nbsp;
        </div>
      </div>
    </form>

    <div class="col-md-12">
      <hr />
    </div>

    <canvas id="gravityChart" :hidden="polyResult == null"></canvas>

  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { validateCurrentForm } from '@/modules/utils'
import { global, config, deviceStore } from '@/modules/pinia'
import { logDebug, logError } from '@/modules/logger'
import router from '@/modules/router'
import {
  Chart as ChartJS,
  Legend,
  LineController,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js'

const device = ref(null)
const devicePoly = ref(null)
const polyResult = ref(null)
const formulas = ref(null)

const chartFormula = ref([])
const chartData = ref([])
const chartOrder1 = ref([])
const chartOrder2 = ref([])
const chartOrder3 = ref([])
const chartOrder4 = ref([])

var chart = null

const dataSetChart = ref({
  datasets: [
  {
      label: 'Current formula',
      borderColor: 'red',
      backgroundColor: 'red',
      data: chartFormula.value
    },
    {
      label: 'Input values',
      borderColor: 'blue',
      backgroundColor: 'blue',
      data: chartData.value
    },
    {
      label: 'Order 1',
      borderColor: 'green',
      backgroundColor: 'green',
      data: chartOrder1.value
    },
    {
      label: 'Order 2',
      borderColor: 'purple',
      backgroundColor: 'purple',
      data: chartOrder2.value
    },
    {
      label: 'Order 3',
      borderColor: 'orange',
      backgroundColor: 'orange',
      data: chartOrder3.value
    },
    {
      label: 'Order 4',
      borderColor: 'pink',
      backgroundColor: 'pink',
      data: chartOrder4.value
    }
  ]
})

const chartOptions = ref({
  type: 'line',
  data: dataSetChart.value,
  options: {
    responsive: true,
    interaction: {
      intersect: false
    },
    scales: {
      x: {
        display: true,
        type: 'linear',
        grace: '5%',
        title: {
          display: true,
          text: 'Angle'
        },
        ticks: {
          crossAlign: 'far'
        },
        suggestedMin: 25
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Gravity'
        },
        suggestedMin: 1.0
      }
    }
  }
})

const formulaCallback = (opt) => {
  device.value.gravityFormula =  opt
}

onMounted(() => {
  logDebug('DeviceGravityView.onMounted()')

  device.value = null

  // Fetch data on the current device
  deviceStore.getDevice(router.currentRoute.value.params.id, (success, d) => {
    if (success && d.software == 'Gravitymon') {
      device.value = d
      logDebug('DeviceGravityView.onMounted()', d)

      devicePoly.value = []

      // device.value.gravityPoly = "" // TODO: REMOVE

      try {
        devicePoly.value = JSON.parse(device.value.gravityPoly)
      } catch (e) {
        logError('DeviceGravityView.onMounted()', 'No valid json found in poly field')

        try {
          var config = JSON.parse(device.value.config)

          console.log(config)
          console.log(config.config)

          // Try to extract data from saved device config
          if (config.config !== undefined && config.config.formula_calculation_data !== undefined) {
            devicePoly.value = config.config.formula_calculation_data
            device.value.gravityFormula = config.config.gravity_formula
          }
        } catch (e) {
          logError('DeviceGravityView.onMounted()', 'No valid json found in config')
        }

        if (devicePoly.value.length == 0)
          devicePoly.value = [
            { a: 0, g: 1.0 },
            { a: 0, g: 1.0 },
            { a: 0, g: 1.0 },
            { a: 0, g: 1.0 },
            { a: 0, g: 1.0 },
            { a: 0, g: 1.0 },
            { a: 0, g: 1.0 },
            { a: 0, g: 1.0 },
            { a: 0, g: 1.0 },
            { a: 0, g: 1.0 }
          ]
      }

      logDebug('DeviceGravityView.onMounted()', devicePoly.value)

      ChartJS.register(Legend, LinearScale, PointElement, LineController, LineElement)

      chart = new ChartJS(document.getElementById('gravityChart'), chartOptions.value)
    } else {
      // global.messageError = "Failed to load device " + id
    }
  })
})

const calcFormula = () => {
  if (!validateCurrentForm()) return

  global.clearMessages()

  console.log(devicePoly.value)

  // TODO: Remove test data
  //devicePoly.value = [ { a: 25, g: 1.000}, { a: 30, g: 1.010}, { a: 36, g: 1.021}, { a: 42, g: 1.034}, { a: 49, g: 1.039}, { a: 0, g: 1.000}, { a: 0, g: 1.000}, { a: 0, g: 1.000}, { a: 0, g: 1.000}, { a: 0, g: 1.000} ]

  global.disabled = true
  fetch(global.baseURL + 'api/gravity/calculate/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: global.token },
    body: JSON.stringify(devicePoly.value),
    signal: AbortSignal.timeout(global.fetchTimout)
  })
    .then((res) => {
      logDebug('DeviceGravityView.calcFormula()', res.status)
      return res.json()
    })
    .then((json) => {
      global.disabled = false

      if (json.poly1 == '' && json.poly2 == '' && json.poly3 == '' && json.poly4 == '') {
        global.messageError = 'Unable to create a formula based on supplied values'
        polyResult.value = null
      } else {
        logDebug('DeviceGravityView.calcFormula()', json)

        polyResult.value = json
        formulas.value = []

        if(json.poly1 != "")
          formulas.value.push( { value: json.poly1, label: "Formula Order 1"})
        if(json.poly2 != "")
          formulas.value.push( { value: json.poly2, label: "Formula Order 2"})
        if(json.poly3 != "")
          formulas.value.push( { value: json.poly3, label: "Formula Order 3"})
        if(json.poly4 != "")
          formulas.value.push( { value: json.poly4, label: "Formula Order 4"})

        updateDataSets()
        chart.data.datasets[0].data = chartFormula.value
        chart.data.datasets[1].data = chartData.value
        chart.data.datasets[2].data = chartOrder1.value
        chart.data.datasets[3].data = chartOrder2.value
        chart.data.datasets[4].data = chartOrder3.value
        chart.data.datasets[5].data = chartOrder4.value
        chart.update()
      }
    })
    .catch((err) => {
      logError('DeviceGravityView.calcFormula()', err)
      global.disabled = false
    })
}

const updateDataSets = () => {
  chartFormula.value = evalPoly(device.value.gravityFormula)

  // Entered values
  chartData.value = []
  devicePoly.value.forEach((e) => {
    if (e.a > 0)
      chartData.value.push({
        x: e.a,
        y: config.isGravityP ? convertToPlato(e.g) : e.g
      })
  })

  // Entered values
  chartOrder1.value = evalPoly(polyResult.value.poly1)
  chartOrder2.value = evalPoly(polyResult.value.poly2)
  chartOrder3.value = evalPoly(polyResult.value.poly3)
  chartOrder4.value = evalPoly(polyResult.value.poly4)
}

const evalPoly = (formula) => {
  if (formula == '') return []

  var result = []

  for (let a = 25.0; a < 80.0; a += 5.0) {
    let angle = a.toFixed(3)
    let f = formula

    f = f.replaceAll('tilt^4', angle + '*' + angle + '*' + angle + '*' + angle)
    f = f.replaceAll('tilt^3', angle + '*' + angle + '*' + angle)
    f = f.replaceAll('tilt^2', angle + '*' + angle)
    f = f.replaceAll('tilt', angle)

    try {
      var g = eval(f)

      if (config.isGravityP) g = convertToPlato(g)

      result.push({ x: parseFloat(a), y: parseFloat(g) })
    } catch (err) {
      logError('DeviceGravityView.evalPoly()', err)
    }
  }

  return result
}

const convertToPlato = (sg) => {
  return 259 - 259 / sg
}

const save = () => {
  if (!validateCurrentForm()) return

  device.value.gravityPoly = JSON.stringify(devicePoly.value)
  console.log(device.value)

  deviceStore.updateDevice(device.value, (success) => {
    if (success) global.messageSuccess = 'Device saved'
    else global.messageError = 'Failed to update device'
  })
}
</script>
