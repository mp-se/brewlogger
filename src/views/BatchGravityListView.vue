<template>
  <div class="container">
    <p></p>
    <p class="h3">Batch Gravity List</p>
    <hr>

    <div class="row gy-2">

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
              <BsInputReadonly v-model="gravityStats.temperature.maxString" label="Temp"></BsInputReadonly>
            </div>
            <div class="col-md-1">
              <BsInputReadonly v-model="gravityStats.temperature.minString" label="Temp"></BsInputReadonly>
            </div>
            <div class="col-md-1">
              <BsInputReadonly v-model="gravityStats.readings" label="#"></BsInputReadonly>
            </div>
            <div class="col-md-1">
              <BsInputReadonly v-model="gravityStats.date.firstDate" label="First date"></BsInputReadonly>
            </div>
            <div class="col-md-1">
              <BsInputReadonly v-model="gravityStats.date.lastDate" label="Last date"></BsInputReadonly>
            </div>
          </div>
        </div>
      </template>

      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col" class="col-sm-1">ID</th>
            <th scope="col" class="col-sm-2">Date</th>
            <th scope="col" class="col-sm-1">Gravity ({{ config.isGravitySG ? "SG" : "P" }})</th>
            <th scope="col" class="col-sm-1">Angle</th>
            <th scope="col" class="col-sm-1">Temp ({{ config.isTempC ? "C" : "F" }})</th>
            <th scope="col" class="col-sm-1">Battery (V)</th>
            <th scope="col" class="col-sm-1">RSSI</th>
            <th scope="col" class="col-sm-1">Run time (s)</th>
            <th scope="col" class="col-sm-1">Active</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="g in gravityList" :key="g.id">
            <th scope="row">{{ g.id }}</th>
            <td>{{ g.created.substring(0, 10) }} {{ g.created.substring(11, 19) }}</td>
            <td>{{ config.isGravitySG ? new Number(g.gravity).toFixed(3) : new Number(gravityToPlato(g.gravity)).toFixed(2)  }}</td>
            <td>{{ new Number(g.angle).toFixed(2) }}</td>
            <td>{{ config.isTempC ? new Number(g.temperature).toFixed(2) : new Number(tempToF(g.temperature)).toFixed(2)  }}</td>
            <td>{{ new Number(g.battery).toFixed(2) }}</td>
            <td>{{ g.rssi }}</td>
            <td>{{ new Number(g.runTime).toFixed(2) }}</td>
            <td>{{ g.active }}</td>
          </tr>
        </tbody>
      </table>

      <div class="col-md-12">
      </div>

      <router-link :to="{ name: 'batch-list' }">
        <button type="button" class="btn btn-secondary w-2"> <i class="bi bi-list"></i>
          Batch list
        </button>
      </router-link>&nbsp;
    </div>

  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from "vue"
import { config, gravityStore } from "@/modules/pinia"
import { router } from '@/modules/router'
import { gravityToPlato, tempToF, getGravityDataAnalytics } from "@/modules/utils"
import { logDebug, logError, logInfo } from '@/modules/logger'

const gravityList = ref(null)
const gravityStats = ref(null)

onMounted(() => {
  logDebug("BatchGravityView.onMounted()")

  gravityList.value = null

  gravityStore.getGravityListForBatch(router.currentRoute.value.params.id, (success, gl) => {
    if (success) {
      gravityList.value = gl
      logDebug(gravityList.value)
      gravityStats.value = getGravityDataAnalytics(gravityList.value)
    } else {
      // global.messageError = "Failed to load gravity " + id
    }
  })
})
</script>