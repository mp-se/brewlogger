import { defineStore } from 'pinia'
import { global } from '@/modules/pinia'
import { logDebug, logError } from '@/modules/logger'
import { BrewfatherBatch } from '@/modules/classes'

export const useBrewfatherStore = defineStore('brewfatherStore', {
  state: () => {
    return { batches: [], valid: false }
  },
  getters: {
    isValid() {
      return this.valid
    },
    batchList() {
      return this.batches
    }
  },
  actions: {
    async getBatchList() {
      // returns true or false

      if (this.isValid) {
        logDebug('brewfatherStore.getBatchList()', 'Cache is valid, skipping fetch!')
        return true
      }

      logDebug('brewfatherStore.getBatchList()')
      global.disabled = true
      try {
        const res = await fetch(
          global.baseURL +
            'api/brewfather/batch/?planning=true&brewing=true&fermenting=true&completed=true&archived=false',
          {
            method: 'GET',
            headers: { Authorization: global.token },
            signal: AbortSignal.timeout(global.fetchTimout)
          }
        )
        logDebug('brewfatherStore.getBatchList()', res.status)
        if (!res.ok) throw res
        const json = await res.json()
        this.batches = []

        json.forEach((b) => {
          var batch = BrewfatherBatch.fromJson(b)
          this.batches.push(batch)
        })

        this.valid = true
        global.disabled = false

        // Keep valid for 5 minutes
        setTimeout(
          () => {
            this.valid = false
          },
          60 * 5 * 1000
        )
        return true
      } catch (err) {
        global.disabled = false
        logError('brewfatherStore.getBatchList()', err)
        return false
      }
    }
  }
})
