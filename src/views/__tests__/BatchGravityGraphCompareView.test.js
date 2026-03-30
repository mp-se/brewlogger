import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import BatchGravityGraphCompareView from '../BatchGravityGraphCompareView.vue';
import { nextTick } from 'vue';

const mockStores = vi.hoisted(() => ({
  batch: {
    getBatch: vi.fn(),
    batchList: [],
  },
  gravity: {
    getGravityListForBatch: vi.fn(),
  },
  config: {
    isGravitySG: true,
    isTempC: true,
    $subscribe: vi.fn(),
    $patch: vi.fn(),
  },
  global: {
    disabled: false,
    messageError: '',
    $subscribe: vi.fn(),
    $patch: vi.fn()
  },
  analytics: {
    gravity: { max: 1.050, min: 1.010 },
    date: {
      firstDate: null,
      lastDate: null,
      first: '2023-01-01T10:00:00Z',
      last: '2023-01-03T10:00:00Z'
    }
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

vi.mock('@/modules/utils', () => ({
  gravityToPlato: vi.fn((g) => (g - 1) * 250),
  tempToF: vi.fn((c) => (c * 9) / 5 + 32),
  getGravityDataAnalytics: vi.fn(() => mockStores.analytics)
}));

// Add a flag to catch initialization
let chartCreated = false;

const mockChartInstance = {
  options: {
    scales: {
      x: { min: null, max: null },
      y: { min: null, max: null }
    },
    plugins: { zoom: {} }
  },
  config: {
    options: {
      scales: {
        x: { min: null, max: null },
        y: { min: null, max: null }
      }
    }
  },
  update: vi.fn(),
  destroy: vi.fn(),
  data: { datasets: [] },
  getContext: vi.fn(() => ({}))
};

vi.mock('chart.js', () => {
    return {
        Chart: vi.fn().mockImplementation(function() {
            chartCreated = true;
            return mockChartInstance;
        }),
        registerables: []
    }
});

import { Chart } from 'chart.js';
Chart.register = vi.fn();

vi.mock('chartjs-plugin-zoom', () => ({
  default: {}
}));

describe('BatchGravityGraphCompareView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    mockStores.batch.batchList = [
      { id: '1', name: 'Batch 1' },
      { id: '2', name: 'Batch 2' },
      { id: '3', name: 'Batch 3' }
    ];
    mockStores.batch.getBatch.mockResolvedValue({ id: '1', name: 'Batch 1' });
    mockStores.gravity.getGravityListForBatch.mockResolvedValue([
      { id: 1, gravity: 1.050, created: '2023-01-01T10:00:00Z', active: true },
      { id: 2, gravity: 1.045, created: '2023-01-02T10:00:00Z', active: true }
    ]);

    const mockCanvas = document.createElement('canvas');
    mockCanvas.id = 'gravityChart';
    mockCanvas.getContext = vi.fn(() => ({}));
    document.body.appendChild(mockCanvas);
  });

  afterEach(() => {
    const canvas = document.getElementById('gravityChart');
    if (canvas) document.body.removeChild(canvas);
  });

  const mountWrapper = async () => {
    chartCreated = false;
    const wrapper = mount(BatchGravityGraphCompareView, {
      global: {
        stubs: {
          'router-link': { template: '<a><slot></slot></a>' },
          'BsSelect': { 
            template: '<select :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><option v-for="o in options" :value="o.value">{{o.label}}</option></select>',
            props: ['modelValue', 'options']
          }
        }
      }
    });

    await nextTick();
    await nextTick();
    return wrapper;
  };

  it('initializes and loads batch list on mount', async () => {
    const wrapper = await mountWrapper();
    expect(wrapper.vm.batchList.length).toBe(3);
    expect(wrapper.vm.batchList[0].label).toBe('Batch 1');
  });

  it('updates graph when batch selection changes', async () => {
    const wrapper = await mountWrapper();
    
    wrapper.vm.batchId1 = '1';
    await nextTick();
    await nextTick();
    
    expect(mockStores.gravity.getGravityListForBatch).toHaveBeenCalledWith('1');
    expect(mockChartInstance.update).toHaveBeenCalled();
  });

  it('handles multiple batch comparisons', async () => {
    const wrapper = await mountWrapper();
    
    wrapper.vm.batchId1 = '1';
    wrapper.vm.batchId2 = '2';
    await nextTick();
    await nextTick();
    
    expect(mockStores.gravity.getGravityListForBatch).toHaveBeenCalled();
  });

  it('exercises time alignment adjustments', async () => {
    const wrapper = await mountWrapper();
    wrapper.vm.batchId1 = '1';
    await nextTick();
    
    wrapper.vm.timeAdjustment = 'start';
    await nextTick();
    expect(mockChartInstance.update).toHaveBeenCalled();

    wrapper.vm.timeAdjustment = 'end';
    await nextTick();
    expect(mockChartInstance.update).toHaveBeenCalled();
  });

  it('handles empty gravity lists gracefully', async () => {
    mockStores.gravity.getGravityListForBatch.mockResolvedValue([]);
    const wrapper = await mountWrapper();
    
    wrapper.vm.batchId1 = '1';
    await nextTick();
    
    expect(wrapper.vm.gravityData1.length).toBe(0);
  });
});
