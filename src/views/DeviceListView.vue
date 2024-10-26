<template>
  <div class="container">
    <div class="row">
      <div class="col-md-8">
        <p></p>
        <p class="h3">Device List</p>
      </div>
      <div class="col-md-4">
        <BsSelect
          v-model="global.deviceListFilterSoftware"
          :options="softwareOptions"
          label="Software"
          help=""
          :disabled="global.disabled"
        >
        </BsSelect>
      </div>
    </div>

    <hr />
    <table class="table table-striped">
      <thead>
        <tr>
          <th scope="col" class="col-sm-3">mDNS&nbsp;
            <a class="icon-link icon-link-hover" @click="sortDeviceList('mdns', 'str')">
              <i class="bi bi-sort-alpha-down"></i>
            </a></th>
          <th scope="col" class="col-sm-1">Chip ID&nbsp;
            <a class="icon-link icon-link-hover" @click="sortDeviceList('chipId'), 'str'">
              <i class="bi bi-sort-alpha-down"></i>
            </a></th>
          <th scope="col" class="col-sm-1">Chip Family&nbsp;
            <a class="icon-link icon-link-hover" @click="sortDeviceList('chipFamily', 'str')">
              <i class="bi bi-sort-alpha-down"></i>
            </a></th>
          <th scope="col" class="col-sm-2">Software&nbsp;
            <a class="icon-link icon-link-hover" @click="sortDeviceList('software', 'str')">
              <i class="bi bi-sort-alpha-down"></i>
            </a></th>
          <th scope="col" class="col-sm-2">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in deviceList" :key="d.id">
          <td class="fs-5">{{ d.mdns != '' ? d.mdns : d.url != '' ? d.url : d.description }}</td>
          <td class="fs-5">
            {{ d.chipId }}
          </td>
          <td class="fs-5">{{ d.chipFamily }}</td>
          <td class="fs-5">{{ d.software }}</td>
          <td>
            <router-link :to="{ name: 'device', params: { id: d.id } }">
              <button type="button" class="btn btn-primary btn-sm">
                <i class="bi bi-pencil-square"></i>
              </button> </router-link
            >&nbsp;
            <button
              type="button"
              class="btn btn-danger btn-sm"
              @click.prevent="deleteDevice(d.id, d.mdns)"
            >
              <i class="bi bi-file-x"></i></button
            >&nbsp;

            <template v-if="d.software == 'Brewpi'">
              <router-link :to="{ name: 'device-brewpi', params: { id: d.id } }">
                <button type="button" class="btn btn-info btn-sm">
                  <i class="bi bi-thermometer-snow"></i>
                </button> </router-link
              >&nbsp;
            </template>

            <template v-if="batchStore.anyBatchesForDevice(d.chipId)">
              <router-link :to="{ name: 'batch-list', query: { chipId: d.chipId } }">
                <button type="button" class="btn btn-success btn-sm">
                  <i class="bi bi-boxes"></i>
                </button> </router-link
              >&nbsp;
            </template>

            <template v-if="d.url.length > 7">
              <button @click="openUrl(d.url)" type="button" class="btn btn-secondary btn-sm">
                <i class="bi bi-link"></i></button
              >&nbsp;
            </template>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="row">
      <div class="col-md-12">
        <router-link :to="{ name: 'device', params: { id: 'new' } }">
          <button type="button" class="btn btn-secondary">Add Device</button> </router-link
        >&nbsp;

        <button @click="search()" type="button" class="btn btn-secondary">Search for Devices</button
        >&nbsp;
      </div>
    </div>

    <BsModalConfirm
      :callback="confirmDeleteCallback"
      :message="confirmDeleteMessage"
      id="deleteDevice"
      title="Delete device"
      :disabled="global.disabled"
    />

    <BsModalSelect
      v-model="searchSelected"
      :disabled="searchOptions == null ? true : false"
      :callback="confirmSearchCallback"
      message="Select a device to add"
      id="searchDevice"
      title="Select device"
      :options="searchOptions"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Device } from '@/modules/deviceStore'
import { global, deviceStore, batchStore } from '@/modules/pinia'
import { logDebug } from '@/modules/logger'

const confirmDeleteMessage = ref(null)
const confirmDeleteId = ref(null)

const deviceList = ref(null)
const { updatedDeviceData, deviceListFilterSoftware } = storeToRefs(global)

const sorting = ref( { column: 'mdns', type: 'str', order: true })

function sortDeviceList(column, type) {
  // Type: str, num, date
  logDebug('DeviceListView.sortDeviceList()', column, type)

  sorting.value.column = column 
  sorting.value.type = type 
  sorting.value.order = !sorting.value.order 
  applySortDeviceList()
}

function applySortDeviceList() {  
  logDebug('DeviceListView.applySortDeviceList()')

  if (sorting.value.order) {
    if (sorting.value.type == 'str') deviceList.value.sort((a, b) => a[sorting.value.column].localeCompare(b[sorting.value.column]))
    else if (sorting.value.type == 'date')
    deviceList.value.sort((a, b) => Date.parse(a[sorting.value.column]) - Date.parse(b[sorting.value.column]))
    else deviceList.value.sort((a, b) => a[sorting.value.column] - b[sorting.value.column])
  } else {
    if (sorting.value.type == 'str') deviceList.value.sort((a, b) => b[sorting.value.column].localeCompare(a[sorting.value.column]))
    else if (sorting.value.type == 'date')
    deviceList.value.sort((a, b) => Date.parse(b[sorting.value.column]) - Date.parse(a[sorting.value.column]))
    else deviceList.value.sort((a, b) => b[sorting.value.column] - a[sorting.value.column])
  }
}

watch(updatedDeviceData, () => {
  updateDeviceList()
})

