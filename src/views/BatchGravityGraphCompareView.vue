<template>
  <div class="container">
    <p></p>
    <p class="h3">Batch Gravity Graph Compare</p>
    <hr />

    <div class="row">
      <div class="col-md-6">
        <BsSelect v-model="batchId1" :options="batchList" label="Batch 1" with="4"></BsSelect>
      </div>

      <div class="col-md-6">
        <BsSelect v-model="batchId2" :options="batchList" label="Batch 2" with="4"></BsSelect>
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
import { config, gravityStore, batchStore, global } from '@/modules/pinia'
import { gravityToPlato } from '@/modules/utils'
import { logDebug, logError } from '@/modules/logger'

var chart = null // Do not use ref for this, will cause stack overflow...

Chart.register(...registerables, zoomPlugin)

const batchList = ref([])

const batchId1 = ref(208)
const batchId2 = ref(0)

const gravityList1 = ref(null)
const gravityList2 = ref(null)

const gravityData1 = ref([])
const gravityData2 = ref([])

watch(batchId1, () => {
  updateGraph()
})

watch(batchId2, () => {
  updateGraph()
})

function updateGraph() {
  if (batchId1.value != 0 && batchId2.value != 0) {
    gravityStore.getGravityListForBatch(batchId1.value, (success, gl) => {
      if (success) {
        gravityList1.value = gl

        gravityStore.getGravityListForBatch(batchId2.value, (success, gl) => {
          if (success) {
            gravityList2.value = gl

            // Sort data to make sure the points are in date order
            gravityList1.value.sort((a, b) => Date.parse(a.created) - Date.parse(b.created))
            gravityList2.value.sort((a, b) => Date.parse(a.created) - Date.parse(b.created))

            createGraph()
          } else {
            global.messageError = 'Failed to load batch ' + batchId2.value
          }
        })
      } else {
        global.messageError = 'Failed to load batch ' + batchId1.value
      }
    })
  }
}

function createGraph() {
  gravityData1.value = mapGravityData(gravityList1.value)
  gravityData2.value = mapGravityData(gravityList2.value)

  console.log(gravityData1.value)
  console.log(gravityData2.value)

  try {
    const chartOptions = {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Batch 1',
            data: gravityData1.value,
            borderColor: 'blue',
            backgroundColor: 'blue',
            yAxisID: 'yGravity',
            pointRadius: 0,
            cubicInterpolationMode: 'monotone',
            tension: 0.4
          },
          {
            label: 'Batch 2',
            data: gravityData2.value,
            borderColor: 'red',
            backgroundColor: 'red',
            yAxisID: 'yGravity',
            pointRadius: 0,
            cubicInterpolationMode: 'monotone',
            tension: 0.4
          }
        ]
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

    if (document.getElementById('gravityChart') == null) {
      logError('BatchGravityGraphCompareView.onMounted()', 'Unable to find the chart canvas')
    } else {
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

</script>