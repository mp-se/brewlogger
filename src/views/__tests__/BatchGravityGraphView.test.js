import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import BatchGravityGraphView from '../BatchGravityGraphView.vue';
import { nextTick } from 'vue';

const mockStores = vi.hoisted(() => ({
  batch: {
    getBatch: vi.fn(),
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
  logDebug: vi.fn((...args) => console.log('DEBUG:', ...args)),
  logError: vi.fn((...args) => console.log('ERROR:', ...args))
}));

vi.mock('@/modules/utils', () => ({
  gravityToPlato: vi.fn((g) => (g - 1) * 250),
  tempToF: vi.fn((c) => (c * 9) / 5 + 32),
  getGravityDataAnalytics: vi.fn(() => mockStores.analytics),
  abv: vi.fn(() => 5.0)
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

describe('BatchGravityGraphView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    mockStores.batch.getBatch.mockResolvedValue({ id: '1', name: 'Batch 1' });
    mockStores.gravity.getGravityListForBatch.mockResolvedValue([
      { id: 1, gravity: 1.050, created: '2023-01-01T10:00:00Z', active: true, temperature: 20 },
      { id: 2, gravity: 1.045, created: '2023-01-02T10:00:00Z', active: true, temperature: 20 }
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

  const mountWrapper = async (options = {}) => {
    chartCreated = false;
    const wrapper = mount(BatchGravityGraphView, {
      global: {
        stubs: {
          'router-link': { template: '<a><slot></slot></a>' },
          'GravityStatsFragment': true,
          'BsInputNumber': true,
          'BsInputBase': true
        }
      }
    });

    // Wait for the onMounted async calls and the internal 100ms setTimeout
    await nextTick();
    await nextTick();
    
    // We need to wait enough for the internal setTimeout(..., 100)
    // but also for the component's internal state to stabilize.
    await new Promise(resolve => setTimeout(resolve, 300));
    await nextTick();
    
    if (!chartCreated && !options.allowNoChart) {
        console.warn('Chart was not created in time');
    }
    
    return wrapper;
  };

  it('initializes and loads data on mount', async () => {
    mockStores.analytics.date.firstDate = '2023-01-01';
    mockStores.analytics.date.lastDate = '2023-01-03';
    
    const wrapper = await mountWrapper();
    expect(mockStores.batch.getBatch).toHaveBeenCalledWith('1');
    expect(mockStores.gravity.getGravityListForBatch).toHaveBeenCalledWith('1');
    expect(wrapper.vm.batchName).toBe('Batch 1');
    // It should have been updated after creation and after the internal filterAll()
    expect(mockChartInstance.update).toHaveBeenCalled();
  });

  it('handles loading no data', async () => {
    mockStores.gravity.getGravityListForBatch.mockResolvedValue(null);
    const wrapper = await mountWrapper({ allowNoChart: true });
    expect(wrapper.vm.gravityList).toBeNull();
  });

  it('exercises filters', async () => {
    mockStores.analytics.date.firstDate = '2023-01-01';
    mockStores.analytics.date.lastDate = '2023-01-03';
    const wrapper = await mountWrapper();
    
    wrapper.vm.filterTemp();
    expect(wrapper.vm.graphOptions.gravity).toBe(false);
    expect(wrapper.vm.graphOptions.temperature).toBe(true);

    wrapper.vm.filterDevice();
    expect(wrapper.vm.graphOptions.battery).toBe(true);

    wrapper.vm.filterVelocity();
    expect(wrapper.vm.graphOptions.velocity).toBe(true);

    wrapper.vm.filterGravity();
    expect(wrapper.vm.graphOptions.gravity).toBe(true);
  });

  it('exercises time filters', async () => {
    mockStores.analytics.date.firstDate = '2023-01-01';
    mockStores.analytics.date.lastDate = '2023-01-03';
    const wrapper = await mountWrapper();

    wrapper.vm.filter24h();
    expect(wrapper.vm.infoFirstDay).toBeDefined();

    wrapper.vm.filter7d();
    expect(wrapper.vm.infoFirstDay).toBeDefined();

    wrapper.vm.filterAll();
    expect(wrapper.vm.infoFirstDay).toBe('2023-01-01');
  });

  it('exercises gravity corrections and smoothing', async () => {
    mockStores.analytics.date.firstDate = '2023-01-01';
    mockStores.analytics.date.lastDate = '2023-01-03';
    const wrapper = await mountWrapper();

    wrapper.vm.lowpass = 5;
    await nextTick();
    // This triggers apply() and chart.update()
    expect(mockChartInstance.update).toHaveBeenCalled();
  });
});
