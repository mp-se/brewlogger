<template>
  <dialog id="spinner" class="loading">
    <div class="container text-center">
      <div class="row align-items-center" style="height: 170px">
        <div class="col">
          <div class="spinner-border" role="status" style="width: 5rem; height: 5rem">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  </dialog>

  <div v-if="!global.initialized" class="container text-center">
    <BsMessage
      message="Initalizing Brewlogger interface"
      class="h2"
      :dismissable="false"
      alert="info"
    ></BsMessage>
  </div>

  <BsMenuBar v-if="global.initialized" :disabled="global.disabled" brand="BrewLogger" />

  <div class="container">
    <div>
      <p></p>
    </div>
    <BsMessage
      v-if="global.isError"
      :close="close"
      :dismissable="true"
      :message="global.messageError"
      alert="danger"
    />
    <BsMessage
      v-if="global.isWarning"
      :close="close"
      :dismissable="true"
      :message="global.messageWarning"
      alert="warning"
    />
    <BsMessage
      v-if="global.isSuccess"
      :close="close"
      :dismissable="true"
      :message="global.messageSuccess"
      alert="success"
    />
    <BsMessage
      v-if="global.isInfo"
      :close="close"
      :dismissable="true"
      :message="global.messageInfo"
      alert="info"
    />
  </div>

  <router-view v-if="global.initialized" />
  <BsFooter
    v-if="global.initialized"
    :text="
      '(c) 2023-2024 Magnus Persson, ui version ' + global.uiVersion + ' (' + global.uiBuild + ')'
    "
  />
</template>

<script setup>
import BsMenuBar from '@/components/BsMenuBar.vue'
import BsFooter from '@/components/BsFooter.vue'
import { onMounted, onUnmounted, watch, ref } from 'vue'
import { global, config, batchStore, deviceStore, saveConfigState } from '@/modules/pinia'
import { storeToRefs } from 'pinia'
import { logDebug, logInfo } from '@/modules/logger'

const socket = ref(null)

const {
  disabled,
  batchListFilterDevice,
  batchListFilterActive,
  batchListFilterData,
  deviceListFilterSoftware,
  showChamberTemps,
  showKegmonTaps,
} = storeToRefs(global)

watch(showChamberTemps, () => {
  localStorage.setItem('showChamberTemps', global.showChamberTemps)
})

watch(showKegmonTaps, () => {
  localStorage.setItem('showKegmonTaps', global.showKegmonTaps)
})

watch(batchListFilterDevice, () => {
  localStorage.setItem('batchListFilterDevice', global.batchListFilterDevice)
})

watch(batchListFilterActive, () => {
  localStorage.setItem('batchListFilterActive', global.batchListFilterActive)
})

watch(batchListFilterData, () => {
  localStorage.setItem('batchListFilterData', global.batchListFilterData)
})

watch(deviceListFilterSoftware, () => {
  localStorage.setItem('deviceListFilterSoftware', global.deviceListFilterSoftware)
})

const close = (alert) => {
  logDebug('App.close()', alert)

  if (alert == 'danger') global.messageError = ''
  else if (alert == 'warning') global.messageWarning = ''
  else if (alert == 'success') global.messageSuccess = ''
  else if (alert == 'info') global.messageInfo = ''
}

watch(disabled, () => {
  logDebug('App.watch(disabled)')

  if (global.disabled) document.body.style.cursor = 'wait'
  else document.body.style.cursor = 'default'
})

function connect() {
  var host = global.baseURL.replaceAll('http://', 'ws://')
  socket.value = new WebSocket(host + 'api/system/notify')

  socket.value.onopen = function () {
    logInfo('App.connect()', 'Established webocket with server for notifications.')
  }

  socket.value.onmessage = function (event) {
    var ev = JSON.parse(event.data)

    logDebug('App.connect()', ev)

    if (ev.table == 'device') {
      deviceStore.processEvent(ev.method, ev.id)
    } else if (ev.table == 'batch') {
      batchStore.processEvent(ev.method, ev.id)
    } else if (ev.table == 'gravity') {
      global.updatedGravityData += 1
    } else if (ev.table == 'pour') {
      global.updatedPourData += 1
    }
  }

  socket.value.onclose = function () {
    logInfo('App.connect()', 'Disconnected webocket from server, retry connection.')
    socket.value = null
    setTimeout(() => {
      connect()
    }, 100)
  }
}

onUnmounted(() => {
  if (socket.value) socket.value.close()
  socket.value = null
})

function test() {
  deviceStore
}

onMounted(() => {
  logDebug('App.onMounted()')

  // Load persistent settings from browser
  global.batchListFilterDevice = localStorage.getItem('batchListFilterDevice')
  global.batchListFilterActive =
    localStorage.getItem('batchListFilterActive') == 'true' ? true : false
  global.batchListFilterData = localStorage.getItem('batchListFilterData') == 'true' ? true : false
  global.deviceListFilterSoftware = localStorage.getItem('deviceListFilterSoftware')
  global.showChamberTemps = localStorage.getItem('showChamberTemps') == 'true' ? true : false
  global.showKegmonTaps = localStorage.getItem('showKegmonTaps') == 'true' ? true : false

  if (global.batchListFilterDevice === null) global.batchListFilterDevice = '*'
  if (global.batchListFilterActive === null) global.batchListFilterActive = false
  if (global.batchListFilterData === null) global.batchListFilterData = false
  if (global.deviceListFilterSoftware === null) global.deviceListFilterSoftware = '*'
  if (global.showChamberTemps === null) global.showChamberTemps = false
  if (global.showKegmonTaps === null) global.showKegmonTaps = false

  logDebug(
    'App.onMounted()',
    global.batchListFilterDevice,
    global.batchListFilterActive,
    global.batchListFilterData,
    global.deviceListFilterSoftware,
    global.showChamberTemps,
    global.showKegmonTaps,
  )

  // Load from API's
  if (!global.initialized) {
    logDebug('App.onMounted()', 'Initializing')
    showSpinner()

    config.load((success) => {
      logDebug('App.onMounted()', 'Configuration loaded', success)
      if (success) {
        saveConfigState()
        deviceStore.getDeviceList((success) => {
          logDebug('App.onMounted()', 'Devices loaded', success)
          if (success) {
            batchStore.getBatchList((success) => {
              logDebug('App.onMounted()', 'Batches loaded', success)
              if (success) {
                global.initialized = true
                hideSpinner()

                test()
              } else {
                global.messageError = 'Failed to load list of batches'
                hideSpinner()
              }
            })
          } else {
            global.messageError = 'Failed to load list of devices'
            hideSpinner()
          }
        })
      } else {
        global.messageError = 'Failed to load configuration'
        hideSpinner()
      }
    })
  }

  setTimeout(() => {
    connect()
  }, 100)
})

function showSpinner() {
  logDebug('App.showSpinner()')
  document.querySelector('#spinner').showModal()
}

function hideSpinner() {
  logDebug('App.hideSpinner()')
  document.querySelector('#spinner').close()
}
</script>

<style>
.loading {
  position: fixed;
  width: 200px;
  height: 200px;
  padding: 10px;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border: 0;
}

dialog::backdrop {
  background-color: black;
  opacity: 60%;
}
</style>
