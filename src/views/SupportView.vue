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





</script>
