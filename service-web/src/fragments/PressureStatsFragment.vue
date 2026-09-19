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
