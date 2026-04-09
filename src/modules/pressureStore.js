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
import { global } from '@/modules/pinia'
import { logDebug, logError } from '@/modules/logger'
import { Pressure } from '@/modules/classes'

export const usePressureStore = defineStore('pressureStore', {
  state: () => {
    return { pressure: [] }
  },
  actions: {
    async getLatestPressure(limit) {
      // returns pressure[] or null

      logDebug('pressureStore.getLatestPressure()', `limit=${limit}`)
      global.disabled = true
      try {
        const url = new URL(global.baseURL + 'api/pressure/latest')
        url.searchParams.append('limit', limit)
        const res = await fetch(url.toString(), {
          method: 'GET',
          headers: { Authorization: global.token },
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        logDebug('pressureStore.getLatestPressure()', res.status)
        if (!res.ok) throw res
        const json = await res.json()
        this.pressure = []

        json.forEach((p) => {
          var pressure = Pressure.fromJson(p)
          pressure.batchName = p.batchName
          pressure.chipIdPressure = p.chipIdPressure
          this.pressure.push(pressure)
        })

        global.disabled = false
        return this.pressure
      } catch (err) {
        global.disabled = false
        logError('pressureStore.getLatestPressure()', err)
        return null
      }
    },
    async getPressureListForBatch(id) {
      // returns pressure[] or null

      logDebug('pressureStore.getPressureListForBatch()')
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/batch/' + id, {
          method: 'GET',
          headers: { Authorization: global.token },
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        logDebug('pressureStore.getGravityListForBatch()', res.status)
        if (!res.ok) throw res
        const json = await res.json()
        this.pressure = []

        json.pressure.forEach((p) => {
          var pressure = Pressure.fromJson(p)
          this.pressure.push(pressure)
        })

        global.disabled = false
        return this.pressure
      } catch (err) {
        global.disabled = false
        logError('pressureStore.getPressureListForBatch()', err)
        return null
      }
    },
    async updatePressure(p) {
      // returns true or false

      logDebug('pressureStore.updatePressure()', JSON.stringify(p.toJson()))
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/pressure/' + p.id, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: global.token },
          body: JSON.stringify(p.toJson()),
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        global.disabled = false
        logDebug('pressureStore.updatePressure()', res.status)
        if (res.status != 200) {
          return false
        }
        return true
      } catch (err) {
        logError('pressureStore.updatePressure()', err)
        global.disabled = false
        return false
      }
    }
  }
})
