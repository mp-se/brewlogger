import { defineStore } from 'pinia'
import { global } from '@/modules/pinia'
import { logDebug, logError } from '@/modules/logger'

export class Device {
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

export class FermentationStep {
  constructor(order, name, type, date, temp, days) {
    this.order = order
    this.name = name === undefined ? '' : name
    this.type = type
    this.date = date
    this.temp = temp
    this.days = days
  }

  static fromJson(fs) {
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

  // THis is for the API payload which needs to include deviceId
  static listToJson(fsList, deviceId) {
    var list = []

    fsList.forEach((fs) => {
      // TODO: Figure out why I the object type has been lost..... This works for now.
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

export class MDNS {
  constructor(host, name, type) {
    this.host = host
    this.name = name
    this.type = type
  }

  static fromJson(m) {
    return new MDNS(m.host, m.name, m.type)
  }

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

export const useDeviceStore = defineStore('deviceStore', {
  state: () => {
    return { devices: [] }
  },
  getters: {
    deviceList() {
      return this.devices
    }
  },
  actions: {
    async processEvent(method, id) {
      logDebug('deviceStore.processEvent()', method, id)
      if (method == 'delete') {
        this.devices = this.devices.filter((d) => {
          return d.id !== id
        })
        logDebug('deviceStore.processEvent()', 'Removed device with', id)
        global.updatedDeviceData += 1
      } else if (method == 'update') {
        const result = await this.getDevice(id)
        if (result) {
          this.devices = this.devices.filter((d) => {
            return d.id !== id
          })
          this.devices.push(result.device)
          logDebug('deviceStore.processEvent()', 'Updated device with', id)
          global.updatedDeviceData += 1
        }
      } else if (method == 'create') {
        const result = await this.getDevice(id)
        if (result) {
          this.devices.push(result.device)
          logDebug('deviceStore.processEvent()', 'Added device with', id)
          global.updatedDeviceData += 1
        }
      }
    },
    async getDeviceList() {
      // returns devices[] or null

      logDebug('deviceStore.getDeviceList()')
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/device/', {
          method: 'GET',
          headers: { Authorization: global.token },
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        logDebug('deviceStore.getDeviceList()', res.status)
        if (!res.ok) throw res
        const json = await res.json()
        logDebug('deviceStore.getDeviceList()', json)
        this.devices = []

        json.forEach((d) => {
          var device = Device.fromJson(d)
          this.devices.push(device)
        })

        global.disabled = false
        return this.devices
      } catch (err) {
        global.disabled = false
        logError('deviceStore.getDeviceList()', err)
        return null
      }
    },
    async getDevice(id) {
      // returns {device, stepList} or null

      logDebug('deviceStore.getDevice()', id)
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/device/' + id, {
          method: 'GET',
          headers: { Authorization: global.token },
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        logDebug('deviceStore.getDevice()', res.status)
        if (!res.ok) throw res
        const json = await res.json()
        logDebug('deviceStore.getDevice()', json)
        var device = Device.fromJson(json)
        var stepList = FermentationStep.listFromJson(json.fermentationStep, false) // Dont update the dates
        global.disabled = false
        return { device, stepList }
      } catch (err) {
        global.disabled = false
        logError('deviceStore.getDevice()', err)
        return null
      }
    },
    async updateDevice(d) {
      // returns device or null

      logDebug('deviceStore.updateDevice()', d.id, d.toJson())
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/device/' + d.id, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: global.token },
          body: JSON.stringify(d.toJson()),
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        logDebug('deviceStore.updateDevice()', res.status)
        if (res.status != 200) throw res
        const json = await res.json()
        global.disabled = false
        logDebug('deviceStore.updateDevice()', json)
        var device = Device.fromJson(json)
        return device
      } catch (err) {
        logError('deviceStore.updateDevice()', err)
        global.disabled = false
        return null
      }
    },
    async addDevice(d) {
      // returns device or null

      logDebug('deviceStore.addDevice()', d.toJson())
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/device/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: global.token },
          body: JSON.stringify(d.toJson()),
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        logDebug('deviceStore.addDevice()', res.status)
        if (res.status != 201) throw res
        const json = await res.json()
        global.disabled = false
        logDebug('deviceStore.addDevice()', json)
        var device = Device.fromJson(json)
        return device
      } catch (err) {
        logError('deviceStore.addDevice()', err)
        global.disabled = false
        return null
      }
    },
    async deleteDevice(id) {
      // returns true or false

      logDebug('deviceStore.deleteDevice()', id)
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/device/' + id, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', Authorization: global.token },
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        global.disabled = false
        logDebug('deviceStore.deleteDevice()', res.status)
        if (res.status != 204) {
          return false
        }
        return true
      } catch (err) {
        logError('deviceStore.deleteDevice()', err)
        global.disabled = false
        return false
      }
    },
    async getDeviceFermentationSteps(id) {
      // returns stepList[] or null

      logDebug('deviceStore.getDeviceFermentationSteps()', id)
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/device/' + id, {
          method: 'GET',
          headers: { Authorization: global.token },
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        logDebug('deviceStore.getDeviceFermentationSteps()', res.status)
        if (!res.ok) throw res
        const json = await res.json()
        logDebug('deviceStore.getDeviceFermentationSteps()', json)
        var stepList = FermentationStep.listFromJson(json.fermentationStep, false) // Dont update the dates
        global.disabled = false
        return stepList
      } catch (err) {
        global.disabled = false
        logError('deviceStore.getDeviceFermentationSteps()', err)
        return null
      }
    },
    async addDeviceFermentationSteps(id, fsList) {
      // returns true or false

      logDebug('deviceStore.addDeviceFermentationSteps()', id)
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/device/' + id + '/step/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: global.token },
          body: JSON.stringify(FermentationStep.listToJson(fsList, id)),
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        global.disabled = false
        logDebug('deviceStore.addDeviceFermentationSteps()', res.status)
        if (res.status != 201) {
          return false
        }
        return true
      } catch (err) {
        logError('deviceStore.addDeviceFermentationSteps()', err)
        global.disabled = false
        return false
      }
    },
    async deleteDeviceFermentationSteps(id) {
      // returns true or false

      logDebug('deviceStore.deleteDeviceFermentationSteps()', id)
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/device/' + id + '/step/', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', Authorization: global.token },
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        global.disabled = false
        logDebug('deviceStore.deleteDeviceFermentationSteps()', res.status)
        if (res.status != 204) {
          return false
        }
        return true
      } catch (err) {
        logError('deviceStore.deleteDeviceFermentationSteps()', err)
        global.disabled = false
        return false
      }
    },
    async proxyRequest(method, url, header, body) {
      // returns json_response or null

      body = { url: url, method: method, header: header, body: body }
      logDebug('deviceStore.proxyRequest()', url, body)
      try {
        const res = await fetch(global.baseURL + 'api/device/proxy_fetch/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: global.token },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(global.fetchTimout)
        })
        logDebug('deviceStore.proxyRequest()', res.status)
        if (!res.ok) throw res
        const json = await res.json()
        logDebug('deviceStore.proxyRequest()', json)
        return json
      } catch (err) {
        logError('deviceStore.proxyRequest()', err)
        return null
      }
    },
    async searchNetwork() {
      // returns mdnsList or null

      logDebug('deviceStore.searchNetwork()')
      global.disabled = true
      try {
        const res = await fetch(global.baseURL + 'api/device/mdns/', {
          method: 'GET',
          headers: { Authorization: global.token },
          signal: AbortSignal.timeout(30000)
        })
        logDebug('deviceStore.searchNetwork()', res.status)
        if (!res.ok) throw res
        const json = await res.json()
        logDebug('deviceStore.searchNetwork()', json)
        var mdnsList = []

        json.forEach((m) => {
          var mdns = MDNS.fromJson(m)
          mdnsList.push(mdns)
        })

        global.disabled = false
        return mdnsList
      } catch (err) {
        global.disabled = false
        logError('deviceStore.searchNetwork()', err)
        return null
      }
    }
  }
})
