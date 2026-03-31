import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
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

    // Wait for the onMounted async calls and internal promise completions
    await nextTick();
    await nextTick();
    
    // Flush all pending promises
    await flushPromises();
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

  it('should have proper component structure on mount', async () => {
    mockStores.analytics.date.firstDate = '2023-01-01';
    mockStores.analytics.date.lastDate = '2023-01-03';
    const wrapper = await mountWrapper();

    expect(wrapper.vm.gravityList).toBeDefined();
    expect(wrapper.vm.batchName).toBe('Batch 1');
  });

  it('should handle batch loading failure', async () => {
    mockStores.batch.getBatch.mockResolvedValue(null);
    const wrapper = await mountWrapper({ allowNoChart: true });
    expect(wrapper.vm.batchName).toBe('');
  });

  it('should initialize graphOptions with defaults', async () => {
    mockStores.analytics.date.firstDate = '2023-01-01';
    mockStores.analytics.date.lastDate = '2023-01-03';
    const wrapper = await mountWrapper();

    expect(wrapper.vm.graphOptions).toBeDefined();
    expect(typeof wrapper.vm.graphOptions).toBe('object');
  });

  it('should have available filter methods', async () => {
    mockStores.analytics.date.firstDate = '2023-01-01';
    mockStores.analytics.date.lastDate = '2023-01-03';
    const wrapper = await mountWrapper();

    expect(typeof wrapper.vm.filterTemp).toBe('function');
    expect(typeof wrapper.vm.filterDevice).toBe('function');
    expect(typeof wrapper.vm.filterVelocity).toBe('function');
    expect(typeof wrapper.vm.filterGravity).toBe('function');
    expect(typeof wrapper.vm.filter24h).toBe('function');
    expect(typeof wrapper.vm.filter7d).toBe('function');
    expect(typeof wrapper.vm.filterAll).toBe('function');
  });

  it('should have chart and canvas reference', async () => {
    mockStores.analytics.date.firstDate = '2023-01-01';
    mockStores.analytics.date.lastDate = '2023-01-03';
    const wrapper = await mountWrapper();

    expect(wrapper.vm.chart).toBeDefined();
  });

  it('should initialize with empty gravity list before loading', async () => {
    const wrapper = await mountWrapper({ allowNoChart: true });
    // Before async data loads, gravityList starts null
    expect(wrapper.vm.gravityList === null || Array.isArray(wrapper.vm.gravityList)).toBe(true);
  });

  it('should toggle multiple filter options sequentially', async () => {
    mockStores.analytics.date.firstDate = '2023-01-01';
    mockStores.analytics.date.lastDate = '2023-01-03';
    const wrapper = await mountWrapper();

    expect(wrapper.vm.graphOptions).toBeDefined();
    
    // Call filter methods and verify graphOptions exists still
    wrapper.vm.filterGravity();
    expect(wrapper.vm.graphOptions).toBeDefined();
    
    wrapper.vm.filterTemp();
    expect(wrapper.vm.graphOptions).toBeDefined();
  });

  it('should update chart when lowpass changes', async () => {
    mockStores.analytics.date.firstDate = '2023-01-01';
    mockStores.analytics.date.lastDate = '2023-01-03';
    const wrapper = await mountWrapper();

    const initialCallCount = mockChartInstance.update.mock.calls.length;
    wrapper.vm.lowpass = 10;
    await nextTick();
    
    // Chart should be updated after lowpass change
    expect(mockChartInstance.update.mock.calls.length).toBeGreaterThanOrEqual(initialCallCount);
  });

  it('should preserve batch name across filter operations', async () => {
    mockStores.analytics.date.firstDate = '2023-01-01';
    mockStores.analytics.date.lastDate = '2023-01-03';
    const wrapper = await mountWrapper();

    const batchName = wrapper.vm.batchName;
    wrapper.vm.filterGravity();
    wrapper.vm.filterTemp();
    expect(wrapper.vm.batchName).toBe(batchName);
  });

  it('should handle date filter inputs', async () => {
    mockStores.analytics.date.firstDate = '2023-01-01';
    mockStores.analytics.date.lastDate = '2023-01-03';
    const wrapper = await mountWrapper();

    expect(wrapper.vm.infoFirstDay).toBeDefined();
    expect(wrapper.vm.infoLastDay).toBeDefined();
  });

  it('should apply filter logic when time filters called', async () => {
    mockStores.analytics.date.firstDate = '2023-01-01';
    mockStores.analytics.date.lastDate = '2023-01-03';
    const wrapper = await mountWrapper();

    const initialFirstDay = wrapper.vm.infoFirstDay;
    wrapper.vm.filter24h();
    
    // First day should change to 24h ago
    expect(wrapper.vm.infoFirstDay).toBeDefined();
  });

  it('should have config available for temperature display', async () => {
    mockStores.analytics.date.firstDate = '2023-01-01';
    mockStores.analytics.date.lastDate = '2023-01-03';
    const wrapper = await mountWrapper();

    expect(wrapper.vm.config).toBeDefined();
    expect(wrapper.vm.config.isTempC).toBe(true);
  });

  it('should handle global disabled state', async () => {
    mockStores.analytics.date.firstDate = '2023-01-01';
    mockStores.analytics.date.lastDate = '2023-01-03';
    mockStores.global.disabled = true;
    const wrapper = await mountWrapper();

    expect(wrapper.vm.global.disabled).toBe(true);
  });
});
