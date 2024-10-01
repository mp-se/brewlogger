<template>
  <div class="container">
    <p></p>
    <p class="h3">Batch</p>
    <hr />

    <template v-if="batch != null">
      <form @submit.prevent="save" class="needs-validation" novalidate>
        <div class="row">
          <div class="col-md-6">
            <BsInputText v-model="batch.name" label="Name" help="" :disabled="global.disabled">
            </BsInputText>
          </div>
          <div class="col-md-3">
            <BsSelect
              v-model="batch.chipId"
              label="Device"
              :options="gravityDeviceOptions"
              help=""
              :disabled="global.disabled"
            ></BsSelect>
          </div>
          <div class="col-md-3">
            <BsSelect
              v-model="batch.fermentationChamber"
              label="Fermentation chamber"
              :options="tempControlDeviceOptions"
              help=""
              :disabled="global.disabled"
            ></BsSelect>
          </div>
          <div class="col-md-12">
            <BsInputText
              v-model="batch.description"
              label="Description"
              help=""
              :disabled="global.disabled"
            >
            </BsInputText>
          </div>
          <div class="col-md-4">
            <BsInputText v-model="batch.brewer" label="Brewer" help="" :disabled="global.disabled">
            </BsInputText>
          </div>
          <div class="col-md-4">
            <BsInputText
              v-model="batch.brewDate"
              label="Brew date"
              help=""
              :disabled="global.disabled"
            >
            </BsInputText>
          </div>
          <div class="col-md-4">
            <BsSelect
              v-model="batch.style"
              label="Style"
              :options="styleOptions"
              help=""
              :disabled="global.disabled"
            >
            </BsSelect>
          </div>
          <div class="col-md-4">
            <BsInputRadio
              v-model="batch.active"
              :options="toggleOptions"
              label="Active"
              help=""
              :disabled="global.disabled"
            ></BsInputRadio>
          </div>
          <div class="col-md-8">
            <BsSelect
              @change="brewfatherChanged(batch.brewfatherId)"
              v-model="batch.brewfatherId"
              label="Brewfather ID"
              :options="brewfatherOptions"
              help=""
              :disabled="global.disabled"
            >
            </BsSelect>
          </div>
          <div class="col-md-4">
            <BsInputNumber
              v-model="batch.abv"
              width="5"
              label="Alcohol"
              unit="% ABV"
              min="0"
              max="100"
              step="0.01"
              help=""
              :disabled="global.disabled"
            >
            </BsInputNumber>
          </div>
          <div class="col-md-4">
            <BsInputNumber
              v-model="batch.ebc"
              width="5"
              label="Color"
              unit="EBC"
              min="0"
              max="100"
              step="0.1"
              help=""
              :disabled="global.disabled"
            >
            </BsInputNumber>
          </div>
          <div class="col-md-4">
            <BsInputNumber
              v-model="batch.ibu"
              width="5"
              label="Bitterness"
              unit="IBU"
              min="0"
              max="100"
              step="1"
              help=""
              :disabled="global.disabled"
            >
            </BsInputNumber>
          </div>
        </div>

        <div class="row gy-2">
          <div class="col-md-12"></div>
          <div class="col-md-12">
            <button type="submit" class="btn btn-primary w-2" :disabled="global.disabled || !batchChanged()">
              <span
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
                :hidden="!global.disabled"
              ></span>
              <i class="bi bi-floppy"></i>
              &nbsp;Save</button
            >&nbsp;
            <router-link :to="{ name: 'batch-list' }">
              <button type="button" class="btn btn-secondary w-2">
                <i class="bi bi-x-square"></i>
                Cancel
              </button> </router-link
            >&nbsp;
            <!-- 
            <router-link :to="{ name: 'batch-list' }">
              <button type="button" class="btn btn-secondary w-2">
                <i class="bi bi-list"></i>
                Batch list
              </button> </router-link
            >&nbsp;-->
          </div>
        </div>
      </form>
    </template>

    <template v-else>
      <!--
      <BsMessage :dismissable="false" :message="'Unable to find batch with id ' + $route.params.id" alert="danger" />
      -->

      <div class="row gy-2">
        <div class="col-md-12">
          <p class="h4">Loading...</p>
        </div>
        <div class="col-md-12">
          <router-link :to="{ name: 'batch-list' }">
            <button type="button" class="btn btn-secondary w-2">Batch list</button> </router-link
          >&nbsp;
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { global, deviceStore, batchStore, brewfatherStore } from '@/modules/pinia'
import { validateCurrentForm } from '@/modules/utils'
import { Batch } from '@/modules/batchStore'
import router from '@/modules/router'
import { logDebug } from '@/modules/logger'

// TODO: Add date selector

const batch = ref(null)
const batchSaved = ref(null)

const gravityDeviceOptions = ref([])
const tempControlDeviceOptions = ref([])

const toggleOptions = ref([
  { label: 'Active', value: true },
  { label: 'Closed', value: false }
])

const brewfatherOptions = ref([{ label: '- not connected -', value: '' }])

