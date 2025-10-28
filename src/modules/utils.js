import { config } from '@/modules/pinia'
import { logDebug } from '@/modules/logger'

export function validateCurrentForm() {
  let valid = true
  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach((form) => {
    if (!form.checkValidity()) valid = false

    form.classList.add('was-validated')
  })

  return valid
}

export const abv = (og, fg) => {
  return Math.round(((76.08 * (og - fg)) / (1.775 - og)) * (fg / 0.794) * 100) / 100
}

export const gravityToPlato = (sg) => {
  return 259 - 259 / sg
}

export function tempToF(c) {
  return c * 1.8 + 32.0
}

export function tempToC(f) {
  return (f - 32.0) / 1.8
}

export function volumeLtoUSGallon(v) {
  return v * 0.264172052
}

export function volumeLtoUKGallon(v) {
  return v * 0.2199692483
}

export function volumeCLtoUSOZ(v) {
  return v * 0.34
}

export function volumeCLtoUKOZ(v) {
  return v == 0.0 ? 0.0 : v / 2.84
}

export function pressureToKPA(p) {
  return p * 6.8947572932
}

export function pressureToBAR(p) {
  return p * 0.0689475729
}

export function isValidJson(s) {
  try {
    JSON.stringify(JSON.parse(s))
    return true
  } catch {
    logDebug('utils.isValidJson()')
  }

  return false
}

export function isValidMqttData(s) {
  logDebug('utils.isValidMqttData()', s)
  return false // Used in common components so it needs to be defined
}

export function isValidFormData(s) {
  logDebug('utils.isValidFormData()', s)
  return false // Used in common components so it needs to be defined
}

export function download(content, mimeType, filename) {
  const a = document.createElement('a')

  // For text content, use data URL to avoid blob URL mixed content issues
  if (mimeType.startsWith('text/')) {
    const dataUrl = `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`
    a.setAttribute('href', dataUrl)
  } else {
    // For binary content, still use blob URL
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    a.setAttribute('href', url)
  }

  a.setAttribute('download', filename)
  a.click()
}

export function getPressureDataAnalytics(pressureList) {
  logDebug('utils.getPressureDataAnalytics()')

  var pList = []

  var stats = {
    pressure: {
      min: 2.0,
      max: 0,
      minString: '',
      maxString: ''
    },
    temperature: {
      min: 100,
      max: -100,
      minString: '',
      maxString: ''
    },
    date: {
      first: '',
      last: '',
      firstDate: '',
      lastDate: '',
      firstTime: '',
      lastTime: ''
    },
    readings: 0,
    averageInterval: 0,
    averageIntervalString: ''
  }

  // Sort the pressure data so its in date order
  pressureList.sort((a, b) => Date.parse(a.created) - Date.parse(b.created))

  // Process the pressure readings
  pressureList.forEach((p) => {
    if (p.active) {
      pList.push(p)

      // Calculate some statistics for pressure and temperature
      if (p.pressure > stats.pressure.max) stats.pressure.max = p.pressure
      if (p.pressure < stats.pressure.min) stats.pressure.min = p.pressure

      // -273 means invalid temperature or not sensor attached
      if (p.temperature > -270) {
        if (p.temperature > stats.temperature.max) stats.temperature.max = p.temperature
        if (p.temperature < stats.temperature.min) stats.temperature.min = p.temperature
      }
    }
  })

  stats.pressure.min = config.isPressurePSI
    ? stats.pressure.min
    : config.isPressureBAR
      ? pressureToBAR(stats.pressure.min)
      : pressureToKPA(stats.pressure.min)
  stats.pressure.max = config.isPressurePSI
    ? stats.pressure.max
    : config.isPressureBAR
      ? pressureToBAR(stats.pressure.max)
      : pressureToKPA(stats.pressure.max)
  stats.temperature.min = config.isTempC ? stats.temperature.min : tempToF(stats.temperature.min)
  stats.temperature.max = config.isTempC ? stats.temperature.max : tempToF(stats.temperature.max)

  stats.pressure.minString =
    new Number(stats.pressure.min).toFixed(3) +
    (config.isPressurePSI ? ' Psi' : config.isPressureBAR ? ' Bar' : ' kPa')
  stats.pressure.maxString =
    new Number(stats.pressure.max).toFixed(3) +
    (config.isPressurePSI ? ' Psi' : config.isPressureBAR ? ' Bar' : ' kPa')
  stats.temperature.minString =
    new Number(stats.temperature.min).toFixed(2) + (config.isTempC ? ' C' : ' F')
  stats.temperature.maxString =
    new Number(stats.temperature.max).toFixed(2) + (config.isTempC ? ' C' : ' F')

  if (pList.length) {
    stats.date.first = pList[0].created
    stats.date.last = pList[pList.length - 1].created

    stats.date.firstDate = stats.date.first.substring(0, 10)
    stats.date.lastDate = stats.date.last.substring(0, 10)

    stats.date.firstTime = stats.date.first.substring(11, 19)
    stats.date.lastTime = stats.date.last.substring(11, 19)

    stats.averageInterval = new Number(
      (Date.parse(stats.date.last) - Date.parse(stats.date.first)) / pList.length / 1000
    ).toFixed(0)

    if (stats.averageInterval < 60) stats.averageIntervalString = stats.averageInterval + ' s'
    else
      stats.averageIntervalString =
        new Number(stats.averageInterval / 60).toFixed(0) +
        ' m ' +
        new Number(stats.averageInterval % 60).toFixed(0) +
        ' s'
  }

  stats.readings = pList.length

  logDebug('utils.getPressureDataAnalytics()', stats)
  return stats
}

