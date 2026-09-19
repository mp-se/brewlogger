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
    <p></p>
    <p class="h3">Batch Gravity Graph Compare</p>
    <hr />

    <div class="row">
      <div class="col-md-12">
        <p class="fw-normal">
          Compare up to 3 batches of gravity data on the same graph. Select batches
        </p>
      </div>

      <div class="col-md-3">
        <BsSelect v-model="batchId1" :options="batchList" label="Batch 1" with="4"></BsSelect>
      </div>

      <div class="col-md-3">
        <BsSelect v-model="batchId2" :options="batchList" label="Batch 2" with="4"></BsSelect>
      </div>

      <div class="col-md-3">
        <BsSelect v-model="batchId3" :options="batchList" label="Batch 3" with="4"></BsSelect>
      </div>

      <div class="col-md-3">
        <BsSelect
          v-model="timeAdjustment"
          :options="timeAdjustmentOptions"
          label="Time Adjustment"
          with="4"
        >
        </BsSelect>
      </div>

      <div class="col-md-12">
        <canvas id="gravityChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import 'date-fns'
import 'chartjs-adapter-date-fns'
import { config, gravityStore, batchStore } from '@/modules/pinia'
import { gravityToPlato } from '@/modules/utils'
import { logDebug, logError } from '@/modules/logger'

var chart = null // Do not use ref for this, will cause stack overflow...

Chart.register(...registerables, zoomPlugin)

const batchList = ref([])
const timeAdjustmentOptions = ref([
  { value: 'none', label: 'No adjustment' },
  { value: 'start', label: 'Align by start date' },
  { value: 'end', label: 'Align by end date' }
])

const batchId1 = ref(0)
const batchId2 = ref(0)
const batchId3 = ref(0)
const timeAdjustment = ref('none')

const gravityList1 = ref(null)
const gravityList2 = ref(null)
const gravityList3 = ref(null)

const gravityData1 = ref([])
const gravityData2 = ref([])
const gravityData3 = ref([])

watch(batchId1, () => {
  updateGraph()
})

watch(batchId2, () => {
  updateGraph()
})

watch(batchId3, () => {
  updateGraph()
})

watch(timeAdjustment, () => {
  createGraph()
})

async function updateGraph() {
  gravityList1.value = []
  gravityList2.value = []
  gravityList3.value = []

  if (batchId1.value != 0) {
    const gl1 = await gravityStore.getGravityListForBatch(batchId1.value)
    if (gl1) {
      gravityList1.value = gl1
      gravityList1.value.sort((a, b) => Date.parse(a.created) - Date.parse(b.created))
    }
  }

  if (batchId2.value != 0) {
    const gl2 = await gravityStore.getGravityListForBatch(batchId2.value)
    if (gl2) {
      gravityList2.value = gl2
      gravityList2.value.sort((a, b) => Date.parse(a.created) - Date.parse(b.created))
    }
  }

  if (batchId3.value != 0) {
    const gl3 = await gravityStore.getGravityListForBatch(batchId3.value)
    if (gl3) {
      gravityList3.value = gl3
      gravityList3.value.sort((a, b) => Date.parse(a.created) - Date.parse(b.created))
    }
  }

  createGraph()
}

