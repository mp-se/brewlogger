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
import { Pour } from '@/modules/classes'

export const usePourStore = defineStore('pourStore', {
  state: () => {
    return { pour: [] }
  },
  actions: {
    async getLatestPour(limit) {
      // returns pour[] or null

      logDebug('pourStore.getLatestPour()', `limit=${limit}`)
      global.disabled = true
      try {
        const url = new URL(global.baseURL + 'api/pour/latest')
        url.searchParams.append('limit', limit)
        const res = await fetch(url.toString(), {
          method: 'GET',
          headers: { Authorization: global.token },
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        logDebug('pourStore.getLatestPour()', res.status)
        if (!res.ok) throw res
        const json = await res.json()
        this.pour = []

        json.forEach((p) => {
          var pour = Pour.fromJson(p)
          pour.batchName = p.batchName
          this.pour.push(pour)
        })

        global.disabled = false
        return this.pour
      } catch (err) {
        global.disabled = false
        logError('pourStore.getLatestPour()', err)
        return null
      }
    },
    async getPourListForBatch(id) {
      // returns pour[] or null

      logDebug('pourStore.getPourListForBatch()')
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/batch/' + id, {
          method: 'GET',
          headers: { Authorization: global.token },
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        logDebug('pourStore.getPourListForBatch()', res.status)
        if (!res.ok) throw res
        const json = await res.json()
        this.pour = []

        json.pour.forEach((p) => {
          var pour = Pour.fromJson(p)
          this.pour.push(pour)
        })

        global.disabled = false
        return this.pour
      } catch (err) {
        global.disabled = false
        logError('pourStore.getPourListForBatch()', err)
        return null
      }
    },
    async updatePour(p) {
      // returns true or false

      logDebug('pourStore.updatePour()', JSON.stringify(p.toJson()))
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/pour/' + p.id, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: global.token },
          body: JSON.stringify(p.toJson()),
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        global.disabled = false
        logDebug('pourStore.updatePour()', res.status)
        if (res.status != 200) {
          return false
        }
        return true
      } catch (err) {
        logError('pourStore.updatePour()', err)
        global.disabled = false
        return false
      }
    },
    async addPour(p) {
      // returns true or false

      logDebug('pourStore.addPour()', JSON.stringify(p.toJson()))
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/pour/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: global.token },
          body: JSON.stringify(p.toJson()),
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        global.disabled = false
        logDebug('pourStore.addPour()', res.status)
        if (res.status != 201) {
          return false
        }
        return true
      } catch (err) {
        logError('pourStore.addPour()', err)
        global.disabled = false
        return false
      }
    }
  }
})
