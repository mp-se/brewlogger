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
