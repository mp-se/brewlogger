<template>
  <div class="container">
    <p class="h3">Flash devices</p>
    <hr />
    <p class="fw-normal">
      Here you can flash your devices using the ESP Web Flasher. Note that flashing will do a FULL
      ERASE! This feature requires internet access for downloading firmware.
    </p>

    <div class="row">
      <div class="col-md-12">
        <BsInputRadio
          v-model="software"
          :options="softwareOptions"
          label="Software"
          help="Select which software to flash"
        ></BsInputRadio>
      </div>
    </div>

    <div class="col-md-12" v-if="software == 'gravitymon-gateway'">
      <BsInputRadio
        v-model="variant"
        :options="variantBoardOptions"
        label="Board variant"
        help="Choose the board manufacturer"
      ></BsInputRadio>
    </div>

    <div class="col-md-12" v-if="software != ''">
      <p>&nbsp;</p>
      <esp-web-install-button :manifest="manifestUrl"></esp-web-install-button>
      <p>&nbsp;</p>
      <p class="fw-normal">
        Some devices might need to be put in flash mode before flashing will work. Hold in EN and
        then do a reset and release EN should put the device in flashing mode.
      </p>
      <!-- 
      <p class="fw-normal">Using manfifest: {{ manifestUrl }}</p>
-->
      <p class="fw-normal">Software version: {{ softwareVersion }}</p>
    </div>

    <div class="col-md-12" v-if="supportedBoards.length">
      <p class="fw-normal">List of supported boards:</p>
      <ul>
        <li class="fw-normal" v-for="(b, index) in supportedBoards" :key="index">{{ b }}</li>
      </ul>
    </div>
    <div class="col-md-12">
      <p class="fw-normal">Powered by <b>ESP Web Tools</b></p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { global } from '@/modules/pinia'
import { storeToRefs } from 'pinia'
import { logDebug, logError } from '@/modules/logger'

const { disabled } = storeToRefs(global)

const software = ref('')
const variant = ref('')
const supportedBoards = ref([])
const softwareVersion = ref('')

watch(disabled, () => {
  logDebug('App.watch(disabled)')

  if (global.disabled) document.body.style.cursor = 'wait'
  else document.body.style.cursor = 'default'
})

watch(software, () => {
  if (software.value == 'gravitymon-gateway') {
    variant.value = '_lolin'
  } else {
    variant.value = ''
    softwareVersion.value = ''
    supportedBoards.value = []
  }

  parseManifest()
})

const manifestUrl = computed(() => {
  return 'https://gravitymon.com/flasher/' + software.value + '/manifest' + variant.value + '.json'
})

watch(variant, () => {
  parseManifest()
})

async function parseManifest() {
  logDebug('App.parseManifest()', manifestUrl.value)

  fetch(manifestUrl.value, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(2000)
  })
    .then((res) => {
      global.disabled = false
      if (res.status != 200) throw res

      return res.json()
    })
    .then((json) => {
      logDebug('App.parseManifest()', json)

      supportedBoards.value = []

      json.builds.forEach((b) => {
        supportedBoards.value.push(b.board)
      })

      softwareVersion.value = json.version
    })
    .catch((err) => {
      logError('App.parseManifest()', err)
    })
}

const softwareOptions = ref([
  { label: '- unknown -', value: '' },
  { label: 'Gravitymon', value: 'gravitymon' },
  { label: 'Gravitymon Gateway', value: 'gravitymon-gateway' },
  { label: 'Kegmon', value: 'kegmon' },
  { label: 'Chamber Controller', value: 'chamber-controller' }
  // { label: 'Pressuremon', value: 'Pressuremon' },
])

const variantBoardOptions = ref([
  { label: 'Lolin boards', value: '_lolin' },
  { label: 'Waveshare boards', value: '_waveshare' }
])
</script>
