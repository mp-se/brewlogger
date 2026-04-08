// SPDX-License-Identifier: GPL-3.0-or-later
// Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger-ui

/**
 * Batch data model - represents a brewing batch with associated sensors and recipe data
 *
 * A Batch contains information about a brewing session including:
 * - Recipe data (name, style, brewer, ABV, EBC, IBU, OG, FG)
 * - Sensor assignments (gravity and pressure device IDs)
 * - Fermentation steps and chamber configuration
 * - Associated gravity, pressure, and pour sensor readings
 *
 * @class
 */
export class Batch {
  /**
   * Creates a new Batch instance
   * @param {number} [id=0] - Batch ID
   * @param {string} [name=''] - Batch name
   * @param {string} [description=''] - Batch description
   * @param {string} [chipIdGravity=''] - Gravity sensor device ID
   * @param {string} [chipIdPressure=''] - Pressure sensor device ID
   * @param {boolean} [active=true] - Whether batch is active
   * @param {string} [brewDate=''] - Brew date
   * @param {string} [style=''] - Beer style
   * @param {string} [brewer=''] - Brewer name
   * @param {number} [abv=0] - Alcohol by volume
   * @param {number} [ebc=0] - Color in EBC units
   * @param {number} [ibu=0] - Bitterness in IBU
   * @param {number} [fg=0] - Final gravity
   * @param {number} [og=0] - Original gravity
   * @param {string} [brewfatherId=''] - Brewfather batch ID
   * @param {number} [fermentationChamber=0] - Chamber number
   * @param {string} [fermentationSteps=''] - Fermentation profile
   * @param {boolean} [tapList=true] - Include in tap list
   * @param {number} [gravityCount=0] - Number of gravity readings
   * @param {number} [pressureCount=0] - Number of pressure readings
   * @param {number} [pourCount=0] - Number of pour events
   * @param {number} [lastPourVolume] - Last pour volume
   * @param {number} [lastPourMaxVolume] - Last pour max volume
   * @param {number} [predictionHoursLeft] - Estimated hours until fermentation complete
   * @param {string} [predictionAtTimestamp] - When the prediction was calculated
   * @param {Array} [gravity] - Gravity readings array
   * @param {Array} [pressure] - Pressure readings array
   * @param {Array} [pour] - Pour events array
   */
  constructor(
    {
      id = 0,
      name = '',
      description = '',
      chipIdGravity = '',
      chipIdPressure = '',
      active = true,
      brewDate = '',
      style = '',
      brewer = '',
      abv = 0,
      ebc = 0,
      ibu = 0,
      fg = 0,
      og = 0,
      brewfatherId = '',
      fermentationChamber = 0,
      fermentationSteps = '',
      tapList = true,
      gravityCount = 0,
      pressureCount = 0,
      pourCount = 0,
      lastPourVolume = undefined,
      lastPourMaxVolume = undefined,
      predictionHoursLeft = undefined,
      predictionAtTimestamp = undefined,
      gravity = [],
      pressure = [],
      pour = []
    } = {}
  ) {
    this._id = id
    this._name = name
    this._description = description
    this._chipIdGravity = chipIdGravity
    this._chipIdPressure = chipIdPressure
    this._active = active
    this._brewDate = brewDate
    this._style = style
    this._brewer = brewer
    this._abv = abv
    this._ebc = ebc
    this._ibu = ibu
    this._fg = fg
    this._og = og
    this._brewfatherId = brewfatherId
    this._fermentationChamber = fermentationChamber === null ? 0 : fermentationChamber
    this._fermentationSteps = fermentationSteps === null ? '' : fermentationSteps
    this._tapList = tapList === null ? true : tapList
    this._gravityCount = gravityCount === null ? 0 : gravityCount
    this._pressureCount = pressureCount === null ? 0 : pressureCount
    this._pourCount = pourCount === null ? 0 : pourCount
    this._lastPourVolume = lastPourVolume === null ? undefined : lastPourVolume
    this._lastPourMaxVolume = lastPourMaxVolume === null ? undefined : lastPourMaxVolume
    this._predictionHoursLeft = predictionHoursLeft === null ? undefined : predictionHoursLeft
    this._predictionAtTimestamp =
      predictionAtTimestamp === null || predictionAtTimestamp === ''
        ? undefined
        : predictionAtTimestamp

    // Initialize arrays
    this._gravity = gravity === null ? [] : gravity
    this._pressure = pressure === null ? [] : pressure
    this._pour = pour === null ? [] : pour
  }

