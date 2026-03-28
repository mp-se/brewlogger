import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { logDebug, logInfo, logError } from '../logger'

describe('logger.js - Logging Functions', () => {
  let consoleLogSpy
  let originalEnv

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    originalEnv = import.meta.env.VITE_APP_DEBUG
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    import.meta.env.VITE_APP_DEBUG = originalEnv
  })

  describe('logDebug', () => {
    it('should not log when VITE_APP_DEBUG is undefined', () => {
      delete import.meta.env.VITE_APP_DEBUG
      logDebug('test message')
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })

    it('should log when VITE_APP_DEBUG is defined', () => {
      import.meta.env.VITE_APP_DEBUG = true
      logDebug('test message')
      expect(consoleLogSpy).toHaveBeenCalledWith('Debug', 'test message')
    })

    it('should handle multiple arguments', () => {
      import.meta.env.VITE_APP_DEBUG = true
      logDebug('message', 'arg1', 'arg2')
      expect(consoleLogSpy).toHaveBeenCalledWith('Debug', 'message', 'arg1', 'arg2')
    })

    it('should handle various data types', () => {
      import.meta.env.VITE_APP_DEBUG = true
      const obj = { key: 'value' }
      const arr = [1, 2, 3]
      logDebug('message', obj, arr, 42, true)
      expect(consoleLogSpy).toHaveBeenCalledWith('Debug', 'message', obj, arr, 42, true)
    })
  })

  describe('logInfo', () => {
    it('should always log info messages', () => {
      logInfo('info message')
      expect(consoleLogSpy).toHaveBeenCalledWith('Info', 'info message')
    })

    it('should handle multiple arguments', () => {
      logInfo('message', 'arg1', 'arg2')
      expect(consoleLogSpy).toHaveBeenCalledWith('Info', 'message', 'arg1', 'arg2')
    })

    it('should handle various data types', () => {
      const obj = { status: 'active' }
      logInfo('message', obj, 100)
      expect(consoleLogSpy).toHaveBeenCalledWith('Info', 'message', obj, 100)
    })
  })

  describe('logError', () => {
    it('should always log error messages', () => {
      logError('error message')
      expect(consoleLogSpy).toHaveBeenCalledWith('Error', 'error message')
    })

    it('should handle multiple arguments', () => {
      logError('error', 'details1', 'details2')
      expect(consoleLogSpy).toHaveBeenCalledWith('Error', 'error', 'details1', 'details2')
    })

    it('should handle error objects', () => {
      const error = new Error('test error')
      logError('Error occurred:', error)
      expect(consoleLogSpy).toHaveBeenCalledWith('Error', 'Error occurred:', error)
    })
  })
})
