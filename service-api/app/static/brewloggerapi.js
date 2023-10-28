class BrewLoggerAPI {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.debug = false;
  }

  setDebug(d) {
    this.debug = d;
  }

  #debug(msg) {
    if(this.debug)
      console.log(msg);
  }

  async #request(path, method, json, callback) {
    var response;

    switch(method) {
      case "GET":
        this.#debug( "GET fetch " + this.baseUrl + path );
        response = await fetch( this.baseUrl + path, { method: method, headers: { "Authorization": "Bearer " + this.apiKey } } );
        var json = await response.json();

        if (response.status == 200) {
          this.#debug( "GET fetch returned 200" );
          this.#debug( "GET fetch response, running callback" );
          await callback(json, response.status);
        } else {
          console.log("GET request failed with response", response.status, json);
          await callback({}, response.status);
        }
        break;

      case "DELETE":
        this.#debug( "DELETE fetch " + this.baseUrl + path );
        response = await fetch( this.baseUrl + path, { method: method, headers: { "Authorization": "Bearer " + this.apiKey } } );

        if (response.status == 204) {
          this.#debug( "DELETE fetch returned 204" );
          this.#debug( "DELETE fetch response, running callback" );
          await callback({}, response.status);
        } else {
          var json = await response.json();
          console.log("DELETE request failed with response", response.status, json);
          await callback({}, response.status);
        }

        break;

      case "POST":
        this.#debug( "POST fetch " + this.baseUrl + path );
        this.#debug( "POST fetch body " + JSON.stringify(json));
        response = await fetch( this.baseUrl + path, { method: method, body: JSON.stringify(json), headers: { "Content-Type": "application/json", "Authorization": "Bearer " + this.apiKey } } );
        var json = await response.json();

        if (response.status == 201 || response.status == 200) {
          this.#debug( "POST fetch returned 201/200" );
          this.#debug( "POST fetch response, running callback" );
          await callback(json, response.status);
        } else {
          console.log("POST request failed with response", response.status, json);
          await callback({}, response.status);
        }
      break;

      case "PATCH":
        this.#debug( "PATCH fetch " + this.baseUrl + path );
        response = await fetch( this.baseUrl + path, { method: method, body: JSON.stringify(json), headers: { "Content-Type": "application/json", "Authorization": "Bearer " + this.apiKey } } );
        var json = await response.json();

        if (response.status == 200) {
          this.#debug( "PATCH fetch returned 200" );
          this.#debug( "POST fetch response, running callback" );
          await callback(json, response.status);
        } else {
          console.log("PATCH request failed with response", response.status, json);
          await callback({}, response.status);
        }
      break;

      default:
        console.log("Unknown request method ", method);
      break;
    }
  }

  async getDeviceList(callback) {
    await this.#request( "/api/device/", "GET", {}, callback);
  }

  async getDevice(id, callback) {
    await this.#request( "/api/device/" + id.toString(), "GET", {}, callback);
  }

  async addDevice(json, callback) {
    await this.#request( "/api/device/", "POST", json, callback);
  }

  async updateDevice(id, json, callback) {
    await this.#request( "/api/device/" + id.toString(), "PATCH", json, callback);
  }

  async deleteDevice(id, callback) {
    await this.#request( "/api/device/" + id.toString(), "DELETE", {}, callback);
  }

  async getBatchList(callback) {
    await this.#request( "/api/batch/", "GET", {}, callback);
  }

  async getBatchListByActive(callback) {
    await this.#request( "/api/batch/?active=true", "GET", {}, callback);
  }

  async getBatchListByChipId(chip, callback) {
    await this.#request( "/api/batch/?chipId=" + chip, "GET", {}, callback);
  }

  async getBatchListByChipIdActive(chip, active, callback) {
    await this.#request( "/api/batch/?active=" + active + "&chipId=" + chip, "GET", {}, callback);
  }

  async getBatch(id, callback) {
    await this.#request( "/api/batch/" + id.toString(), "GET", {}, callback);
  }

  async addBatch(json, callback) {
    await this.#request( "/api/batch/", "POST", json, callback);
  }

  async updateBatch(id, json, callback) {
    await this.#request( "/api/batch/" + id.toString(), "PATCH", json, callback);
  }

  async deleteBatch(id, callback) {
    await this.#request( "/api/batch/" + id.toString(), "DELETE", {}, callback);
  }

  async getPourList(callback) {
    await this.#request( "/api/pour/", "GET", {}, callback);
  }

  async getPour(id, callback) {
    await this.#request( "/api/pour/" + id.toString(), "GET", {}, callback);
  }

  async addPour(json, callback) {
    await this.#request( "/api/pour/", "POST", json, callback);
  }

  async updatePour(id, json, callback) {
    await this.#request( "/api/pour/" + id.toString(), "PATCH", json, callback);
  }

  async deletePour(id, callback) {
    await this.#request( "/api/pour/" + id.toString(), "DELETE", {}, callback);
  }

  async getGravityList(callback) {
    await this.#request( "/api/gravity/", "GET", {}, callback);
  }

  async getGravity(id, callback) {
    await this.#request( "/api/gravity/" + id.toString(), "GET", {}, callback);
  }

  async addGravity(json, callback) {
    await this.#request( "/api/gravity/", "POST", json, callback);
  }

  async updateGravity(id, json, callback) {
    await this.#request( "/api/gravity/" + id.toString(), "PATCH", json, callback);
  }

  async deleteGravity(id, callback) {
    await this.#request( "/api/gravity/" + id.toString(), "DELETE", {}, callback);
  }

  async getHealth(callback) {
    await this.#request( "/health", "GET", {}, callback);
  }

  async deleteDatabase(callback) {
    await this.#request( "/html/test/cleardb", "DELETE", {}, callback);
  }

  async sendIspindel(json, callback) {
    await this.#request( "/api/gravity/ispindel", "POST", json, callback);
  }

  async proxyFetch(url, callback) {
    await this.#request( "/api/device/proxy_fetch", "POST", { "url": url, "method": "get", "body": "" }, callback);
  }

  // New in 0.2.0
  async getSetting(callback) {
    await this.#request( "/api/setting/", "GET", {}, callback);
  }

  async updateSetting(json, callback) {
    await this.#request( "/api/setting/", "PATCH", json, callback);
  }
}
