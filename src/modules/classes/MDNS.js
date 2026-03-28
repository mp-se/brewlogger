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
   * @param {string} [name=''] - Service name (short hostname)
   * @param {string} [host=''] - Full hostname with .local extension
   * @param {string} [type=''] - Service type (e.g., _http._tcp.local.)
   */
  constructor(host, name, type) {
    this.host = host
    this.name = name
    this.type = type
  }

  /**
   * Factory method to create an MDNS discovery result from JSON/API response
   * @static
   * @param {Object} m - The JSON object from API
   * @returns {MDNS} A new MDNS instance
   */
  static fromJson(m) {
    return new MDNS(m.host, m.name, m.type)
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
