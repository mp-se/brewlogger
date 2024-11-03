<template>
  <div class="container">
    <p></p>
    <p class="h3">Device</p>
    <hr />

    <template v-if="device != null">
      <form @submit.prevent="save" class="needs-validation" novalidate>
        <div class="row">
          <div class="col-md-12">
            <BsInputText
              v-model="device.chipId"
              label="Chip ID"
              width="4"
              maxlength="6"
              help=""
              :disabled="global.disabled || !isNew()"
              @keyup="validateChipId()"
              :class="chipIdValid ? '' : 'is-invalid'"
            >
            </BsInputText>
          </div>
          <div class="col-md-12">
            <BsInputText
              v-model="device.mdns"
              label="mDNS"
              width="6"
              help=""
              :disabled="global.disabled"
            >
            </BsInputText>
          </div>
          <div class="col-md-12">
            <BsInputText
              v-model="device.url"
              type="url"
              label="URL"
              width="11"
              help=""
              :disabled="global.disabled"
            >
            </BsInputText>
          </div>
          <div class="col-md-12">
            <BsInputText
              v-model="device.description"
              label="Description"
              width="11"
              help=""
              :disabled="global.disabled"
            >
            </BsInputText>
          </div>
          <div class="col-md-12">
            <BsInputRadio
              v-model="device.chipFamily"
              :options="chipFamilyOptions"
              label="Chip Family"
              help=""
              :disabled="global.disabled"
            ></BsInputRadio>
          </div>
          <div class="col-md-12">
            <BsInputRadio
              v-model="device.software"
              :options="softwareOptions"
              label="Software"
              help=""
              :disabled="global.disabled || device.chipId == '000000'"
            ></BsInputRadio>
          </div>
          <div class="col-md-12" v-if="device.software == 'Gravitymon'">
            <BsInputRadio
              v-model="device.bleColor"
              :options="bleColorOptions"
              label="BLE Color"
              help="Used for receving gravity readings via Tilt"
              :disabled="disableTilt"
            ></BsInputRadio>
          </div>
          <div class="col-md-11" v-if="device.software != 'Brewpi'">
            <BsInputText v-model="device.config" label="Configuration" width="11" help="" disabled>
            </BsInputText>
          </div>
          <div class="col-md-1" v-if="device.software != 'Brewpi'">
            <BsInputBase label="&nbsp;">
              <button
                type="button"
                class="btn btn-secondary btn-sm"
                @click="copyToClipboard()"
                :disabled="global.disabled"
              >
                <i class="bi bi-clipboard"></i></button
              >&nbsp;
            </BsInputBase>
          </div>
        </div>

        <div class="row gy-2" v-if="activeFermentationSteps != null">
          <div class="col-md-12">
            <hr />
          </div>
          <div class="row">
            <div class="col-md-12">
              <p class="h4">Active Fermentation Steps</p>
              <FermentationStepFragment
                :fermentationSteps="activeFermentationSteps"
              ></FermentationStepFragment>
            </div>
          </div>
        </div>

        <div class="row gy-2">
          <div class="col-md-12">
            <hr />
          </div>
          <div class="col-md-12">
            <button
              type="submit"
              class="btn btn-primary w-2"
              :disabled="global.disabled || !deviceChanged()"
            >
              <span
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
                :hidden="!global.disabled"
              ></span>
              <i class="bi bi-floppy"></i>
              &nbsp;Save</button
            >&nbsp;
            <router-link :to="{ name: 'device-list' }">
              <button type="button" class="btn btn-secondary w-2">
                <i class="bi bi-x-square"></i>
                Cancel
              </button> </router-link
            >&nbsp;

            <template v-if="device.software != 'Brewwpi'">
              <button
                type="button"
                class="btn btn-secondary"
                @click="fetchConfigFromDevice()"
                :disabled="global.disabled || device.url == ''"
              >
                <i class="bi bi-box-arrow-down"></i> Fetch config</button
              >&nbsp;
            </template>

            <BsModal
              @click="viewConfig()"
              v-model="render"
              :code="true"
              title="Vire configuration"
              button="View config"
              :disabled="global.disabled || device.config == ''"
            />&nbsp;

            <BsModalConfirm
              :callback="deleteFermentationStepsCallback"
              message="Do you reallu want to delete the fermentation steps"
              id="deleteFermentationSteps"
              title="Delete"
              :disabled="global.disabled"
            />

            <template v-if="activeFermentationSteps != null">
              <button
                type="button"
                class="btn btn-secondary"
                @click="deleteFermentationSteps()"
                :disabled="global.disabled"
              >
                Delete steps</button
              >&nbsp;
            </template>
          </div>
        </div>
      </form>
    </template>
    <template v-else>
      <BsMessage
        :dismissable="false"
        :message="'Unable to find device with id ' + $route.params.id"
        alert="danger"
      />
      <div class="row gy-2">
        <div class="col-md-12"></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { global, deviceStore } from '@/modules/pinia'
