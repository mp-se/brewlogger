<template>
  <template v-if="pressureStats != null">
    <div class="col-md-12">
      <div class="row">
        <div class="col-md-1">
          <BsInputReadonly
            v-model="pressureStats.pressure.maxString"
            label="High"
          ></BsInputReadonly>
        </div>
        <div class="col-md-1">
          <BsInputReadonly v-model="pressureStats.pressure.minString" label="Low"></BsInputReadonly>
        </div>

        <div class="col-md-1">
          <BsInputReadonly v-model="pressureStats.readings" label="#"></BsInputReadonly>
        </div>
        <div class="col-md-1">
          <BsInputReadonly
            v-model="pressureStats.averageIntervalString"
            label="Ave Int"
          ></BsInputReadonly>
        </div>
        <div class="col-md-1">
          <BsInputReadonly
            v-model="pressureStats.temperature.maxString"
            label="High"
          ></BsInputReadonly>
        </div>
        <div class="col-md-1">
          <BsInputReadonly
            v-model="pressureStats.temperature.minString"
            label="Low"
          ></BsInputReadonly>
        </div>
        <div class="col-md-2">
          <BsInputReadonly v-model="pressureStats.date.firstDate" label="First"></BsInputReadonly>
        </div>
        <div class="col-md-2">
          <BsInputReadonly v-model="pressureStats.date.lastDate" label="Last"></BsInputReadonly>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
defineOptions({
  inheritAttrs: false
})
const pressureStats = defineModel()
</script>
