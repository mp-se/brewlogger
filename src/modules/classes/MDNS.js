/**
 * MDNS data model - represents a discovered mDNS service on the network
 *
 * mDNS (multicast DNS) discovery results for finding devices on local network:
 * - Service name (short name)
 * - Full hostname with .local domain
 * - Service type (e.g., _http._tcp.local)
 *
 * @class
 */
export class MDNS {
  /**
   * Creates a new MDNS service instance
   * @param {Object} params - The MDNS service properties
   * @param {string} [params.host=''] - Full hostname with .local extension
   * @param {string} [params.name=''] - Service name (short hostname)
   * @param {string} [params.type=''] - Service type (e.g., _http._tcp.local.)
   */
  constructor({
    host = '',
    name = '',
    type = ''
  } = {}) {
    this._host = host === undefined ? '' : host
    this._name = name === undefined ? '' : name
    this._type = type === undefined ? '' : type
  }

  /**
   * Factory method to create an MDNS discovery result from JSON/API response
   * @static
   * @param {Object} m - The JSON object from API
   * @returns {MDNS} A new MDNS instance
   */
  static fromJson(m) {
    return new MDNS({
      host: m.host,
      name: m.name,
      type: m.type
    })
  }

  /**
   * Serialize MDNS service to JSON for API requests
   * @returns {Object} JSON representation of the mDNS service
   */
  toJson() {
    return {
      host: this.host,
      name: this.name,
      type: this.type
    }
  }

  get host() {
    return this._host
  }
  get name() {
    return this._name
  }
  get type() {
    return this._type
  }

  set host(host) {
    this._host = host
  }
  set name(name) {
    this._name = name
  }
  set type(type) {
    this._type = type
  }
}