  static compare(b1, b2) {
    return (
      b1.name == b2.name &&
      b1.description == b2.description &&
      b1.chipIdGravity == b2.chipIdGravity &&
      b1.chipIdPressure == b2.chipIdPressure &&
      b1.active == b2.active &&
      b1.tapList == b2.tapList &&
      b1.brewDate == b2.brewDate &&
      b1.style == b2.style &&
      b1.brewer == b2.brewer &&
      b1.abv == b2.abv &&
      b1.ebc == b2.ebc &&
      b1.ibu == b2.ibu &&
      b1.fg == b2.fg &&
      b1.og == b2.og &&
      b1.brewfatherId == b2.brewfatherId &&
      b1.fermentationChamber == b2.fermentationChamber &&
      b1.fermentationSteps == b2.fermentationSteps &&
      b1.predictionHoursLeft == b2.predictionHoursLeft &&
      b1.predictionAtTimestamp == b2.predictionAtTimestamp
    )
  }

  /**
   * Factory method to create a Batch from JSON/API response
   * @static
   * @param {Object} b - The JSON object from API
   * @returns {Batch} A new Batch instance
   */
  static fromJson(b) {
    // Calculate counts from arrays if they exist, otherwise use provided counts
    const gravityCount =
      b.gravity !== undefined && b.gravity !== null ? b.gravity.length : b.gravityCount || 0
    const pressureCount =
      b.pressure !== undefined && b.pressure !== null ? b.pressure.length : b.pressureCount || 0
    const pourCount = b.pour !== undefined && b.pour !== null ? b.pour.length : b.pourCount || 0

    return new Batch({
      id: b.id,
      name: b.name,
      description: b.description,
      chipIdGravity: b.chipIdGravity,
      chipIdPressure: b.chipIdPressure,
      active: b.active,
      brewDate: b.brewDate,
      style: b.style,
      brewer: b.brewer,
      abv: b.abv,
      ebc: b.ebc,
      ibu: b.ibu,
      fg: b.fg,
      og: b.og,
      brewfatherId: b.brewfatherId,
      fermentationChamber: b.fermentationChamber,
      fermentationSteps: b.fermentationSteps,
      tapList: b.tapList,
      gravityCount: gravityCount,
      pressureCount: pressureCount,
      pourCount: pourCount,
      lastPourVolume: b.lastPourVolume,
      lastPourMaxVolume: b.lastPourMaxVolume,
      predictionHoursLeft: b.predictionHoursLeft,
      predictionAtTimestamp: b.predictionAtTimestamp,
      gravity: b.gravity,
      pressure: b.pressure,
      pour: b.pour
    })
  }

  static fromDashboardJson(bd) {
    // Calculate counts from arrays
    const gravityCount = bd.gravity === undefined || bd.gravity === null ? 0 : bd.gravity.length
    const pressureCount = bd.pressure === undefined || bd.pressure === null ? 0 : bd.pressure.length
    const pourCount = bd.pour === undefined || bd.pour === null ? 0 : bd.pour.length

    // Extract last pour values from the pour array
    let lastPourVolume = undefined
    let lastPourMaxVolume = undefined
    if (bd.pour !== undefined && bd.pour !== null) {
      const activePours = bd.pour.filter((p) => p.active)
      activePours.sort((a, b) => Date.parse(b.created) - Date.parse(a.created))
      if (activePours.length > 0) {
        lastPourVolume = activePours[0].volume
        lastPourMaxVolume = activePours[0].maxVolume
      }
    }

    return new Batch({
      id: bd.id,
      name: bd.name,
      description: bd.description || '',
      chipIdGravity: bd.chipIdGravity || '',
      chipIdPressure: bd.chipIdPressure || '',
      active: bd.active !== undefined ? bd.active : true,
      brewDate: bd.brewDate || '',
      style: bd.style || '',
      brewer: bd.brewer || '',
      abv: bd.abv || 0,
      ebc: bd.ebc || 0,
      ibu: bd.ibu || 0,
      fg: bd.fg || 0,
      og: bd.og || 0,
      brewfatherId: bd.brewfatherId || '',
      fermentationChamber: bd.fermentationChamber || 0,
      fermentationSteps: bd.fermentationSteps || '',
      tapList: bd.tapList !== undefined ? bd.tapList : true,
      gravityCount,
      pressureCount,
      pourCount,
      lastPourVolume,
      lastPourMaxVolume,
      predictionHoursLeft: bd.predictionHoursLeft,
      predictionAtTimestamp: bd.predictionAtTimestamp,
      gravity: bd.gravity || [],
      pressure: bd.pressure || [],
      pour: bd.pour || []
    })
  }

