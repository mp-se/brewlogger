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
   * @param {number} [id=0] - Reading ID
   * @param {number|null} [temperature=null] - Temperature reading
   * @param {number} [gravity=0.0] - Gravity/density value
   * @param {number|null} [velocity=null] - Rate of change
   * @param {number} [angle=0.0] - Tilt/angle in degrees
   * @param {number} [battery=0.0] - Battery voltage
   * @param {number} [rssi=0] - Signal strength (RSSI)
   * @param {number|null} [corrGravity=null] - Corrected gravity value
   * @param {number|null} [runTime=null] - Runtime in seconds
   * @param {string} [created=''] - Timestamp
   * @param {number} [batchId=0] - Associated batch ID
   * @param {boolean} [active=true] - Reading active
   * @param {number|null} [chamberTemperature=null] - Chamber temperature
   * @param {number|null} [beerTemperature=null] - Beer temperature
   */
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
    this.temperature = temperature === undefined || temperature === null ? null : temperature
    this.gravity = gravity === undefined ? 0.0 : gravity
    this.velocity = velocity === undefined || velocity === null ? null : velocity
    this.angle = angle === undefined ? 0.0 : angle
    this.battery = battery === undefined ? 0.0 : battery
    this.rssi = rssi === undefined ? 0 : rssi
    this.corrGravity = corrGravity === undefined || corrGravity === null ? null : corrGravity
    this.runTime = runTime === undefined || runTime === null ? null : runTime
    this.created = created === undefined ? '' : created
    this.batchId = batchId === undefined ? 0 : batchId
    this.active = active === undefined ? true : active
    this.chamberTemperature =
      chamberTemperature === undefined || chamberTemperature === null ? null : chamberTemperature
    this.beerTemperature =
      beerTemperature === undefined || beerTemperature === null ? null : beerTemperature
  }

  /**
   * Factory method to create a Gravity reading from JSON/API response
   * @static
   * @param {Object} g - The JSON object from API
   * @returns {Gravity} A new Gravity instance
   */
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
