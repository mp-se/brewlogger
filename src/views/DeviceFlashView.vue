<template>
  <div class="container">
    <p class="h3">Flash devices</p>
    <hr />

    <div class="col-md-12 text-bg-warning" v-if="isBeta">
      <p class="fw-normal">
        You are now using beta version of the softwares, select a software to see if there are any
        beta versions available.
      </p>
    </div>

    <p class="fw-normal">
      Here you can flash your devices using the ESP Web Flasher. Note that flashing will do a FULL
      ERASE!
    </p>
    <p class="fw-normal">
      Upgrading can be done in the web interface, using the firmware upload method. Download the
      latest version from github.
    </p>
    <p class="fw-normal">If you want to try any beta versions then add '?beta' to the URL.</p>

    <div class="row">
      <div class="col-md-10">
        <BsInputRadio
          v-model="software"
          :options="softwareOptions.filter((o) => o.enabled == 1)"
          label="Software"
          help="Select which software to flash"
        ></BsInputRadio>
      </div>
      <div class="col-md-2">
        <BsInputSwitch v-model="beta" label="Beta" help="Use beta versions"></BsInputSwitch>
      </div>
    </div>

    <div class="col-md-12" v-if="message.length">
      <p></p>
      <p class="fw-normal">Note! {{ message }}</p>
    </div>

    <div class="col-md-12" v-if="variantBoardOptions.length">
      <BsInputRadio
        v-model="variant"
        :options="variantBoardOptions"
        label="Board variant"
        help="Choose the board manufacturer"
      ></BsInputRadio>
    </div>

    <template v-if="manifestStatus == 1">
      <div class="col-md-12" v-if="software != ''">
        <p>&nbsp;</p>
        <esp-web-install-button :manifest="manifestUrl"></esp-web-install-button>
        <p>&nbsp;</p>
        <p class="fw-normal">
          Some devices might need to be put in flash mode before flashing will work. Hold in EN and
          then do a reset and release EN should put the device in flashing mode.
        </p>
      </div>

      <div class="col-md-12" v-if="supportedBoardsManifest.length">
        <p class="fw-normal">
          Software version: <b>{{ softwareVersion }}, {{ message }}</b>
        </p>
        <p class="fw-normal">List of supported boards:</p>
        <ul>
          <li class="fw-normal" v-for="(b, index) in supportedBoardsManifest" :key="index">
            {{ b }}
          </li>
        </ul>
      </div>
    </template>

    <div class="col-md-12 text-bg-danger" v-if="manifestStatus == 2 && !isBeta">
      <p></p>
      <p class="fw-bold">
        Failed to load the needed manifest file from the server. Could be that there is no released
        version yet.
      </p>
    </div>

    <div class="col-md-12 text-bg-info" v-if="manifestStatus == 2 && isBeta">
      <p></p>
      <p class="fw-bold">No beta available for this option.</p>
    </div>

    <div class="row" v-if="github != ''">
      <p></p>
      <p class="fw-normal">
        Project url on github.com: <a :href="github" target="_blank">{{ github }}</a>
      </p>
    </div>

    <div class="col-md-12">
      <hr />
      <p class="fw-normal">Powered by <b>esp web tools</b> and <b>esptool-js</b></p>
    </div>

    <div class="row" v-if="doValidation">
      <div class="col-md-12">
        <p class="fw-normal">
          Validating {{ validationCount.validated }} of {{ validationCount.total }}
        </p>
      </div>
      <div class="col-md-12" v-for="(log, index) in validationLog" :key="index">
        <p class="fw-normal">{{ log }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, ref, computed } from 'vue'
import { global } from '@/modules/pinia'
import { storeToRefs } from 'pinia'
import { logDebug, logInfo, logError } from '@/modules/logger'

const { disabled } = storeToRefs(global)
const software = ref('')
const variant = ref('')
const supportedBoardsManifest = ref([])
const softwareVersion = ref('')
const message = ref('')
const github = ref('')
const beta = ref(false)
const manifestStatus = ref(0) // 0 = not loaded, 1 = loading, 2 = failed loading
const validationLog = ref([])
const validationCount = ref({ total: 0, validated: 0 })
const variantBoardOptions = ref([])

watch(disabled, () => {
  logDebug('DeviceFlashView.watch(disabled)')

  if (global.disabled) document.body.style.cursor = 'wait'
  else document.body.style.cursor = 'default'
})

watch(beta, () => {
  logDebug('DeviceFlashView.watch(beta)')
  parseManifest()
})

onMounted(() => {
  logDebug('DeviceFlashView.onMounted()')
  global.initialized = true
})

watch(software, () => {
  logDebug('DeviceFlashView.watch(software)', software.value)
  var selected = softwareOptions.value.filter((o) => o.value == software.value).at(0)

  variantBoardOptions.value = selected.boards
    .filter((b) => b.valid)
    .map((b) => {
      return { label: b.label, value: b.value }
    })
  variant.value = ''
  github.value = selected.github
  message.value = ''

  if (selected.boards.length) {
    variant.value = selected.boards[0].value
  }

  logDebug('DeviceFlashView.watch(software)', selected, variant.value, softwareOptions.value)
  parseManifest()
})

