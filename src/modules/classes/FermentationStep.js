/**
 * FermentationStep data model - represents a fermentation schedule step/stage
 * 
 * A fermentation step defines a temperature set-point and duration for
 * a particular stage of fermentation (e.g., pitch at 10°C, ramp to 18°C, hold for 7 days)
 * 
 * @class
 */
export class FermentationStep {
  /**
   * Creates a new FermentationStep instance
   * @param {string} [name=''] - Step name/description
   * @param {number} [stepTemp=0] - Target temperature
   * @param {number} [stepTime=0] - Duration in hours
   * @param {string} [rampTime=''] - Temperature ramp time
   */
  constructor(order, name, type, date, temp, days) {
    this.order = order
    this.name = name === undefined ? '' : name
    this.type = type
    this.date = date
    this.temp = temp
    this.days = days
  }
  /**
   * Factory method to create a FermentationStep from JSON/API response
   * @static
   * @param {Object} f - The JSON object from API
   * @returns {FermentationStep} A new FermentationStep instance
   */  static fromJson(fs) {
    return new FermentationStep(fs.order, fs.name, fs.type, fs.date, fs.temp, fs.days)
  }

  static listFromJson(fsList, updateDates) {
    var list = []

    fsList.forEach((fs) => {
      var step = FermentationStep.fromJson(fs)
      list.push(step)
    })

    if (updateDates) {
      var day = new Date()

      list.forEach((fs) => {
        fs.date = new Date(day).toISOString().substring(0, 10)
        day.setDate(day.getDate() + fs.days)
      })
    }

    return list
  }

  static listToJson(fsList, deviceId) {
    var list = []

    fsList.forEach((fs) => {
      var step = new FermentationStep(
        fs.order,
        fs.name,
        fs.type,
        fs.date,
        fs.temp,
        fs.days
      ).toJson()
      step.deviceId = deviceId
      list.push(step)
    })

    return list
  }

  /**
   * Serialize FermentationStep to JSON for API requests
   * @returns {Object} JSON representation of the fermentation step (excluding ID)
   */
  toJson() {
    return {
      order: this.order,
      name: this.name,
      type: this.type,
      date: this.date,
      temp: this.temp,
      days: this.days
    }
  }

  get order() {
    return this._order
  }
  get name() {
    return this._name
  }
  get type() {
    return this._type
  }
  get date() {
    return this._date
  }
  get temp() {
    return this._temp
  }
  get days() {
    return this._days
  }

  set order(order) {
    this._order = order
  }
  set name(name) {
    this._name = name
  }
  set type(type) {
    this._type = type
  }
  set date(date) {
    this._date = date
  }
  set temp(temp) {
    this._temp = temp
  }
  set days(days) {
    this._days = days
  }
}
