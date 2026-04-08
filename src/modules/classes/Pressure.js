// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

/**
 * Pressure data model - represents a pressure sensor reading
 *
 * Pressure readings from a keg or tank pressure sensor including:
 * - Primary measurement (pressure value)
 * - Alternative pressure channel (optional, pressure1)
 * - Environmental data (temperature, battery, signal strength)
 * - Runtime tracking and batch association
 * - Single vs dual pressure support
 *
 * @class
 */
export class Pressure {
  /**
   * Creates a new Pressure reading instance
   * @param {Object} params - The pressure properties
   */
  constructor({
    id = 0,
    temperature = null,
    pressure = 0.0,
    pressure1 = null,
    battery = null,
    rssi = 0,
    runTime = null,
    created = '',
    batchId = 0,
    active = true
  } = {}) {
    this._id = id
    this._temperature = (temperature === undefined || temperature === null) ? null : temperature
    this._pressure = pressure === undefined ? 0.0 : pressure
    this._pressure1 = (pressure1 === undefined || pressure1 === null) ? null : pressure1
    this._battery = (battery === undefined || battery === null) ? null : battery
    this._rssi = rssi === undefined ? 0 : rssi
    this._runTime = (runTime === undefined || runTime === null) ? null : runTime
    this._created = created === undefined ? '' : created
    this._batchId = batchId === undefined ? 0 : batchId
    this._active = active === undefined ? true : active
  }

  /**
   * Factory method to create a Pressure reading from JSON/API response
   * @static
   * @param {Object} p - The JSON object from API
   * @returns {Pressure} A new Pressure instance
   */
  static fromJson(p) {
    return new Pressure({
      id: p.id,
      temperature: p.temperature,
      pressure: p.pressure,
      pressure1: p.pressure1,
      battery: p.battery,
      rssi: p.rssi,
      runTime: p.runTime,
      created: p.created,
      batchId: p.batchId,
      active: p.active
    })
  }

  /**
   * Serialize Pressure reading to JSON for API requests
   * @returns {Object} JSON representation of the pressure reading (excluding ID)
   */
  toJson() {
    var j = {
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
