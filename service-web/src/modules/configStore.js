// BrewLogger
// Copyright (c) 2021-2026 Magnus
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Alternatively, this software may be used under the terms of a
// commercial license. See LICENSE_COMMERCIAL for details.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//
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
    async load() {
      // returns true or false

      global.disabled = true
      logDebug('configStore.load()')
      try {
        const res = await fetch(global.baseURL + 'api/config/', {
          method: 'GET',
          headers: { Authorization: global.token },
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        const json = await res.json()
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
        return true
      } catch (err) {
        global.disabled = false
        logError('configStore.load()', err)
        return false
      }
    },
    async save() {
      // returns true or false

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

      try {
        const res = await fetch(global.baseURL + 'api/config/' + this.id, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: global.token },
          body: JSON.stringify(data),
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        global.disabled = false
        if (res.status != 200) {
          logDebug('configStore.save()', res.status)
          return false
        } else {
          logDebug('configStore.save()')
          saveConfigState()
          return true
        }
      } catch (err) {
        logError('configStore.save()', err)
        global.disabled = false
        return false
      }
    }
  }
})
