<!--
BrewLogger
Copyright (c) 2021-2026 Magnus

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Alternatively, this software may be used under the terms of a
commercial license. See LICENSE_COMMERCIAL for details.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->
<template>
  <div class="container">
    <BsPageHeader title="Batch" />

    <template v-if="batch != null">
      <form @submit.prevent="save" class="needs-validation" novalidate>
        <div class="row">
          <div class="col-md-6">
            <BsInputText v-model="batch.name" label="Name" help="" :disabled="global.disabled">
            </BsInputText>
          </div>
          <div class="col-md-3">
            <BsSelect v-model="batch.chipIdGravity" label="Gravity Device" :options="gravityDeviceOptions" help=""
              :disabled="global.disabled"></BsSelect>
          </div>
          <div class="col-md-3">
            <BsSelect v-model="batch.chipIdPressure" label="Pressure Device" :options="pressureDeviceOptions" help=""
              :disabled="global.disabled"></BsSelect>
          </div>
          <div class="col-md-3">
            <BsSelect v-model="batch.fermentationChamber" label="Fermentation chamber"
              :options="tempControlDeviceOptions" help="" :disabled="global.disabled"></BsSelect>
          </div>
          <div class="col-md-2" v-if="activeFermentationSteps.length > 0">
            <BsInputBase label="&nbsp;">
              <div class="input-group">
                <p class="fs-5"><span class="badge text-bg-warning">Controller active</span></p>
              </div>
            </BsInputBase>
          </div>
          <div class="col-md-12">
            <BsInputText v-model="batch.description" label="Description" help="" :disabled="global.disabled">
            </BsInputText>
          </div>
          <div class="col-md-4">
            <BsInputText v-model="batch.brewer" label="Brewer" help="" :disabled="global.disabled">
            </BsInputText>
          </div>
          <div class="col-md-4">
            <BsInputText v-model="batch.brewDate" label="Brew date" help="" :disabled="global.disabled">
            </BsInputText>
          </div>
          <div class="col-md-4">
            <BsSelect v-model="batch.style" label="Style" :options="beerStyleOptions" help=""
              :disabled="global.disabled">
            </BsSelect>
          </div>
          <div class="col-md-4">
            <BsInputRadio v-model="batch.active" :options="activeOptions" label="Receiving data" help=""
              :disabled="global.disabled"></BsInputRadio>
          </div>
          <div class="col-md-4">
            <BsInputRadio v-model="batch.tapList" :options="tapListOptions" label="Tap list" help=""
              :disabled="global.disabled"></BsInputRadio>
          </div>
          <div class="col-md-4">
            <BsSelect @change="brewfatherChanged(batch.brewfatherId)" v-model="batch.brewfatherId" label="Brewfather ID"
              :options="brewfatherOptions" help="" :disabled="global.disabled || brewfatherOptions.length <= 1">
            </BsSelect>
          </div>
          <div class="col-md-4">
            <BsInputNumber v-model="batch.abv" width="5" label="Alcohol" unit="% ABV" min="0" max="100" step="0.01"
              help="" :disabled="global.disabled">
            </BsInputNumber>
          </div>
          <div class="col-md-4">
            <BsInputNumber v-model="batch.ebc" width="5" label="Color" unit="EBC" min="0" max="100" step="0.1" help=""
              :disabled="global.disabled">
            </BsInputNumber>
          </div>
          <div class="col-md-4">
            <BsInputNumber v-model="batch.ibu" width="5" label="Bitterness" unit="IBU" min="0" max="100" step="0.1"
              help="" :disabled="global.disabled">
            </BsInputNumber>
          </div>
          <div class="col-md-4">
            <BsInputNumber v-model="ogDisplayValue" width="5" label="Original Gravity" :unit="gravityUnit" min="0"
              max="40" :step="ogStep" :disabled="global.disabled">
            </BsInputNumber>
          </div>
          <div class="col-md-4">
            <BsInputNumber v-model="fgDisplayValue" width="5" label="Final Gravity" :unit="gravityUnit" min="0" max="40"
              :step="fgStep" :disabled="global.disabled">
            </BsInputNumber>
          </div>

          <div class="col-md-12">
            <hr />
          </div>

          <div class="col-md-12">
            <label class="form-label fw-bold">Fermentation Steps</label>

            <FermentationStepFragment v-model:fermentationSteps="parsedFermentationSteps" :tempUnit="config.tempUnit">
            </FermentationStepFragment>
          </div>
        </div>

        <div class="row gy-2">
          <div class="col-md-12">
            <hr />
          </div>
          <div class="col-md-12">
            <button type="submit" class="btn btn-primary w-2" :disabled="global.disabled || !batchChanged()">
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"
                :hidden="!global.disabled"></span>
              <i class="bi bi-floppy"></i>
              &nbsp;Save</button>&nbsp;
            <router-link :to="{ name: 'batch-list' }">
              <button type="button" class="btn btn-secondary w-2">
                <i class="bi bi-x-square"></i>
                Cancel
              </button> </router-link>&nbsp;

            <template v-if="batch.fermentationChamber > 0 && batch.fermentationSteps != ''">
              <router-link :to="{
                name: 'batch-fermentation-control',
                params: { id: router.currentRoute.value.params.id }
              }">
                <button type="button" class="btn btn-secondary w-3" :disabled="global.batchChanged">
                  Fermentation Control
                </button> </router-link>&nbsp;
            </template>

            <BsModalConfirm :callback="deleteFermentationStepsCallback"
              message="Do you reallu want to delete the fermentation steps" id="deleteFermentationSteps" title="Delete"
              :disabled="global.disabled" />

            <template v-if="activeFermentationSteps.length > 0">
              <button type="button" class="btn btn-secondary" @click="deleteFermentationSteps()"
                :disabled="global.disabled">
                Delete steps</button>&nbsp;
            </template>
          </div>
        </div>
      </form>
    </template>

    <template v-else>
      <div class="row gy-2">
        <div class="col-md-12">
          <p class="h4">Loading...</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { global, deviceStore, batchStore, brewfatherStore, config } from '@/modules/pinia'
