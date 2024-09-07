<template>
  <div class="container">
    <p></p>
    <p class="h3">Backup & Restore</p>
    <hr />

    <div class="row">
      <div class="col-md-12">
        <p>Create a a complete backup of the database and store this in a textfile</p>
      </div>

      <div class="col-md-12">
        <button
          @click="createBackup()"
          type="button"
          class="btn btn-primary w-2"
          data-bs-toggle="tooltip"
          :disabled="global.disabled"
        >
          Create backup
        </button>
      </div>

      <div class="col-md-12">
        <hr />
      </div>

      <div class="col-md-12">
        <p>Restore a previous backup of the database by uploading it.</p>
      </div>
    </div>

    <div class="row">
      <form @submit.prevent="restore()">
        <div class="col-md-12">
          <BsFileUpload
            name="upload"
            id="upload"
            label="Select backup file"
            accept=".txt"
            :disabled="global.disabled"
          >
          </BsFileUpload>
        </div>

        <div class="col-md-3">
          <p></p>
          <button type="submit" class="btn btn-primary" value="upload" :disabled="global.disabled">
            <span
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
              :hidden="!global.disabled"
            ></span>
            &nbsp;Restore
          </button>
        </div>

        <div v-if="progress > 0" class="col-md-12">
          <p></p>
          <BsProgress :progress="progress"></BsProgress>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { batchStore, deviceStore, global } from '@/modules/pinia'
import { download } from '@/modules/utils'
import { logDebug, logError, logInfo } from '@/modules/logger'

const progress = ref(0)
const progressMax = ref(0)
const restoreErrors = ref(0)
const backup = ref({
  meta: {
    version: '0.5',
    software: 'BrewLogger'
  },
  batches: [],
  devices: []
})

async function getBatchList(callback) {
  const res = await fetch(global.baseURL + 'api/batch/', {
    method: 'GET',
    headers: { Authorization: global.token }
    // signal: AbortSignal.timeout(global.fetchTimout),
  })

  if (!res.ok) {
    logError('BackupView.getBatchList()', res.status)
    throw res
  }

  const json = await res.json()
  callback(true, json)
}

async function getDeviceList(callback) {
  const res = await fetch(global.baseURL + 'api/device/', {
    method: 'GET',
    headers: { Authorization: global.token }
    // signal: AbortSignal.timeout(global.fetchTimout),
  })

  if (!res.ok) {
    logDebug('BackupView.getDeviceList()', res.status)
    throw res
  }

  const json = await res.json()
  callback(true, json)
}

function cleanupJson(list) {
  list.forEach(l => {
    Object.keys(l).forEach(key => {
      if(l[key] == null) {
        // logDebug("BackupView.cleanupJson()", key)
        delete l[key]
      }
    })    
  })

}

function createBackup() {
  logDebug('BackupView.createBackup()')

  getBatchList((success, bl) => {
    if (success) {
      logDebug('BackupView.createBackup()', 'Collected batches')
      backup.value.batches = bl

      // Remove optional params from payload
      cleanupJson(backup.value.batches)

      backup.value.batches.forEach(b => {
        cleanupJson(b.gravity)
      })

      console.log(backup.value.batches)
      // backup.value.batches = bl

      getDeviceList((success, dl) => {
        if (success) {
          logDebug('BackupView.createBackup()', 'Collected devices')
          backup.value.devices = dl

          var s = JSON.stringify(backup.value, null, 2)
          download(s, 'text/plain', 'brewlogger_backup.txt')
        } else {
          global.messageError = 'Failed to fetch devices'
          global.disabled = false
        }
      })
    } else {
      global.messageError = 'Failed to fetch batches'
      global.disabled = false
    }
  })
}

function restore() {
  logDebug('BackupView.restore()')

  const fileElement = document.getElementById('upload')

  if (fileElement.files.length === 0) {
    global.messageError = 'You need to select a file to restore data from'
  } else {
    global.disabled = true
    logInfo('BackupView.restore()', 'Selected file: ' + fileElement.files[0].name)
    const reader = new FileReader()
    reader.addEventListener('load', function (e) {
      let text = e.target.result

      try {
        const data = JSON.parse(text)
        if (
          data.meta.software === 'BrewLogger' &&
          (data.meta.version === '0.5' || data.meta.version === '0.4')
        ) {
          processRestore(data)
        } else {
          global.messageFailed = 'Unknown format, unable to process'
        }
      } catch (error) {
        console.error(error)
        global.messageFailed = 'Unable to parse configuration file for GravityMon.'
      }
    })
    reader.readAsText(fileElement.files[0])
  }
}

