import { defineStore } from 'pinia'
import { global } from '@/modules/pinia'
import { logDebug, logError } from '@/modules/logger'

export class Pressure {
  constructor(id, temperature, pressure, pressure1, battery, rssi, runTime, created, batchId, active) {
    this.id = id === undefined ? 0 : id
    this.temperature = temperature === undefined ? 0.0 : temperature
    this.pressure = pressure === undefined ? 0.0 : pressure
    this.pressure1 = pressure1 === undefined ? 0.0 : pressure1
    this.battery = battery === undefined ? 0.0 : battery
    this.rssi = rssi === undefined ? 0 : rssi
    this.runTime = runTime === undefined ? 0 : runTime
    this.created = created === undefined ? '' : created
    this.batchId = batchId === undefined ? 0 : batchId
    this.active = active === undefined ? true : active
  }

  static fromJson(p) {
    return new Pressure(
      p.id,
      p.temperature,
      p.pressure,
      p.pressure1,
      p.battery,
      p.rssi,
      p.runTime,
      p.created,
      p.batchId,
      p.active
    )
  }

  toJson() {
    var j = {
      // "id": this.id,
      //"batchId": this.batchId,
      temperature: this.temperature,
      pressure: this.pressure,
      pressure1: this.pressure1,
      battery: this.battery,
      rssi: this.rssi,
      runTime: this.runTime,
      created: this.created,
      active: this.active
    }

    return j
  }

  get id() {
    return this._id
  }
  get temperature() {
    return this._temperature
  }
  get pressure() {
    return this._pressure
  }
  get pressure1() {
    return this._pressure1
  }
  get battery() {
    return this._battery
  }
  get rssi() {
    return this._rssi
  }
  get runTime() {
    return this._runTime
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
  set temperature(temperature) {
    this._temperature = temperature
  }
  set pressure(pressure) {
    this._pressure = pressure
  }
  set pressure1(pressure1) {
    this._pressure1 = pressure1
  }
  set battery(battery) {
    this._battery = battery
  }
  set rssi(rssi) {
    this._rssi = rssi
  }
  set runTime(runTime) {
    this._runTime = runTime
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

export const usePressureStore = defineStore('pressureStore', {
  state: () => {
    return { pressure: [] }
  },
  actions: {
    getPressureListForBatch(id, callback) {
      // callback => (success, pressure[])

      logDebug('pressureStore.getPressureListForBatch()')
      global.disabled = true
      fetch(global.baseURL + 'api/batch/' + id, {
        method: 'GET',
        headers: { Authorization: global.token },
        signal: AbortSignal.timeout(global.fetchTimout)
      })
        .then((res) => {
          logDebug('pressureStore.getGravityListForBatch()', res.status)
          if (!res.ok) throw res
          return res.json()
        })
        .then((json) => {
          this.pressure = []

          json.pressure.forEach((p) => {
            var pressure = Pressure.fromJson(p)
            this.pressure.push(pressure)
          })

          callback(true, this.pressure)
          global.disabled = false
        })
        .catch((err) => {
          global.disabled = false
          logError('pressureStore.getPressureListForBatch()', err)
          callback(false, [])
        })
    },
    updatePressure(p, callback) {
      // callback => (success)

      logDebug('pressureStore.updatePressure()', JSON.stringify(p.toJson()))
      global.disabled = true
      fetch(global.baseURL + 'api/pressure/' + p.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: global.token },
        body: JSON.stringify(p.toJson()),
        signal: AbortSignal.timeout(global.fetchTimout)
      })
        .then((res) => {
          global.disabled = false
          logDebug('pressureStore.updatePressure()', res.status)
          if (res.status != 200) {
            callback(false)
          } else {
            callback(true)
          }
        })
        .catch((err) => {
          logError('pressureStore.updatePressure()', err)
          callback(false)
          global.disabled = false
        })
    }
  }
})
