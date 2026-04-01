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
   * @param {Object} params - The device properties
   */
  constructor({
    id = 0,
    chipId = '',
    chipFamily = '',
    software = '',
    mdns = '',
    config = '',
    bleColor = '',
    url = '',
    description = '',
    collectLogs = false
  } = {}) {
    this._id = id
    this._chipId = chipId
    this._chipFamily = chipFamily
    this._software = software
    this._mdns = mdns
    this._config = config
    this._bleColor = bleColor
    this._description = description
    this._url = (url === 'http://' || url === 'https://') ? '' : url
    this._collectLogs = collectLogs
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
    return new Device({
      id: d.id,
      chipId: d.chipId,
      chipFamily: d.chipFamily,
      software: d.software,
      mdns: d.mdns,
      config: d.config,
      bleColor: d.bleColor,
      url: d.url,
      description: d.description,
      collectLogs: d.collectLogs
    })
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
