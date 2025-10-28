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
            ref="fileUploadRef"
            name="upload"
            label="Select backup file"
            accept=".txt,.json"
            :disabled="global.disabled"
          >
          </BsFileUpload>
        </div>

        <div class="col-md-3">
          <p></p>
          <button
            type="submit"
            class="btn btn-primary"
            value="upload"
            :disabled="global.disabled || !fileSelected"
          >
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
import { ref, onMounted, nextTick } from 'vue'
import { batchStore, deviceStore, global } from '@/modules/pinia'
import { download } from '@/modules/utils'
import { logDebug, logError, logInfo } from '@/modules/logger'

const progress = ref(0)
const progressMax = ref(0)
const restoreErrors = ref(0)
const fileSelected = ref(false)
const fileUploadRef = ref(null)
const backup = ref({
  meta: {
    version: '0.8', // 0.5 is used for older version, 0.8 include pressure and pour data
    software: 'BrewLogger',
    created: ''
  },
  batches: [],
  devices: [],
  pressure: [],
  pour: []
})

// Watch for file selection changes
onMounted(() => {
  nextTick(() => {
    const fileInput = fileUploadRef.value?.$el?.querySelector('input[type="file"]')
    logDebug('BackupView.onMounted()', 'File input found:', fileInput)
    if (fileInput) {
      fileInput.addEventListener('change', () => {
        fileSelected.value = fileInput.files.length > 0
        logDebug('BackupView.fileInput.change()', 'File selected:', fileSelected.value)
      })
    }
  })
})

async function getBatchList(callback) {
  try {
    const res = await fetch(global.baseURL + 'api/batch/', {
      method: 'GET',
      headers: { Authorization: global.token }
      // signal: AbortSignal.timeout(global.fetchTimout),
    })

    if (!res.ok) {
      logError('BackupView.getBatchList()', res.status)
      callback(false, null)
      return
    }

    const json = await res.json()
    callback(true, json)
  } catch (error) {
    logError('BackupView.getBatchList()', 'Exception:', error)
    callback(false, null)
  }
}

async function getDeviceList(callback) {
  try {
    const res = await fetch(global.baseURL + 'api/device/', {
      method: 'GET',
      headers: { Authorization: global.token }
      // signal: AbortSignal.timeout(global.fetchTimout),
    })

    if (!res.ok) {
      logDebug('BackupView.getDeviceList()', res.status)
      callback(false, null)
      return
    }

    const json = await res.json()
    callback(true, json)
  } catch (error) {
    logError('BackupView.getDeviceList()', 'Exception:', error)
    callback(false, null)
  }
}

function cleanupJson(list) {
  list.forEach((l) => {
    Object.keys(l).forEach((key) => {
      if (l[key] == null) {
        // logDebug("BackupView.cleanupJson()", key)
        delete l[key]
      }
    })
  })
}

