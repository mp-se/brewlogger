<template>
  <div class="container">
    <div class="row align-items-center">
      <div class="col-md-10">
        <p></p>
        <p class="h3">Receive log - Latest 50 data received</p>
      </div>
      <div class="col-md-2 d-flex gap-2">
        <button
          type="button"
          class="btn btn-secondary btn"
          @click.prevent="updateLogList()"
          :disabled="global.disabled"
        >
          Refresh
        </button>
        <button
          type="button"
          class="btn btn-primary btn"
          @click.prevent="downloadAllRecords()"
          :disabled="global.disabled"
        >
          Download
        </button>
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
  fetch(global.baseURL + 'api/system/receive/?limit=50', {
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
      global.disabled = false
    })
    .catch(() => {
      global.disabled = false
      global.messageError = 'Failed to retrive list of receive log enties'
    })
}

async function downloadAllRecords() {
  logDebug('ReceiveLogView.downloadAllRecords()')

  global.disabled = true
  const allRecords = []
  let skip = 0
  const limit = 50

  try {
    while (true) {
      const res = await fetch(
        global.baseURL + `api/system/receive/?limit=${limit}&skip=${skip}`,
        {
          method: 'GET',
          headers: { Authorization: global.token },
          signal: AbortSignal.timeout(global.fetchTimout)
        }
      )

      logDebug('ReceiveLogView.downloadAllRecords()', res.status)
      if (!res.ok) throw res

      const json = await res.json()
      logDebug('ReceiveLogView.downloadAllRecords()', json)

      allRecords.push(...json.data)

      if (json.data.length < limit) {
        break
      }

      skip += limit
    }

    // Create JSON and trigger download
    const jsonString = JSON.stringify(allRecords, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `receive-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    logDebug('ReceiveLogView.downloadAllRecords()', 'Download complete')
    global.disabled = false
  } catch (error) {
    logDebug('ReceiveLogView.downloadAllRecords()', error)
    global.disabled = false
    global.messageError = 'Failed to download records'
  }
}
</script>
