/**
 * BrewfatherBatch data model - represents batch data from Brewfather integration
 */
export class BrewfatherBatch {
  /**
   * Creates a new BrewfatherBatch instance
   * @param {Object} params - The brewfather batch properties
   */
  constructor({
    brewfatherId = '',
    name = '',
    brewDate = '',
    style = '',
    brewer = '',
    abv = 0,
    ebc = 0,
    ibu = 0,
    og = 0,
    fg = 0,
    fermentationSteps = ''
  } = {}) {
    this._name = name === undefined ? '' : name
    this._brewDate = brewDate === undefined ? '' : brewDate
    this._style = style === undefined ? '' : style
    this._brewer = brewer === undefined ? '' : brewer
    this._abv = abv === undefined ? 0 : abv
    this._ebc = ebc === undefined ? 0 : ebc
    this._ibu = ibu === undefined ? 0 : ibu
    this._og = og === undefined ? 0 : og
    this._fg = fg === undefined ? 0 : fg
    this._brewfatherId = brewfatherId === undefined ? '' : brewfatherId
    this._fermentationSteps = fermentationSteps === undefined ? '' : fermentationSteps
  }

  /**
   * Factory method to create a BrewfatherBatch from JSON/Brewfather API response
   * @static
   * @param {Object} d - The JSON object from Brewfather API
   * @returns {BrewfatherBatch} A new BrewfatherBatch instance
   */
  static fromJson(d) {
    return new BrewfatherBatch({
      brewfatherId: d.brewfatherId,
      name: d.name,
      brewDate: d.brewDate,
      style: d.style,
      brewer: d.brewer,
      abv: d.abv,
      ebc: d.ebc,
      ibu: d.ibu,
      og: d.og,
      fg: d.fg,
      fermentationSteps: d.fermentationSteps
    })
  }

  get brewfatherId() {
    return this._brewfatherId
  }
  get name() {
    return this._name
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
  get og() {
    return this._og
  }
  get fg() {
    return this._fg
  }
  get fermentationSteps() {
    return this._fermentationSteps
  }

  set brewfatherId(brewfatherId) {
    this._brewfatherId = brewfatherId
  }
  set name(name) {
    this._name = name
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
  set og(og) {
    this._og = og
  }
  set fg(fg) {
    this._fg = fg
  }
  set fermentationSteps(fermentationSteps) {
    this._fermentationSteps = fermentationSteps
  }
}
