<template>
  <div class="container">
    <p class="h3">Flash devices</p>
    <hr />
    <p class="fw-normal">
      Here you can flash your devices using the ESP Web Flasher. Note that flashing will do a FULL ERASE!
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
        Some devices might need to be put in flash mode before flashing will work. Hold in EN and then do a reset and release EN should put the device in flashing mode.
      </p>
      <p class="fw-normal">
        Using manfifest: {{ manifestUrl }}
      </p>
      <p class="fw-normal">
        Powered by <b>ESP Web Tools</b>
      </p>
  </div>

  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const software = ref('')
const variant = ref('')

watch(software, () => {
  variant.value = ''
})

const manifestUrl = computed(() => {
  return (
    window.location.origin + '/firmware/' + software.value + '/manifest' + variant.value + '.json'
  )
})

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
