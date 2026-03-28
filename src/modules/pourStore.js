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