function createGraph() {
  // Calculate minimum and maximum timestamps for each batch
  const minTime1 =
    gravityList1.value && gravityList1.value.length > 0
      ? Math.min(...gravityList1.value.map((g) => Date.parse(g.created)))
      : null
  const maxTime1 =
    gravityList1.value && gravityList1.value.length > 0
      ? Math.max(...gravityList1.value.map((g) => Date.parse(g.created)))
      : null

  const minTime2 =
    gravityList2.value && gravityList2.value.length > 0
      ? Math.min(...gravityList2.value.map((g) => Date.parse(g.created)))
      : null
  const maxTime2 =
    gravityList2.value && gravityList2.value.length > 0
      ? Math.max(...gravityList2.value.map((g) => Date.parse(g.created)))
      : null

  const minTime3 =
    gravityList3.value && gravityList3.value.length > 0
      ? Math.min(...gravityList3.value.map((g) => Date.parse(g.created)))
      : null
  const maxTime3 =
    gravityList3.value && gravityList3.value.length > 0
      ? Math.max(...gravityList3.value.map((g) => Date.parse(g.created)))
      : null

  // Calculate durations and find max
  const duration1 = maxTime1 && minTime1 ? maxTime1 - minTime1 : 0
  const duration2 = maxTime2 && minTime2 ? maxTime2 - minTime2 : 0
  const duration3 = maxTime3 && minTime3 ? maxTime3 - minTime3 : 0
  const maxDuration = Math.max(duration1, duration2, duration3)

  gravityData1.value = mapGravityData(gravityList1.value, minTime1, maxTime1, maxDuration)
  gravityData2.value = mapGravityData(gravityList2.value, minTime2, maxTime2, maxDuration)
  gravityData3.value = mapGravityData(gravityList3.value, minTime3, maxTime3, maxDuration)

  try {
    var chartOptions = {
      type: 'line',
      data: {
        datasets: []
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'hour',
              displayFormats: {
                hour: 'E HH:mm',
                day: 'HH:mm',
                week: 'E HH:mm',
                month: 'd HH:mm'
              }
            }
          },
          yGravity: {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Gravity'
            }
          }
        },
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

    if (gravityData1.value.length > 0) {
      chartOptions.data.datasets.push({
        label: 'Batch 1',
        data: gravityData1.value,
        borderColor: 'blue',
        backgroundColor: 'blue',
        yAxisID: 'yGravity',
        pointRadius: 0,
        cubicInterpolationMode: 'monotone',
        tension: 0.4
      })
    }

    if (gravityData2.value.length > 0) {
      chartOptions.data.datasets.push({
        label: 'Batch 2',
        data: gravityData2.value,
        borderColor: 'green',
        backgroundColor: 'green',
        yAxisID: 'yGravity',
        pointRadius: 0,
        cubicInterpolationMode: 'monotone',
        tension: 0.4
      })
    }

    if (gravityData3.value.length > 0) {
      chartOptions.data.datasets.push({
        label: 'Batch 3',
        data: gravityData3.value,
        borderColor: 'red',
        backgroundColor: 'red',
        yAxisID: 'yGravity',
        pointRadius: 0,
        cubicInterpolationMode: 'monotone',
        tension: 0.4
      })
    }

    if (document.getElementById('gravityChart') == null) {
      logError('BatchGravityGraphCompareView.onMounted()', 'Unable to find the chart canvas')
    } else {
      if (chart != null) {
        chart.destroy()
      }
      chart = new Chart(document.getElementById('gravityChart').getContext('2d'), chartOptions)
      chart.update()
    }
  } catch (err) {
    logDebug('BatchGravityGraphCompareView.onMounted()', err)
  }
}

onMounted(() => {
  logDebug('BatchGravityGraphCompareView.onMounted()')

  batchStore.batchList.forEach((b) => {
    batchList.value.push({
      value: b.id,
      label: b.name
    })
  })
})

function mapGravityData(gList, minTime, maxTime, maxDuration) {
  var result = []

  if (gList == null) {
    return result
  }

  gList.forEach((g) => {
    let x = g.created

    if (timeAdjustment.value !== 'none' && minTime != null) {
      const referenceDate = new Date('2000-01-01T00:00:00Z').getTime()
      let timeInMs = 0

      if (timeAdjustment.value === 'start') {
        // Align by start date
        timeInMs = Date.parse(g.created) - minTime
      } else if (timeAdjustment.value === 'end') {
        // Align by end date
        const currentDuration = maxTime - minTime
        const offset = maxDuration - currentDuration
        timeInMs = offset + (Date.parse(g.created) - minTime)
      }

      const normalizedDate = new Date(referenceDate + timeInMs)
      x = normalizedDate
    }

    result.push({
      x: x,
      y: parseFloat(
        new Number(config.isGravitySG ? g.gravity : gravityToPlato(g.gravity)).toFixed(4)
      )
    })
  })

  return result
}
</script>
