<template>
  <div class="container">
    <div class="row">
      <div class="col-md-5">
        <p></p>
        <p class="h3">Device Logs</p>
      </div>
      <div class="col-md-5">
        <BsSelect
          v-model="deviceSelected"
          :options="deviceOptions"
          label="Device Logs"
          help=""
          :disabled="global.disabled"
        >
        </BsSelect>
      </div>

      <div class="col-md-2 align-bottom"><p>&nbsp;</p>
        <button @click="fetchLogs()" type="button" class="btn btn-secondary" :disabled="deviceSelected == ''">Refresh</button>
      </div>

    </div>

      <hr />

      <div class="row" v-if="deviceSelected != ''">
        <div class="col-md-12">
          <p>Log contains {{ deviceLog.length }} lines</p>
        </div>

        <hr />
      </div>
    
      <div class="row" v-if="deviceLog.length">
        <div class="col-md-12">
        <p style="font-monospace">
          <template v-for="line in deviceLog">
            {{ line }}<br>
          </template></p>
        <hr />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { global, deviceStore } from '@/modules/pinia'
import { logDebug } from '@/modules/logger'

const deviceSelected = ref('')
const deviceOptions = ref([])
const deviceLog = ref([])

watch(deviceSelected, () => {
  fetchLogs()
})

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
      logDebug('DeviceLogView.watch(deviceLogSelected)', res.status)
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
          logDebug('DeviceLogView.watch(deviceLogSelected)', res2.status)
          if (!res2.ok) throw res2
          return res2.text()
        })
        .then((text2) => {
          deviceLog.value = text2.split('\n').concat(deviceLog.value)
          global.disabled = false
        })
        .catch(() => {
          global.disabled = false
          logDebug('Failed to retrive second log file')
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
