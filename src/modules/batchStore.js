// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

import { defineStore } from 'pinia'
import { global } from '@/modules/pinia'
import { logDebug, logError } from '@/modules/logger'
import { Batch } from '@/modules/classes'

export const useBatchStore = defineStore('batchStore', {
  state: () => {
    return { batches: [] }
  },
  getters: {
    batchList() {
      return this.batches
    }
  },
  actions: {
    async processEvent(method, id) {
      logDebug('batchStore.processEvent()', method, id)
      if (method == 'delete') {
        this.batches = this.batches.filter((b) => {
          return b.id !== id
        })
        logDebug('batchStore.processEvent()', 'Removed batch with', id)
        global.updatedBatchData += 1
      } else if (method == 'update') {
        const batch = await this.getBatch(id)
        if (batch && batch.id) {
          this.batches = this.batches.filter((b) => {
            return b.id !== id
          })
          this.batches.push(batch)
          logDebug('batchStore.processEvent()', 'Updated batch with', id)
          global.updatedBatchData += 1
        }
      } else if (method == 'create') {
        const batch = await this.getBatch(id)
        if (batch && batch.id) {
          this.batches.push(batch)
          logDebug('batchStore.processEvent()', 'Added batch with', id)
          global.updatedBatchData += 1
        }
      }
    },
    anyBatchesForDevice(chipId) {
      // returns true or false
      logDebug('batchStore.anyBatchesForDevice()')

      var found = false

      this.batches.forEach((b) => {
        if (b.chipIdGravity == chipId || b.chipIdPressure == chipId) found = true
      })
      return found
    },
    async getBatchList() {
      // returns batches[] or null

      logDebug('batchStore.getBatchList()')
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/batch/', {
          method: 'GET',
          headers: { Authorization: global.token },
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        logDebug('batchStore.getBatchList()', res.status)
        if (!res.ok) throw res
        const json = await res.json()
        logDebug('batchStore.getBatchList()', json)
        this.batches = []

        json.forEach((b) => {
          var batch = Batch.fromJson(b)
          this.batches.push(batch)
        })

        global.disabled = false
        return this.batches
      } catch (err) {
        global.disabled = false
        logError('batchStore.getBatchList()', err)
        return null
      }
    },
    async getBatch(id) {
      // returns batch or null

      logDebug('batchStore.getBatch()', id)
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/batch/' + id, {
          method: 'GET',
          headers: { Authorization: global.token },
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        logDebug('batchStore.getBatch()', res.status)
        if (!res.ok) throw res
        const json = await res.json()
        logDebug('batchStore.getBatch()', json)
        var batch = Batch.fromJson(json)
        global.disabled = false
        return batch
      } catch (err) {
        global.disabled = false
        logError('batchStore.getBatch()', err)
        return null
      }
    },
    async getBatchDashboard(id) {
      // returns batch or null

      logDebug('batchStore.getBatchDashboard()', id)
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/batch/' + id + '/dashboard', {
          method: 'GET',
          headers: { Authorization: global.token },
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        logDebug('batchStore.getBatchDashboard()', res.status)
        if (!res.ok) throw res
        const json = await res.json()
        logDebug('batchStore.getBatchDashboard()', json)
        var batch = Batch.fromDashboardJson(json)
        global.disabled = false
        return batch
      } catch (err) {
        global.disabled = false
        logError('batchStore.getBatchDashboard()', err)
        return null
      }
    },
    async updateBatch(b) {
      // returns batch or null

      logDebug('batchStore.updateBatch()', b.id, b.toJson())
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/batch/' + b.id, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: global.token },
          body: JSON.stringify(b.toJson()),
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        logDebug('batchStore.updateBatch()', res.status)
        if (res.status != 200) throw res
        const json = await res.json()
        logDebug('batchStore.updateBatch()', json)
        global.disabled = false
        var batch = Batch.fromJson(json)
        return batch
      } catch (err) {
        logError('batchStore.updateBatch()', err)
        global.disabled = false
        return null
      }
    },
    async addBatch(b) {
      // returns batch or null

      logDebug('batchStore.addBatch()', b.toJson())
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/batch/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: global.token },
          body: JSON.stringify(b.toJson()),
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        logDebug('batchStore.addBatch()', res.status)
        if (res.status != 201) throw res
        const json = await res.json()
        global.disabled = false
        logDebug('batchStore.addBatch()', json)
        var batch = Batch.fromJson(json)
        return batch
      } catch (err) {
        logError('batchStore.addBatch()', err)
        global.disabled = false
        return null
      }
    },
    async deleteBatch(id) {
      // returns true or false

      logDebug('batchStore.deleteBatch()', id)
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/batch/' + id, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', Authorization: global.token },
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        global.disabled = false
        logDebug('batchStore.deleteBatch()', res.status)
        if (res.status != 204) {
          return false
        }
        return true
      } catch (err) {
        logError('batchStore.deleteBatch()', err)
        global.disabled = false
        return false
      }
    }
  }
})