import { validateCurrentForm } from '@/modules/utils'
import { Device } from '@/modules/deviceStore'
import FermentationStepFragment from '@/fragments/FermentationStepFragment.vue'
import router from '@/modules/router'
import { logDebug, logError, logInfo } from '@/modules/logger'
import BsInputBase from '@/components/BsInputBase.vue'

const render = ref('')
const device = ref(null)
const deviceSaved = ref(null)
const chipIdValid = ref(false)
const activeFermentationSteps = ref(null)

const chipFamilyOptions = ref([
  { label: '- unknown -', value: '' },
  { label: 'ESP8266', value: 'esp8266' },
  { label: 'ESP32', value: 'esp32' },
  { label: 'ESP32-C3', value: 'esp32c3' },
  { label: 'ESP32-S2', value: 'esp32s2' },
  { label: 'ESP32-S3', value: 'esp32s3' }
])

const softwareOptions = ref([
  { label: '- unknown -', value: '' },
  { label: 'Gravitymon', value: 'Gravitymon' },
  { label: 'Gravitymon Gateway', value: 'Gravitymon-Gateway' },
  { label: 'Kegmon', value: 'Kegmon' },
  { label: 'Brewpi', value: 'Brewpi' }
  // { label: 'Pressuremon', value: 'Pressuremon' },
  // { label: 'iSpindel', value: 'iSpindel' }
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
  { label: 'Pink', value: 'pink' }
])

function deviceChanged() {
  logDebug('DeviceView.deviceChanged()')

  if (device.value == null) return false

  global.deviceChanged = !Device.compare(device.value, deviceSaved.value)
  return global.deviceChanged
}

const viewConfig = () => {
  render.value = device.value.config
}

const disableTilt = computed(() => {
  if (device.value.software != 'Gravitymon') return true

  if (
    device.value.chipFamily != 'esp32' &&
    device.value.chipFamily != 'esp32c3' &&
    device.value.chipFamily != 'esp32s3'
  )
    return true

  return global.disabled
})

function isNew() {
  return router.currentRoute.value.params.id == 'new' ? true : false
}

onMounted(() => {
  logDebug('DeviceView.onMounted()')

  device.value = null
  activeFermentationSteps.value = null
  chipIdValid.value = true

  if (isNew()) {
    deviceSaved.value = new Device()
    device.value = new Device()
  } else {
    deviceStore.getDevice(router.currentRoute.value.params.id, (success, d, fs) => {
      if (success) {
        deviceSaved.value = Device.fromJson(d.toJson())
        device.value = d
        if (fs.length > 0) {
          activeFermentationSteps.value = fs
        }
      } else {
        // global.messageError = "Failed to load device " + id
      }
    })
  }
})

function validateChipId() {
  logDebug('DeviceView.validateChipId()')

  if (device.value.software == 'Brewpi') {
    device.value.chipId = '000000'
    return true
  }

  const regex = new RegExp(/^([0-9,a-f]){6}$/)

  if (regex.test(device.value.chipId)) {
    chipIdValid.value = true
  } else {
    chipIdValid.value = false
  }

  return chipIdValid.value
}

async function copyToClipboard() {
  logInfo('DeviceView.copyToClipboard()')
  navigator.clipboard.writeText(device.value.config)
  global.messageSuccess = 'Configuration is copied to clipboard'
}

async function fetchConfigFromDevice() {
  logInfo('DeviceView.fetchConfigFromDevice()')

  global.clearMessages()
  global.disabled = true
  validateUrl()
  await fetchConfigEspFwkV1() // Applies to Kegmon 1.x and Gravitymon 2.x
  // TODO: Validate fetch from old Gravitymon 1.x and Kegmon 0.x
  // TODO: Validate fetch from BrewPi
  global.disabled = false
}

