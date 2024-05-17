<template>
  <div class="container">
    <p></p>
    <p class="h3">Backup & Restore</p>
    <hr>

    <div class="row">
      <div class="col-md-12">
        <p>Create a a complete backup of the database and store this in a textfile</p>
      </div>

      <div class="col-md-12">
        <button @click="createBackup()" type="button" class="btn btn-primary w-2" data-bs-toggle="tooltip"
          :disabled="global.disabled">Create
          backup</button>
      </div>

      <div class="col-md-12">
        <hr>
      </div>

      <div class="col-md-12">
        <p>Restore a previous backup of the database by uploading it.</p>
      </div>
    </div>

    <div class="row">
      <form @submit.prevent="restore()">
        <div class="col-md-12">
          <BsFileUpload name="upload" id="upload" label="Select backup file" accept=".txt" :disabled="global.disabled">
          </BsFileUpload>
        </div>

        <div class="col-md-3">
          <p></p>
          <button type="submit" class="btn btn-primary" value="upload" :disabled="global.disabled">
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"
              :hidden="!global.disabled"></span>
            &nbsp;Restore</button>
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
import { batchStore, deviceStore, global } from "@/modules/pinia"
import { download } from '@/modules/utils'
import { logDebug, logError, logInfo } from '@/modules/logger'

const progress = ref(0)
const progressMax = ref(0)
const restoreErrors = ref(0)
const backup = ref({
  "meta": {
    "version": "0.4",
    "software": "BrewLogger"
  },
  "batches": [],
  "devices": [],
});

function getBatchList(callback) {
  fetch(global.baseURL + 'api/batch/', {
    method: "GET",
    headers: { "Authorization": global.token },
    signal: AbortSignal.timeout(global.fetchTimout),
  })
    .then(res => {
      logDebug("BackupView.getBatchList()", res.status)
      if (!res.ok) throw res
      return res.json()
    })
    .then(json => {
      callback(true, json)
    })
    .catch(err => {
      logError("BackupView.getBatchList()", err)
      callback(false, {})
    })
}

function getDeviceList(callback) {
  fetch(global.baseURL + 'api/device/', {
    method: "GET",
    headers: { "Authorization": global.token },
    signal: AbortSignal.timeout(global.fetchTimout),
  })
    .then(res => {
      logDebug("BackupView.getDeviceList()", res.status)
      if (!res.ok) throw res
      return res.json()
    })
    .then(json => {
      callback(true, json)
    })
    .catch(err => {
      logError("BackupView.getDeviceList()", err)
      callback(false, {})
    })
}

function createBackup() {
  logDebug("BackupView.createBackup()")

  getBatchList((success, bl) => {
    if (success) {
      logDebug("BackupView.createBackup()", "Collected batches")
      backup.value.batches = bl

      getDeviceList((success, dl) => {
        if (success) {
          logDebug("BackupView.createBackup()", "Collected devices")
          backup.value.devices = dl

          var s = JSON.stringify(backup.value, null, 2)
          download(s, "text/plain", "brewlogger_backup.txt")
        } else {
          global.messageError = "Failed to fetch devices"
          global.disabled = false
        }
      })
    } else {
      global.messageError = "Failed to fetch batches"
      global.disabled = false
    }
  })
}

function restore() {
  logDebug("BackupView.restore()")

  const fileElement = document.getElementById('upload');

  if (fileElement.files.length === 0) {
    global.messageError = "You need to select a file to restore data from"
  } else {
    global.disabled = true
    logInfo("BackupView.restore()", "Selected file: " + fileElement.files[0].name)
    const reader = new FileReader()
    reader.addEventListener('load', function (e) {
      let text = e.target.result

      try {
        const data = JSON.parse(text);
        if (data.meta.software === "BrewLogger" && (data.meta.version === "0.4" || data.meta.version === "0.3")) {
          processRestore(data);
        } else {
          global.messageFailed = "Unknown format, unable to process"
        }
      } catch (error) {
        console.error(error);
        global.messageFailed = "Unable to parse configuration file for GravityMon."
      }

    })
    reader.readAsText(fileElement.files[0])
  }
}

