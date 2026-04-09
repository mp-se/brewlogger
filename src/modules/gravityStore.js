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
import { Gravity } from '@/modules/classes'

export const useGravityStore = defineStore('gravityStore', {
  state: () => {
    return { gravity: [] }
  },
  actions: {
    async getLatestGravity(limit) {
      // returns gravity[] or null

      logDebug('gravityStore.getLatestGravity()', `limit=${limit}`)
      global.disabled = true
      try {
        const url = new URL(global.baseURL + 'api/gravity/latest')
        url.searchParams.append('limit', limit)
        const res = await fetch(url.toString(), {
          method: 'GET',
          headers: { Authorization: global.token },
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        logDebug('gravityStore.getLatestGravity()', res.status)
        if (!res.ok) throw res
        const json = await res.json()
        this.gravity = []

        json.forEach((g) => {
          var gravity = Gravity.fromJson(g)
          gravity.batchName = g.batchName
          gravity.chipIdGravity = g.chipIdGravity
          this.gravity.push(gravity)
        })

        global.disabled = false
        return this.gravity
      } catch (err) {
        global.disabled = false
        logError('gravityStore.getLatestGravity()', err)
        return null
      }
    },
    async getGravityListForBatch(id) {
      // returns gravity[] or null

      logDebug('gravityStore.getGravityListForBatch()')
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/batch/' + id, {
          method: 'GET',
          headers: { Authorization: global.token },
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        logDebug('gravityStore.getGravityListForBatch()', res.status)
        if (!res.ok) throw res
        const json = await res.json()
        this.gravity = []

        json.gravity.forEach((g) => {
          var gravity = Gravity.fromJson(g)
          this.gravity.push(gravity)
        })

        global.disabled = false
        return this.gravity
      } catch (err) {
        global.disabled = false
        logError('gravityStore.getGravityListForBatch()', err)
        return null
      }
    },
    async updateGravity(g) {
      // returns true or false

      logDebug('gravityStore.updateGravity()', JSON.stringify(g.toJson()))
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/gravity/' + g.id, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: global.token },
          body: JSON.stringify(g.toJson()),
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        global.disabled = false
        logDebug('gravityStore.updateGravity()', res.status)
        if (res.status != 200) {
          return false
        }
        return true
      } catch (err) {
        logError('gravityStore.updateGravity()', err)
        global.disabled = false
        return false
      }
    }
  }
})
