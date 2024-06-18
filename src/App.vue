<template>
  <BsIcon :init="true"></BsIcon>

  <dialog id="spinner" class="loading">
    <div class="container text-center">
      <div class="row align-items-center" style="height: 170px">
        <div class="col">
          <div class="spinner-border" role="status" style="width: 5rem; height: 5rem;">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  </dialog>

  <div v-if="!global.initialized" class="container text-center">
    <BsMessage message="Initalizing Brewlogger interface" class="h2" :dismissable="false" alert="info"></BsMessage>
  </div>

  <Menubar v-if="global.initialized" :disabled="global.disabled" />

  <div class="container">
    <div>
      <p></p>
    </div>
    <BsMessage v-if="global.isError" :close="close" :dismissable="true" :message="global.messageError" alert="danger" />
    <BsMessage v-if="global.isWarning" :close="close" :dismissable="true" :message="global.messageWarning"
      alert="warning" />
    <BsMessage v-if="global.isSuccess" :close="close" :dismissable="true" :message="global.messageSuccess"
      alert="success" />
    <BsMessage v-if="global.isInfo" :close="close" :dismissable="true" :message="global.messageInfo" alert="info" />
  </div>

  <router-view v-if="global.initialized" />
  <Footer v-if="global.initialized"
    :text="'(c) 2023-2024 Magnus Persson, ui version ' + global.uiVersion + ' (' + global.uiBuild + ')'" />

</template>

<script setup>
import Menubar from "@/components/Menubar.vue"
import Footer from "@/components/Footer.vue"
import { onMounted, watch } from 'vue'
import { global, config, batchStore, deviceStore, saveConfigState } from "@/modules/pinia"
import { storeToRefs } from 'pinia'
import { logDebug, logError, logInfo } from '@/modules/logger'

const props = defineProps(['App'])
const { disabled, batchListFilterDevice, batchListFilterActive, batchListFilterData, deviceListFilterSoftware } = storeToRefs(global)

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
  logDebug("App.close()", alert)

  if (alert == "danger")
    global.messageError = ""
  else if (alert == "warning")
    global.messageWarning = ""
  else if (alert == "success")
    global.messageSuccess = ""
  else if (alert == "info")
    global.messageInfo = ""
}

watch(disabled, () => {
  logDebug("App.watch(disabled)")

  if (global.disabled)
    document.body.style.cursor = 'wait';
  else
    document.body.style.cursor = 'default';
})

onMounted(() => {
  logDebug("App.onMounted()")

  // Load persistent settings from browser
  global.batchListFilterDevice = localStorage.getItem('batchListFilterDevice')
  global.batchListFilterActive = localStorage.getItem('batchListFilterActive')
  global.batchListFilterData = localStorage.getItem('batchListFilterData')
  global.deviceListFilterSoftware = localStorage.getItem('deviceListFilterSoftware')

  if(global.batchListFilterDevice === null)
      global.batchListFilterDevice = "*"
  if(global.batchListFilterActive === null)
      global.batchListFilterActive = false
  if(global.batchListFilterData === null)
      global.batchListFilterData = false
  if(global.deviceListFilterSoftware === null)
      global.deviceListFilterSoftware = "*"

  logDebug("App.onMounted()", global.batchListFilterDevice, global.batchListFilterActive, global.batchListFilterData, global.deviceListFilterSoftware)

  // Load from API's
  if (!global.initialized) {
    logDebug("App.onMounted()", "Initializing")
    showSpinner()

    config.load((success) => {
      logDebug("App.onMounted()", "Configuration loaded", success)
      if (success) {
        saveConfigState()
        deviceStore.getDeviceList((success) => {
          logDebug("App.onMounted()", "Devices loaded", success)
          if (success) {
            batchStore.getBatchList((success) => {
              logDebug("App.onMounted()", "Batches loaded", success)
              if (success) {
                global.initialized = true
                hideSpinner()
              } else {
                global.messageError = "Failed to load list of batches"
                hideSpinner()
              }
            })
          } else {
            global.messageError = "Failed to load list of devices"
            hideSpinner()
          }
        })
      } else {
        global.messageError = "Failed to load configuration"
        hideSpinner()
      }
    })
  }
})

function showSpinner() {
  logDebug("App.showSpinner()")
  document.querySelector('#spinner').showModal()
}

function hideSpinner() {
  logDebug("App.hideSpinner()")
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