import { validateCurrentForm, tempToF, tempToC } from '@/modules/utils'
import { Batch } from '@/modules/classes'
import router from '@/modules/router'
import { logDebug } from '@/modules/logger'
import FermentationStepFragment from '@/fragments/FermentationStepFragment.vue'
import { useGravityConversion } from '@/modules/useUnitConversion'
import { beerStyleOptions } from '@/modules/constants/beerStyles'
import BsPageHeader from '@/components/BsPageHeader.vue'

const batch = ref(null)
const batchSaved = ref(null)

const gravityDeviceOptions = ref([])
const pressureDeviceOptions = ref([])
const tempControlDeviceOptions = ref([])
const activeFermentationSteps = ref('')

const activeOptions = ref([
  { label: 'Active', value: true },
  { label: 'Closed', value: false }
])

const tapListOptions = ref([
  { label: 'Visible', value: true },
  { label: 'Hidden', value: false }
])

const brewfatherOptions = ref([{ label: '- Not connected -', value: '' }])

const parsedFermentationSteps = ref([])

// Sync parsed steps back to batch whenever the fragment updates the array
// Convert F→C before storing (database always stores in Celsius)
watch(parsedFermentationSteps, (steps) => {
  if (batch.value) {
    const stepsInC = config.isTempF
      ? steps.map((s) => ({ ...s, temp: tempToC(s.temp) }))
      : steps
    batch.value.fermentationSteps = stepsInC.length > 0 ? JSON.stringify(stepsInC) : ''
  }
}, { deep: true })

const {
  displayValue: ogDisplayValue,
  unit: gravityUnit,
  step: ogStep
} = useGravityConversion(batch, 'og')
const { displayValue: fgDisplayValue, step: fgStep } = useGravityConversion(batch, 'fg')

function batchChanged() {
  logDebug('BatchView.batchChanged()')

  if (batch.value == null) return false

  global.batchChanged = !Batch.compare(batch.value, batchSaved.value)
  return global.batchChanged
}

function isNew() {
  return router.currentRoute.value.params.id == 'new' ? true : false
}

function brewfatherChanged(id) {
  logDebug('BatchView.brewfatherChanged()', id)

  brewfatherStore.batches.forEach((b) => {
    if (id == b.brewfatherId) {
      batch.value.name = b.name
      batch.value.brewDate = b.brewDate
      batch.value.brewer = b.brewer
      batch.value.style = b.style
      batch.value.ebc = b.ebc
      batch.value.abv = b.abv
      batch.value.ibu = b.ibu
      batch.value.og = b.og
      batch.value.fg = b.fg
      batch.value.fermentationSteps = b.fermentationSteps
      return
    }
  })
}

