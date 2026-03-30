import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import BatchGravityListView from '../BatchGravityListView.vue';
import { nextTick } from 'vue';

const mockStores = vi.hoisted(() => ({
  batch: {
    getBatch: vi.fn(),
  },
  gravity: {
    getGravityListForBatch: vi.fn(),
    updateGravity: vi.fn().mockResolvedValue(true)
  },
  config: {
    isGravitySG: true,
    gravityFormat: 'SG',
    showAllRecords: false,
    $subscribe: vi.fn(),
    $patch: vi.fn(),
    isTempC: true
  },
  global: {
    isNetworkConnected: true,
    disabled: false,
    messageError: '',
    $subscribe: vi.fn(),
    $patch: vi.fn()
  },
  analytics: {
    date: { firstDate: '2023-01-01 10:00:00', lastDate: '2023-01-03 10:00:00' },
    gravity: { min: 1.010, max: 1.050 }
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
  config: mockStores.config,
  gravityStore: mockStores.gravity,
  batchStore: mockStores.batch,
  global: mockStores.global,
  default: {}
}));

vi.mock('@/modules/router', () => ({
  default: mockStores.router
}));

vi.mock('@/modules/logger', () => ({
  logDebug: vi.fn(),
  logError: vi.fn()
}));

vi.mock('@/modules/ui', () => ({
  sortedIconClass: vi.fn(() => 'bi-sort-down'),
  setSortingDefault: vi.fn(),
  sortedClass: vi.fn(() => 'sorted'),
  sortList: vi.fn(),
  applySortList: vi.fn((l) => l)
}));

vi.mock('@/modules/utils', async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    getGravityDataAnalytics: () => mockStores.analytics,
    getFormattedTemperature: (t) => `${t} C`
  };
});

describe('BatchGravityListView', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    mockStores.batch.getBatch.mockResolvedValue({ id: '1', name: 'Batch 1' });
    mockStores.gravity.getGravityListForBatch.mockResolvedValue([
      { id: 1, batchId: 1, gravity: 1.050, created: '2023-01-01 10:00:00', active: true, temperature: 20 },
      { id: 2, batchId: 1, gravity: 1.045, created: '2023-01-02 10:00:00', active: true, temperature: 20 },
      { id: 3, batchId: 1, gravity: 1.040, created: '2023-01-03 10:00:00', active: false, temperature: 20 }
    ]);
  });

  const mountWrapper = () => {
    return mount(BatchGravityListView, {
      global: {
        stubs: {
          'router-link': { template: '<a><slot></slot></a>' },
          'GravityStatsFragment': true,
          'LifeEstimates': true,
          'BsInputDate': true,
          'BsInputNumber': true,
          'BsInputBase': true
        }
      }
    });
  };

  it('loads batch and gravity data on mount', async () => {
    const wrapper = mountWrapper();
    await nextTick();
    await nextTick();
    await nextTick();

    expect(mockStores.batch.getBatch).toHaveBeenCalledWith('1');
    expect(mockStores.gravity.getGravityListForBatch).toHaveBeenCalledWith('1');
    expect(wrapper.vm.batchName).toBe('Batch 1');
    expect(wrapper.vm.gravityList).toHaveLength(3);
  });

  it('filters gravity records correctly when apply() is called', async () => {
    const wrapper = mountWrapper();
    await nextTick();
    await nextTick();
    await nextTick();

    wrapper.vm.infoFirstDay = '2023-01-02 00:00:00';
    wrapper.vm.infoLastDay = '2023-01-03 23:59:59';
    wrapper.vm.infoOG = 1.048;
    wrapper.vm.infoFG = 1.035;

    await wrapper.vm.apply();

    expect(mockStores.gravity.updateGravity).toHaveBeenCalledTimes(2);
  });

  it('handles apply() failure when updateGravity fails', async () => {
    mockStores.gravity.updateGravity.mockResolvedValueOnce(false);
    const wrapper = mountWrapper();
    await nextTick();
    await nextTick();
    await nextTick();

    wrapper.vm.infoFirstDay = '2023-01-02 00:00:00';
    wrapper.vm.infoLastDay = '2023-01-03 23:59:59';
    wrapper.vm.infoOG = 1.048;
    wrapper.vm.infoFG = 1.035;

    await wrapper.vm.apply();
    // It should continue even if one fails
    expect(mockStores.gravity.updateGravity).toHaveBeenCalled();
  });

  it('activates all records when activateAll() is called', async () => {
    const wrapper = mountWrapper();
    await nextTick();
    await nextTick();
    await nextTick();

    await wrapper.vm.activateAll();

    expect(mockStores.gravity.updateGravity).toHaveBeenCalledTimes(1);
    expect(mockStores.gravity.updateGravity).toHaveBeenCalledWith(expect.objectContaining({ id: 3, active: true }));
  });

  it('handles activateAll() failure when updateGravity fails', async () => {
    mockStores.gravity.updateGravity.mockResolvedValueOnce(false);
    const wrapper = mountWrapper();
    await nextTick();
    await nextTick();
    await nextTick();

    await wrapper.vm.activateAll();
    expect(mockStores.gravity.updateGravity).toHaveBeenCalled();
  });

  it('toggles record activity with updateGravity()', async () => {
    const wrapper = mountWrapper();
    await nextTick();
    await nextTick();
    await nextTick();

    await wrapper.vm.updateGravity(1);

    expect(mockStores.gravity.updateGravity).toHaveBeenCalledWith(expect.objectContaining({ id: 1, active: false }));
  });

  it('handles updateGravity() failure', async () => {
    mockStores.gravity.updateGravity.mockResolvedValue(false);
    const wrapper = mountWrapper();
    await nextTick();
    await nextTick();
    await nextTick();

    await wrapper.vm.updateGravity(1);
    expect(mockStores.global.messageError).toContain('Failed to load gravity 1');
  });

  it('handles onMounted with no gravity records', async () => {
    mockStores.gravity.getGravityListForBatch.mockResolvedValue([]);
    const wrapper = mountWrapper();
    await nextTick();
    await nextTick();
    await nextTick();

    expect(wrapper.vm.gravityList).toBeNull();
  });
});