const softwareOptions = ref([
  { label: '(All)', value: '*' },
  { label: '(Blank)', value: '' },
  { label: 'Gravitymon', value: 'Gravitymon' },
  { label: 'Kegmon', value: 'Kegmon' },
  // { label: 'Pressuremon', value: 'Pressuremon' },
  { label: 'Brewpi', value: 'Brewpi' }
  // { label: 'iSpindel', value: 'iSpindel' }
])

const searchOptions = ref(null)
const searchSelected = ref('')

onMounted(() => {
  logDebug('DeviceListView.onMounted()')
  deviceList.value = deviceStore.deviceList
  updateDeviceList()
})

function filterDeviceList() {
  logDebug('DeviceListView.filterDeviceList', global.deviceListFilterSoftware)

  deviceList.value = []
  deviceStore.deviceList.forEach((d) => {
    if (global.deviceListFilterSoftware == '*') {
      deviceList.value.push(d)
    } else {
      if (d.software == global.deviceListFilterSoftware) deviceList.value.push(d)
    }
  })

  applySortDeviceList()
}

watch(deviceListFilterSoftware, async (selected) => {
  logDebug('DeviceListView.watch(filterSoftware)', selected)
  filterDeviceList()
})

function updateDeviceList() {
  logDebug('DeviceListView.updateDeviceList()')

  deviceStore.getDeviceList((success, dl) => {
    if (success) {
      deviceList.value = dl
      filterDeviceList()
    } else {
      global.messageError = 'Failed to load device list'
    }
  })
}

const confirmDeleteCallback = (result) => {
  logDebug('DeviceListView.confirmDeleteCallback()', result)

  if (result) {
    global.disabled = true
    global.clearMessages()

    deviceStore.deleteDevice(confirmDeleteId.value, (success) => {
      if (success) global.messageSuccess = 'Deleted device'
      else global.messageError = 'Failed to delete device'

      global.disabled = false
    })
  }
}

const deleteDevice = (id, name) => {
  logDebug('DeviceListView.deleteDevice()', id, name)

  confirmDeleteMessage.value = "Do you really want to delete device ''" + name + "'"
  confirmDeleteId.value = id
  document.getElementById('deleteDevice').click()
}

function openUrl(url) {
  logDebug('DeviceListView.openUrl()', url)
  window.open(url, '_blank')
}

function search() {
  logDebug('DeviceListView.search()')

  global.disabled = true
  global.clearMessages()
  searchOptions.value = null
  searchSelected.value = ''
  document.getElementById('searchDevice').click()

  /*
  searchOptions.value = [{ label: "- none -", value: "", host: "", type: "", name: "" }]
  searchOptions.value.push({ label: "Test 1", value: "192.168.1.2", host: "host1", type: "http.local.", name: "name1" })
  searchOptions.value.push({ label: "Test 2", value: "192.168.1.3", host: "host2", type: "http.local.", name: "name2" })
  */

  deviceStore.searchNetwork((success, ml) => {
    if (success) {
      searchOptions.value = [{ label: '- none -', value: '' }]

      ml.forEach((m) => {
        searchOptions.value.push({
          label: m.name + ',' + m.host + ' (' + m.type + ')',
          value: m.host,
          host: m.host,
          type: m.type,
          name: m.name
        })
      })
    } else {
      global.messageError = 'Failed to search for mDNS devices on the local network'
    }
  })
}

const confirmSearchCallback = (result, value) => {
  logDebug('DeviceListView.confirmSearchCallback()', result, value)

  if (result) {
    global.clearMessages()
    global.disabled = true
    if (value != '') {
      searchOptions.value.forEach((e) => {
        if (e.value == value) {
          logDebug('DeviceListView.confirmSearchCallback()', e)
          detectDeviceType('http://' + e.name)
        }
      })
    }
  }
}

async function detectDeviceType(url) {
  logDebug('DeviceListView.detectDeviceType()', url)

  // This should detect the GravityMon, KegMon and PressureMon software
  await fetch(url + '/api/status', {
    method: 'GET',
    signal: AbortSignal.timeout(global.fetchTimout)
  })
    .then((res) => {
      logDebug('DeviceListView.detectDeviceType()', res.status)
      if (!res.ok) throw res
      return res.json()
    })
    .then((json) => {
      logDebug('DeviceListView.detectDeviceType()', json)

      var device = new Device(0, '', '', '', '', '', '', url, '')

      if (Object.prototype.hasOwnProperty.call(json, 'id')) {
        logDebug('DeviceListView.detectDeviceType()', 'ID found', json.id)
        device.chipId = json.id
      }

      if (Object.prototype.hasOwnProperty.call(json, 'mdns')) {
        logDebug('DeviceListView.detectDeviceType()', 'mDNS found', json.mdns)
        device.mdns = json.mdns
      }

      if (Object.prototype.hasOwnProperty.call(json, 'platform')) {
        logDebug('DeviceListView.detectDeviceType()', 'Platform found', json.platform.split(' ')[0])
        device.chipFamily = json.platform.split(' ')[0]
      }

      if (Object.prototype.hasOwnProperty.call(json, 'scale-raw1')) {
        logDebug('DeviceListView.detectDeviceType()', 'Software Kegmon')
        device.software = 'Kegmon'
      }

      // TODO: Add detection of gravitymon
      // TODO: Add detection of pressuremon

      if (device.chipId != '') {
        deviceStore.addDevice(device, (success) => {
          if (success) {
            global.messageSuccess = 'Saved device ' + device.mdns
          } else {
            global.messageError = 'Failed to save device'
          }
        })
      } else {
        global.messageError = 'Unable to detect device type for ' + device.mdns
      }
    })
    .catch((err) => {
      logDebug('DeviceListView.detectDeviceType()', err)
    })
}
</script>