async function proxyRequest(url, header) {
  var body = { url: url, method: 'GET', body: '', header: header }
  logDebug('DeviceView.proxyRequest()', body)

  const res = await fetch(global.baseURL + 'api/device/proxy_fetch/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: global.token },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000)
  }).catch((err) => {
    logError('DeviceView.proxyRequest()', err)
    throw new Error('Fetch error ' + err)
  })

  if (!res.ok) {
    logError('BackupView.getBatchList()', res.status)
    throw new Error('Failed to perform proxy request' + res.status)
  }

  const json = await res.json()
  return json
}

/*
 * Fetch config from a device with API V1.x that uses /api/auth and /api/config (with auth)
 */
async function fetchConfigEspFwkV1() {
  try {
    var data = {}

    const status = await proxyRequest(device.value.url + 'api/status', '')
    logDebug('DeviceView.fetchConfigV2()', status)
    data.status = status

    // Gravitymon, Kegmon etc
    if (status.platform !== undefined) {
      device.value.chipFamily = status.platform
    }
    if (status.mdns !== undefined) {
      device.value.mdns = status.mdns
    }

    // Gravitymon
    if (status.gravity_format !== undefined) {
      device.value.software = 'Gravitymon'
    }

    const header = 'Authorization: Basic ' + btoa('username:password')
    const auth = await proxyRequest(device.value.url + 'api/auth', header)
    logDebug('DeviceView.fetchConfigV2()', auth)

    const header2 = 'Authorization: Bearer ' + auth.token
    const config = await proxyRequest(device.value.url + 'api/config', header2)
    logDebug('DeviceView.fetchConfigV2()', config)
    data.config = config

    // Gravitymon
    if (config.ble_tilt_color !== undefined) {
      device.value.bleColor = config.ble_tilt_color
    }

    if (device.value.software == 'Gravitymon') {
      const format = await proxyRequest(device.value.url + 'api/format', header2)
      logDebug('DeviceView.fetchConfigV2()', format)
      data.format = format
    }

    device.value.config = JSON.stringify(data)
    return true
  } catch (err) {
    logError('DeviceView.fetchConfigV2()', err)
    global.messageError = 'Error when trying to retrive data from device'
  }

  return false
}

function validateUrl() {
  device.value.url =
    device.value.url.endsWith('/') || device.value.url.length < 7
      ? device.value.url
      : device.value.url + '/'
}

const save = () => {
  logDebug('DeviceView.save()')

  validateUrl()
  if (!validateChipId()) return
  if (!validateCurrentForm()) return

  global.clearMessages()
  deviceSaved.value = Device.fromJson(device.value.toJson())

  if (isNew()) {
    // Check if a device with the current chipId already exist
    for (var i = 0; i < deviceStore.devices.length; i++) {
      if (deviceStore.devices[i].chipId == device.value.chipId && device.value.chipId != '000000') {
        global.messageWarning = 'A device with this chip ID already exists'
        return
      }
    }

    deviceStore.addDevice(device.value, (success, d) => {
      logDebug('DeviceView.addDevice()', 'Add device', success)
      device.value = d
      if (success) {
        deviceStore.getDeviceList((success) => {
          logDebug('DeviceView.addDevice()', 'Change to editor', success, device.value)
          router.push({ name: 'device', params: { id: device.value.id } })
        })
      } else {
        global.messageError = 'Failed to add device'
      }
    })
  } else {
    deviceStore.updateDevice(device.value, (success) => {
      logDebug('DeviceView.saveDevice()', 'Update device', success)
      if (success) global.messageSuccess = 'Saved device'
      else global.messageError = 'Failed to save device'
    })
  }
}

function deleteFermentationSteps() {
  logDebug('DeviceView.deleteFermentationSteps()')
  document.getElementById('deleteFermentationSteps').click()
}

function deleteFermentationStepsCallback() {
  logDebug('DeviceView.deleteFermentationStepsCallback()')

  deviceStore.deleteDeviceFermentationSteps(device.value.id, (success) => {
    logDebug('DeviceView.deleteFermentationSteps()', success)
    if (success) {
      global.messageSuccess = 'Fermentation steps removed'
      activeFermentationSteps.value = null
    } else {
      global.messageError = 'Failed to remove fermentation steps'
    }
  })
}
</script>