async function processRestore(json) {
  logDebug("BackupView.processRestore()")

  var cntDevices = json.devices.length
  var cntBatches = json.batches.length * 2 // Batch, Gravity

  progress.value = 0
  progressMax.value = cntDevices + cntBatches

  logDebug("BackupView.processRestore()", "Steps to complete restore", progressMax.value)

  /* Check the current database and delete records if needed */

  deleteDevices()
  deleteBatches()

  /* Do the restore */

  restoreErrors.value = 0

  json.devices.forEach(d => {
    restoreDevice(d)
  })

  json.batches.forEach(b => {
    restoreBatch(b)
  })

  if (restoreErrors.value) {
    global.messageError = "Restore failed"
  } else {
    global.messageSuccess = "Restore successful"
  }

  deviceStore.getDeviceList((success, dl) => {
    if (success) {
      logInfo("BackupView.processRestore()", "Refreshed device list")
    } else {
      logError("BackupView.processRestore()", "Failed to refreshed device list")
    }

    batchStore.getBatchList((success, bl) => {
      if (success) {
        logInfo("BackupView.processRestore()", "Refreshed batch list")
      } else {
        logError("BackupView.processRestore()", "Failed to refreshed batch list")
      }
    })
  })

  global.disabled = false
}

async function restoreDevice(d) {
  await fetch(global.baseURL + 'api/device/', {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": global.token },
    body: JSON.stringify(d),
    signal: AbortSignal.timeout(global.fetchTimout),
  })
    .then(res => {
      updateProgress()
      logDebug("BackupView.restoreDevice()", res.status)
      if (res.status != 201) {
        logError("BackupView.restoreDevice()", "Got error from API", res.status)
        restoreErrors.value += 1
      }
    })
    .catch(err => {
      logError("BackupView.restoreDevice()", err)
      restoreErrors.value += 1
    })
}

async function restoreBatch(b) {
  await fetch(global.baseURL + 'api/batch/', {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": global.token },
    body: JSON.stringify(b),
    signal: AbortSignal.timeout(global.fetchTimout),
  })
    .then(res => {
      logDebug("BackupView.restoreBatch()", res.status)
      if (!res.ok) throw res
      return res.json()
    })
    .then(json => {
      updateProgress()

      // The record can be assgined a new ID so we need to update all gravity records with that
      b.gravity.forEach(g => {
        g.batchId = json.id;
      })

      fetch(global.baseURL + 'api/gravity/list/', {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": global.token },
        body: JSON.stringify(b.gravity),
        signal: AbortSignal.timeout(global.fetchTimout),
      })
        .then(res => {
          updateProgress()
          logDebug("BackupView.restoreBatch()", res.status)
          if (res.status != 201) {
            logError("BackupView.restoreBatch()", "Got error from API", res.status)
            restoreErrors.value += 1
          }
        })
        .catch(err => {
          logError("BackupView.restoreBatch()", err)
          restoreErrors.value += 1
        })
    })
    .catch(err => {
      logError("BackupView.restoreBatch()", err)
      restoreErrors.value += 1
    })
}

async function deleteDevices() {
  await fetch(global.baseURL + 'api/device/', {
    method: "GET",
    headers: { "Content-Type": "application/json", "Authorization": global.token },
    signal: AbortSignal.timeout(global.fetchTimout),
  })
    .then(res => {
      logDebug("BackupView.deleteDevices()", res.status)
      if (!res.ok) throw res
      return res.json()
    })
    .then(json => {
      json.forEach(d => {
        logDebug("BackupView.deleteDevices()", "Deleting device", d.id)

        fetch(global.baseURL + 'api/device/' + d.id, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", "Authorization": global.token },
          signal: AbortSignal.timeout(global.fetchTimout),
        })
          .then(res => {
            logDebug("BackupView.deleteDevices()", res.status)
            if (res.status != 204) {
              logError("BackupView.deleteDevices()", "Got error from API", res.status)
            }
          })
          .catch(err => {
            logError("BackupView.deleteDevices()", err)
          })
      })
    })
    .catch(err => {
      logError("BackupView.deleteDevices()", err)
    })
}

async function deleteBatches() {
  await fetch(global.baseURL + 'api/batch/', {
    method: "GET",
    headers: { "Content-Type": "application/json", "Authorization": global.token },
    signal: AbortSignal.timeout(global.fetchTimout),
  })
    .then(res => {
      logDebug("BackupView.deleteBatches()", res.status)
      if (!res.ok) throw res
      return res.json()
    })
    .then(json => {
      json.forEach(b => {
        logDebug("BackupView.deleteDevices()", "Deleting batch", b.id)

        fetch(global.baseURL + 'api/batch/' + b.id, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", "Authorization": global.token },
          signal: AbortSignal.timeout(global.fetchTimout),
        })
          .then(res => {
            logDebug("BackupView.deleteBatches()", res.status)
            if (res.status != 204) {
              logError("BackupView.deleteBatches()", "Got error from API", res.status)
            }
          })
          .catch(err => {
            logError("BackupView.deleteBatches()", err)
          })
      })
    })
    .catch(err => {
      logError("BackupView.deleteBatches()", err)
    })
}

function updateProgress() {
  progress.value = progress.value + (100 / progressMax.value)
}
</script>