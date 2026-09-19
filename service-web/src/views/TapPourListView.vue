<!--
BrewLogger
Copyright (c) 2021-2026 Magnus

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Alternatively, this software may be used under the terms of a
commercial license. See LICENSE_COMMERCIAL for details.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->
<template>
  <div class="container">
    <p></p>
    <p class="h3">Tap Pour List - '{{ batchName }}'</p>
    <hr />

    <table class="table table-striped">
      <thead>
        <tr>
          <th scope="col" class="col-sm-2">
            <div :class="sortedClass('created')">
              Date&nbsp;
              <a class="icon-link icon-link-hover" @click="sortList(pourList, 'created', 'date')">
                <i :class="sortedIconClass"></i>
              </a>
            </div>
          </th>
          <th scope="col" class="col-sm-1">Active</th>
          <th scope="col" class="col-sm-2">
            <div :class="sortedClass('pour')">
              Pour ({{ config.isVolumeMetric ? 'cl' : 'fl. oz.' }})&nbsp;
              <a class="icon-link icon-link-hover" @click="sortList(pourList, 'pour', 'num')">
                <i :class="sortedIconClass"></i>
              </a>
            </div>
          </th>
          <th scope="col" class="col-sm-2">
            <div :class="sortedClass('volume')">
              Volume ({{ config.isVolumeMetric ? 'Liters' : 'Gallon' }})&nbsp;
              <a class="icon-link icon-link-hover" @click="sortList(pourList, 'volume', 'num')">
                <i :class="sortedIconClass"></i>
              </a>
            </div>
          </th>
          <th scope="col" class="col-sm-2">
            Max Volume ({{ config.isVolumeMetric ? 'Liters' : 'Gallon' }})
          </th>
        </tr>
      </thead>

      <tbody :key="forceRender">
        <tr v-for="p in pourList" :key="p.id">
          <td class="fs-5">{{ p.created.substring(0, 10) }} {{ p.created.substring(11, 19) }}</td>
          <td>
            <div class="form-check">
              <input
                class="form-check-input"
                v-model="p.active"
                type="checkbox"
                @click="updatePour(p.id)"
              />
            </div>
          </td>
          <td class="fs-5">{{ getFormattedPourVolume(p.pour * 100) }}</td>
          <td class="fs-5">{{ getFormattedVolume(p.volume) }}</td>
          <td class="fs-5">{{ getFormattedVolume(p.maxVolume) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="col-md-12"></div>

    <router-link :to="{ name: 'tap-list' }">
      <button type="button" class="btn btn-secondary w-2">
        <i class="bi bi-list"></i>
        Tap list
      </button> </router-link
    >&nbsp;
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { pourStore, batchStore, config, global } from '@/modules/pinia'
import router from '@/modules/router'
import { logDebug, logError } from '@/modules/logger'
import { getFormattedVolume, getFormattedPourVolume } from '@/modules/utils'
import {
  sortedIconClass,
  setSortingDefault,
  sortedClass,
  sortList,
  applySortList
} from '@/modules/ui'

const pourList = ref(null)
const forceRender = ref(0)
const batchName = ref('')

async function updatePour(id) {
  logDebug('TapPourListView.updatePour()', id)

  for (const p of pourList.value) {
    if (p.id == id) {
      logDebug('TapPourListView.updatePour()', 'Found Record', p)

      p.active = !p.active
      const success = await pourStore.updatePour(p)
      if (success) {
        logDebug('BatchGravityListView.updatePour()', 'Success')
      } else {
        global.messageError = 'Failed to load pour ' + id
      }
      break
    }
  }
}

onMounted(async () => {
  logDebug('TapPourListView.onMounted()')
  setSortingDefault('created', 'date', false)

  pourList.value = null

  const b = await batchStore.getBatch(router.currentRoute.value.params.id)
  if (b) batchName.value = b.name

  const pl = await pourStore.getPourListForBatch(router.currentRoute.value.params.id)
  if (pl) {
    pourList.value = pl
    applySortList(pourList.value)
    logDebug('TapPourListView.onMounted()', pourList.value)
  } else {
    logError(
      'TapPourListView.onMounted()',
      'Failed to load pour',
      router.currentRoute.value.params.id
    )
  }
})
</script>
