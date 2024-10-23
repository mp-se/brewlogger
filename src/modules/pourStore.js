import { defineStore } from 'pinia'
import { global } from '@/modules/pinia'
import { logDebug, logError } from '@/modules/logger'

export class Pour {
  constructor(id, pour, volume, created, batchId, active) {
    this.id = id === undefined ? 0 : id
    this.pour = pour === undefined ? 0.0 : pour
    this.volume = volume === undefined ? 0.0 : volume
    this.created = created === undefined ? '' : created
    this.batchId = batchId === undefined ? 0 : batchId
    this.active = active === undefined ? true : active
  }

  static fromJson(p) {
    return new Pour(p.id, p.pour, p.volume, p.created, p.batchId, p.active)
  }

  toJson() {
    var j = {
      // "id": this.id,
      //"batchId": this.batchId,
      pour: this.pour,
      volume: this.volume,
      created: this.created,
      active: this.active
    }

    return j
  }

  get id() {
    return this._id
  }
  get pour() {
    return this._pour
  }
  get volume() {
    return this._volume
  }
  get created() {
    return this._created
  }
  get batchId() {
    return this._batchId
  }
  get active() {
    return this._active
  }

  set id(id) {
    this._id = id
  }
  set pour(pour) {
    this._pour = pour
  }
  set volume(volume) {
    this._volume = volume
  }
  set created(created) {
    this._created = created
  }
  set batchId(batchId) {
    this._batchId = batchId
  }
  set active(active) {
    this._active = active
  }
}

export const usePourStore = defineStore('pourStore', {
  state: () => {
    return { pour: [] }
  },
  actions: {
    getPourListForBatch(id, callback) {
      // callback => (success, pour[])

      logDebug('pourStore.getPourListForBatch()')
      global.disabled = true
      fetch(global.baseURL + 'api/batch/' + id, {
        method: 'GET',
        headers: { Authorization: global.token },
        signal: AbortSignal.timeout(global.fetchTimout)
      })
        .then((res) => {
          logDebug('pourStore.getPourListForBatch()', res.status)
          if (!res.ok) throw res
          return res.json()
        })
        .then((json) => {
          this.pour = []

          json.pour.forEach((p) => {
            var pour = Pour.fromJson(p)
            this.pour.push(pour)
          })

          callback(true, this.pour)
          global.disabled = false
        })
        .catch((err) => {
          global.disabled = false
          logError('pourStore.getPourListForBatch()', err)
          callback(false, [])
        })
    },
    updatePour(p, callback) {
      // callback => (success)

      logDebug('pourStore.updatePour()', JSON.stringify(p.toJson()))
      global.disabled = true
      fetch(global.baseURL + 'api/pour/' + p.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: global.token },
        body: JSON.stringify(p.toJson()),
        signal: AbortSignal.timeout(global.fetchTimout)
      })
        .then((res) => {
          global.disabled = false
          logDebug('pourStore.updatePour()', res.status)
          if (res.status != 200) {
            callback(false)
          } else {
            callback(true)
          }
        })
        .catch((err) => {
          logError('pourStore.updatePour()', err)
          callback(false)
          global.disabled = false
        })
    }
  }
})
