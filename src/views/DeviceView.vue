<template>
  <div class="container">
    <p></p>
    <p class="h3">Device</p>
    <hr>

    <template v-if="device != null">
      <form @submit.prevent="save" class="needs-validation" novalidate>
        <div class="row">
          <div class="col-md-12">
            <BsInputText v-model="device.chipId" label="Chip ID" width="4" maxlength="6" help=""
              :disabled="global.disabled || !isNew()" @keyup="validateChipId()"
              :class="chipIdValid ? '' : 'is-invalid'">
            </BsInputText>
          </div>
          <div class="col-md-12">
            <BsInputText v-model="device.mdns" label="mDNS" width="6" help="" :disabled="global.disabled">
            </BsInputText>
          </div>
          <div class="col-md-12">
            <BsInputText v-model="device.url" type="url" label="URL" width="11" help="" :disabled="global.disabled">
            </BsInputText>
          </div>
          <div class="col-md-12">
            <BsInputText v-model="device.description" label="Description" width="11" help=""
              :disabled="global.disabled">
            </BsInputText>
          </div>
          <div class="col-md-12">
            <BsInputRadio v-model="device.chipFamily" :options="chipFamilyOptions" label="Chip Family" help=""
              :disabled="global.disabled"></BsInputRadio>
          </div>
          <div class="col-md-12">
            <BsInputRadio v-model="device.software" :options="softwareOptions" label="Software" help=""
              :disabled="global.disabled"></BsInputRadio>
          </div>
          <div class="col-md-12">
            <BsInputRadio v-model="device.bleColor" :options="bleColorOptions" label="BLE Color" help=""
              :disabled="global.disabled"></BsInputRadio>
          </div>
          <div class="col-md-12">
            <BsInputText v-model="device.config" label="Configuration" width="11" help="" :disabled="global.disabled">
            </BsInputText>
          </div>
        </div>

        <div class="row gy-2">
          <div class="col-md-12">
          </div>
          <div class="col-md-12">
            <button type="submit" class="btn btn-primary w-2" :disabled="global.disabled">
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"
                :hidden="!global.disabled"></span> <i class="bi bi-floppy"></i>
              &nbsp;Save
            </button>&nbsp;
            <router-link :to="{ name: 'device-list' }">
              <button type="button" class="btn btn-secondary w-2"> <i class="bi bi-x-square"></i>
                Cancel
              </button>
            </router-link>&nbsp;
            <router-link :to="{ name: 'device-list' }">
              <button type="button" class="btn btn-secondary w-2"> <i class="bi bi-list"></i>
                Device list
              </button>
            </router-link>&nbsp;
            <button disabled type="button" class="btn btn-secondary" @click="fetchConfigFromDevice()"><i
                class="bi bi-box-arrow-down"></i> Fetch</button>&nbsp;
            <button disabled type="button" class="btn btn-secondary" @click="detectDeviceType()"><i
                class="bi bi-binoculars"></i>
              Detect</button>
          </div>
        </div>
      </form>

    </template>
    <template v-else>
      <BsMessage :dismissable="false" :message="'Unable to find device with id ' + $route.params.id" alert="danger" />
      <div class="row gy-2">
        <div class="col-md-12">
        </div>
        <div class="col-md-12">
          <router-link :to="{ name: 'device-list' }">
            <button type="button" class="btn btn-secondary w-2">
              Device list
            </button>
          </router-link>&nbsp;
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { global, deviceStore } from "@/modules/pinia"
import { validateCurrentForm } from '@/modules/utils'
import { Device } from '@/modules/deviceStore'
import { router } from '@/modules/router'
import { logDebug, logError, logInfo } from '@/modules/logger'

const device = ref(null)
const chipIdValid = ref(false)

const chipFamilyOptions = ref([
  { label: 'ESP8266', value: 'esp8266' },
  { label: 'ESP32', value: 'esp32' },
  { label: 'ESP32-C3', value: 'esp32c3' },
  { label: 'ESP32-S2', value: 'esp32s2' },
  { label: 'ESP32-S3', value: 'esp32s3' },
])

const softwareOptions = ref([
  { label: 'Gravitymon', value: 'Gravitymon' },
  { label: 'Kegmon', value: 'Kegmon' },
  { label: 'Pressuremon', value: 'Pressuremon' },
  { label: 'Brewpi', value: 'Brewpi' },
  { label: 'iSpindel', value: 'iSpindel' },
])

const bleColorOptions = ref([
  { label: '- disabled -', value: '' },
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Black', value: 'black' },
  { label: 'Purple', value: 'purple' },
  { label: 'Orange', value: 'orange' },
  { label: 'Blue', value: 'blue' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Pink', value: 'pink' },
])

function isNew() {
  return router.currentRoute.value.params.id == "new" ? true : false
}

onMounted(() => {
  logDebug("DeviceView.onMounted()")

  device.value = null
  chipIdValid.value = true

  if (isNew()) {
    device.value = new Device(0, "", "", "", "", "", "", "", "")
  } else {
    deviceStore.getDevice(router.currentRoute.value.params.id, (success, d) => {
      if (success) {
        device.value = d
        logDebug(device.value)
      } else {
        // global.messageError = "Failed to load device " + id
      }
    })
  }
})

function validateChipId() {
  logDebug("DeviceView.validateChipId()")

  const regex = new RegExp(/^([0-9,a-f]){6}$/)

  if (regex.test(device.value.chipId)) {
    chipIdValid.value = true
  } else {
    chipIdValid.value = false
  }

  return chipIdValid.value
}

function fetchConfigFromDevice() {
  // TODO: add option to fetch config from device 
  logInfo("DeviceView.fetchConfigFromDevice()", "Not implemented!")
}

function detectDeviceType() {
  // TODO: add option to detect software based on config 
  logInfo("DeviceView.detectDeviceType()", "Not implemented!")
}

const save = () => {
  logDebug("DeviceView.save()")

  if (!validateChipId()) return
  if (!validateCurrentForm()) return

  global.clearMessages()

  if (isNew()) {

    // Check if a device with the current chipId already exist
    for (var i = 0; i < deviceStore.devices.length; i++) {
      if (deviceStore.devices[i].chipId == device.value.chipId) {
        global.messageWarning = "A device with this chip ID already exists"
        return
      }
    }

    deviceStore.addDevice(device.value, (success) => {
      logDebug("DeviceView.addDevice()", "Add device", success)

      if (success) {
        global.messageSuccess = "Added device"
        deviceStore.getDeviceList((success) => {
          logDebug("DeviceView.addDevice()", "Refresh device list", success)

        })
      }
      else
        global.messageError = "Failed to add device"
    })
  } else {
    deviceStore.updateDevice(device.value, (success) => {
      logDebug("DeviceView.saveDevice()", "Update device", success)
      if (success)
        global.messageSuccess = "Saved device"
      else
        global.messageError = "Failed to save device"
    })
  }
}
</script>