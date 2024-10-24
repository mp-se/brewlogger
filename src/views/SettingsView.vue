<template>
  <div class="container">
    <p></p>
    <p class="h3">Settings</p>
    <hr />

    <form @submit.prevent="saveSettings" class="needs-validation" novalidate>
      <div class="row">
        <div class="col-md-4">
          <BsInputRadio
            v-model="config.temperatureFormat"
            :options="temperatureOptions"
            label="Temperature Format"
            width=""
            :disabled="global.disabled"
          ></BsInputRadio>
        </div>
        <div class="col-md-4">
          <BsInputRadio
            v-model="config.gravityFormat"
            :options="gravityOptions"
            label="Gravity Format"
            width=""
            :disabled="global.disabled"
          ></BsInputRadio>
        </div>
        <div class="col-md-4">
          <BsInputRadio
            v-model="config.pressureFormat"
            :options="pressureOptions"
            label="Pressure Format"
            width=""
            :disabled="global.disabled"
          ></BsInputRadio>
        </div>

        <div class="col-md-12">
          <hr />
        </div>

        <div class="col-md-12">
          <BsInputText
            v-model="config.gravityForwardUrl"
            :options="pressureOptions"
            label="Gravity Forward URL"
            type="url"
            help="Enter URL to forward received gravity readings to in iSpindle format, transmission will be done every 15 minutes."
            width=""
            :disabled="global.disabled"
          ></BsInputText>
        </div>

        <div class="col-md-12">
          <hr />
        </div>

        <div class="col-md-4">
          <BsInputRadio
            v-model="config.dark_mode"
            :options="darkModeOptions"
            label="Dark mode"
            width=""
            :disabled="global.disabled"
          ></BsInputRadio>
        </div>
        <!-- 
        <div class="col-md-6">
          <BsInputNumber
            v-model="config.mdnsTimeout"
            min="1"
            max="60"
            label="MDNS Search Timeout"
            width="2"
            help="How long time will be scan for MDNS devices on the local network"
            :disabled="global.disabled"
          >
          </BsInputNumber>
        </div>-->
      </div>

      <div class="row gy-2">
        <div class="col-md-12">
          <hr />
        </div>
        <div class="col-md-3">
          <button
            type="submit"
            class="btn btn-primary w-2"
            :disabled="global.disabled || !global.configChanged"
          >
            <span
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
              :hidden="!global.disabled"
            ></span>
            &nbsp;Save
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { global, config } from '@/modules/pinia'
import { validateCurrentForm } from '@/modules/utils'
import { logDebug } from '@/modules/logger'

const temperatureOptions = ref([
  { label: 'Celsius °C', value: 'C' },
  { label: 'Fahrenheit °F', value: 'F' }
])

const gravityOptions = ref([
  { label: 'Specific Gravity', value: 'SG' },
  { label: 'Plato', value: 'P' }
])

const pressureOptions = ref([
  { label: 'PSI', value: 'PSI' },
  { label: 'Bar', value: 'BAR' }
])

const darkModeOptions = ref([
  { label: 'Dark Mode', value: true },
  { label: 'Day Mode', value: false }
])

const saveSettings = () => {
  logDebug('SettingsView.saveSettings()')

  if (!validateCurrentForm()) return

  config.save((success) => {
    if (success) global.messageSuccess = 'Settings saved'
    else global.messageError = 'Failed to save settings'
  })
}
</script>