function createBackup() {
  logDebug('BackupView.createBackup()')

  global.disabled = true
  backup.value.meta.created = new Date().toISOString().slice(0, 10)

  try {
    getBatchList((success, bl) => {
      if (success) {
        logDebug('BackupView.createBackup()', 'Collected batches')
        backup.value.batches = bl

        // Remove optional params from payload
        cleanupJson(backup.value.batches)

        backup.value.batches.forEach((b) => {
          cleanupJson(b.gravity)
        })

        logDebug('BackupView.createBackup()', 'Backup batches:', backup.value.batches)
        // backup.value.batches = bl

        getDeviceList((success, dl) => {
          if (success) {
            logDebug('BackupView.createBackup()', 'Collected devices')
            backup.value.devices = dl

            var s = JSON.stringify(backup.value, null, 2)
            download(s, 'text/plain', 'brewlogger_backup.txt')
            global.disabled = false
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
  } catch (error) {
    logError('BackupView.createBackup()', 'Exception occurred:', error)
    global.messageError = 'Failed to create backup'
    global.disabled = false
  }
}

function restore() {
  logDebug('BackupView.restore()')

  const fileElement = fileUploadRef.value?.$el?.querySelector('input[type="file"]')

  if (!fileElement || fileElement.files.length === 0) {
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
          (data.meta.version === '0.8' || data.meta.version === '0.5')
        ) {
          processRestore(data)
        } else {
          global.messageFailed = 'Unknown format, unable to process'
        }
      } catch (error) {
        console.error(error)
        global.messageFailed = 'Unable to parse configuration file for BrewLogger.'
      }
    })
    reader.readAsText(fileElement.files[0])
  }
}

async function processRestore(json) {
  logDebug('BackupView.processRestore()')

  global.clearMessages()

  try {
    var cntDevices = json.devices.length + deviceStore.deviceList.length
    var cntBatches = json.batches.length * 4 + batchStore.batchList.length // For update we separate sending batch + gravity + pressure + pour

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
  } catch (error) {
    logError('BackupView.processRestore()', error)
    restoreErrors.value += 1
    global.disabled = false
    fileSelected.value = false // Reset file selection on error
  }

  if (restoreErrors.value) {
    global.messageError = 'Restore failed'
  } else {
    global.messageSuccess = 'Restore successful'
  }

  const deviceSuccess = await deviceStore.getDeviceList()
  if (deviceSuccess) {
    logInfo('BackupView.processRestore()', 'Refreshed device list')
  } else {
    logError('BackupView.processRestore()', 'Failed to refreshed device list')
  }

  const batchSuccess = await batchStore.getBatchList()
  if (batchSuccess) {
    logInfo('BackupView.processRestore()', 'Refreshed batch list')
  } else {
    logError('BackupView.processRestore()', 'Failed to refreshed batch list')
  }

  global.disabled = false
  fileSelected.value = false // Reset file selection after restore
}

async function restoreDevices(dl) {
  await Promise.all(
    dl.map(async (d) => {
      logDebug('BackupView.restoreDevice()', 'Restore device', d.id)

      if (d.fermentationSteps === undefined) d.fermentationSteps = []

      if (d.collectLogs === undefined || d.collectLogs === null)
        // New in 0.8
        d.collectLogs = false

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

      if (b.fermentationSteps === undefined || b.fermentationSteps === null)
        // New in 0.7
        b.fermentationSteps = ''

      if (b.tapList === undefined || b.tapList === null)
        // New in 0.8
        b.tapList = true

      if (b.chipIdGravity === undefined) {
        // New in 0.9
        b.chipIdGravity = b.chipId
        b.chipIdPressure = ''
      }

      b.fermentationChamber = 0

      const res = await fetch(global.baseURL + 'api/batch/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: global.token },
        body: JSON.stringify(b)
        // signal: AbortSignal.timeout(global.fetchTimout),
      })

      const json = await res.json()
      updateProgress()
      b.id = json.id

      // Update the batchId to match related data sets
      b.gravity.forEach((g) => {
        g.batchId = json.id

        if (g.velocity === undefined) g.velocity = 0 // New in 0.8
      })

      b.pressure.forEach((p) => {
        p.batchId = json.id
      })

      b.pour.forEach((p) => {
        p.batchId = json.id
      })

      return b
    })
  )

  logDebug('BackupView.restoreBatch()', 'Results', results)

  // Restore gravity readings
  await Promise.all(
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

  // Restore pressure readings
  await Promise.all(
    results.map(async (b) => {
      logDebug('BackupView.restoreBatch()', 'Restore batch pressure', b.id)

      if (b.pressure.length == 0) {
        logInfo('BackupView.restoreBatch()', 'No pressure readings for batch', b.id)
        updateProgress()
        return {}
      }

      const res = await fetch(global.baseURL + 'api/pressure/list/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: global.token },
        body: JSON.stringify(b.pressure)
        // signal: AbortSignal.timeout(global.fetchTimout),
      })

      const json = await res.json()
      updateProgress()
      return json
    })
  )

  // Restore pour readings
  await Promise.all(
    results.map(async (b) => {
      logDebug('BackupView.restoreBatch()', 'Restore batch pour', b.id)

      if (b.pour.length == 0) {
        logInfo('BackupView.restoreBatch()', 'No pour readings for batch', b.id)
        updateProgress()
        return {}
      }

      const res = await fetch(global.baseURL + 'api/pour/list/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: global.token },
        body: JSON.stringify(b.pour)
        // signal: AbortSignal.timeout(global.fetchTimout),
      })

      const json = await res.json()
      updateProgress()
      return json
    })
  )

  logDebug('BackupView.restoreBatch()')
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
    updateProgress()
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
    updateProgress()
  })
}

function updateProgress() {
  progress.value = progress.value + 100 / progressMax.value
}
</script>
