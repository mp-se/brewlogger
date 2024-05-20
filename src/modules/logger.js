import { ref } from 'vue'

const debug = ref(true)
const info = ref(true)

export function logDebug(...args) {
  if(debug.value)
    console.log("Debug", ...args)
}

export function logInfo(...args) {
  if(info.value)
    console.log("Info", ...args)
}

export function logError(...args) {
  console.log("Error", ...args)
}
