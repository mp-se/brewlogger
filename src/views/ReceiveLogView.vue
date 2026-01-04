<template>
  <div class="container">
    <div class="row">
      <div class="col-md-6">
        <p></p>
        <p class="h3">Receive log - Latest data received</p>
      </div>
    </div>
    <hr />

    <div class="row" v-if="logList != null">
      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col" class="col-sm-2">Created</th>
            <th scope="col" class="col-sm-2">IP</th>
            <th scope="col" class="col-sm-8">Payload</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in logList" :key="l.id">
            <td scope="row">
              {{ l.timestamp.substring(0, 10) }} {{ l.timestamp.substring(11, 19) }}
            </td>
            <td>{{ l.ipAddress }}</td>
            <td>{{ l.payload }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { global } from '@/modules/pinia'
import { logDebug } from '@/modules/logger'

const logList = ref(null)
const total = ref(0) 
const skip = ref(0) 

onMounted(() => {
  logDebug('ReceiveLogView.onMounted()')
  updateLogList()
})

function updateLogList() {
  logDebug('ReceiveLogView.updateLogList()')

  logList.value = null

  global.disabled = true
  fetch(global.baseURL + 'api/system/receive/?limit=30', {
    method: 'GET',
    headers: { Authorization: global.token },
    signal: AbortSignal.timeout(global.fetchTimout)
  })
    .then((res) => {
      logDebug('ReceiveLogView.updateLogList()', res.status)
      if (!res.ok) throw res
      return res.json()
    })
    .then((json) => {
      logDebug('ReceiveLogView.updateLogList()', json)
      total.value = json.total
      skip.value = json.skip
      logList.value = json.data
      logDebug('ReceiveLogView.updateLogList()', logList.value)
      global.disabled = false
    })
    .catch(() => {
      global.disabled = false
      global.messageError = 'Failed to retrive list of receive log enties'
    })
}
</script>
