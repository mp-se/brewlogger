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
  <template v-if="gravityStats != null">
    <div class="col-md-12">
      <div class="row">
        <div class="col-md-1">
          <label class="form-label fw-bold">30 sec</label>
          <label class="form-control-plaintext">{{ estimateBattery(30) }}</label>
        </div>

        <div class="col-md-1">
          <label class="form-label fw-bold">60 sec</label>
          <label class="form-control-plaintext">{{ estimateBattery(60) }}</label>
        </div>

        <div class="col-md-1">
          <label class="form-label fw-bold">300 sec</label>
          <label class="form-control-plaintext">{{ estimateBattery(300) }}</label>
        </div>

        <div class="col-md-1">
          <label class="form-label fw-bold">900 sec</label>
          <label class="form-control-plaintext">{{ estimateBattery(900) }}</label>
        </div>

        <div class="col-md-1">
          <label class="form-label fw-bold">1800 sec</label>
          <label class="form-control-plaintext">{{ estimateBattery(1800) }}</label>
        </div>

        <!--
        <div class="col-md-1">
          <BsInputReadonly v-model="gravityStats.gravity.maxString" label="OG"></BsInputReadonly>
        </div>
        <div class="col-md-1">
          <BsInputReadonly v-model="gravityStats.gravity.minString" label="FG"></BsInputReadonly>
        </div>
        <div class="col-md-1">
          <BsInputReadonly v-model="gravityStats.abvString" label="ABV"></BsInputReadonly>
        </div>
        <div class="col-md-1">
          <BsInputReadonly v-model="gravityStats.readings" label="#"></BsInputReadonly>
        </div>
        <div class="col-md-1">
          <BsInputReadonly v-model="gravityStats.averageIntervalString" label="Ave Int"></BsInputReadonly>
        </div>
        <div class="col-md-1">
          <BsInputReadonly v-model="gravityStats.temperature.maxString" label="High"></BsInputReadonly>
        </div>
        <div class="col-md-1">
          <BsInputReadonly v-model="gravityStats.temperature.minString" label="Low"></BsInputReadonly>
        </div>
        <div class="col-md-2">
          <BsInputReadonly v-model="gravityStats.date.firstDate" label="First"></BsInputReadonly>
        </div>
        <div class="col-md-2">
          <BsInputReadonly v-model="gravityStats.date.lastDate" label="Last"></BsInputReadonly>
        </div>
        -->
      </div>
    </div>
  </template>
</template>

<script setup>
import { formatTimeShort } from '@/modules/utils'
import { logDebug } from '@/modules/logger'

defineOptions({
  inheritAttrs: false
})
const gravityStats = defineModel()

function estimateBattery(interval) {
  logDebug('LifeEstimates.estimateBattery()', interval)
  var estimate = gravityStats.value.readings * interval
  return formatTimeShort(estimate)
}
</script>
