<template>
  <div class="container">
    <p></p>
    <p class="h3">Batch</p>
    <hr>

    <template v-if="batch != null">
      <form @submit.prevent="save" class="needs-validation" novalidate>

        <div class="row">
          <div class="col-md-6">
            <BsInputText v-model="batch.name" label="Name" help="" :disabled="global.disabled">
            </BsInputText>
          </div>
          <div class="col-md-6">
            <BsSelect v-model="batch.chipId" label="Device" :options="chipIdOptions" help=""
              :disabled="global.disabled"></BsSelect>
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
            <BsSelect v-model="batch.style" label="Style" :options="styleOptions" help="" :disabled="global.disabled">
            </BsSelect>

            <!--
            <BsInputText v-model="batch.style" label="Style" help="" :disabled="global.disabled">
            </BsInputText>
            -->
          </div>
          <div class="col-md-4">
            <BsInputRadio v-model="batch.active" :options="toggleOptions" label="Active" help=""
              :disabled="global.disabled"></BsInputRadio>
          </div>
          <div class="col-md-4">
            <BsInputNumber v-model="batch.abv" width="5" label="Alcohol" unit="% ABV" min="0" max="100" step="0.01"
              help="" :disabled="global.disabled">
            </BsInputNumber>
          </div>
          <div class="col-md-4">
            <BsInputNumber v-model="batch.ebc" width="5" label="Color" unit="EBC" min="0" max="100" step="1" help=""
              :disabled="global.disabled">
            </BsInputNumber>
          </div>
          <div class="col-md-4">
            <BsInputNumber v-model="batch.ibu" width="5" label="Bitterness" unit="IBU" min="0" max="100" step="1"
              help="" :disabled="global.disabled">
            </BsInputNumber>
          </div>
          <div class="col-md-12">
            <BsInputText v-model="batch.brewfatherId" label="Brewfather ID" help="" :disabled="global.disabled">
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
            <router-link :to="{ name: 'batch-list' }">
              <button type="button" class="btn btn-secondary w-2"> <i class="bi bi-x-square"></i>
                Cancel
              </button>
            </router-link>&nbsp;
            <router-link :to="{ name: 'batch-list' }">
              <button type="button" class="btn btn-secondary w-2"> <i class="bi bi-list"></i>
                Batch list
              </button>
            </router-link>&nbsp;
          </div>
        </div>
      </form>
    </template>

    <template v-else>

      <BsMessage :dismissable="false" :message="'Unable to find batch with id ' + $route.params.id" alert="danger" />

      <div class="row gy-2">
        <div class="col-md-12">
        </div>
        <div class="col-md-12">
          <router-link :to="{ name: 'batch-list' }">
            <button type="button" class="btn btn-secondary w-2">
              Batch list
            </button>
          </router-link>&nbsp;
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { global, deviceStore, batchStore } from "@/modules/pinia"
import { validateCurrentForm } from '@/modules/utils'
import { Batch } from '@/modules/batchStore'
import { router } from '@/modules/router'
import { logDebug, logError, logInfo } from '@/modules/logger'

// TODO: Add date selector
// TODO: Add synchronization with brewfather

const batch = ref(null)
const chipIdOptions = ref([])
const toggleOptions = ref([
  { label: 'Active', value: true },
  { label: 'Closed', value: false },
])

const styleOptions = ref([
  { label: '- undefined -', value: "" },
  { label: 'Bitter', value: "Bitter" },
  { label: 'Ale', value: "Ale" },
  { label: 'Stout', value: "Stout" },
  { label: 'Porter', value: "Porter" },
  { label: 'Lager', value: "Lager" },
  { label: 'Red Ale', value: "Red Ale" },
  { label: 'IPA', value: "IPA" },
  // TODO: Add list of approved beer styles
])

function isNew() {
  return router.currentRoute.value.params.id == "new" ? true : false
}

onMounted(() => {
  logDebug("BatchView.onMounted()")

  batch.value = null

  updateChipIdOptions()

  if (isNew()) {
    batch.value = new Batch(0, "", "", "", true, "", "", "", 0.0, 0, 0, "")
  } else {
    batchStore.getBatch(router.currentRoute.value.params.id, (success, b) => {
      if (success) {
        batch.value = b
        logDebug(batch.value)
      } else {
        // global.messageError = "Failed to load batch " + id
      }
    })
  }
})

function updateChipIdOptions() {
  logDebug("BatchView.updateChipIdOptions()")

  chipIdOptions.value = []

  deviceStore.getDeviceList((success, dl) => {
    if (success) {
      for (var i = 0; i < dl.length; i++) {
        chipIdOptions.value.push({ "value": dl[i].chipId, "label": dl[i].chipId + " (" + dl[i].mdns + ")" })
      }

      logDebug("BatchView.updateChipIdOptions()", chipIdOptions.value)
    } else {
      global.messageError = "Failed to load device list"
    }
  })
}

const save = () => {
  logDebug("BatchView.save()")

  if (!validateCurrentForm()) return

  global.clearMessages()

  if (isNew()) {
    batchStore.addBatch(batch.value, (success) => {
      logDebug("BatchView.addBatch()", success)

      if (success)
        global.messageSuccess = "Added batch"
      else
        global.messageError = "Failed to add batch"
    })
  } else {
    batchStore.updateBatch(batch.value, (success) => {
      logDebug("BatchView.saveBatch()", success)
      if (success)
        global.messageSuccess = "Saved batch"
      else
        global.messageError = "Failed to save batch"
    })

  }
}
</script>