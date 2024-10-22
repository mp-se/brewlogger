<template>
  <div class="container">
    <div class="row">
      <div class="col-md-6">
        <p></p>
        <p class="h3">System log</p>
      </div>
    </div>
    <hr />

    <div class="row" v-if="logList != null">
      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col" class="col-sm-2">Date</th>
            <th scope="col" class="col-sm-2">Module</th>
            <th scope="col" class="col-sm-7">Message</th>
            <th scope="col" class="col-sm-1">Code</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in logList" :key="l.id">
            <td scope="row">
              {{ l.timestamp.substring(0, 10) }} {{ l.timestamp.substring(11, 19) }}
            </td>
            <td>{{ l.module }}</td>
            <td>{{ l.message }}</td>
            <td>{{ l.errorCode }}</td>
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

onMounted(() => {
  logDebug('LogListView.onMounted()')
  updateLogList()
})

function updateLogList() {
  logDebug('LogListView.updateLogList()')

  logList.value = null

  global.disabled = true
  fetch(global.baseURL + 'api/system/log/?limit=30', {
    method: 'GET',
    headers: { Authorization: global.token },
    signal: AbortSignal.timeout(global.fetchTimout)
  })
    .then((res) => {
      logDebug('LogListView.updateLogList()', res.status)
      if (!res.ok) throw res
      return res.json()
    })
    .then((json) => {
      logList.value = json
      global.disabled = false
    })
    .catch(() => {
      global.disabled = false
      global.messageError = 'Failed to retrive list of system log enties'
    })
}
</script>
