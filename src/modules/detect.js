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

  if (Object.prototype.hasOwnProperty.call(status, 'gravity'))  {
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
