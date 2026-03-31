/**
 * Device data model - represents a hardware sensor device (ESP32, ESP8266, etc.)
 *
 * A Device holds configuration and metadata for physical brewing sensors:
 * - Device identification (chip ID, chip family, mDNS name)
 * - Network configuration (URL/IP address, BLE color)
 * - Software version and debug configuration
 * - Firmware configuration string
 *
 * @class
 */
export class Device {
  /**
   * Creates a new Device instance
   * @param {number} [id=0] - Device ID
   * @param {string} [chipId=''] - Device chip ID (unique identifier)
   * @param {string} [chipFamily=''] - Device chip family (ESP32, ESP8266, etc.)
   * @param {string} [software=''] - Software version
   * @param {string} [mdns=''] - mDNS hostname (without .local)
   * @param {string} [config=''] - Firmware configuration string
   * @param {string} [bleColor=''] - BLE color identifier
   * @param {string} [url=''] - Device URL/IP address (auto-cleaned for invalid URLs)
   * @param {string} [description=''] - Device description
   * @param {boolean} [collectLogs=false] - Enable debug logging
   */
  constructor(
    id,
    chipId,
    chipFamily,
    software,
    mdns,
    config,
    bleColor,
    url,
    description,
    collectLogs
  ) {
    this.id = id === undefined ? 0 : id
    this.chipId = chipId === undefined ? '' : chipId
    this.chipFamily = chipFamily === undefined ? '' : chipFamily
    this.software = software === undefined ? '' : software
    this.mdns = mdns === undefined ? '' : mdns
    this.config = config === undefined ? '' : config
    this.bleColor = bleColor === undefined ? '' : bleColor
    this.description = description === undefined ? '' : description
    this.url = url === undefined ? '' : url
    this.collectLogs = collectLogs === undefined ? false : collectLogs

    if (this.url === 'http://' || this.url === 'https://') this.url = ''
  }

  /**
   * Compare two devices for equality (excluding ID)
   * @static
   * @param {Device} d1 - First device to compare
   * @param {Device} d2 - Second device to compare
   * @returns {boolean} True if devices have identical configuration (ID is ignored)
   */
  static compare(d1, d2) {
    return (
      d1.chipId == d2.chipId &&
      d1.chipFamily == d2.chipFamily &&
      d1.software == d2.software &&
      d1.mdns == d2.mdns &&
      d1.config == d2.config &&
      d1.bleColor == d2.bleColor &&
      d1.url == d2.url &&
      d1.description == d2.description &&
      d1.collectLogs == d2.collectLogs
    )
  }

  /**
   * Factory method to create a Device from JSON/API response
   * @static
   * @param {Object} d - The JSON object from API
   * @returns {Device} A new Device instance
   */
  static fromJson(d) {
    return new Device(
      d.id,
      d.chipId,
      d.chipFamily,
      d.software,
      d.mdns,
      d.config,
      d.bleColor,
      d.url,
      d.description,
      d.collectLogs
    )
  }

  /**
   * Serialize Device to JSON for API requests
   * Includes fermentationSteps array even though it's managed separately at API level
   * @returns {Object} JSON representation of the device (excluding ID)
   */
  toJson() {
    return {
      chipId: this.chipId,
      chipFamily: this.chipFamily,
      software: this.software,
      mdns: this.mdns,
      config: this.config,
      bleColor: this.bleColor,
      url: this.url,
      description: this.description,
      collectLogs: this.collectLogs,
      fermentationSteps: []
    }
  }

  get id() {
    return this._id
  }
  get chipId() {
    return this._chipId
  }
  get chipFamily() {
    return this._chipFamily
  }
  get software() {
    return this._software
  }
  get mdns() {
    return this._mdns
  }
  get config() {
    return this._config
  }
  get bleColor() {
    return this._bleColor
  }
  get url() {
    return this._url
  }
  get description() {
    return this._description
  }
  get collectLogs() {
    return this._collectLogs
  }

  set id(id) {
    this._id = id
  }
  set chipId(chipId) {
    this._chipId = chipId
  }
  set chipFamily(chipFamily) {
    this._chipFamily = chipFamily
  }
  set software(software) {
    this._software = software
  }
  set mdns(mdns) {
    this._mdns = mdns
  }
  set config(config) {
    this._config = config
  }
  set bleColor(bleColor) {
    this._bleColor = bleColor
  }
  set url(url) {
    this._url = url
  }
  set description(description) {
    this._description = description
  }
  set collectLogs(collectLogs) {
    this._collectLogs = collectLogs
  }
}
