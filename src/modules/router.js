import { ref, defineAsyncComponent } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { global } from '@/modules/pinia'
import { logDebug } from '@/modules/logger'

// Lazy-loaded view components for better initial load time
const HomeView = defineAsyncComponent(() => import('@/views/HomeView.vue'))
const DeviceView = defineAsyncComponent(() => import('@/views/DeviceView.vue'))
const DeviceFlashView = defineAsyncComponent(() => import('@/views/DeviceFlashView.vue'))
const DeviceLogView = defineAsyncComponent(() => import('@/views/DeviceLogView.vue'))
const DeviceListView = defineAsyncComponent(() => import('@/views/DeviceListView.vue'))
const BatchView = defineAsyncComponent(() => import('@/views/BatchView.vue'))
const BatchListView = defineAsyncComponent(() => import('@/views/BatchListView.vue'))
const TapListView = defineAsyncComponent(() => import('@/views/TapListView.vue'))
const TapPourListView = defineAsyncComponent(() => import('@/views/TapPourListView.vue'))
const BatchGravityListView = defineAsyncComponent(() => import('@/views/BatchGravityListView.vue'))
const BatchGravityTestView = defineAsyncComponent(() => import('@/views/BatchGravityTestView.vue'))
const BatchGravityGraphView = defineAsyncComponent(
  () => import('@/views/BatchGravityGraphView.vue')
)
const BatchGravityGraphCompareView = defineAsyncComponent(
  () => import('@/views/BatchGravityGraphCompareView.vue')
)
const BatchPressureGraphView = defineAsyncComponent(
  () => import('@/views/BatchPressureGraphView.vue')
)
const BatchPressureListView = defineAsyncComponent(
  () => import('@/views/BatchPressureListView.vue')
)
const BatchFermentationControlView = defineAsyncComponent(
  () => import('@/views/BatchFermentationControlView.vue')
)
const BatchPressureView = defineAsyncComponent(() => import('@/views/BatchPressureView.vue'))
const AboutView = defineAsyncComponent(() => import('@/views/AboutView.vue'))
const SettingsView = defineAsyncComponent(() => import('@/views/SettingsView.vue'))
const BackupView = defineAsyncComponent(() => import('@/views/BackupView.vue'))
const SupportView = defineAsyncComponent(() => import('@/views/SupportView.vue'))
const SystemLogView = defineAsyncComponent(() => import('@/views/SystemLogView.vue'))
const ReceiveLogView = defineAsyncComponent(() => import('@/views/ReceiveLogView.vue'))
const NotFoundView = defineAsyncComponent(() => import('@/views/NotFoundView.vue'))

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/device',
    name: 'device-list',
    component: DeviceListView
  },
  {
    path: '/device/log/:id',
    name: 'device-log',
    component: DeviceLogView
  },
  {
    path: '/device/:id',
    name: 'device',
    component: DeviceView
  },
  {
    path: '/device/flash',
    name: 'device-flash',
    component: DeviceFlashView
  },
  {
    path: '/batch',
    name: 'batch-list',
    component: BatchListView
  },
  {
    path: '/batch/compare',
    name: 'batch-compare-view',
    component: BatchGravityGraphCompareView
  },
  {
    path: '/batch/:id',
    name: 'batch',
    component: BatchView
  },
  {
    path: '/batch/:id/gravity/graph',
    name: 'batch-gravity-graph',
    component: BatchGravityGraphView
  },
  {
    path: '/batch/:id/fermentation-control',
    name: 'batch-fermentation-control',
    component: BatchFermentationControlView
  },
  {
    path: '/batch/:id/gravity',
    name: 'batch-gravity-list',
    component: BatchGravityListView
  },
  {
    path: '/batch/:id/pressure/graph',
    name: 'batch-pressure-graph',
    component: BatchPressureGraphView
  },
  {
    path: '/batch/:id/pressure',
    name: 'batch-pressure-list',
    component: BatchPressureListView
  },
  {
    path: '/batch/:id/gravity/test',
    name: 'batch-gravity-test-list',
    component: BatchGravityTestView
  },
  {
    path: '/batch/:id/pressure',
    name: 'batch-pressure',
    component: BatchPressureView
  },
  {
    path: '/taplist',
    name: 'tap-list',
    component: TapListView
  },
  {
    path: '/taplist/:id/pour',
    name: 'tap-pour-list',
    component: TapPourListView
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView
  },
  {
    path: '/other/backup',
    name: 'backup',
    component: BackupView
  },
  {
    path: '/other/support',
    name: 'support',
    component: SupportView
  },
  {
    path: '/other/system',
    name: 'system_log',
    component: SystemLogView
  },
  {
    path: '/other/receive',
    name: 'receive_log',
    component: ReceiveLogView
  },
  {
    path: '/other/about',
    name: 'about',
    component: AboutView
  },
  {
    path: '/:catchAll(.*)',
    name: '404',
    component: NotFoundView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

export default router

/**
 * Handles cleanup on navigation end
 * @param {Object} globalStore - The global store instance
 * @param {Object} to - Destination route
 * @param {Object} from - Source route
 */
export const handleNavigationEnd = (globalStore, to, from) => {
  logDebug('router.handleNavigationEnd()', to, from)

  if (globalStore && typeof globalStore.clearMessages === 'function') {
    globalStore.clearMessages()
  }
  if (globalStore) {
    globalStore.batchChanged = false
    globalStore.deviceChanged = false
  }
  return true
}

router.afterEach((to, from) => {
  return handleNavigationEnd(global, to, from)
})

export { routes }

const items = ref([
  {
    label: 'Home',
    icon: 'IconHome',
    path: '/',
    subs: []
  },
  {
    label: 'Device',
    icon: 'IconCpu',
    path: '/device',
    subs: []
  },
  {
    label: 'Batch',
    icon: 'IconGraphUpArrow',
    path: '/batch',
    subs: []
  },
  {
    label: 'Tap List',
    icon: 'IconListUl',
    path: '/taplist',
    subs: []
  },
  {
    label: 'Settings',
    icon: 'IconTools',
    path: '/settings',
    subs: []
  },
  {
    label: 'Other',
    icon: 'IconTools',
    path: '/other',
    subs: [
      {
        label: 'Backup & Restore',
        path: '/other/backup'
      },
      {
        label: 'System log',
        path: '/other/system'
      },
      {
        label: 'Receive log',
        path: '/other/receive'
      },
      // {
      //   label: 'Support',
      //   path: '/other/support',
      // },
      {
        label: 'About',
        path: '/other/about'
      }
    ]
  }
])

export { items }
