// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

<template>
  <div class="container">
    <div class="row align-items-center">
      <div class="col-md-10">
        <p></p>
        <p class="h3">System log - Latest system events</p>
      </div>
    </div>
    <hr />

    <div class="row">
      <div class="col-md-10">
        <p>
          Total log entries: {{ total }}, Showing the first: {{ logList ? logList.length : 0 }}, Use
          download to fetch all entires.
        </p>
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

    <div class="row" v-if="logList != null">
      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col" class="col-sm-2">
              <div :class="sortedClass('timestamp')">
                Date&nbsp;
                <a
                  class="icon-link icon-link-hover"
                  @click="sortList(logList, 'timestamp', 'date')"
                >
                  <i :class="sortedIconClass"></i>
                </a>
              </div>
            </th>
            <th scope="col" class="col-sm-2">
              <div :class="sortedClass('module')">
                Module&nbsp;
                <a class="icon-link icon-link-hover" @click="sortList(logList, 'module', 'str')">
                  <i :class="sortedIconClass"></i>
                </a>
              </div>
            </th>
            <th scope="col" class="col-sm-6">Message</th>
            <th scope="col" class="col-sm-1">Log level</th>
            <th scope="col" class="col-sm-1">Error Code</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in logList" :key="l.id">
            <td scope="row">
              <span v-if="l.timestamp"
                >{{ l.timestamp.substring(0, 10) }} {{ l.timestamp.substring(11, 19) }}</span
              >
            </td>
            <td>{{ l.module }}</td>
            <td>{{ l.message }}</td>
            <td>{{ mapLogLevel(l.logLevel) }}</td>
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
import {
  sortedIconClass,
  setSortingDefault,
  sortedClass,
  sortList,
  applySortList
} from '@/modules/ui'

const logList = ref(null)
const total = ref(0)
const skip = ref(0)

function mapLogLevel(level) {
  const logLevelMap = {
    0: 'DEBUG',
    1: 'INFO',
    2: 'WARNING',
    3: 'ERROR',
    4: 'CRITICAL'
  }
  return logLevelMap[level] || String(level)
}

onMounted(() => {
  logDebug('LogListView.onMounted()')
  setSortingDefault('timestamp', 'date', false)
  updateLogList()
})

function updateLogList() {
  logDebug('LogListView.updateLogList()')

  logList.value = null

  global.disabled = true
  fetch(global.baseURL + 'api/system/log/?limit=50', {
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
      total.value = json.total
      skip.value = json.skip
      logList.value = json.data
      applySortList(logList.value)
      global.disabled = false
    })
    .catch(() => {
      global.disabled = false
      global.messageError = 'Failed to retrive list of system log enties'
    })
}

async function downloadAllRecords() {
  logDebug('SystemLogView.downloadAllRecords()')

  global.disabled = true
  const allRecords = []
  let skip = 0
  const limit = 50

  try {
    while (true) {
      const res = await fetch(global.baseURL + `api/system/log/?limit=${limit}&skip=${skip}`, {
        method: 'GET',
        headers: { Authorization: global.token },
        signal: AbortSignal.timeout(global.fetchTimout)
      })

      logDebug('SystemLogView.downloadAllRecords()', res.status)
      if (!res.ok) throw res

      const json = await res.json()
      logDebug('SystemLogView.downloadAllRecords()', json)

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
    link.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    logDebug('SystemLogView.downloadAllRecords()', 'Download complete')
    global.disabled = false
  } catch (error) {
    logDebug('SystemLogView.downloadAllRecords()', error)
    global.disabled = false
    global.messageError = 'Failed to download records'
  }
}
</script>
