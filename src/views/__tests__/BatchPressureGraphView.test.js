import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import BatchPressureGraphView from '../BatchPressureGraphView.vue';
import { nextTick } from 'vue';

const mockStores = vi.hoisted(() => ({
  batch: {
    getBatch: vi.fn(),
  },
  pressure: {
    getPressureListForBatch: vi.fn(),
  },
  config: {
    isPressurePSI: true,
    isPressureBAR: false,
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
    pressure: { max: 15, min: 0 },
    temperature: { max: 25, min: 18 },
    date: {
      firstDate: '2023-01-01',
      lastDate: '2023-01-03',
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
  pressureStore: mockStores.pressure,
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
  pressureToBAR: vi.fn((p) => p / 14.5038),
  pressureToKPA: vi.fn((p) => p * 6.89476),
  tempToF: vi.fn((c) => (c * 9) / 5 + 32),
  getPressureDataAnalytics: vi.fn(() => mockStores.analytics)
}));

// Add a flag to catch initialization
let chartCreated = false;

const mockChartInstance = {
  options: {
    scales: {
      x: { min: null, max: null },
      yPressure: { min: null, max: null },
      yTemp: { min: null, max: null },
      yVolt: { min: null, max: null }
    },
    plugins: { zoom: {} }
  },
  config: {
    options: {
      scales: {
        x: { min: null, max: null }
      }
    }
  },
  update: vi.fn(),
  destroy: vi.fn(),
  data: { datasets: [] },
  getContext: vi.fn(() => ({})),
  getInitialScaleBounds: vi.fn(() => ({})),
  getZoomedScaleBounds: vi.fn(() => ({})),
  isZoomedOrPanned: vi.fn(() => false)
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

describe('BatchPressureGraphView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    mockStores.batch.getBatch.mockResolvedValue({ id: '1', name: 'Batch 1' });
    mockStores.pressure.getPressureListForBatch.mockResolvedValue([
      { id: 1, pressure: 10, created: '2023-01-01T10:00:00Z', active: true, temperature: 20, battery: 4.2 },
      { id: 2, pressure: 12, created: '2023-01-02T10:00:00Z', active: true, temperature: 21, battery: 4.1 }
    ]);

    const mockCanvas = document.createElement('canvas');
    mockCanvas.id = 'pressureChart';
    mockCanvas.getContext = vi.fn(() => ({}));
    document.body.appendChild(mockCanvas);
  });

  afterEach(() => {
    const canvas = document.getElementById('pressureChart');
    if (canvas) document.body.removeChild(canvas);
  });

  const mountWrapper = async (options = {}) => {
    chartCreated = false;
    const wrapper = mount(BatchPressureGraphView, {
      global: {
        stubs: {
          'router-link': { template: '<a><slot></slot></a>' },
          'PressureStatsFragment': true,
          'BsInputNumber': true,
          'BsInputBase': true
        }
      }
    });

    // Wait for the onMounted async calls and the internal 100ms setTimeout
    await nextTick();
    await nextTick();
    
    // We need to wait enough for the internal setTimeout(..., 100)
    await new Promise(resolve => setTimeout(resolve, 300));
    await nextTick();
    
    return wrapper;
  };

  it('initializes and loads data on mount', async () => {
    const wrapper = await mountWrapper();
    expect(mockStores.batch.getBatch).toHaveBeenCalledWith('1');
    expect(mockStores.pressure.getPressureListForBatch).toHaveBeenCalledWith('1');
    expect(wrapper.vm.batchName).toBe('Batch 1');
    expect(mockChartInstance.update).toHaveBeenCalled();
  });

  it('handles loading no data', async () => {
    mockStores.pressure.getPressureListForBatch.mockResolvedValue(null);
    const wrapper = await mountWrapper();
    expect(wrapper.vm.pressureList).toBeNull();
  });

  it('exercises filter methods', async () => {
    const wrapper = await mountWrapper();
    
    wrapper.vm.filterTemp();
    expect(wrapper.vm.graphOptions.pressure).toBe(false);
    expect(wrapper.vm.graphOptions.temperature).toBe(true);

    wrapper.vm.filterPressure();
    expect(wrapper.vm.graphOptions.pressure).toBe(true);
    expect(wrapper.vm.graphOptions.temperature).toBe(true);
  });

  it('exercises time filters', async () => {
    const wrapper = await mountWrapper();
    
    wrapper.vm.filter24h();
    expect(wrapper.vm.infoFirstDay).toBeDefined();

    wrapper.vm.filter48h();
    expect(wrapper.vm.infoFirstDay).toBeDefined();

    wrapper.vm.filterAll();
    expect(wrapper.vm.infoFirstDay).toBe('2023-01-01');

    wrapper.vm.filter7d();
    expect(wrapper.vm.infoFirstDay).toBeDefined();
  });

  it('handles chart update through watchers', async () => {
    const wrapper = await mountWrapper();
    
    wrapper.vm.infoFirstDay = '2023-01-02';
    await nextTick();
    expect(mockChartInstance.update).toHaveBeenCalled();

    wrapper.vm.infoLastDay = '2023-01-04';
    await nextTick();
    expect(mockChartInstance.update).toHaveBeenCalled();
  });

  it('handles different pressure units', async () => {
    mockStores.config.isPressurePSI = false;
    mockStores.config.isPressureBAR = true;
    const wrapper = await mountWrapper();
    
    wrapper.vm.apply();
    // Verify that mapPressureData was called and datasets updated
    expect(mockChartInstance.data.datasets.length).toBeGreaterThan(0);
  });

  it('handles temperature unit Fahrenheit', async () => {
    mockStores.config.isTempC = false;
    const wrapper = await mountWrapper();
    
    wrapper.vm.apply();
    expect(mockChartInstance.data.datasets.length).toBeGreaterThan(0);
  });

  it('handles battery data mapping', async () => {
    const wrapper = await mountWrapper();
    wrapper.vm.graphOptions.battery = true;
    wrapper.vm.apply();
    
    const batteryDataset = mockChartInstance.data.datasets.find(d => d.label === 'Battery');
    expect(batteryDataset).toBeDefined();
  });
});