export function getGravityDataAnalytics(gravityList) {
  logDebug('utils.getGravityDataAnalytics()')

  var gList = []

  var stats = {
    gravity: {
      min: 2.0, // FG
      max: 0, // OG
      minString: '',
      maxString: ''
    },
    temperature: {
      min: 100,
      max: -100,
      minString: '',
      maxString: ''
    },
    abv: 0,
    abvString: '',
    date: {
      first: '',
      last: '',
      firstDate: '',
      lastDate: '',
      firstTime: '',
      lastTime: ''
    },
    readings: 0,
    averageInterval: 0,
    averageIntervalString: ''
  }

  // Sort the gravity data so its in date order
  gravityList.sort((a, b) => Date.parse(a.created) - Date.parse(b.created))

  // Process the gravity readings
  gravityList.forEach((g) => {
    if (g.active) {
      gList.push(g)

      // Calculate some statistics for gravity and temperature
      if (g.gravity > stats.gravity.max) stats.gravity.max = g.gravity
      if (g.gravity < stats.gravity.min) stats.gravity.min = g.gravity

      if (g.temperature > stats.temperature.max) stats.temperature.max = g.temperature
      if (g.temperature < stats.temperature.min) stats.temperature.min = g.temperature
    }
  })

  stats.abv = abv(stats.gravity.max, stats.gravity.min)
  stats.gravity.min = config.isGravitySG ? stats.gravity.min : gravityToPlato(stats.gravity.min)
  stats.gravity.max = config.isGravitySG ? stats.gravity.max : gravityToPlato(stats.gravity.max)
  stats.temperature.min = config.isTempC ? stats.temperature.min : tempToF(stats.temperature.min)
  stats.temperature.max = config.isTempC ? stats.temperature.max : tempToF(stats.temperature.max)

  stats.abvString = new Number(stats.abv).toFixed(2) + ' %'
  stats.gravity.minString =
    new Number(stats.gravity.min).toFixed(3) + (config.isGravitySG ? ' SG' : ' P')
  stats.gravity.maxString =
    new Number(stats.gravity.max).toFixed(3) + (config.isGravitySG ? ' SG' : ' P')
  stats.temperature.minString =
    new Number(stats.temperature.min).toFixed(2) + (config.isTempC ? ' C' : ' F')
  stats.temperature.maxString =
    new Number(stats.temperature.max).toFixed(2) + (config.isTempC ? ' C' : ' F')

  if (gList.length) {
    stats.date.first = gList[0].created
    stats.date.last = gList[gList.length - 1].created

    stats.date.firstDate = stats.date.first.substring(0, 10)
    stats.date.lastDate = stats.date.last.substring(0, 10)

    stats.date.firstTime = stats.date.first.substring(11, 19)
    stats.date.lastTime = stats.date.last.substring(11, 19)

    stats.averageInterval = new Number(
      (Date.parse(stats.date.last) - Date.parse(stats.date.first)) / gList.length / 1000
    ).toFixed(0)

    if (stats.averageInterval < 60) stats.averageIntervalString = stats.averageInterval + ' s'
    // if(stats.averageInterval<60*60)
    else
      stats.averageIntervalString =
        new Number(stats.averageInterval / 60).toFixed(0) +
        ' m ' +
        new Number(stats.averageInterval % 60).toFixed(0) +
        ' s'
  }

  stats.readings = gList.length

  logDebug('utils.getGravityDataAnalytics()', stats)
  return stats
}

export function formatTime(t) {
  var seconds = Math.floor(t % 60)
  var minutes = Math.floor((t % (60 * 60)) / 60)
  var hours = Math.floor((t % (24 * 60 * 60)) / (60 * 60))
  var days = Math.floor((t % (7 * 24 * 60 * 60)) / (24 * 60 * 60))
  var weeks = Math.floor((t % (4 * 7 * 24 * 60 * 60)) / (7 * 24 * 60 * 60))

  var s = ''

  if (weeks > 0) s += weeks + 'w '
  if (days > 0) s += days + 'd '
  if (hours > 0) s += hours + 'h '
  if (minutes > 0) s += minutes + 'm '
  if (seconds > 0) s += seconds + 's '
  return s
}

export function formatTimeShort(t) {
  var seconds = Math.floor(t % 60)
  var minutes = Math.floor((t % (60 * 60)) / 60)
  var hours = Math.floor((t % (24 * 60 * 60)) / (60 * 60))
  var days = Math.floor((t % (7 * 24 * 60 * 60)) / (24 * 60 * 60))
  var weeks = Math.floor((t % (365 * 24 * 60 * 60)) / (7 * 24 * 60 * 60))

  logDebug('utils.formatTimeShort()', t, weeks, days, hours, minutes, seconds)

  var s = ''

  if (weeks > 0) s += weeks + 'w '
  if (days > 0) s += days + 'd '
  if (hours > 0) s += hours + 'h '
  //if(minutes>0)
  //  s += minutes + "m "
  //if(seconds>0)
  //  s += seconds + "s "
  return s
}