const styleOptions = ref([
  { label: '- undefined -', value: '' },
  { label: 'American Amber Ale', value: 'American Amber Ale' },
  { label: 'American Blonde Ale', value: 'American Blonde Ale' },
  { label: 'American Brown Ale', value: 'American Brown Ale' },
  { label: 'American IPA', value: 'American IPA' },
  { label: 'American Pale Ale', value: 'American Pale Ale' },
  { label: 'American Porter', value: 'American Porter' },
  { label: 'American Stout', value: 'American Stout' },
  { label: 'Barleywine', value: 'Barleywine' },
  { label: 'Belgian Dubbel', value: 'Belgian Dubbel' },
  { label: 'Belgian Tripel', value: 'Belgian Tripel' },
  { label: 'Berliner Weisse', value: 'Berliner Weisse' },
  { label: 'Bock', value: 'Bock' },
  { label: 'Brown Porter', value: 'Brown Porter' },
  { label: 'California Common', value: 'California Common' },
  { label: 'Cream Ale', value: 'Cream Ale' },
  { label: 'Doppelbock', value: 'Doppelbock' },
  { label: 'Dortmunder Export', value: 'Dortmunder Export' },
  { label: 'Dry Stout', value: 'Dry Stout' },
  { label: 'Dunkelweizen', value: 'Dunkelweizen' },
  { label: 'English Bitter', value: 'English Bitter' },
  { label: 'English Brown Ale', value: 'English Brown Ale' },
  { label: 'English IPA', value: 'English IPA' },
  { label: 'English Porter', value: 'English Porter' },
  { label: 'Foreign Extra Stout', value: 'Foreign Extra Stout' },
  { label: 'German Helles Exportbier', value: 'German Helles Exportbier' },
  { label: 'German Pilsner', value: 'German Pilsner' },
  { label: 'Gose', value: 'Gose' },
  { label: 'Hefeweizen', value: 'Hefeweizen' },
  { label: 'Imperial IPA', value: 'Imperial IPA' },
  { label: 'Imperial Stout', value: 'Imperial Stout' },
  { label: 'Irish Red Ale', value: 'Irish Red Ale' },
  { label: 'Kolsch', value: 'Kolsch' },
  { label: 'Marzen', value: 'Marzen' },
  { label: 'Munich Dunkel', value: 'Munich Dunkel' },
  { label: 'Munich Helles', value: 'Munich Helles' },
  { label: 'Oatmeal Stout', value: 'Oatmeal Stout' },
  { label: 'Oktoberfest', value: 'Oktoberfest' },
  { label: 'Old Ale', value: 'Old Ale' },
  { label: 'Pale Ale', value: 'Pale Ale' },
  { label: 'Pale Lager', value: 'Pale Lager' },
  { label: 'Pilsner', value: 'Pilsner' },
  { label: 'Robust Porter', value: 'Robust Porter' },
  { label: 'Saison', value: 'Robust Porter' },
  { label: 'Schwarzbier', value: 'Schwarzbier' },
  { label: 'Scotch Ale', value: 'Scotch Ale' },
  { label: 'Scottish Ale', value: 'Scottish Ale' },
  { label: 'Session IPA', value: 'Session IPA' },
  { label: 'Vienna Lager', value: 'Vienna Lager' },
  { label: 'Wheat Beer', value: 'Wheat Beer' },
  { label: 'Witbier', value: 'Witbier' }
])

function batchChanged() {
  logDebug("BatchView.batchChanged()")

  if(batch.value == null)
    return false

  return !Batch.compare(batch.value, batchSaved.value)
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
      return
    }
  })
}

onMounted(() => {
  logDebug('BatchView.onMounted()')

  batch.value = null

  brewfatherStore.getBatchList((success) => {
    logDebug(success)

    brewfatherStore.batches.forEach((b) => {
      brewfatherOptions.value.push({
        label: b.name + ', ' + b.brewDate + ', ' + b.brewer + ', ' + b.style,
        value: b.brewfatherId
      })
    })

    updateDeviceOptions()

    if (isNew()) {
      batch.value = new Batch()
    } else {
      batchStore.getBatch(router.currentRoute.value.params.id, (success, b) => {
        if (success) {
          batchSaved.value = Batch.fromJson(b.toJson())
          batch.value = b
          logDebug(batch.value)
        } else {
          global.messageError = 'Failed to load batch ' + router.currentRoute.value.params.id
        }
      })
    }
  })
})

function updateDeviceOptions() {
  logDebug('BatchView.updateDeviceOptions()')

  gravityDeviceOptions.value = []
  tempControlDeviceOptions.value = [{ value: 0, label: '-- Disabled --' }]

  deviceStore.getDeviceList((success, dl) => {
    if (success) {
      for (var i = 0; i < dl.length; i++) {
        const d = dl[i]

        if (d.software != 'Brewpi' && d.software != 'Kegmon') {
          var s =
            d.mdns != ''
              ? d.mdns
              : d.url != ''
                ? d.url
                : d.description != ''
                  ? d.description
                  : d.software

          gravityDeviceOptions.value.push({
            value: dl[i].chipId,
            label: dl[i].chipId + ' (' + s + ')'
          })
        }

        if (d.software == 'Brewpi' || d.chipId == '000000') {
          s = d.mdns != '' ? d.mdns : d.url != '' ? d.url : d.description

          tempControlDeviceOptions.value.push({
            value: dl[i].id,
            label: 'Brewpi (' + s + ')'
          })
        }
      }

      logDebug('BatchView.updateDeviceOptions()', gravityDeviceOptions.value)
      logDebug('BatchView.updateDeviceOptions()', tempControlDeviceOptions.value)
    } else {
      global.messageError = 'Failed to load device list'
    }
  })
}

const save = () => {
  logDebug('BatchView.save()')

  if (!validateCurrentForm()) return

  global.clearMessages()

  if (isNew()) {
    batchStore.addBatch(batch.value, (success) => {
      logDebug('BatchView.addBatch()', success)

      if (success) global.messageSuccess = 'Added batch'
      else global.messageError = 'Failed to add batch'
    })
  } else {
    batchStore.updateBatch(batch.value, (success) => {
      logDebug('BatchView.saveBatch()', success)
      if (success) global.messageSuccess = 'Saved batch'
      else global.messageError = 'Failed to save batch'
    })
  }
}
</script>
