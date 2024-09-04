<template>
  <div class="container">
    <p></p>
    <p class="h3">Internal Testing</p>
    <hr />

    <div class="row">
      <div class="col-md-12">
        <p>Device</p>
      </div>

      <div class="col-md-12">
        <button type="button" class="btn btn-secondary" @click="clearLog()">Clear log</button>&nbsp;
        <button type="button" class="btn btn-secondary" @click="listDevices()">List</button>&nbsp;
        <button type="button" class="btn btn-secondary" @click="addDevice()">Add</button>&nbsp;
        <button type="button" class="btn btn-secondary" @click="deleteDevice()">Delete</button
        >&nbsp;
        <button type="button" class="btn btn-secondary" @click="updateDevice()">Update</button
        >&nbsp;
        <button type="button" class="btn btn-secondary" @click="searchDevice()">MDNS</button>&nbsp;
        <button type="button" class="btn btn-secondary" @click="proxyDevice()">Proxy</button>&nbsp;
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <hr />
      </div>
      <div class="col-md-12">
        <p>Batch</p>
      </div>

      <div class="col-md-12">
        <button type="button" class="btn btn-secondary" @click="clearLog()">Clear log</button>&nbsp;
        <button type="button" class="btn btn-secondary" @click="listBatches()">List</button>&nbsp;
        <button type="button" class="btn btn-secondary" @click="addBatch()">Add</button>&nbsp;
        <button type="button" class="btn btn-secondary" @click="deleteBatch()">Delete</button>&nbsp;
        <button type="button" class="btn btn-secondary" @click="updateBatch()">Update</button>&nbsp;
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <hr />
      </div>
      <div class="col-md-12">
        <p>Gravity</p>
      </div>

      <div class="col-md-12">
        <button type="button" class="btn btn-secondary" @click="clearLog()">Clear log</button>&nbsp;
        <button type="button" class="btn btn-secondary" @click="listGravity()">List</button>&nbsp;
        <button type="button" class="btn btn-secondary" @click="addGravity()">Add</button>&nbsp;
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <hr />
      </div>

      <div class="col-md-12">
        <p></p>
        <textarea v-model="output" rows="20" cols="120"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { global, deviceStore, batchStore, gravityStore } from '@/modules/pinia'
import { Device } from '@/modules/deviceStore'
import { Batch } from '@/modules/batchStore'
import { logDebug } from '@/modules/logger'

const output = ref('')

function clearLog() {
  logDebug('TestView.clearLog()')
  output.value = 'Log cleared\n'
}

function listDevices() {
  logDebug('TestView.listDevices()')

  deviceStore.getDeviceList((success, dl) => {
    if (success && dl.length) {
      for (var i = 0; i < dl.length; i++) {
        output.value += JSON.stringify(dl[i].toJson()) + '\n'
      }
    } else {
      output.value += 'Failed to load devices or list is empty\n'
    }
  })
}

