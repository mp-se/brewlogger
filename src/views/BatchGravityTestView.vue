<template>
  <div class="container">
    <p></p>
    <p class="h3">Batch Gravity Test List - '{{ batchName }}'</p>
    <hr />

    <p>Testing page for gravity related development</p>

    <p v-for="d in data" :key="d.id">{{ d.date }} {{ d.value1 }} {{ d.value2 }}</p>

  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { gravityStore, batchStore } from '@/modules/pinia'
import router from '@/modules/router'
import { logDebug, logError } from '@/modules/logger'
import { createTrend } from 'trendline'

const gravityList = ref(null)
const batchName = ref('')
const data = ref([])

// https://www.30secondsofcode.org/js/s/partition-array/

onMounted(() => {
  logDebug('BatchGravityTestView.onMounted()')

  gravityList.value = null

  batchStore.getBatch(router.currentRoute.value.params.id, (success, b) => {
    if (success) batchName.value = b.name
  })

  gravityStore.getGravityListForBatch(router.currentRoute.value.params.id, (success, gl) => {
    if (success) {
      gravityList.value = gl

      // Sort the gravity data into arrays per day ------------------------------------------------
      
      const map = new Map()
      gl.forEach(g => {
        var dt = g.created.substring(0, 10)
        var arr = map.has(dt) ? map.get(dt) : new Array()
        arr.push(g)           
        map.set(dt, arr)
      })

      // logDebug("KEYS", map.keys())

      for(const k of map.keys()) {
        var d = []
        var y = []

        map.get(k).forEach(g => {
          y.push( g.gravity)
          d.push( { x: new Date(g.created).valueOf(), y: g.gravity})
        })

        // Option 1 using linear library
        const trend = createTrend(d, 'x', 'y')
        // console.log(trend)

        // Option 2 using min()/max() to see the difference over one day (Simple test, should look at direction of slope to see +/-)
        let minValue = Math.min(...y);
        let maxValue = Math.max(...y);

        data.value.push( { date: k, value1: trend.slope, value2: Number((minValue - maxValue) * 1000).toFixed(2)  })
      }
      
      // -------------------------------------------------------------------------------------------

      // logDebug('BatchGravityTestView.onMounted()', gravityList.value)
    } else {
      logError(
        'BatchGravityTestView.onMounted()',
        'Failed to load gravity',
        router.currentRoute.value.params.id
      )
    }
  })
})
</script>
