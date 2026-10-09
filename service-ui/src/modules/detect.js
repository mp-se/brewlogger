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
import { logDebug } from '@/modules/logger'

export function detectId(status) {
  if (Object.prototype.hasOwnProperty.call(status, 'id')) {
    logDebug('DeviceListView.detectId()', 'ID found', status.id)
    return status.id
  }

  return ''
}

export function detectMdns(status) {
  if (Object.prototype.hasOwnProperty.call(status, 'mdns')) {
    logDebug('DeviceListView.detectMdns()', 'mDNS found', status.mdns)
    return status.mdns
  }

  return ''
}

export function detectPlatform(status) {
  if (Object.prototype.hasOwnProperty.call(status, 'platform')) {
    logDebug('DeviceListView.detectPlatform()', 'Platform found', status.platform.split(' ')[0])
    return status.platform.split(' ')[0].toLowerCase()
  }

  return ''
}

export function detectSoftware(status) {
  logDebug('DeviceListView.detectSoftware()')

  if (Object.prototype.hasOwnProperty.call(status, 'scale_raw1')) {
    logDebug('DeviceListView.detectSoftware()', 'Software Kegmon')
    return 'Kegmon'
  }

  if (Object.prototype.hasOwnProperty.call(status, 'pid_mode')) {
    logDebug('DeviceListView.detectSoftware()', 'Software Chamber Controller')
    return 'Chamber-Controller'
  }

  if (Object.prototype.hasOwnProperty.call(status, 'gravity_device')) {
    logDebug('DeviceListView.detectSoftware()', 'Software Gravitymon Gateway')
    return 'Gravitymon-Gateway'
  }

  if (Object.prototype.hasOwnProperty.call(status, 'gravity')) {
    logDebug('DeviceListView.detectSoftware()', 'Software Gravitymon')
    return 'Gravitymon'
  }

  if (Object.prototype.hasOwnProperty.call(status, 'pressure')) {
    logDebug('DeviceListView.detectSoftware()', 'Software Pressuremon')
    return 'Pressuremon'
  }

  logDebug('DeviceListView.detectSoftware()', "Unknown software, can't detect")
  return ''
}
