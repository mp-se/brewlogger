import { defineStore } from 'pinia'
import { global, saveConfigState } from '@/modules/pinia'
import { logDebug, logError } from '@/modules/logger'

export const useConfigStore = defineStore('config', {
  state: () => {
    return {
      id: 0,
      temperatureFormat: '',
      pressureFormat: '',
      gravityFormat: '',
      volumeFormat: '',
      appVersion: 0,
      gravityForwardUrl: '',
      dark_mode: false
    }
  },
  getters: {
    tempUnit() {
      return this.temperatureFormat
    },
    isTempC() {
      return this.temperatureFormat == 'C' ? true : false
    },
    isTempF() {
      return this.temperatureFormat == 'F' ? true : false
    },
    isGravitySG() {
      return this.gravityFormat == 'SG' ? true : false
    },
    isGravityP() {
      return this.gravityFormat == 'P' ? true : false
    },
    isVolumeMetric() {
      return this.volumeFormat == 'L' ? true : false
    },
    isVolumeUs() {
      return this.volumeFormat == 'US' ? true : false
    },
    isVolumeUk() {
      return this.volumeFormat == 'UK' ? true : false
    },
    isPressureBAR() {
      return this.pressureFormat == 'BAR' ? true : false
    },
    isPressureKPA() {
      return this.pressureFormat == 'KPA' ? true : false
    },
    isPressurePSI() {
      return this.pressureFormat == 'PSI' ? true : false
    }
  },
  actions: {
    load(callback) {
      global.disabled = true
      logDebug('configStore.load()')
      fetch(global.baseURL + 'api/config/', {
        method: 'GET',
        headers: { Authorization: global.token },
        signal: AbortSignal.timeout(global.fetchTimout)
      })
        .then((res) => res.json())
        .then((json) => {
          logDebug('configStore.load()', json)
          global.disabled = false
          this.id = json.id
          this.temperatureFormat = json.temperatureFormat
          this.pressureFormat = json.pressureFormat
          this.gravityFormat = json.gravityFormat
          this.volumeFormat = json.volumeFormat
          this.appVersion = json.appVersion
          this.gravityForwardUrl = json.gravityForwardUrl
          this.dark_mode = json.darkMode
          callback(true)
        })
        .catch((err) => {
          global.disabled = false
          logError('configStore.load()', err)
          callback(false)
        })
    },
    save(callback) {
      global.disabled = true
      logDebug('configStore.save()')

      var data = {
        pressureFormat: this.pressureFormat,
        gravityFormat: this.gravityFormat,
        temperatureFormat: this.temperatureFormat,
        volumeFormat: this.volumeFormat,
        darkMode: this.dark_mode,
        gravityForwardUrl: this.gravityForwardUrl,
        version: ''
      }

      // logDebug(data)

      fetch(global.baseURL + 'api/config/' + this.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: global.token },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(global.fetchTimout)
      })
        .then((res) => {
          global.disabled = false
          if (res.status != 200) {
            logDebug('configStore.save()', res.status)
            callback(false)
          } else {
            logDebug('configStore.save()')
            saveConfigState()
            callback(true)
          }
        })
        .catch((err) => {
          logError('configStore.save()', err)
          callback(false)
          global.disabled = false
        })
    }
  }
})