async function processRestore(json) {
  logDebug('BackupView.processRestore()')

  var cntDevices = json.devices.length
  var cntBatches = json.batches.length * 2 // Batch, Gravity

  progress.value = 0
  progressMax.value = cntDevices + cntBatches

  logDebug('BackupView.processRestore()', 'Steps to complete restore', progressMax.value)

  /* Check the current database and delete records if needed */

  logDebug('BackupView.processRestore()', 'Deleting devices')
  await deleteDevices()
  logDebug('BackupView.processRestore()', 'Deleting batches')
  await deleteBatches()

  /* Do the restore */

  restoreErrors.value = 0

  logDebug('BackupView.processRestore()', 'Restore devices')
  await restoreDevices(json.devices)

  logDebug('BackupView.processRestore()', 'Restore batches')
  await restoreBatches(json.batches)

  logDebug('BackupView.processRestore()', 'Restore completed')

  if (restoreErrors.value) {
    global.messageError = 'Restore failed'
  } else {
    global.messageSuccess = 'Restore successful'
  }

  deviceStore.getDeviceList((success) => {
    if (success) {
      logInfo('BackupView.processRestore()', 'Refreshed device list')
    } else {
      logError('BackupView.processRestore()', 'Failed to refreshed device list')
    }

    batchStore.getBatchList((success) => {
      if (success) {
        logInfo('BackupView.processRestore()', 'Refreshed batch list')
      } else {
        logError('BackupView.processRestore()', 'Failed to refreshed batch list')
      }
    })
  })

  global.disabled = false
}

async function restoreDevices(dl) {
  await Promise.all(
    dl.map(async (d) => {
      logDebug('BackupView.restoreDevice()', 'Restore device', d.id)

      const res = await fetch(global.baseURL + 'api/device/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: global.token },
        body: JSON.stringify(d)
        // signal: AbortSignal.timeout(global.fetchTimout),
      })
      updateProgress()
      return res.json()
    })
  )
}

async function restoreBatches(bl) {
  const results = await Promise.all(
    bl.map(async (b) => {
      logDebug('BackupView.restoreBatch()', 'Restore batch', b.id)

      const res = await fetch(global.baseURL + 'api/batch/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: global.token },
        body: JSON.stringify(b)
        // signal: AbortSignal.timeout(global.fetchTimout),
      })

      const json = await res.json()
      updateProgress()
      b.id = json.id
      b.gravity.forEach((g) => {
        g.batchId = json.id

        if (!Object.prototype.hasOwnProperty.call(g, 'active'))
          // New in v0.5
          g.active = true
      })

      return b
    })
  )

  logDebug('BackupView.restoreBatch()', 'Results', results)

  const results2 = await Promise.all(
    results.map(async (b) => {
      logDebug('BackupView.restoreBatch()', 'Restore batch gravity', b.id)

      if (b.gravity.length == 0) {
        logInfo('BackupView.restoreBatch()', 'No gravity readings for batch', b.id)
        updateProgress()
        return {}
      }

      const res = await fetch(global.baseURL + 'api/gravity/list/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: global.token },
        body: JSON.stringify(b.gravity)
        // signal: AbortSignal.timeout(global.fetchTimout),
      })

      const json = await res.json()
      updateProgress()
      return json
    })
  )

  logDebug('BackupView.restoreBatch()', 'Results2', results2)
}

async function deleteDevice(d) {
  const res = await fetch(global.baseURL + 'api/device/' + d.id, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: global.token }
    // signal: AbortSignal.timeout(global.fetchTimout),
  })

  if (res.status != 204) {
    logError('BackupView.deleteDevice()', 'Got error from API', res.status)
  }
}

async function deleteDevices() {
  const res = await fetch(global.baseURL + 'api/device/', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: global.token }
    // signal: AbortSignal.timeout(global.fetchTimout),
  })

  if (!res.ok) {
    logDebug('BackupView.deleteDevices()', res.status)
    throw res
  }

  const json = await res.json()

  json.forEach((d) => {
    logDebug('BackupView.deleteDevices()', 'Deleting device', d.id)
    deleteDevice(d)
  })
}

async function deleteBatch(b) {
  const res = await fetch(global.baseURL + 'api/batch/' + b.id, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: global.token }
    // signal: AbortSignal.timeout(global.fetchTimout),
  })

  if (res.status != 204) {
    logError('BackupView.deleteBatches()', 'Got error from API', res.status)
  }
}

async function deleteBatches() {
  const res = await fetch(global.baseURL + 'api/batch/', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: global.token }
    // signal: AbortSignal.timeout(global.fetchTimout),
  })

  if (!res.ok) {
    logDebug('BackupView.deleteBatches()', res.status)
    throw res
  }

  const json = await res.json()

  json.forEach((b) => {
    logDebug('BackupView.deleteDevices()', 'Deleting batch', b.id)
    deleteBatch(b)
  })
}

function updateProgress() {
  progress.value = progress.value + 100 / progressMax.value
}
</script>
