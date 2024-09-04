<template>
  <template v-if="gravityStats != null">
    <div class="col-md-12">
      <div class="row">
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
          <BsInputReadonly
            v-model="gravityStats.averageIntervalString"
            label="Ave Int"
          ></BsInputReadonly>
        </div>
        <div class="col-md-1">
          <BsInputReadonly
            v-model="gravityStats.temperature.maxString"
            label="High"
          ></BsInputReadonly>
        </div>
        <div class="col-md-1">
          <BsInputReadonly
            v-model="gravityStats.temperature.minString"
            label="Low"
          ></BsInputReadonly>
        </div>
        <div class="col-md-2">
          <BsInputReadonly v-model="gravityStats.date.firstDate" label="First"></BsInputReadonly>
        </div>
        <div class="col-md-2">
          <BsInputReadonly v-model="gravityStats.date.lastDate" label="Last"></BsInputReadonly>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
defineOptions({
  inheritAttrs: false
})
const gravityStats = defineModel()
</script>
