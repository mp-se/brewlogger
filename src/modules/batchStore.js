import { defineStore } from 'pinia'
import { global } from '@/modules/pinia'
import { logDebug, logError } from '@/modules/logger'

export class Batch {
  constructor(
    id,
    name,
    description,
    chipId,
    active,
    brewDate,
    style,
    brewer,
    abv,
    ebc,
    ibu,
    brewfatherId,
    gravity,
    fermentationChamber
  ) {
    this.id = id === undefined ? 0 : id
    this.name = name === undefined ? '' : name
    this.description = description === undefined ? '' : description
    this.chipId = chipId === undefined ? '' : chipId
    this.active = active === undefined ? true : active
    this.brewDate = brewDate === undefined ? '' : brewDate
    this.style = style === undefined ? '' : style
    this.brewer = brewer === undefined ? '' : brewer
    this.abv = abv === undefined ? 0 : abv
    this.ebc = ebc === undefined ? 0 : ebc
    this.ibu = ibu === undefined ? 0 : ibu
    this.brewfatherId = brewfatherId === undefined ? '' : brewfatherId
    this.fermentationChamber =
      fermentationChamber === undefined || fermentationChamber === null ? 0 : fermentationChamber
    this.gravityCount = gravity === undefined || gravity === null ? 0 : gravity.length
    this.gravity = []
  }

  static compare(b1, b2) {
    return (
      b1.name == b2.name &&
      b1.description == b2.description &&
      b1.chipId == b2.chipId &&
      b1.active == b2.active &&
      b1.brewDate == b2.brewDate &&
      b1.style == b2.style &&
      b1.brewer == b2.brewer &&
      b1.abv == b2.abv &&
      b1.ebc == b2.ebc &&
      b1.ibu == b2.ibu &&
      b1.brewfatherId == b2.brewfatherId &&
      b1.fermentationChamber == b2.fermentationChamber
    )
  }
  static fromJson(b) {
    return new Batch(
      b.id,
      b.name,
      b.description,
      b.chipId,
      b.active,
      b.brewDate,
      b.style,
      b.brewer,
      b.abv,
      b.ebc,
      b.ibu,
      b.brewfatherId,
      b.gravity,
      b.fermentationChamber
    )
  }

  static fromDashboardJson(bd) {
    var b = new Batch(
      bd.id,
      bd.name,
      '',
      bd.chipId,
      bd.active,
      '',
      '',
      '',
      0,
      0,
      0,
      0,
      bd.gravity,
      bd.fermentationChamber
    )
    b.gravity = bd.gravity
    return b
  }

  toJson() {
    var j = {
      name: this.name,
      description: this.description,
      chipId: this.chipId,
      active: this.active,
      brewDate: this.brewDate,
      style: this.style,
      brewer: this.brewer,
      abv: this.abv,
      ebc: this.ebc,
      ibu: this.ibu,
      brewfatherId: this.brewfatherId,
      fermentationChamber: this.fermentationChamber // Optional: Can be undefined (=0)
    }

    // Optional: Can be undefined
    if (this.fermentationChamber !== undefined && this.fermentationChamber > 0)
      j.fermentationChamber = this.fermentationChamber

    return j
  }

  get id() {
    return this._id
  }
  get name() {
    return this._name
  }
  get description() {
    return this._description
  }
  get chipId() {
    return this._chipId
  }
  get active() {
    return this._active
  }
  get brewDate() {
    return this._brewDate
  }
  get style() {
    return this._style
  }
  get brewer() {
    return this._brewer
  }
  get abv() {
    return this._abv
  }
  get ebc() {
    return this._ebc
  }
  get ibu() {
    return this._ibu
  }
  get brewfatherId() {
    return this._brewfatherId
  }
  get gravityCount() {
    return this._gravityCount
  }
  get gravity() {
    return this._gravity
  }
  get fermentationChamber() {
    return this._fermentationChamber
  }

