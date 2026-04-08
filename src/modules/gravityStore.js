// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

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