watch(variant, () => {
  parseManifest()
})

const isBeta = computed(() => {
  return beta.value
})

const doValidation = computed(() => {
  return false // Disable this here
})

async function parseManifest() {
  logDebug('DeviceFlashView.parseManifest()', manifestUrl.value, software.value)
  manifestStatus.value = 0 // 0 = not loaded

  if (software.value == '') return

  fetch(manifestUrl.value, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(2000)
  })
    .then((res) => {
      if (res.status != 200) throw res

      return res.json()
    })
    .then((json) => {
      logDebug('DeviceFlashView.parseManifest()', json)

      supportedBoardsManifest.value = []

      json.builds.forEach((b) => {
        supportedBoardsManifest.value.push(b.board)
      })

      softwareVersion.value = json.version
      manifestStatus.value = 1 // 1 = loaded
      message.value = json.message
      global.disabled = false
    })
    .catch((err) => {
      logError('DeviceFlashView.parseManifest()', err)
      manifestStatus.value = 2 // 2 = failed loading
      global.disabled = false
    })
}

const manifestUrl = computed(() => {
  return createManifestUrl(software.value, variant.value)
})

function createManifestUrl(software, variant) {
  return (
    'https://gravitymon.com/flasher/' +
    (isBeta.value ? 'beta/' : '') +
    software +
    '/manifest' +
    variant +
    '.json'
  )
}

function createBinUrl(software, bin) {
  return 'https://gravitymon.com/flasher/' + (isBeta.value ? 'beta/' : '') + software + '/' + bin
}

const softwareOptions = ref([
  {
    label: 'Gravitymon',
    value: 'gravitymon',
    enabled: true,
    github: 'https://github.com/mp-se/gravitymon',
    boards: [
      { label: 'Lolin boards', value: '', valid: true },
      { label: 'Waveshare boards', value: '_waveshare', valid: true },
      { label: 'Tenstar boards', value: '_tenstar', valid: true },
      { label: 'Olimex boards (Custom)', value: '_olimex', valid: true },
      { label: 'Floaty variant', value: '_floaty', valid: true }
    ]
  },
  {
    label: 'Gravitymon Gateway',
    value: 'gravitymon-gateway',
    enabled: true,
    github: 'https://github.com/mp-se/gravitymon-gateway',
    boards: [
      { label: 'Lolin boards', value: '_lolin', valid: true },
      { label: 'Waveshare boards', value: '_waveshare', valid: true }
    ]
  },
  {
    label: 'Kegmon',
    value: 'kegmon',
    enabled: true,
    github: 'https://github.com/mp-se/kegmon',
    boards: []
  },
  {
    label: 'Chamber Controller',
    value: 'chamber-controller',
    github: 'https://github.com/mp-se/chamber-controller',
    enabled: true,
    boards: []
  },
  {
    label: 'Pressuremon',
    value: 'pressuremon',
    enabled: true,
    github: 'https://github.com/mp-se/pressuremon',
    boards: []
  }
])

onMounted(() => {
  // Check if the manfiest files exist for the boards or disable them in the list
  softwareOptions.value.forEach((o) => {
    o.boards.forEach((b, idx) => {
      const url = createManifestUrl(o.value, b.value)

      fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000)
      })
        .then((res) => {
          if (res.status != 200) throw new Error('Manifest file does not exist')
          return res.json()
        })
        .then(() => {})
        .catch(() => {
          logError('DeviceFlashView.onMounted()', 'Error fetching manifest', url)
          o.boards[idx] = { value: b.value, label: b.label, valid: false }
        })
    })
  })

  // If validation flag is enabled we check all the .bin files to see if they exist.
  if (doValidation.value) {
    softwareOptions.value.forEach((o) => {
      o.boards.forEach((b) => {
        const url = createManifestUrl(o.value, b.value)

        fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(2000)
        })
          .then((res) => {
            if (res.status != 200) throw new Error('Manifest file does not exist')
            return res.json()
          })
          .then((json) => {
            logInfo('DeviceFlashView.onMounted()', 'Manifest file exists', json)

            json.builds.forEach((b) => {
              b.parts.forEach((p) => {
                const binUrl = createBinUrl(o.value, p.path)
                // validationLog.value.push(`Testing: ${binUrl}`)
                validationCount.value.total += 1

                fetch(binUrl, {
                  method: 'GET',
                  signal: AbortSignal.timeout(10000)
                })
                  .then((res) => {
                    if (res.status != 200) {
                      throw new Error('Bin file does not exist')
                    }
                    const contentType = res.headers.get('Content-Type') || ''
                    if (!contentType.includes('application/octet-stream')) {
                      throw new Error('File is not a valid octet-stream')
                    }
                    return res.blob()
                  })
                  .then(() => {
                    validationCount.value.validated += 1
                  })
                  .catch(() => {
                    validationCount.value.validated += 1
                    validationLog.value.push(`Validation error: File not found ${binUrl}`)
                  })
              })

              // validationLog.value.push(`Found board: ${b.board}`)
            })
          })
          .catch(() => {
            validationLog.value.push(
              `Validation error: Manifest file for ${o.value} with variant ${b.value} does not exist.`
            )
          })
      })
    })
  }
})
</script>
