// BrewLogger
// Copyright (c) 2021-2026 Magnus
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Alternatively, this software may be used under the terms of a
// commercial license. See LICENSE_COMMERCIAL for details.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//
import { defineStore } from 'pinia'
import { global } from '@/modules/pinia'
import { logDebug, logError } from '@/modules/logger'
import { Device, FermentationStep, MDNS } from '@/modules/classes'

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

      // Handle invalid device IDs
      if (id === undefined || id === null || id === 0) {
        logDebug('deviceStore.getDevice()', 'Invalid device ID, returning null')
        return null
      }

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

      // Handle invalid device IDs
      if (id === undefined || id === null || id === 0) {
        logDebug('deviceStore.getDeviceFermentationSteps()', 'Invalid device ID, returning null')
        return null
      }

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
        if (res.status != 200) throw res
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
