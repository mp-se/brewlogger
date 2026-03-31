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
   * @param {Array} [gravity] - Gravity readings array
   * @param {Array} [pressure] - Pressure readings array
   * @param {Array} [pour] - Pour events array
   */
  constructor(
    id,
    name,
    description,
    chipIdGravity,
    chipIdPressure,
    active,
    brewDate,
    style,
    brewer,
    abv,
    ebc,
    ibu,
    fg,
    og,
    brewfatherId,
    fermentationChamber,
    fermentationSteps,
    tapList,
    gravityCount,
    pressureCount,
    pourCount,
    lastPourVolume,
    lastPourMaxVolume,
    gravity,
    pressure,
    pour
  ) {
    this.id = id === undefined ? 0 : id
    this.name = name === undefined ? '' : name
    this.description = description === undefined ? '' : description
    this.chipIdGravity = chipIdGravity === undefined ? '' : chipIdGravity
    this.chipIdPressure = chipIdPressure === undefined ? '' : chipIdPressure
    this.active = active === undefined ? true : active
    this.tapList = tapList === undefined ? true : tapList
    this.brewDate = brewDate === undefined ? '' : brewDate
    this.style = style === undefined ? '' : style
    this.brewer = brewer === undefined ? '' : brewer
    this.abv = abv === undefined ? 0 : abv
    this.ebc = ebc === undefined ? 0 : ebc
    this.ibu = ibu === undefined ? 0 : ibu
    this.fg = fg === undefined ? 0 : fg
    this.og = og === undefined ? 0 : og
    this.brewfatherId = brewfatherId === undefined ? '' : brewfatherId
    this.fermentationChamber =
      fermentationChamber === undefined || fermentationChamber === null ? 0 : fermentationChamber
    this.fermentationSteps =
      fermentationSteps === undefined || fermentationSteps === null ? '' : fermentationSteps

    this.gravityCount = gravityCount === undefined ? 0 : gravityCount
    this.pressureCount = pressureCount === undefined ? 0 : pressureCount
    this.pourCount = pourCount === undefined ? 0 : pourCount
    this.lastPourVolume =
      lastPourVolume === undefined || lastPourVolume === null ? undefined : lastPourVolume
    this.lastPourMaxVolume =
      lastPourMaxVolume === undefined || lastPourMaxVolume === null ? undefined : lastPourMaxVolume

    // Initialize arrays
    this.gravity = gravity === undefined || gravity === null ? [] : gravity
    this.pressure = pressure === undefined || pressure === null ? [] : pressure
    this.pour = pour === undefined || pour === null ? [] : pour
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
      b1.fermentationSteps == b2.fermentationSteps
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

    return new Batch(
      b.id,
      b.name,
      b.description,
      b.chipIdGravity,
      b.chipIdPressure,
      b.active,
      b.brewDate,
      b.style,
      b.brewer,
      b.abv,
      b.ebc,
      b.ibu,
      b.fg,
      b.og,
      b.brewfatherId,
      b.fermentationChamber,
      b.fermentationSteps,
      b.tapList,
      gravityCount,
      pressureCount,
      pourCount,
      b.lastPourVolume,
      b.lastPourMaxVolume,
      b.gravity,
      b.pressure,
      b.pour
    )
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
      if (activePours.length) {
        lastPourVolume = activePours[0].volume
        lastPourMaxVolume = activePours[0].maxVolume
      }
    }

    var b = new Batch(
      bd.id,
      bd.name,
      '',
      bd.chipIdGravity,
      bd.chipIdPressure,
      bd.active,
      '',
      '',
      '',
      0,
      0,
      0,
      bd.fg,
      bd.og,
      0,
      bd.fermentationChamber,
      '',
      bd.tapList,
      gravityCount,
      pressureCount,
      pourCount,
      lastPourVolume,
      lastPourMaxVolume,
      bd.gravity,
      bd.pressure,
      bd.pour
    )

    return b
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
}