  /**
   * Serialize Batch to JSON for API requests
   * @returns {Object} JSON representation of the batch (excluding ID and computed fields)
   */
  toJson() {
    var j = {
      id: this.id,
      name: this.name,
      description: this.description,
      chipIdGravity: this.chipIdGravity,
      chipIdPressure: this.chipIdPressure,
      active: this.active,
      tapList: this.tapList,
      brewDate: this.brewDate,
      style: this.style,
      brewer: this.brewer,
      abv: this.abv,
      ebc: this.ebc,
      ibu: this.ibu,
      fg: this.fg,
      og: this.og,
      brewfatherId: this.brewfatherId,
      fermentationChamber: this.fermentationChamber,
      fermentationSteps: this.fermentationSteps,
      predictionHoursLeft: this.predictionHoursLeft,
      predictionAtTimestamp: this.predictionAtTimestamp,
      gravity: this.gravity || [],
      pressure: this.pressure || [],
      pour: this.pour || []
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
  get chipIdGravity() {
    return this._chipIdGravity
  }
  get chipIdPressure() {
    return this._chipIdPressure
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
  get fg() {
    return this._fg
  }
  get og() {
    return this._og
  }
  get brewfatherId() {
    return this._brewfatherId
  }
  get fermentationChamber() {
    return this._fermentationChamber
  }
  get fermentationSteps() {
    return this._fermentationSteps
  }
  get tapList() {
    return this._tapList
  }
  get gravityCount() {
    return this._gravityCount
  }
  get gravity() {
    return this._gravity
  }
  get pressureCount() {
    return this._pressureCount
  }
  get pressure() {
    return this._pressure
  }
  get pourCount() {
    return this._pourCount
  }
  get pour() {
    return this._pour
  }
  get lastPourVolume() {
    return this._lastPourVolume
  }
  get lastPourMaxVolume() {
    return this._lastPourMaxVolume
  }
  get predictionHoursLeft() {
    return this._predictionHoursLeft
  }
  get predictionAtTimestamp() {
    return this._predictionAtTimestamp
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
  set chipIdGravity(chipIdGravity) {
    this._chipIdGravity = chipIdGravity
  }
  set chipIdPressure(chipIdPressure) {
    this._chipIdPressure = chipIdPressure
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
  set fg(fg) {
    this._fg = fg
  }
  set og(og) {
    this._og = og
  }
  set brewfatherId(brewfatherId) {
    this._brewfatherId = brewfatherId
  }
  set fermentationChamber(fermentationChamber) {
    this._fermentationChamber = fermentationChamber
  }
  set fermentationSteps(fermentationSteps) {
    this._fermentationSteps = fermentationSteps
  }
  set tapList(tapList) {
    this._tapList = tapList
  }
  set gravityCount(gravityCount) {
    this._gravityCount = gravityCount
  }
  set gravity(gravity) {
    this._gravity = gravity
  }
  set pressureCount(pressureCount) {
    this._pressureCount = pressureCount
  }
  set pressure(pressure) {
    this._pressure = pressure
  }
  set pourCount(pourCount) {
    this._pourCount = pourCount
  }
  set pour(pour) {
    this._pour = pour
  }
  set lastPourVolume(lastPourVolume) {
    this._lastPourVolume = lastPourVolume
  }
  set lastPourMaxVolume(lastPourMaxVolume) {
    this._lastPourMaxVolume = lastPourMaxVolume
  }
  set predictionHoursLeft(predictionHoursLeft) {
    this._predictionHoursLeft = predictionHoursLeft
  }
  set predictionAtTimestamp(predictionAtTimestamp) {
    this._predictionAtTimestamp = predictionAtTimestamp
  }
}