onMounted(async () => {
  logDebug('BatchView.onMounted()')

  batch.value = null

  const success = await brewfatherStore.getBatchList()
  logDebug('BatchView.onMounted()', success)

  if (success) {
    brewfatherStore.batches.forEach((b) => {
      brewfatherOptions.value.push({
        label: b.name + ', ' + b.brewDate + ', ' + b.brewer + ', ' + b.style,
        value: b.brewfatherId
      })
    })

    updateDeviceOptions()
    activeFermentationSteps.value = ''

    if (isNew()) {
      batchSaved.value = new Batch()
      batch.value = new Batch()
      parsedFermentationSteps.value = []
    } else {
      const batchResult = await batchStore.getBatch(router.currentRoute.value.params.id)
      if (batchResult) {
        // Normalize fermentationSteps JSON string so Batch.compare() works correctly
        if (batchResult.fermentationSteps) {
          try {
            batchResult.fermentationSteps = JSON.stringify(JSON.parse(batchResult.fermentationSteps))
          } catch {
            batchResult.fermentationSteps = ''
          }
        }
        batchSaved.value = Batch.fromJson(batchResult.toJson())
        batch.value = batchResult
        parsedFermentationSteps.value = batchResult.fermentationSteps
          ? JSON.parse(batchResult.fermentationSteps).map((s) =>
            config.isTempF ? { ...s, temp: Number(tempToF(s.temp).toFixed(1)) } : s
          )
          : []

        if (batchResult.fermentationChamber > 0) {
          const deviceResult = await deviceStore.getDevice(batchResult.fermentationChamber)
          if (deviceResult && deviceResult.device) {
            const { stepList } = deviceResult
            if (stepList.length > 0) {
              activeFermentationSteps.value = stepList
            }
          } else {
            // global.messageError = "Failed to load device " + id
          }
        }
      } else {
        global.messageError = 'Failed to load batch ' + router.currentRoute.value.params.id
      }
    }
  }
})

function updateDeviceOptions() {
  logDebug('BatchView.updateDeviceOptions()')

  gravityDeviceOptions.value = []
  gravityDeviceOptions.value = [{ value: '', label: '-- Disabled --' }]
  pressureDeviceOptions.value = [{ value: '', label: '-- Disabled --' }]
  tempControlDeviceOptions.value = [{ value: 0, label: '-- Disabled --' }]

  deviceStore.devices.forEach((d) => {
    if (d.software == 'Gravitymon') {
      var sg =
        d.mdns != ''
          ? d.mdns
          : d.url != ''
            ? d.url
            : d.description != ''
              ? d.description
              : d.software

      gravityDeviceOptions.value.push({
        value: d.chipId,
        label: d.chipId + ' (' + sg + ')'
      })
    } else if (d.software == 'Pressuremon') {
      var sp =
        d.mdns != ''
          ? d.mdns
          : d.url != ''
            ? d.url
            : d.description != ''
              ? d.description
              : d.software

      pressureDeviceOptions.value.push({
        value: d.chipId,
        label: d.chipId + ' (' + sp + ')'
      })
    } else if (d.software == 'Chamber-Controller') {
      var sc = d.mdns != '' ? d.mdns : d.url != '' ? d.url : d.description

      if (d.url != '') {
        tempControlDeviceOptions.value.push({
          value: d.id,
          label: d.software + '(' + sc + ')'
        })
      }
    }
  })

  logDebug('BatchView.updateDeviceOptions()', 'Gravity', gravityDeviceOptions.value)
  logDebug('BatchView.updateDeviceOptions()', 'Pressure', pressureDeviceOptions.value)
  logDebug('BatchView.updateDeviceOptions()', 'Chamber', tempControlDeviceOptions.value)
}

const save = async () => {
  logDebug('BatchView.save()')

  if (!validateCurrentForm()) return

  global.clearMessages()
  batchSaved.value = Batch.fromJson(batch.value.toJson())

  if (isNew()) {
    const result = await batchStore.addBatch(batch.value)
    logDebug('BatchView.addBatch()', result)
    if (result) {
      batch.value = result
      logDebug('BatchView.addBatch()', 'Change to editor', result, batch.value)
      router.push({ name: 'batch', params: { id: batch.value.id } })
    } else {
      global.messageError = 'Failed to add batch'
    }
  } else {
    const success = await batchStore.updateBatch(batch.value)
    logDebug('BatchView.saveBatch()', success)
    if (success) global.messageSuccess = 'Saved batch'
    else global.messageError = 'Failed to save batch'
  }
}

function deleteFermentationSteps() {
  logDebug('DeviceView.deleteFermentationSteps()')
  document.getElementById('deleteFermentationSteps').click()
}

async function deleteFermentationStepsCallback() {
  logDebug('DeviceView.deleteFermentationStepsCallback()')

  const success = await deviceStore.deleteDeviceFermentationSteps(batch.value.fermentationChamber)
  logDebug('DeviceView.deleteFermentationSteps()', success)
  if (success) {
    global.messageSuccess = 'Fermentation steps removed'
    activeFermentationSteps.value = ''
  } else {
    global.messageError = 'Failed to remove fermentation steps'
  }
}
</script>
