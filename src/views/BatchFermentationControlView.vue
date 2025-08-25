<template>
  <div class="container">
    <p></p>
    <p class="h3">Batch Fermentation Control - '{{ batchName }}'</p>
    <hr />

    <div class="row" v-if="device != null">
      <div class="col-md-12">
        <p class="h4">Fermentation controller</p>
      </div>
      <div class="col-md-3">
        <BsInputReadonly v-model="device.software" label="Software"></BsInputReadonly>
      </div>
      <div class="col-md-3">
        <BsInputReadonly v-model="device.description" label="Description"></BsInputReadonly>
      </div>
      <div class="col-md-3">
        <BsInputReadonly v-model="device.mdns" label="MDNS"></BsInputReadonly>
      </div>
      <div class="col-md-3">
        <BsInputReadonly v-model="device.url" label="URL"></BsInputReadonly>
      </div>
    </div>

    <div class="row" v-if="activeFermentationSteps != null && activeFermentationSteps.length > 0">
      <div class="col-md-12">
        <p class="h4">Active Fermentation Steps</p>
        <FermentationStepFragment
          :fermentationSteps="activeFermentationSteps"
        ></FermentationStepFragment>
      </div>
    </div>

    <div class="row" v-if="fermentationSteps != null">
      <div class="col-md-12">
        <p class="h4">Fermentation Steps</p>

        <BsMessage
          v-if="activeFermentationSteps != null && activeFermentationSteps.length > 0"
          :dismissable="false"
          message="The fermentation device has active fermentation steps, Starting will overwrite those!"
          alert="warning"
        />

        <FermentationStepFragment :fermentationSteps="fermentationSteps"></FermentationStepFragment>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6">
        <button
          type="button"
          class="btn btn-primary w-3"
          @click="startSteps()"
          v-if="device != null && fermentationSteps != null"
        >
          Start</button
        >&nbsp;

        <router-link :to="{ name: 'batch', params: { id: router.currentRoute.value.params.id } }">
          <button type="button" class="btn btn-secondary w-3">Cancel</button> </router-link
        >&nbsp;

        <router-link :to="{ name: 'batch', params: { id: router.currentRoute.value.params.id } }">
          <button type="button" class="btn btn-secondary w-3">Back</button> </router-link
        >&nbsp;
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { batchStore, deviceStore, global } from '@/modules/pinia'
import { FermentationStep } from '@/modules/deviceStore'
import FermentationStepFragment from '@/fragments/FermentationStepFragment.vue'
import router from '@/modules/router'
import { logDebug, logInfo, logError } from '@/modules/logger'

const fermentationSteps = ref(null)
const batchName = ref('')
const device = ref(null)
const activeFermentationSteps = ref(null)

onMounted(() => {
  logDebug('BatchFermentationControlView.onMounted()')
  loadProfile()
})

function loadProfile() {
  logDebug('BatchFermentationControlView.loadProfile()')

  fermentationSteps.value = null
  device.value = null
  batchName.value = ''

  global.clearMessages()
  global.disabled = true

  batchStore.getBatch(router.currentRoute.value.params.id, (success, b) => {
    if (success) {
      batchName.value = b.name

      // Try to parse fermentation steps if defined in batch (should be imported from brewfather)
      try {
        fermentationSteps.value = FermentationStep.listFromJson(
          JSON.parse(b.fermentationSteps),
          true
        ) // Set new dates based on today
        logDebug(fermentationSteps.value)
      } catch (e) {
        logError('BatchFermentationControlView.onMounted()', e)
        global.messageError =
          'No fermentation profile found on batch, please connect with brewfather batch.'
        global.disabled = false
        return
      }

      // Try to load the fermentation controller if defined in batch (selected in UI)
      if (b.fermentationChamber > 0) {
        deviceStore.getDevice(b.fermentationChamber, (success, d) => {
          if (success) {
            device.value = d
            logInfo('BatchFermentationControlView.onMounted()', d)
          } else {
            global.messageError =
              'Failed to load the device configuration, check connected fermentation device.'
            global.disabled = false
            return
          }
        })
      } else {
        global.messageError = 'No fermentation controller is selected for this batch.'
        global.disabled = false
        return
      }

      // Check if there are defined fermentation steps for the device
      deviceStore.getDeviceFermentationSteps(b.fermentationChamber, (success, fsList) => {
        if (success) {
          activeFermentationSteps.value = fsList
        } else {
          global.messageError = 'Failed to check for active fermentration steps.'
          global.disabled = false
          return
        }
      })
    } else {
      global.messageError = 'Failed to load the batch.'
      global.disabled = false
    }
  })
}

function startSteps() {
  global.clearMessages()
  global.disabled = true

  if (activeFermentationSteps.value.length > 0) {
    deviceStore.deleteDeviceFermentationSteps(device.value.id, () => {
      activeFermentationSteps.value = []
      addSteps()
    })
  } else {
    addSteps()
  }
}

function addSteps() {
  logInfo('BatchFermentationControlView.addSteps()')

  // TODO: Some more validation is needed, check that controller is chamber controller device, check if steps alreay exist for this device => replace
  // TODO: This should not be accessible if device and steps are not loaded correctly

  deviceStore.addDeviceFermentationSteps(device.value.id, fermentationSteps.value, (success) => {
    if (success) {
      logInfo('BatchFermentationControlView.addSteps()', 'Success')
      loadProfile()
      global.messageSuccess =
        'Fermentation steps for device has been created, it will take a few minutes for execution to start.'
    } else {
      logInfo('BatchFermentationControlView.addSteps()', 'Success')
      global.messageError = 'Failed to load the device.'
      global.disabled = false
    }
  })
}
</script>
