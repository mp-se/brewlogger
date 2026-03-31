import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import BackupView from '../BackupView.vue'
import { nextTick } from 'vue'

const mockStores = vi.hoisted(() => ({
  batch: {
    getBatch: vi.fn(),
    getBatchList: vi.fn(),
    batchList: []
  },
  device: {
    getDeviceList: vi.fn(),
    deviceList: []
  },
  global: {
    disabled: false,
    messageError: '',
    messageSuccess: '',
    baseURL: 'http://localhost/',
    token: 'test-token',
    $subscribe: vi.fn(),
    $patch: vi.fn(),
    clearMessages: vi.fn()
  }
}));

vi.mock('@/modules/pinia', () => ({
  batchStore: mockStores.batch,
  deviceStore: mockStores.device,
  global: mockStores.global,
  default: {}
}));

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}));

vi.mock('@/modules/utils', () => ({
  download: vi.fn()
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('BackupView - Integration & Coverage Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockStores.global.disabled = false;
    mockStores.global.messageError = '';
    
    // Default fetch mocks
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => []
    });
  });

  const mountWrapper = async () => {
    const wrapper = mount(BackupView, {
      global: {
        stubs: {
          BsProgress: true,
          BsFileUpload: {
            template: '<div class="bs-file-upload"><input type="file" /></div>'
          }
        }
      }
    });
    await nextTick();
    return wrapper;
  };

  it('handles createBackup with data', async () => {
    // 1. Mock batch list response
    global.fetch.mockImplementation((url) => {
      if (url.includes('api/batch/')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 1, name: 'Batch 1' }]
        });
      }
      if (url.includes('api/device/')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 101, chipId: 'ESP1' }]
        });
      }
      return Promise.resolve({ ok: false });
    });

    // 2. Mock batchStore.getBatch
    mockStores.batch.getBatch.mockResolvedValue({
      id: 1,
      name: 'Batch 1',
      gravity: [{ id: 1, gravity: 1.050, created: '2023-01-01T12:00:00Z' }],
      pressure: [],
      pour: []
    });

    const wrapper = await mountWrapper();
    await wrapper.vm.createBackup();

    // Wait for all the callbacks and promises
    await flushPromises();

    const utils = await import('@/modules/utils');
    expect(utils.download).toHaveBeenCalled();
    expect(mockStores.global.disabled).toBe(false);
  });

  it('handles createBackup with fetch error for batches', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500 });

    const wrapper = await mountWrapper();
    await wrapper.vm.createBackup();
    
    await flushPromises();
    expect(mockStores.global.messageError).toBe('Failed to fetch batches');
  });

  it('handles createBackup with fetch error for devices', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('api/batch/')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 1 }]
        });
      }
      return Promise.resolve({ ok: false, status: 500 });
    });

    const wrapper = await mountWrapper();
    await wrapper.vm.createBackup();
    
    await flushPromises();
    expect(mockStores.global.messageError).toBe('Failed to fetch devices');
  });

  it('handles empty batch list in createBackup', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => []
    });

    const wrapper = await mountWrapper();
    await wrapper.vm.createBackup();
    
    await flushPromises();
    const utils = await import('@/modules/utils');
    expect(utils.download).toHaveBeenCalled();
  });

  it('handles batchStore error during sequential fetch', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('api/batch/')) return Promise.resolve({ ok: true, json: async () => [{ id: 1 }] });
      if (url.includes('api/device/')) return Promise.resolve({ ok: true, json: async () => [] });
      return Promise.resolve({ ok: false });
    });

    mockStores.batch.getBatch.mockRejectedValue(new Error('Store error'));

    const wrapper = await mountWrapper();
    await wrapper.vm.createBackup();
    
    await flushPromises();
    const logger = await import('@/modules/logger');
    expect(logger.logError).toHaveBeenCalled();
  });

  it('handles file input change events', async () => {
    const wrapper = await mountWrapper();
    const fileInput = wrapper.find('input[type="file"]');
    
    // Create a mock trigger for change event
    Object.defineProperty(fileInput.element, 'files', {
      value: [new File([''], 'test.json')],
      writable: true
    });
    
    await fileInput.trigger('change');
    expect(wrapper.vm.fileSelected).toBe(true);
  });

  it('handles restore with no file', async () => {
    const wrapper = await mountWrapper();
    // Simulate no file in input
    wrapper.vm.fileUploadRef = { $el: { querySelector: () => ({ files: [] }) } };
    
    await wrapper.vm.restore();
    expect(mockStores.global.messageError).toBe('You need to select a file to restore data from');
  });

  it('handles getBatchList Exception', async () => {
    global.fetch.mockRejectedValue(new Error('Network Error'));
    const wrapper = await mountWrapper();
    
    const callback = vi.fn();
    await wrapper.vm.getBatchList(callback);
    expect(callback).toHaveBeenCalledWith(false, null);
  });

  it('handles getDeviceList Exception', async () => {
    global.fetch.mockRejectedValue(new Error('Network Error'));
    const wrapper = await mountWrapper();
    
    const callback = vi.fn();
    await wrapper.vm.getDeviceList(callback);
    expect(callback).toHaveBeenCalledWith(false, null);
  });

  it('exercises restore process (full flow)', async () => {
    // 1. Mock file reader and JSON data
    const mockBackupData = {
      meta: { software: 'BrewLogger', version: '0.8' },
      devices: [{ id: 101, chipId: 'ESP1' }],
      batches: [{ 
        id: 1, name: 'B1', 
        gravity: [{id: 1, created: '2023-01-01'}],
        pressure: [{id: 1, created: '2023-01-01'}],
        pour: [{id: 1, created: '2023-01-01'}]
      }]
    };

    // 2. Mock all the fetch calls in the sequence
    global.fetch.mockImplementation((url) => {
      // Deleting batches/devices
      if (url.endsWith('api/batch/') || url.endsWith('api/device/')) {
        return Promise.resolve({ ok: true, json: async () => [{id: 1}] });
      }
      // Single delete
      if (url.match(/api\/(batch|device)\/\d+/)) {
        return Promise.resolve({ ok: true, status: 204 });
      }
      // POST restore
      if (url.includes('api/batch/') || url.includes('api/device/') || url.includes('api/gravity/') || url.includes('api/pressure/') || url.includes('api/pour/')) {
        return Promise.resolve({ ok: true, json: async () => ({ id: 999 }) });
      }
      return Promise.resolve({ ok: false });
    });

    // 3. Mock store refreshes
    mockStores.device.getDeviceList.mockResolvedValue(true);
    mockStores.batch.getBatchList.mockResolvedValue(true);

    const wrapper = await mountWrapper();
    
    // Use the exposed method directly for coverage
    await wrapper.vm.processRestore(mockBackupData);

    expect(mockStores.global.messageSuccess).toBe('Restore successful');
    expect(mockStores.global.disabled).toBe(false);
  });

  it('handles restore failures', async () => {
    const wrapper = await mountWrapper();
    
    // Force a failure in processRestore (e.g., throwing from deleteDevices)
    global.fetch.mockResolvedValue({ ok: false, status: 500 });

    await wrapper.vm.processRestore({ devices: [], batches: [] });
    expect(mockStores.global.messageError).toBe('Restore failed');
  });

  it('handles cleanupJson with nested arrays', () => {
    const wrapper = mount(BackupView);
    const data = [{
      id: 1,
      gravity: [{ id: 10, val: null, ok: 1 }]
    }];
    
    wrapper.vm.cleanupJson(data);
    wrapper.vm.cleanupJson(data[0].gravity);
    
    expect(data[0].gravity[0]).not.toHaveProperty('val');
    expect(data[0].gravity[0].ok).toBe(1);
  });
});
