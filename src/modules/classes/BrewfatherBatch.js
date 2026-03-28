/**
 * BrewfatherBatch data model - represents batch data from Brewfather integration
 */
export class BrewfatherBatch {
  /**
   * Creates a new BrewfatherBatch instance
   * @param {string} [brewfatherId=''] - Brewfather ID
   * @param {string} [name=''] - Recipe name
   * @param {string} [brewDate=''] - Brew date
   * @param {string} [style=''] - Beer style
   * @param {string} [brewer=''] - Brewer name
   * @param {number} [abv=0] - Alcohol by volume
   * @param {number} [ebc=0] - Color in EBC units
   * @param {number} [ibu=0] - Bitterness in IBU
   * @param {number} [og=0] - Original gravity (SG)
   * @param {number} [fg=0] - Final gravity (SG)
   * @param {string} [fermentationSteps=''] - Fermentation profile
   */
  constructor(brewfatherId, name, brewDate, style, brewer, abv, ebc, ibu, og, fg, fermentationSteps) {
    this.name = name === undefined ? '' : name
    this.brewDate = brewDate === undefined ? '' : brewDate
    this.style = style === undefined ? '' : style
    this.brewer = brewer === undefined ? '' : brewer
    this.abv = abv === undefined ? 0 : abv
    this.ebc = ebc === undefined ? 0 : ebc
    this.ibu = ibu === undefined ? 0 : ibu
    this.og = og === undefined ? 0 : og
    this.fg = fg === undefined ? 0 : fg
    this.brewfatherId = brewfatherId === undefined ? '' : brewfatherId
    this.fermentationSteps = fermentationSteps === undefined ? '' : fermentationSteps
  }

  /**
   * Factory method to create a BrewfatherBatch from JSON/Brewfather API response
   * @static
   * @param {Object} d - The JSON object from Brewfather API
   * @returns {BrewfatherBatch} A new BrewfatherBatch instance
   */
  static fromJson(d) {
    return new BrewfatherBatch(
      d.brewfatherId,
      d.name,
      d.brewDate,
      d.style,
      d.brewer,
      d.abv,
      d.ebc,
      d.ibu,
      d.og,
      d.fg,
      d.fermentationSteps
    )
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