  set id(id) {
    this._id = id
  }
  set name(name) {
    this._name = name
  }
  set description(description) {
    this._description = description
  }
  set chipId(chipId) {
    this._chipId = chipId
  }
  set active(active) {
    this._active = active
  }
  set brewDate(brewDate) {
    this._brewDate = brewDate
  }
  set style(style) {
    this._style = style
  }
  set brewer(brewer) {
    this._brewer = brewer
  }
  set abv(abv) {
    this._abv = abv
  }
  set ebc(ebc) {
    this._ebc = ebc
  }
  set ibu(ibu) {
    this._ibu = ibu
  }
  set brewfatherId(brewfatherId) {
    this._brewfatherId = brewfatherId
  }
  set fermentationChamber(fermentationChamber) {
    this._fermentationChamber = fermentationChamber
  }
  set gravityCount(gravityCount) {
    this._gravityCount = gravityCount
  }
  set gravity(gravity) {
    this._gravity = gravity
  }
}

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
    anyBatchesForDevice(chipId) {
      logDebug('batchStore.anyBatchesForDevice()')

      var found = false
      this.batches.forEach((b) => {
        if (b.chipId == chipId) found = true
      })
      return found
    },
    getBatchList(callback) {
      // callback => (success, batches[])

      logDebug('batchStore.getBatchList()')
      global.disabled = true
      fetch(global.baseURL + 'api/batch/', {
        method: 'GET',
        headers: { Authorization: global.token },
        signal: AbortSignal.timeout(global.fetchTimout)
      })
        .then((res) => {
          logDebug('batchStore.getBatchList()', res.status)
          if (!res.ok) throw res
          return res.json()
        })
        .then((json) => {
          logDebug(json)
          this.batches = []

          json.forEach((b) => {
            var batch = Batch.fromJson(b)
            this.batches.push(batch)
          })

          callback(true, this.batches)
          global.disabled = false
        })
        .catch((err) => {
          global.disabled = false
          logError('batchStore.getBatchList()', err)
          callback(false, [])
        })
    },
    getBatch(id, callback) {
      // callback => (success, batch)

      logDebug('batchStore.getBatch()', id)
      global.disabled = true
      fetch(global.baseURL + 'api/batch/' + id, {
        method: 'GET',
        headers: { Authorization: global.token },
        signal: AbortSignal.timeout(global.fetchTimout)
      })
        .then((res) => {
          logDebug('batchStore.getBatch()', res.status)
          if (!res.ok) throw res
          return res.json()
        })
        .then((json) => {
          logDebug('batchStore.getBatch()', json)
          var batch = Batch.fromJson(json)
          callback(true, batch)
          global.disabled = false
        })
        .catch((err) => {
          global.disabled = false
          logError('batchStore.getBatch()', err)
          callback(false, null)
        })
    },
    getBatchDashboard(id, callback) {
      // callback => (success, batch)

      logDebug('batchStore.getBatchDashboard()', id)
      global.disabled = true
      fetch(global.baseURL + 'api/batch/' + id + '/dashboard', {
        method: 'GET',
        headers: { Authorization: global.token },
        signal: AbortSignal.timeout(global.fetchTimout)
      })
        .then((res) => {
          logDebug('batchStore.getBatchDashboard()', res.status)
          if (!res.ok) throw res
          return res.json()
        })
        .then((json) => {
          logDebug('batchStore.getBatchDashboard()', json)
          var batch = Batch.fromDashboardJson(json)
          callback(true, batch)
          global.disabled = false
        })
        .catch((err) => {
          global.disabled = false
          logError('batchStore.getBatchDashboard()', err)
          callback(false, null)
        })
    },
    updateBatch(b, callback) {
      // callback => (success)

      logDebug('batchStore.updateBatch()', b.id, b.toJson())
      global.disabled = true
      fetch(global.baseURL + 'api/batch/' + b.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: global.token },
        body: JSON.stringify(b.toJson()),
        signal: AbortSignal.timeout(global.fetchTimout)
      })
        .then((res) => {
          global.disabled = false
          logDebug('batchStore.updateBatch()', res.status)
          if (res.status != 200) {
            callback(false)
          } else {
            callback(true)
          }
        })
        .catch((err) => {
          logError('batchStore.updateBatch()', err)
          callback(false)
          global.disabled = false
        })
    },
    addBatch(b, callback) {
      // callback => (success)

      logDebug('batchStore.addBatch()', b.toJson())
      global.disabled = true
      fetch(global.baseURL + 'api/batch/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: global.token },
        body: JSON.stringify(b.toJson()),
        signal: AbortSignal.timeout(global.fetchTimout)
      })
        .then((res) => {
          global.disabled = false
          logDebug('batchStore.addBatch()', res.status)
          if (res.status != 201) {
            callback(false)
          } else {
            callback(true)
          }
        })
        .catch((err) => {
          logError('batchStore.addBatch()', err)
          callback(false)
          global.disabled = false
        })
    },
    deleteBatch(id, callback) {
      // callback => (success)

      logDebug('batchStore.deleteBatch()', id)
      global.disabled = true
      fetch(global.baseURL + 'api/batch/' + id, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: global.token },
        signal: AbortSignal.timeout(global.fetchTimout)
      })
        .then((res) => {
          global.disabled = false
          logDebug('batchStore.deleteBatch()', res.status)
          if (res.status != 204) {
            callback(false)
          } else {
            callback(true)
          }
        })
        .catch((err) => {
          logError('batchStore.deleteBatch()', err)
          callback(false)
          global.disabled = false
        })
    }
  }
})
