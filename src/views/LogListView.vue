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
            <th scope="col" class="col-sm-2">
              <div :class="sortedClass('timestamp')">
                Date&nbsp;
                <a class="icon-link icon-link-hover" @click="sortLogList('timestamp', 'date')">
                  <i :class="sortedIconClass"></i>
                </a>
              </div>
            </th>
            <th scope="col" class="col-sm-2">
              <div :class="sortedClass('module')">
                Module&nbsp;
                <a class="icon-link icon-link-hover" @click="sortLogList('module', 'str')">
                  <i :class="sortedIconClass"></i>
                </a>
              </div>
            </th>
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
import { onMounted, ref, computed } from 'vue'
import { global } from '@/modules/pinia'
import { logDebug } from '@/modules/logger'

const logList = ref(null)

const sorting = ref({ column: 'timestamp', type: 'date', order: false })

function sortedClass(column) {
  logDebug('LogListView.sortedClass()', column)
  if (column == sorting.value.column) return 'text-primary'
  return ''
}

const sortedIconClass = computed(() => {
  return 'bi ' + (sorting.value.order ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up')
})

function sortLogList(column, type) {
  // Type: str, num, date
  logDebug('LogListView.sortLogList()', column, type)

  sorting.value.column = column
  sorting.value.type = type
  sorting.value.order = !sorting.value.order
  applySortLogList()
}

function applySortLogList() {
  logDebug('LogListView.applySortLogList()')

  if (sorting.value.order) {
    if (sorting.value.type == 'str')
      logList.value.sort((a, b) => a[sorting.value.column].localeCompare(b[sorting.value.column]))
    else if (sorting.value.type == 'date')
      logList.value.sort(
        (a, b) => Date.parse(a[sorting.value.column]) - Date.parse(b[sorting.value.column])
      )
    else logList.value.sort((a, b) => a[sorting.value.column] - b[sorting.value.column])
  } else {
    if (sorting.value.type == 'str')
      logList.value.sort((a, b) => b[sorting.value.column].localeCompare(a[sorting.value.column]))
    else if (sorting.value.type == 'date')
      logList.value.sort(
        (a, b) => Date.parse(b[sorting.value.column]) - Date.parse(a[sorting.value.column])
      )
    else logList.value.sort((a, b) => b[sorting.value.column] - a[sorting.value.column])
  }
}

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
      applySortLogList()
      global.disabled = false
    })
    .catch(() => {
      global.disabled = false
      global.messageError = 'Failed to retrive list of system log enties'
    })
}
</script>
