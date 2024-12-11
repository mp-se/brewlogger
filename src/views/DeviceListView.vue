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
    <template v-if="deviceList != null">
      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col" class="col-sm-3">
              <div :class="sortedClass('mdns')">
                mDNS&nbsp;
                <a class="icon-link icon-link-hover" @click="sortList(deviceList, 'mdns', 'str')">
                  <i :class="sortedIconClass"></i>
                </a>
              </div>
            </th>
            <th scope="col" class="col-sm-1">
              <div :class="sortedClass('chipId')">
                Chip ID&nbsp;
                <a class="icon-link icon-link-hover" @click="sortList(deviceList, 'chipId', 'str')">
                  <i :class="sortedIconClass"></i>
                </a>
              </div>
            </th>
            <th scope="col" class="col-sm-1">
              <div :class="sortedClass('chipFamily')">
                Chip Family&nbsp;
                <a
                  class="icon-link icon-link-hover"
                  @click="sortList(deviceList, 'chipFamily', 'str')"
                >
                  <i :class="sortedIconClass"></i>
                </a>
              </div>
            </th>
            <th scope="col" class="col-sm-2">
              <div :class="sortedClass('software')">
                Software&nbsp;
                <a
                  class="icon-link icon-link-hover"
                  @click="sortList(deviceList, 'software', 'str')"
                >
                  <i :class="sortedIconClass"></i>
                </a>
              </div>
            </th>
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

          <button @click="search()" type="button" class="btn btn-secondary">
            Search for Devices</button
          >&nbsp;

          <router-link :to="{ name: 'device-log' }">
            <button type="button" class="btn btn-secondary">Device Logs</button> </router-link
          >&nbsp;

        </div>
      </div>
    </template>

    <template v-else>
      <div class="row gy-2">
        <div class="col-md-12">
          <p class="h4">Loading...</p>
        </div>
      </div>
    </template>

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
import {
  sortedIconClass,
  setSortingDefault,
  sortedClass,
  sortList,
  applySortList
} from '@/modules/ui'
import { detectId, detectMdns, detectPlatform, detectSoftware } from '@/modules/detect'

const confirmDeleteMessage = ref(null)
const confirmDeleteId = ref(null)

const deviceList = ref(null)
const { updatedDeviceData, deviceListFilterSoftware } = storeToRefs(global)

watch(updatedDeviceData, () => {
  filterDeviceList()
  applySortList(deviceList.value)
})

const softwareOptions = ref([
  { label: '(All)', value: '*' },
  { label: '(Blank)', value: '' },
  { label: 'Gravitymon', value: 'Gravitymon' },
  { label: 'Gravitymon Gateway', value: 'Gravitymon-Gateway' },
  { label: 'Chamber Controller', value: 'Chamber-Controller' },
  { label: 'Kegmon', value: 'Kegmon' },
  // { label: 'Pressuremon', value: 'Pressuremon' },
  // { label: 'iSpindel', value: 'iSpindel' }
])

const searchOptions = ref(null)
const searchSelected = ref('')

onMounted(() => {
  logDebug('DeviceListView.onMounted()')
  setSortingDefault('mdns', 'str', false)
  filterDeviceList()
  applySortList(deviceList.value)
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
}

watch(deviceListFilterSoftware, async (selected) => {
  logDebug('DeviceListView.watch(filterSoftware)', selected)
  filterDeviceList()
  applySortList(deviceList.value)
})

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
          detectDeviceType('http://' + e.value)
        }
      })
    }
  }
}

async function detectDeviceType(url) {
  logDebug('DeviceListView.detectDeviceType()', url)

  // This should detect the GravityMon, KegMon and PressureMon software
  const status = await deviceStore.proxyRequestWaitable("GET", url + '/api/status', "")
  logDebug('DeviceView.fetchConfigEspFwkV1()', status)

  var device = new Device(0, '', '', '', '', '', '', url, '', false)

  device.chipId = detectId(status)
  device.mdns = detectMdns(status)
  device.chipFamily = detectPlatform(status)
  device.software = detectSoftware(status)
  
  if (device.chipId != '') {
    deviceStore.addDevice(device, (success) => {
      if (success) {
        global.messageSuccess = 'Saved device ' + device.mdns
      } else {
        global.messageError = 'Failed to save device, it might already exist.'
      }
    })
  } else {
    global.messageError = 'Unable to detect device type for ' + device.mdns
  }
}
</script>
