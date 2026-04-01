/**
 * Gravity data model - represents a gravity/density/tilt sensor reading
 *
 * Gravity readings from hydrometers or tilt sensors including:
 * - Primary measurement (gravity value)
 * - Environmental data (temperature, battery, signal strength)
 * - Calculated/corrected values (velocity, corrected gravity)
 * - Chamber and beer temperature (optional)
 * - Timestamp and batch association
 *
 * @class
 */
export class Gravity {
  /**
   * Creates a new Gravity reading instance
   * @param {Object} params - The gravity properties
   */
  constructor({
    id = 0,
    temperature = null,
    gravity = 0.0,
    velocity = null,
    angle = 0.0,
    battery = 0.0,
    rssi = 0,
    corrGravity = null,
    runTime = null,
    created = '',
    batchId = 0,
    active = true,
    chamberTemperature = null,
    beerTemperature = null
  } = {}) {
    this._id = id
    this._temperature = (temperature === undefined || temperature === null) ? null : temperature
    this._gravity = gravity === undefined ? 0.0 : gravity
    this._velocity = (velocity === undefined || velocity === null) ? null : velocity
    this._angle = angle === undefined ? 0.0 : angle
    this._battery = battery === undefined ? 0.0 : battery
    this._rssi = rssi === undefined ? 0 : rssi
    this._corrGravity = (corrGravity === undefined || corrGravity === null) ? null : corrGravity
    this._runTime = (runTime === undefined || runTime === null) ? null : runTime
    this._created = created === undefined ? '' : created
    this._batchId = batchId === undefined ? 0 : batchId
    this._active = active === undefined ? true : active
    this._chamberTemperature = (chamberTemperature === undefined || chamberTemperature === null) ? null : chamberTemperature
    this._beerTemperature = (beerTemperature === undefined || beerTemperature === null) ? null : beerTemperature
  }

  /**
   * Factory method to create a Gravity reading from JSON/API response
   * @static
   * @param {Object} g - The JSON object from API
   * @returns {Gravity} A new Gravity instance
   */
  static fromJson(g) {
    return new Gravity({
      id: g.id,
      temperature: g.temperature,
      gravity: g.gravity,
      velocity: g.velocity,
      angle: g.angle,
      battery: g.battery,
      rssi: g.rssi,
      corrGravity: g.corrGravity,
      runTime: g.runTime,
      created: g.created,
      batchId: g.batchId,
      active: g.active,
      chamberTemperature: g.chamberTemperature,
      beerTemperature: g.beerTemperature
    })
  }

  /**
   * Serialize Gravity reading to JSON for API requests
   * Only includes temperature fields if they are not null
   * @returns {Object} JSON representation of the gravity reading (excluding ID)
   */
  toJson() {
    var j = {
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

    if (this.chamberTemperature !== null) j.chamberTemperature = this.chamberTemperature
    if (this.beerTemperature !== null) j.beerTemperature = this.beerTemperature

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
