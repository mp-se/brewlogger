import { ref } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { global } from '@/modules/pinia'
import HomeView from '@/views/HomeView.vue'
import DeviceView from '@/views/DeviceView.vue'
import DeviceFlashView from '@/views/DeviceFlashView.vue'
import DeviceLogView from '@/views/DeviceLogView.vue'
import DeviceListView from '@/views/DeviceListView.vue'
import DeviceBatchView from '@/views/DeviceBatchView.vue'
import BatchView from '@/views/BatchView.vue'
import BatchListView from '@/views/BatchListView.vue'
import TapListView from '@/views/TapListView.vue'
import TapPourListView from '@/views/TapPourListView.vue'
import BatchGravityListView from '@/views/BatchGravityListView.vue'
import BatchGravityTestView from '@/views/BatchGravityTestView.vue'
import BatchGravityGraphView from '@/views/BatchGravityGraphView.vue'
import BatchFermentationControlView from '@/views/BatchFermentationControlView.vue'
import BatchPressureView from '@/views/BatchPressureView.vue'
import AboutView from '@/views/AboutView.vue'
import SettingsView from '@/views/SettingsView.vue'
import BackupView from '@/views/BackupView.vue'
import SupportView from '@/views/SupportView.vue'
import LogListView from '@/views/LogListView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import { logDebug } from '@/modules/logger'

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
    path: '/device/:id/batch',
    name: 'device-batch',
    component: DeviceBatchView
  },
  {
    path: '/batch',
    name: 'batch-list',
    component: BatchListView
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
    path: '/other/log',
    name: 'log',
    component: LogListView
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

router.afterEach((to, from) => {
  logDebug('router.afterEach()', to, from)

  global.clearMessages()
  global.batchChanged = false
  global.deviceChanged = false
  return true
})

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
        path: '/other/log'
      },
      /*{
        label: 'Support',
        path: '/other/support',
      },*/
      {
        label: 'About',
        path: '/other/about'
      }
    ]
  }
])

export { items }
