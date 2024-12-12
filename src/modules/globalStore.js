import { defineStore } from 'pinia'
import { logDebug } from '@/modules/logger'

export const useGlobalStore = defineStore('global', {
  state: () => {
    return {
      initialized: false,
      disabled: false,

      configChanged: false,
      batchChanged: false,
      deviceChanged: false,

      messageError: '',
      messageWarning: '',
      messageSuccess: '',
      messageInfo: '',

      fetchTimout: 30000,

      // Global variables (filters)
      batchListFilterDevice: '*',
      batchListFilterActive: false,
      batchListFilterData: false,

      deviceListFilterSoftware: '*',

      // Global variables (filters - home)
      showChamberTemps: false,
      showKegmonTaps: false,

      // Global variables (notification)
      updatedDeviceData: 0,
      updatedBatchData: 0,
      updatedGravityData: 0,
      updatedPourData: 0
    }
  },
  getters: {
    isError() {
      return this.messageError != '' ? true : false
    },
    isWarning() {
      return this.messageWarning != '' ? true : false
    },
    isSuccess() {
      return this.messageSuccess != '' ? true : false
    },
    isInfo() {
      return this.messageInfo != '' ? true : false
    },
    baseURL() {
      if (import.meta.env.VITE_APP_HOST === undefined) {
        logDebug('globalStore.baseURL()', 'Using base URL from browser', window.location.href)
        return window.location.href
      }

      logDebug('globalStore.baseURL()', 'Using base URL from env', import.meta.env.VITE_APP_HOST)
      return import.meta.env.VITE_APP_HOST
    },
    token() {
      logDebug(
        'globalStore.token()',
        'env:',
        import.meta.env.VITE_APP_TOKEN,
        'js:',
        window.VITE_APP_TOKEN
      )

      // If the token is not defined in the env-config.js then use the environment instead
      if (window.VITE_APP_TOKEN === undefined || window.VITE_APP_TOKEN === '__TOKEN__')
        return 'Bearer ' + import.meta.env.VITE_APP_TOKEN

      return 'Bearer ' + window.VITE_APP_TOKEN
    },
    uiVersion() {
      return import.meta.env.VITE_APP_VERSION
    },
    uiBuild() {
      return import.meta.env.VITE_APP_BUILD
    }
  },
  actions: {
    clearMessages() {
      this.messageError = ''
      this.messageWarning = ''
      this.messageSuccess = ''
      this.messageInfo = ''
    }
  }
})
