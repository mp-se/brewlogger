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
   * @param {Object} params - The pour properties
   */
  constructor({
    id = 0,
    pour = 0.0,
    volume = 0.0,
    maxVolume = 0.0,
    created = '',
    batchId = 0,
    active = true
  } = {}) {
    this._id = id
    this._pour = pour === undefined ? 0.0 : pour
    this._volume = volume === undefined ? 0.0 : volume
    this._maxVolume = maxVolume === undefined ? 0.0 : maxVolume
    this._created = created === undefined ? '' : created
    this._batchId = batchId === undefined ? 0 : batchId
    this._active = active === undefined ? true : active
  }

  /**
   * Factory method to create a Pour event from JSON/API response
   * @static
   * @param {Object} p - The JSON object from API
   * @returns {Pour} A new Pour instance
   */
  static fromJson(p) {
    return new Pour({
      id: p.id,
      pour: p.pour,
      volume: p.volume,
      maxVolume: p.maxVolume,
      created: p.created,
      batchId: p.batchId,
      active: p.active
    })
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
