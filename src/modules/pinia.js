import { ref } from 'vue'
import { createPinia } from 'pinia'
import { useGlobalStore } from '@/modules/globalStore'
import { useConfigStore } from '@/modules/configStore'
import { useDeviceStore } from '@/modules/deviceStore'
import { useBatchStore } from '@/modules/batchStore'
import { useGravityStore } from '@/modules/gravityStore'
import { usePressureStore } from '@/modules/pressureStore'
import { usePourStore } from '@/modules/pourStore'
import { useBrewfatherStore } from '@/modules/brewfatherStore'
import { logDebug, logError } from '@/modules/logger'

const piniaInstance = createPinia()

export default piniaInstance

const config = useConfigStore(piniaInstance)
const global = useGlobalStore(piniaInstance)
const deviceStore = useDeviceStore(piniaInstance)
const batchStore = useBatchStore(piniaInstance)
const gravityStore = useGravityStore(piniaInstance)
const pressureStore = usePressureStore(piniaInstance)
const pourStore = usePourStore(piniaInstance)
const brewfatherStore = useBrewfatherStore(piniaInstance)

export {
  global,
  config,
  deviceStore,
  batchStore,
  gravityStore,
  pressureStore,
  pourStore,
  brewfatherStore
}

const configCompare = ref(null)

const saveConfigState = () => {
  logDebug('pinia.saveConfigState()')

  configCompare.value = {}
  for (var key in config) {
    if (typeof config[key] !== 'function' && key !== '$id') {
      configCompare.value[key] = config[key]
    }
  }

  logDebug('pinia.saveConfigState()', 'Saved state: ', configCompare.value)
  global.configChanged = false
}

const getConfigChanges = () => {
  logDebug('pinia.getConfigChanges()')
  var changes = {}

  if (configCompare.value === null) {
    logError('pinia.getConfigChanges()', 'configState not saved')
    return changes
  }

  for (var key in configCompare.value) {
    if (configCompare.value[key] != config[key]) {
      changes[key] = config[key]
    }
  }

  return changes
}

config.$subscribe(() => {
  logDebug('pinia.subscribe()')

  if (!global.initialized) return

  var changes = getConfigChanges()
  logDebug('pinia.subscribe()', 'State change on configStore', changes)

  if (JSON.stringify(changes).length > 2) {
    global.configChanged = true
    logDebug('pinia.subscribe()', 'Changed properties:', changes)
  } else {
    global.configChanged = false
  }
})

export { saveConfigState, getConfigChanges }
