import { defineStore } from 'pinia'
import { global } from '@/modules/pinia'
import { logDebug, logError } from '@/modules/logger'

export class Gravity {
  constructor(
    id,
    temperature,
    gravity,
    velocity,
    angle,
    battery,
    rssi,
    corrGravity,
    runTime,
    created,
    batchId,
    active,
    chamberTemperature,
    beerTemperature
  ) {
    this.id = id === undefined ? 0 : id
    this.temperature = temperature === undefined ? 0.0 : temperature
    this.gravity = gravity === undefined ? 0.0 : gravity
    this.velocity = velocity === undefined ? 0.0 : velocity
    this.angle = angle === undefined ? 0.0 : angle
    this.battery = battery === undefined ? 0.0 : battery
    this.rssi = rssi === undefined ? 0 : rssi
    this.corrGravity = corrGravity === undefined ? 0.0 : corrGravity
    this.runTime = runTime === undefined ? 0 : runTime
    this.created = created === undefined ? '' : created
    this.batchId = batchId === undefined ? 0 : batchId
    this.active = active === undefined ? true : active
    this.chamberTemperature =
      chamberTemperature === undefined || chamberTemperature === null
        ? undefined
        : chamberTemperature
    this.beerTemperature =
      beerTemperature === undefined || beerTemperature === null ? undefined : beerTemperature
  }

  static fromJson(g) {
    return new Gravity(
      g.id,
      g.temperature,
      g.gravity,
      g.velocity,
      g.angle,
      g.battery,
      g.rssi,
      g.corrGravity,
      g.runTime,
      g.created,
      g.batchId,
      g.active,
      g.chamberTemperature,
      g.beerTemperature
    )
  }

  toJson() {
    var j = {
      // "id": this.id,
      //"batchId": this.batchId,
      temperature: this.temperature,
      gravity: this.gravity,
      velocity: this.velocity,
      angle: this.angle,
      battery: this.battery,
      rssi: this.rssi,
      corrGravity: this.corrGravity,
      runTime: this.runTime,
      created: this.created,
      active: this.active
    }

    // Optional: Can be undefined or null
    if (this.chamberTemperature !== undefined) j.chamberTemperature = this.chamberTemperature

    if (this.beerTemperature !== undefined) j.beerTemperature = this.beerTemperature

    return j
  }

  get id() {
    return this._id
  }
  get temperature() {
    return this._temperature
  }
  get gravity() {
    return this._gravity
  }
  get velocity() {
    return this._velocity
  }
  get angle() {
    return this._angle
  }
  get battery() {
    return this._battery
  }
  get rssi() {
    return this._rssi
  }
  get corrGravity() {
    return this._corrGravity
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
  get chamberTemperature() {
    return this._chamberTemperature
  }
  get beerTemperature() {
    return this._beerTemperature
  }

  set id(id) {
    this._id = id
  }
  set temperature(temperature) {
    this._temperature = temperature
  }
  set gravity(gravity) {
    this._gravity = gravity
  }
  set velocity(velocity) {
    this._velocity = velocity
  }
  set angle(angle) {
    this._angle = angle
  }
  set battery(battery) {
    this._battery = battery
  }
  set rssi(rssi) {
    this._rssi = rssi
  }
  set corrGravity(corrGravity) {
    this._corrGravity = corrGravity
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
  set chamberTemperature(chamberTemperature) {
    this._chamberTemperature = chamberTemperature
  }
  set beerTemperature(beerTemperature) {
    this._beerTemperature = beerTemperature
  }
}

export const useGravityStore = defineStore('gravityStore', {
  state: () => {
    return { gravity: [] }
  },
  actions: {
    getGravityListForBatch(id, callback) {
      // callback => (success, gravity[])

      logDebug('gravityStore.getGravityListForBatch()')
      global.disabled = true
      fetch(global.baseURL + 'api/batch/' + id, {
        method: 'GET',
        headers: { Authorization: global.token },
        signal: AbortSignal.timeout(global.fetchTimout)
      })
        .then((res) => {
          logDebug('gravityStore.getGravityListForBatch()', res.status)
          if (!res.ok) throw res
          return res.json()
        })
        .then((json) => {
          this.gravity = []

          json.gravity.forEach((g) => {
            var gravity = Gravity.fromJson(g)
            this.gravity.push(gravity)
          })

          callback(true, this.gravity)
          global.disabled = false
        })
        .catch((err) => {
          global.disabled = false
          logError('gravityStore.getGravityListForBatch()', err)
          callback(false, [])
        })
    },
    updateGravity(g, callback) {
      // callback => (success)

      logDebug('gravityStore.updateGravity()', JSON.stringify(g.toJson()))
      global.disabled = true
      fetch(global.baseURL + 'api/gravity/' + g.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: global.token },
        body: JSON.stringify(g.toJson()),
        signal: AbortSignal.timeout(global.fetchTimout)
      })
        .then((res) => {
          global.disabled = false
          logDebug('gravityStore.updateGravity()', res.status)
          if (res.status != 200) {
            callback(false)
          } else {
            callback(true)
          }
        })
        .catch((err) => {
          logError('gravityStore.updateGravity()', err)
          callback(false)
          global.disabled = false
        })
    }
  }
})
