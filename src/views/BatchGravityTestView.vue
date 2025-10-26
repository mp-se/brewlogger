<template>
  <div class="container">
    <p></p>
    <p class="h3">Batch Gravity Test List - '{{ batchName }}'</p>
    <hr />

    <p>Testing page for gravity related development</p>

    <table>
      <thead>
        <tr>
          <th scope="col" class="col-sm-2">Day</th>
          <th scope="col" class="col-sm-1">Points</th>
          <th scope="col" class="col-sm-1">First</th>
          <th scope="col" class="col-sm-1">Last</th>
          <th scope="col" class="col-sm-1">Min</th>
          <th scope="col" class="col-sm-1">Max</th>
          <th scope="col" class="col-sm-1">L first</th>
          <th scope="col" class="col-sm-1">L last</th>
          <th scope="col" class="col-sm-1">Delta first</th>
          <th scope="col" class="col-sm-1">Delta last</th>
          <th scope="col" class="col-sm-1">Velocity</th>
          <th scope="col" class="col-sm-1">Min/Max</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.day">
          <td>{{ item.day }}</td>
          <td>{{ item.points }}</td>
          <td>{{ new Number(item.first).toFixed(4) }}</td>
          <td>{{ new Number(item.last).toFixed(4) }}</td>
          <td>{{ new Number(item.min).toFixed(4) }}</td>
          <td>{{ new Number(item.max).toFixed(4) }}</td>
          <td>{{ new Number(item.linearFirst).toFixed(4) }}</td>
          <td>{{ new Number(item.linearLast).toFixed(4) }}</td>

          <td>{{ new Number(Math.abs(item.linearFirst - item.first)).toFixed(4) }}</td>
          <td>{{ new Number(Math.abs(item.linearLast - item.last)).toFixed(4) }}</td>

          <td>{{ new Number(item.linearLast - item.linearFirst).toFixed(4) }}</td>
          <td>{{ new Number(item.min - item.max).toFixed(4) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { gravityStore, batchStore } from '@/modules/pinia'
import router from '@/modules/router'
import { logDebug, logError } from '@/modules/logger'
import regression from 'regression'

const gravityList = ref(null)
const batchName = ref('')
const data = ref([])

onMounted(async () => {
  logDebug('BatchGravityTestView.onMounted()')

  gravityList.value = null

  const b = await batchStore.getBatch(router.currentRoute.value.params.id)
  if (b) batchName.value = b.name

  const gl = await gravityStore.getGravityListForBatch(router.currentRoute.value.params.id)
  if (gl) {
    gravityList.value = gl
    data.value = test(gravityList.value, 30)
  } else {
    logError(
      'BatchGravityTestView.onMounted()',
      'Failed to load gravity',
      router.currentRoute.value.params.id
    )
  }
})

function filterOutliers(data, limit) {
  var count = 0
  var newList = []

  newList.push(data[0])

  for (let i = 1; i < data.length; i++) {
    const p = data[i - 1]
    const g = data[i]

    if (Math.abs(g.gravity - p.gravity) > limit) {
      logDebug('Current: ' + g.gravity + ' Previous: ' + p.gravity)
      count++
    } else {
      newList.push(g)
    }
  }

  logDebug('Outliers removed: ' + count)
  return newList
}

function test(gList, window) {
  var result = []

  const map = new Map()

  if (window === undefined) window = 96 // assume 15 minutes per day

  gList = filterOutliers(gList, 0.002)

  // Prepare data for gravity velocity, one array per day
  gList.forEach((g) => {
    const dateStr = g.created.substring(0, 10)
    if (!map.has(dateStr)) map.set(dateStr, [])
    map.get(dateStr).push(g)
  })

  // Calculate the velocity for each day
  map.keys().forEach((day) => {
    var linear = []
    var i = 0

    map.get(day).forEach((g) => {
      linear.push([i, g.gravity])
      i++
    })

    // const linearResult = regression.linear(linear.slice(-30), { precision: 12 })
    const linearResult = regression.linear(linear.slice(-window), { precision: 12 })

    result.push({
      day: day,
      first: linear[0][1],
      last: linear[linear.length - 1][1],
      min: Math.min(...linear.map((point) => point[1])),
      max: Math.max(...linear.map((point) => point[1])),
      points: linear.length,
      linear: linearResult.string,
      linearFirst: linearResult.predict(0)[1],
      linearLast: linearResult.predict(96)[1]
    })
  })

  return result
}
</script>
