/**
 * Pour data model - represents a pouring/dispensing event from a keg or tap
 *
 * Pour records track:
 * - Volume poured in this event
 * - Maximum volume available (tank/keg size)
 * - Timestamp of the pour event
 * - Associated batch and active state
 *
 * @class
 */
export class Pour {
  /**
   * Creates a new Pour event instance
   * @param {number} [id=0] - Event ID
   * @param {number} [pour=0.0] - Pour volume
   * @param {number} [volume=0.0] - Current volume in vessel
   * @param {number} [maxVolume=0.0] - Maximum volume (tank/keg size)
   * @param {string} [created=''] - Timestamp
   * @param {number} [batchId=0] - Associated batch ID
   * @param {boolean} [active=true] - Event active
   */
  constructor(id, pour, volume, maxVolume, created, batchId, active) {
    this.id = id === undefined ? 0 : id
    this.pour = pour === undefined ? 0.0 : pour
    this.volume = volume === undefined ? 0.0 : volume
    this.maxVolume = maxVolume === undefined ? 0.0 : maxVolume
    this.created = created === undefined ? '' : created
    this.batchId = batchId === undefined ? 0 : batchId
    this.active = active === undefined ? true : active
  }

  /**
   * Factory method to create a Pour event from JSON/API response
   * @static
   * @param {Object} p - The JSON object from API
   * @returns {Pour} A new Pour instance
   */
  static fromJson(p) {
    return new Pour(p.id, p.pour, p.volume, p.maxVolume, p.created, p.batchId, p.active)
  }

  /**
   * Serialize Pour event to JSON for API requests
   * @returns {Object} JSON representation of the pour event (excluding ID)
   */
  toJson() {
    var j = {
      pour: this.pour,
      volume: this.volume,
      maxVolume: this.maxVolume,
      created: this.created,
      active: this.active,
      batchId: this.batchId
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
  get maxVolume() {
    return this._maxVolume
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
  set maxVolume(maxVolume) {
    this._maxVolume = maxVolume
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
