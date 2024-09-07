<template>
  <div class="container">
    <p></p>
    <p class="h3">Device - Brewpi</p>
    <hr />

    <template v-if="device != null">
      <div class="row gy-2 align-items-end">
        <div class="col-md-3">
          <pre
            v-if="lcd != null"
            style="
              background-color: black;
              color: yellow;
              text-align: center;
            ">{{ lcd[0] }}<br>{{ lcd[1] }}<br>{{ lcd[2] }}<br>{{ lcd[3] }}</pre>
        </div>

        <div class="col-md-12">
          <hr />
        </div>

        <template v-if="tempControl">
          <div class="col-md-4">
            <button @click="setFridgeTemp()" type="button" class="btn btn-success">
              <i class="bi bi-arrow-right-circle"></i>
              Set fridge temperature
            </button>
          </div>
          <div class="col-md-8">
            <BsInputNumber
              v-model="tempControl.fridgeSet"
              width="4"
              label="Fridge target temperature"
              :unit="tempControl.tempUnit"
              :min="tempControl.tempMin"
              :max="tempControl.tempMax"
              step="1"
              help=""
              :disabled="global.disabled"
            >
            </BsInputNumber>
          </div>

          <div class="col-md-12">
            <hr />
          </div>

          <!--
          <div class="col-md-4">
            <button @click="setBeerTemp()" type="button" class="btn btn-success"> <i
                class="bi bi-arrow-right-circle"></i>
              Set beer temperature
            </button>
          </div>
          <div class="col-md-8">
            <BsInputNumber v-model="tempControl.beerSet" width="4" label="Beer target temperature"
              :unit="tempControl.tempUnit" :min="tempControl.tempMin" :max="tempControl.tempMax" step="1" help=""
              :disabled="global.disabled">
            </BsInputNumber>
          </div>

          <div class="col-md-12">
            <hr>
          </div>
          -->
        </template>

        <div class="col-md-12">
          <router-link :to="{ name: 'device-list' }">
            <button type="button" class="btn btn-secondary w-2">
              <i class="bi bi-list"></i>
              Device list
            </button> </router-link
          >&nbsp;
        </div>
      </div>
    </template>

    <template v-else>
      <BsMessage
        :dismissable="false"
        :message="
          'Unable to find device with id ' + $route.params.id + ' or device is not a brewpi device'
        "
        alert="danger"
      />
      <div class="row gy-2">
        <div class="col-md-12"></div>
        <div class="col-md-12">
          <router-link :to="{ name: 'device-list' }">
            <button type="button" class="btn btn-secondary w-2">Device list</button> </router-link
          >&nbsp;
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { global, deviceStore } from '@/modules/pinia'
import { logDebug } from '@/modules/logger'
import router from '@/modules/router'
import { validateCurrentForm } from '@/modules/utils'

const device = ref(null)
const lcd = ref(null)
const ticker = ref(null)
const tempControl = ref(null)

onUnmounted(() => {
  logDebug('DeviceBrewpiView.onUnmounted()')

  if (ticker.value != null) clearInterval(ticker.value)
})

onMounted(() => {
  logDebug('DeviceBrewpiView.onMounted()')

  device.value = null
  tempControl.value = null

  deviceStore.getDevice(router.currentRoute.value.params.id, (success, d) => {
    if (success && d.software == 'Brewpi') {
      device.value = d
      fetchTempConfig()

      ticker.value = setInterval(() => {
        fetchDisplay()
      }, 2000)
    } else {
      // global.messageError = "Failed to load device " + id
    }
  })
})

/*function setBeerTemp() {
  logDebug("DeviceBrewpiView.setBeerTemp()")

  if (!validateCurrentForm())
    return
}*/

function setFridgeTemp() {
  logDebug('DeviceBrewpiView.setFridgeTemp()')

  if (!validateCurrentForm()) return

  global.disabled = true
  deviceStore.proxyRequest(
    device.value.url + 'api/mode/',
    'put',
    JSON.stringify({ mode: 'f', setPoint: tempControl.value.fridgeSet }),
    (success, res) => {
      logDebug('DeviceBrewpiView.setFridgeTemp()', success, res)
      if (success) {
        global.messageSuccess = 'Target temperature set'
        tempControl.value = null
        fetchTempConfig()
      } else {
        global.messageError = 'Failed to set target temperature'
      }
      global.disabled = false
    }
  )
}

function fetchTempConfig() {
  logDebug('DeviceBrewpiView.fetchTempConfig()')

  if (device.value.url == '') {
    global.messageError = 'Missing URL for device.'
    return
  }

  deviceStore.proxyRequest(
    device.value.url + 'api/all_temp_control/',
    'get',
    '',
    (success, res) => {
      logDebug('DeviceBrewpiView.fetchTempConfig()', success, res)

      /* { 
      "cc": {
        "tempFormat": "C",
        "tempSetMin": 1,
        "tempSetMax": 30,
        "pidMax": 10,
        "Kp": 5,
        "Ki": 0.25,
        "Kd": -1.5,
        "iMaxErr": 0.5,
        "idleRangeH": 1,
        "idleRangeL": -1,
        "heatTargetH": 0.299,
        "heatTargetL": -0.199,
        "coolTargetH": 0.199,
        "coolTargetL": -0.299,
        "maxHeatTimeForEst": 600
      },
      "cs": {
          "mode": "f",
          "beerSet": 0,
          "fridgeSet": 5,
          "heatEst": 0.199,
          "coolEst": 4.131
      },
      "cv": {
          "beerDiff": 0,
          "diffIntegral": 0,
          "beerSlope": 0,
          "p": 0,
          "i": 0,
          "d": 0,
          "estPeak": 5,
          "negPeakEst": 5,
          "posPeakEst": 48,
          "negPeak": 48,
          "posPeak": 48
      },
      "temp": {
          "BeerTemp": "",
          "BeerSet": 0,
          "BeerAnn": "",
          "FridgeTemp": 5.2,
          "FridgeSet": 5,
          "FridgeAnn": "",
          "RoomTemp": "",
          "State": 0
        }
      }*/

      tempControl.value = {
        tempUnit: res.cc.tempFormat,
        tempMin: res.cc.tempSetMin,
        tempMax: res.cc.tempSetMax,
        mode: res.cs.mode,
        beerSet: res.cs.beerSet,
        fridgeSet: res.cs.fridgeSet
      }

      logDebug(tempControl.value)
    }
  )
}

function fetchDisplay() {
  logDebug('DeviceBrewpiView.fetchDisplay()')

  deviceStore.proxyRequest(device.value.url + 'api/lcd/', 'get', '', (success, res) => {
    logDebug('DeviceBrewpiView.fetchDisplay()', success, res)
    lcd.value = JSON.parse(res)
  })
}
</script>
