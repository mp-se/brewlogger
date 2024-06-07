import { ref } from 'vue'
import { config } from "@/modules/pinia"
import { logDebug, logError, logInfo } from '@/modules/logger'

export function validateCurrentForm() {
  let valid = true
  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach(form => {
    if (!form.checkValidity())
      valid = false

    form.classList.add('was-validated')
  })

  return valid
}

export const abv = (og, fg) => {
  return Math.round((76.08 * (og - fg) / (1.775 - og)) * (fg / 0.794) * 100) / 100
}

export const gravityToPlato = (sg) => {
  return 259 - (259 / sg)
}

export function tempToF(c) {
  return (c * 1.8) + 32.0
}

export function tempToC(f) {
  return (f - 32.0) / 1.8
}

export function isValidJson(s) {
  try {
    JSON.stringify(JSON.parse(s))
    return true
  } catch (e) {
  }

  return false
}

export function isValidMqttData(s) {
  return false // Used in common components so it needs to be defined
}

export function isValidFormData(s) {
  return false // Used in common components so it needs to be defined
}

export function download(content, mimeType, filename) {
  const a = document.createElement('a')
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  a.setAttribute('href', url)
  a.setAttribute('download', filename)
  a.click()
}

export function getGravityDataAnalytics(gravityList) {
  logDebug("utils.getGravityDataAnalytics()", gravityList)

  var stats = {
    gravity: {
      min: 2.0, // FG
      max: 0, // OG
      minString: "",
      minString: ""
    },
    temperature: {
      min: 100,
      max: -100,
      minString: "",
      maxString: "",
    },
    abv: 0,
    abvString: "",
    date: {
      first: "",
      last: "",
      firstDate: "",
      lastDate: "",
      firstTime: "",
      lastTime: "",
    },
    readings: gravityList.length,
  }

  // Sort the gravity data so its in date order
  gravityList.sort((a, b) => Date.parse(a.created) - Date.parse(b.created))

  // Process the gravity readings
  gravityList.forEach(g => {
    // Validate the datapoints if they are withing reasonable 
    var valid = false

    if (g.gravity > 1.0 && g.gravity < 1.1)
      valid = true

    if (valid) {
      // Calculate some statistics for gravity and temperature
      if (g.gravity > stats.gravity.max)
        stats.gravity.max = g.gravity
      if (g.gravity < stats.gravity.min)
        stats.gravity.min = g.gravity

      if (g.temperature > stats.temperature.max)
        stats.temperature.max = g.temperature
      if (g.temperature < stats.temperature.min)
        stats.temperature.min = g.temperature
    }
  })

  stats.abv = abv(stats.gravity.max, stats.gravity.min)
  stats.gravity.min = config.isGravitySG ? stats.gravity.min : gravityToPlato(stats.gravity.min)
  stats.gravity.max = config.isGravitySG ? stats.gravity.max : gravityToPlato(stats.gravity.max)
  stats.temperature.min = config.isTempC ? stats.temperature.min : tempToF(stats.temperature.min)
  stats.temperature.max = config.isTempC ? stats.temperature.max : tempToF(stats.temperature.max)

  stats.gravity.minString = new Number(stats.gravity.min).toFixed(3)
  stats.gravity.maxString = new Number(stats.gravity.max).toFixed(3)
  stats.temperature.minString = new Number(stats.temperature.min).toFixed(2)
  stats.temperature.maxString = new Number(stats.temperature.max).toFixed(2)
  stats.abvString = new Number(stats.abv).toFixed(2) + " %"

  if (gravityList.length) {
    stats.date.first = gravityList[0].created
    stats.date.last = gravityList[gravityList.length - 1].created

    stats.date.firstDate = stats.date.first.substring(0, 10)
    stats.date.lastDate = stats.date.last.substring(0, 10)

    stats.date.firstTime = stats.date.first.substring(11, 19)
    stats.date.lastTime = stats.date.last.substring(11, 19)
  }

  logDebug("utils.getGravityDataAnalytics()", stats)
  return stats
}