function addDevice() {
  logDebug('TestView.addDevice()')

  const chars = 'ABCDEF0123456789'
  const len = 6
  let id = ''
  for (let i = 0; i < len; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  const device = new Device(
    0,
    id,
    'esp32',
    'gravmon',
    'hostname',
    '<config>',
    'pink',
    'http://localhost',
    'generated device'
  )

  deviceStore.addDevice(device, (success) => {
    if (success) {
      output.value += 'Added device\n'
    } else {
      output.value += 'Failed to add device\n'
    }
  })
}

function deleteDevice() {
  logDebug('TestView.deleteDevice()')

  deviceStore.getDeviceList((success, deviceList) => {
    if (success && deviceList.length) {
      deviceStore.deleteDevice(deviceList[0].id, (success) => {
        if (success) {
          output.value += 'Deleted device\n'
        } else {
          output.value += 'Failed to delete device\n'
        }
      })
    } else {
      output.value += 'Failed to get list of devices or list is empty\n'
    }
  })
}

function updateDevice() {
  logDebug('TestView.updateDevice()')

  deviceStore.getDeviceList((success, deviceList) => {
    if (success && deviceList.length) {
      deviceList[0].description = 'Updated entry'

      deviceStore.updateDevice(deviceList[0], (success) => {
        if (success) {
          output.value += 'Updated device\n'
        } else {
          output.value += 'Failed to update device\n'
        }
      })
    } else {
      output.value += 'Failed to get list of devices or list is empty\n'
    }
  })
}

function searchDevice() {
  logDebug('TestView.searchDevice()')

  deviceStore.searchNetwork((success, ml) => {
    if (success) {
      ml.forEach((m) => {
        output.value += m.host + ',' + m.type + ',' + m.name + '\n'
      })
    } else {
      output.value += 'Failed to search for devices\n'
    }
  })
}

function proxyDevice() {
  logDebug('TestView.proxyDevice()')

  deviceStore.proxyRequest((success, response) => {
    if (success) {
      output.value += response + '\n'
    } else {
      output.value += 'Failed to execute proxy request\n'
    }
  })
}

function listBatches() {
  logDebug('TestView.listBatches()')

  batchStore.getBatchList((success, bl) => {
    if (success && bl.length) {
      for (var i = 0; i < bl.length; i++) {
        output.value += JSON.stringify(bl[i].toJson()) + '\n'
      }
    } else {
      output.value += 'Failed to load batches or list is empty\n'
    }
  })
}

function addBatch() {
  logDebug('TestView.addBatch()')

  const batch = new Batch(
    0,
    'name',
    'description',
    'AAAAAA',
    true,
    '20240101',
    'IPA',
    'MP',
    1.0,
    2.0,
    3.0,
    ''
  )

  batchStore.addBatch(batch, (success) => {
    if (success) {
      output.value += 'Added batch\n'
    } else {
      output.value += 'Failed to add batch\n'
    }
  })
}

function deleteBatch() {
  logDebug('TestView.deleteBatch()')

  batchStore.getBatchList((success, batchList) => {
    if (success && batchList.length) {
      batchStore.deleteBatch(batchList[0].id, (success) => {
        if (success) {
          output.value += 'Deleted batch\n'
        } else {
          output.value += 'Failed to delete batch\n'
        }
      })
    } else {
      output.value += 'Failed to get list of batches or list is empty\n'
    }
  })
}

function updateBatch() {
  logDebug('TestView.updateBatch()')

  batchStore.getBatchList((success, batchList) => {
    if (success && batchList.length) {
      batchList[0].description = 'Updated entry'

      batchStore.updateBatch(batchList[0], (success) => {
        if (success) {
          output.value += 'Updated batch\n'
        } else {
          output.value += 'Failed to update batch\n'
        }
      })
    } else {
      output.value += 'Failed to get list of batches or list is empty\n'
    }
  })
}

function addGravity() {
  logDebug('TestView.addGravity()')

  const chars = 'ABCDEF0123456789'
  const len = 6
  let id = ''
  for (let i = 0; i < len; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  for (var i = 0; i < 10; i++) {
    global.disabled = true

    var data = {
      name: 'test',
      ID: id,
      token: 'token',
      interval: 900,
      temperature: Math.random() * 10,
      temp_units: 'C',
      gravity: 1 + Math.random(),
      angle: Math.random() * 5,
      battery: 3.67,
      RSSI: -12,
      'corr-gravity': 1 + Math.random(),
      'gravity-unit': 'G',
      'run-time': 6
    }

    fetch(global.baseURL + 'api/gravity/public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: global.token },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(global.fetchTimout)
    })
      .then((res) => {
        global.disabled = false
        logDebug('TestView.addGravity()', res.status)
        if (res.status != 200) {
          logDebug('TestView.addGravity()', 'Failed to add gravity')
        } else {
          logDebug('TestView.addGravity()', 'Added gravity')
        }
      })
      .catch((err) => {
        logDebug('TestView.addGravity()', err)
        global.disabled = false
      })
  }
}

function listGravity() {
  logDebug('TestView.listGravity()')

  batchStore.getBatchList((success, batchList) => {
    if (success && batchList.length) {
      logDebug('TestView.listGravity()', 'Using batch', batchList[0].id)
      gravityStore.getGravityListForBatch(batchList[0].id, (success, gl) => {
        if (success && gl.length) {
          logDebug('TestView.listGravity()', 'Processing gravity')
          for (var i = 0; i < gl.length; i++) {
            output.value += JSON.stringify(gl[i].toJson()) + '\n'
          }
        } else {
          output.value += 'Failed to load gravity or list is empty\n'
        }
      })
    } else {
      output.value += 'Failed to get list of batches or list is empty\n'
    }
  })
}
</script>
