import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BatchFermentationControlView from '../BatchFermentationControlView.vue'
import { nextTick } from 'vue'

const mockStores = vi.hoisted(() => ({
  batch: {
    getBatch: vi.fn(),
  },
  device: {
    getDevice: vi.fn(),
    getDeviceFermentationSteps: vi.fn(),
    addDeviceFermentationSteps: vi.fn(),
    deleteDeviceFermentationSteps: vi.fn(),
  },
  global: {
    disabled: false,
    messageError: '',
    messageSuccess: '',
    clearMessages: vi.fn(),
    $subscribe: vi.fn(),
    $patch: vi.fn()
  },
  router: {
    currentRoute: {
      value: {
        params: { id: '1' }
      }
    }
  }
}));

vi.mock('@/modules/pinia', () => ({
  batchStore: mockStores.batch,
  deviceStore: mockStores.device,
  global: mockStores.global,
  default: {}
}));

vi.mock('@/modules/router', () => ({
  default: mockStores.router
}));

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn()
}))

describe('BatchFermentationControlView', () => {

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    mockStores.batch.getBatch.mockResolvedValue({
      id: '1',
      name: 'Batch 1',
      fermentationSteps: JSON.stringify([{ id: 1, name: 'Step 1' }]),
      fermentationChamber: 10
    });
    mockStores.device.getDevice.mockResolvedValue({
      device: { id: 10, software: 'BrewPi', description: 'Main Chamber', mdns: 'brewpi.local', url: 'http://192.168.1.10' }
    });
    mockStores.device.getDeviceFermentationSteps.mockResolvedValue([]);
    mockStores.device.addDeviceFermentationSteps.mockResolvedValue(true);
  });

  const mountWrapper = async () => {
    const wrapper = mount(BatchFermentationControlView, {
      global: {
        stubs: { 
          'router-link': { template: '<a><slot></slot></a>' },
          'FermentationStepFragment': true, 
          'BsInputReadonly': true, 
          'BsMessage': true 
        }
      }
    });
    await nextTick();
    await nextTick();
    await nextTick();
    return wrapper;
  }

  it('loads profile correctly on mount', async () => {
    const wrapper = await mountWrapper();
    expect(mockStores.batch.getBatch).toHaveBeenCalledWith('1');
    expect(wrapper.vm.batchName).toBe('Batch 1');
    expect(wrapper.vm.device.id).toBe(10);
    expect(wrapper.vm.fermentationSteps.length).toBe(1);
  });

  it('handles batch without fermentation profile', async () => {
    mockStores.batch.getBatch.mockResolvedValue({
      id: '1',
      name: 'No Steps Batch',
      fermentationSteps: 'invalid json',
      fermentationChamber: 10
    });
    const wrapper = await mountWrapper();
    expect(mockStores.global.messageError).toContain('No fermentation profile found');
    expect(wrapper.vm.fermentationSteps).toBeNull();
  });

  it('handles batch without fermentation controller selected', async () => {
    mockStores.batch.getBatch.mockResolvedValue({
      id: '1',
      name: 'No Controller Batch',
      fermentationSteps: JSON.stringify([{ id: 1 }]),
      fermentationChamber: 0
    });
    const wrapper = await mountWrapper();
    expect(mockStores.global.messageError).toContain('No fermentation controller is selected');
  });

  it('handles device load failure', async () => {
    mockStores.batch.getBatch.mockResolvedValue({
      id: '1',
      name: 'Fail Device Batch',
      fermentationSteps: JSON.stringify([{ id: 1 }]),
      fermentationChamber: 10
    });
    mockStores.device.getDevice.mockResolvedValue(null);
    const wrapper = await mountWrapper();
    expect(mockStores.global.messageError).toContain('Failed to load the device configuration');
  });

  it('handles active fermentation steps check failure', async () => {
    mockStores.device.getDeviceFermentationSteps.mockResolvedValue(null);
    const wrapper = await mountWrapper();
    expect(mockStores.global.messageError).toContain('Failed to check for active fermentration steps');
  });

  it('shows warning when device has active steps', async () => {
    mockStores.device.getDeviceFermentationSteps.mockResolvedValue([{ id: 99 }]);
    const wrapper = await mountWrapper();
    expect(wrapper.vm.activeFermentationSteps.length).toBe(1);
    expect(wrapper.find('bs-message-stub').exists()).toBe(true);
  });

  it('starts steps when none are active', async () => {
    const wrapper = await mountWrapper();
    await wrapper.find('button.btn-primary').trigger('click');
    expect(mockStores.device.addDeviceFermentationSteps).toHaveBeenCalled();
    expect(mockStores.global.messageSuccess).toContain('Fermentation steps for device has been created');
  });

  it('deletes existing steps before starting new ones', async () => {
    mockStores.device.getDeviceFermentationSteps.mockResolvedValue([{ id: 99 }]);
    const wrapper = await mountWrapper();
    await wrapper.find('button.btn-primary').trigger('click');
    expect(mockStores.device.deleteDeviceFermentationSteps).toHaveBeenCalledWith(10);
    expect(mockStores.device.addDeviceFermentationSteps).toHaveBeenCalled();
  });

  it('handles start steps failure', async () => {
    mockStores.device.addDeviceFermentationSteps.mockResolvedValue(false);
    const wrapper = await mountWrapper();
    await wrapper.find('button.btn-primary').trigger('click');
    expect(mockStores.global.messageError).toContain('Failed to load the device');
  });

  it('handles loadProfile failure (batch not found)', async () => {
    mockStores.batch.getBatch.mockResolvedValue(null);
    const wrapper = await mountWrapper();
    expect(mockStores.global.messageError).toContain('Failed to load the batch');
  });
});
