<template>
  <div class="container">
    <p></p>
    <p class="h3">Support</p>
    <hr />
    <p class="h5">Log status</p>
    <pre>{{ JSON.stringify(logData, null, 2) }}</pre>
    <hr />
    <p class="h5">BLE status</p>
    <pre>{{ JSON.stringify(bleData, null, 2) }}</pre>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { global } from '@/modules/pinia'
import { logDebug, logError } from '@/modules/logger'

const logData = ref({})
const bleData = ref({})

onMounted(() => {
  logDebug('SupportView.onMounted()')

  fetch(global.baseURL + 'api/system/self_test/', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: global.token },
    signal: AbortSignal.timeout(global.fetchTimout)
  })
    .then((res) => {
      return res.json()
    })
    .then((json) => {
      json.log.forEach((entry) => {
        const [, deviceid, attribute] = entry.name.split('_')
        if (!logData.value[deviceid]) logData.value[deviceid] = {}
        let value = entry.value
        if (attribute === 'start' || attribute === 'last') {
          // Convert to 'YYYY-MM-DD HH:mm' format (assume value is a Unix timestamp in seconds)
          const date = new Date(value * 1000)
          const pad = (n) => n.toString().padStart(2, '0')
          value = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
        }
        logData.value[deviceid][attribute] = value
      })

      json.ble.forEach((entry) => {
        const [, deviceid, attribute] = entry.name.split('_')
        if (!bleData.value[deviceid]) bleData.value[deviceid] = {}
        let value = entry.value
        if (attribute === 'last') {
          // Convert to 'YYYY-MM-DD HH:mm' format (assume value is a Unix timestamp in seconds)
          const date = new Date(value * 1000)
          const pad = (n) => n.toString().padStart(2, '0')
          value = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
        }
        bleData.value[deviceid][attribute] = value
      })

      logDebug('SupportView.onMounted()', json)
    })
    .catch((err) => {
      logError('SupportView.onMounted()', err)
    })
})

// async function () {
//   logDebug('HomeView.fetchScheduler()')

// }
</script>
