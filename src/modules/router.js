import { ref } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { validateCurrentForm } from '@/modules/utils'
import { global } from '@/modules/pinia'
import HomeView from '@/views/HomeView.vue'
import DeviceView from '@/views/DeviceView.vue'
import DeviceBrewpiView from '@/views/DeviceBrewpiView.vue'
import DeviceListView from '@/views/DeviceListView.vue'
import DeviceBatchView from '@/views/DeviceBatchView.vue'
import DeviceGravityView from '@/views/DeviceGravityView.vue'
import BatchView from '@/views/BatchView.vue'
import BatchListView from '@/views/BatchListView.vue'
import BatchGravityListView from '@/views/BatchGravityListView.vue'
import BatchGravityGraphView from '@/views/BatchGravityGraphView.vue'
import BatchPressureView from '@/views/BatchPressureView.vue'
import AboutView from '@/views/AboutView.vue'
import SettingsView from '@/views/SettingsView.vue'
import BackupView from '@/views/BackupView.vue'
import SupportView from '@/views/SupportView.vue'
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
    path: '/device/:id',
    name: 'device',
    component: DeviceView
  },
  {
    path: '/device/brewpi/:id',
    name: 'device-brewpi',
    component: DeviceBrewpiView
  },
  {
    path: '/device/:id/batch',
    name: 'device-batch',
    component: DeviceBatchView
  },
  {
    path: '/device/:id/gravity',
    name: 'device-gravity',
    component: DeviceGravityView
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
    path: '/batch/:id/gravity',
    name: 'batch-gravity-list',
    component: BatchGravityListView
  },
  {
    path: '/batch/:id/pressure',
    name: 'batch-pressure',
    component: BatchPressureView
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
