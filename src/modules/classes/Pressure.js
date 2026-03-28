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
   * @param {number} [id=0] - Reading ID
   * @param {number|null} [temperature=null] - Temperature reading
   * @param {number} [pressure=0.0] - Pressure value (PSI or bar)
   * @param {number|null} [pressure1=null] - Secondary pressure channel (optional)
   * @param {number|null} [battery=null] - Battery voltage
   * @param {number} [rssi=0] - Signal strength (RSSI)
   * @param {number|null} [runTime=null] - Runtime in seconds
   * @param {string} [created=''] - Timestamp
   * @param {number} [batchId=0] - Associated batch ID
   * @param {boolean} [active=true] - Reading active
   */
  constructor(
    id,
    temperature,
    pressure,
    pressure1,
    battery,
    rssi,
    runTime,
    created,
    batchId,
    active
  ) {
    this.id = id === undefined ? 0 : id
    this.temperature = temperature === undefined || temperature === null ? null : temperature
    this.pressure = pressure === undefined ? 0.0 : pressure
    this.pressure1 = pressure1 === undefined || pressure1 === null ? null : pressure1
    this.battery = battery === undefined || battery === null ? null : battery
    this.rssi = rssi === undefined ? 0 : rssi
    this.runTime = runTime === undefined || runTime === null ? null : runTime
    this.created = created === undefined ? '' : created
    this.batchId = batchId === undefined ? 0 : batchId
    this.active = active === undefined ? true : active
  }

  /**
   * Factory method to create a Pressure reading from JSON/API response
   * @static
   * @param {Object} p - The JSON object from API
   * @returns {Pressure} A new Pressure instance
   */
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
