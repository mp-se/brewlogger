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

/**
 * Creates a snapshot of config state by filtering out functions and internal properties
 * @param {Object} configObj - The config object to snapshot
 * @returns {Object} Snapshot of config state
 */
export const createConfigSnapshot = (configObj) => {
  const snapshot = {}
  for (var key in configObj) {
    if (typeof configObj[key] !== 'function' && key !== '$id') {
      snapshot[key] = configObj[key]
    }
  }
  return snapshot
}

/**
 * Detects changes between two snapshots
 * @param {Object} savedSnapshot - Previously saved snapshot
 * @param {Object} currentSnapshot - Current config snapshot
 * @returns {Object} Object with changed keys and their new values
 */
export const detectConfigChanges = (savedSnapshot, currentSnapshot) => {
  const changes = {}

  if (!savedSnapshot) {
    logError('pinia.detectConfigChanges()', 'Saved snapshot is null or undefined')
    return changes
  }

  for (var key in savedSnapshot) {
    if (savedSnapshot[key] != currentSnapshot[key]) {
      changes[key] = currentSnapshot[key]
    }
  }

  return changes
}

/**
 * Checks if changes object has meaningful content (more than empty JSON)
 * @param {Object} changes - Changes object to check
 * @returns {boolean} True if changes are meaningful
 */
export const hasSignificantChanges = (changes) => {
  return JSON.stringify(changes).length > 2
}

const saveConfigState = () => {
  logDebug('pinia.saveConfigState()')

  configCompare.value = createConfigSnapshot(config)

  logDebug('pinia.saveConfigState()', 'Saved state: ', configCompare.value)
  global.configChanged = false
}

const getConfigChanges = () => {
  logDebug('pinia.getConfigChanges()')

  if (configCompare.value === null) {
    logError('pinia.getConfigChanges()', 'configState not saved')
    return {}
  }

  const currentSnapshot = createConfigSnapshot(config)
  return detectConfigChanges(configCompare.value, currentSnapshot)
}

config.$subscribe(() => {
  logDebug('pinia.subscribe()')

  if (!global.initialized) return

  var changes = getConfigChanges()
  logDebug('pinia.subscribe()', 'State change on configStore', changes)

  if (hasSignificantChanges(changes)) {
    global.configChanged = true
    logDebug('pinia.subscribe()', 'Changed properties:', changes)
  } else {
    global.configChanged = false
  }
})

export { saveConfigState, getConfigChanges }
