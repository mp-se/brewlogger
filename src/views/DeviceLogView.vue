<template>
  <div class="container">
    <div class="row">
      <div class="col-md-4">
        <p></p>
        <p class="h3">Device Logs</p>
      </div>
      <div class="col-md-4">
        <BsSelect
          v-model="deviceSelected"
          :options="deviceOptions"
          label="Device Logs"
          help=""
          :disabled="global.disabled"
        >
        </BsSelect>
      </div>

      <div class="col-md-4"><p>&nbsp;</p>
        <button @click="fetchLogs()" type="button" class="btn btn-secondary" :disabled="deviceSelected == ''">Refresh</button>
        &nbsp;
        <button @click="deleteLogs()" type="button" class="btn btn-secondary" :disabled="deviceSelected == ''">Delete</button>
        &nbsp;
        <button @click="hideInfo()" type="button" class="btn btn-secondary" :disabled="deviceSelected == ''">Hide Info</button>
        &nbsp;
        <button @click="hideWarn()" type="button" class="btn btn-secondary" :disabled="deviceSelected == ''">Hide Warn</button>
      </div>

    </div>

      <hr />

      <div class="row" v-if="deviceSelected != ''">
        <div class="col-md-2">
          <p>Log contains {{ deviceLog.length }} lines</p>
        </div>
        <div class="col-md-2">
          <p>Size: {{ Number(deviceLogSize / 1024).toFixed(0) }} kb</p>
        </div>
        <div class="col-md-2">
          <button @click="deleteLogs()" type="button" class="btn btn-secondary" :disabled="deviceSelected == ''">Delete</button>
        </div>
        <hr />
      </div>
    
      <div class="row" v-if="deviceLog.length">
        <div class="col-md-12">
        <p class="font-monospace">
          <template v-for="line in deviceLog">
            {{ line }}<br>
          </template></p>
        <hr />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { global, deviceStore } from '@/modules/pinia'
import { logDebug } from '@/modules/logger'

const deviceSelected = ref('')
const deviceOptions = ref([])
const deviceLog = ref([])

const deviceLogSize = computed(() => {
  var l = 0

  deviceLog.value.forEach(e => {
    l += e.length
  })

  return l
})

function hideInfo() {
  var l = []

  deviceLog.value.forEach(e => {
    if(e.search(' I: ') == -1)
      l.push(e)
  })

  deviceLog.value = l
}

function hideWarn() {
  hideInfo()

  var l = []

  deviceLog.value.forEach(e => {
    if(e.search(' W: ') == -1)
      l.push(e)
  })

  deviceLog.value = l
}

watch(deviceSelected, () => {
  fetchLogs()
})

function deleteLogs() {
  global.disabled = true
  fetch(global.baseURL + 'api/device/logs/' + deviceSelected.value, {
    method: 'DELETE',
    headers: { Authorization: global.token },
    signal: AbortSignal.timeout(global.fetchTimout)
  })
  .then((res) => {
      logDebug('DeviceLogView.deleteLogs()', res.status)
      if (!res.ok) throw res
      updateDeviceLogList()
      return
    })
    .catch(() => {
      global.disabled = false
      global.messageError = 'Failed to delete logfile for device'
    })

}

function fetchLogs() {
  if(deviceSelected.value == '') {
    deviceLog.value = []
    return
  }

  global.disabled = true
  fetch(global.baseURL + 'logs/' + deviceSelected.value + ".log", {
    method: 'GET',
    signal: AbortSignal.timeout(global.fetchTimout)
  })
  .then((res) => {
      logDebug('DeviceLogView.fetchLogs()', res.status)
      if (!res.ok) throw res
      return res.text()
    })
    .then((text) => {
      deviceLog.value = text.split('\n')

      // Try to load the .1 file if this exist...
      fetch(global.baseURL + 'logs/' + deviceSelected.value + ".log.1", {
        method: 'GET',
        signal: AbortSignal.timeout(global.fetchTimout)
      })
      .then((res2) => {
          logDebug('DeviceLogView.fetchLogs()', res2.status)
          if (!res2.ok) throw res2
          return res2.text()
        })
        .then((text2) => {
          deviceLog.value = text2.split('\n').concat(deviceLog.value)
          global.disabled = false
        })
        .catch(() => {
          global.disabled = false
          logDebug('DeviceLogView.fetchLogs()', 'Failed to retrive second log file')
        })

    })
    .catch(() => {
      global.disabled = false
      global.messageError = 'Failed to load logfile for device'
    })
}

onMounted(() => {
  logDebug('DeviceLogView.onMounted()')
  updateDeviceLogList()
})

function updateDeviceLogList() {
  logDebug('DeviceLogView.updateDeviceLogList()')

  deviceOptions.value = [ { label: '-- none --', value: '' } ]
  deviceLog.value = []
  deviceSelected.value = ''

  global.disabled = true
  fetch(global.baseURL + 'api/device/logs/', {
    method: 'GET',
    headers: { Authorization: global.token },
    signal: AbortSignal.timeout(global.fetchTimout)
  })
    .then((res) => {
      logDebug('DeviceLogView.updateDeviceLogList()', res.status)
      if (!res.ok) throw res
      return res.json()
    })
    .then((json) => {
      json.forEach(chipId => {
        if( !chipId.endsWith(".log.1") ) {
          chipId = chipId.replace(".log", "")
          deviceStore.deviceList.forEach(device => {
            if(device.chipId == chipId) {
              deviceOptions.value.push({ label: device.mdns + " - " + device.chipId + " - " + device.software, value: chipId })
            }
          })
        }
      })

      global.disabled = false
    })
    .catch(() => {
      global.disabled = false
      global.messageError = 'Failed to retrive list of system log enties'
    })
}
</script>
