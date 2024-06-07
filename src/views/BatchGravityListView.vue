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

      <div class="row gy-2">
        <div class="col-md-2">
          <BsInputDate v-model="infoFirstDay" label="First date" :disabled="global.disabled"></BsInputDate>
        </div>
        <div class="col-md-2">
          <BsInputDate v-model="infoLastDay" label="Last date" :disabled="global.disabled"></BsInputDate>
        </div>
        <div class="col-md-2">
          <BsInputNumber v-model="infoOG" label="Filter OG" step="0.001" :disabled="global.disabled"></BsInputNumber>
        </div>
        <div class="col-md-2">
          <BsInputNumber v-model="infoFG" label="Filter FG" step="0.001" :disabled="global.disabled"></BsInputNumber>
        </div>
        <div class="col-md-1">
          <BsInputBase label="&nbsp;"><button @click="apply()" type="button" class="btn btn-secondary btn-sm" :disabled="global.disabled">
              Apply
            </button></BsInputBase>
        </div>
        <div class="col-md-1">
          <BsInputBase label="&nbsp;"><button @click="activateAll()" type="button" class="btn btn-secondary btn-sm" :disabled="global.disabled">
              Activate All
            </button></BsInputBase>
        </div>
      </div>

      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col" class="col-sm-1">ID</th>
            <th scope="col" class="col-sm-1">Active</th>
            <th scope="col" class="col-sm-2">Date</th>
            <th scope="col" class="col-sm-1">Gravity ({{ config.isGravitySG ? "SG" : "P" }})</th>
            <th scope="col" class="col-sm-1">Angle</th>
            <th scope="col" class="col-sm-1">Temp ({{ config.isTempC ? "C" : "F" }})</th>
            <th scope="col" class="col-sm-1">Battery (V)</th>
            <th scope="col" class="col-sm-1">RSSI</th>
            <th scope="col" class="col-sm-1">Run time (s)</th>
          </tr>
        </thead>

        <tbody :key="forceRender">
          <tr v-for="g in gravityList" :key="g.id">
            <th scope="row">{{ g.id }}</th>
            <td><input v-model="g.active" type="checkbox" @click="updateGravity(g.id)"></td>
            <td>{{ g.created.substring(0, 10) }} {{ g.created.substring(11, 19) }}</td>
            <td>{{ config.isGravitySG ? new Number(g.gravity).toFixed(3) : new
              Number(gravityToPlato(g.gravity)).toFixed(2) }}
            </td>
            <td>{{ new Number(g.angle).toFixed(2) }}</td>
            <td>{{ config.isTempC ? new Number(g.temperature).toFixed(2) : new Number(tempToF(g.temperature)).toFixed(2)
              }}
            </td>
            <td>{{ new Number(g.battery).toFixed(2) }}</td>
            <td>{{ g.rssi }}</td>
            <td>{{ new Number(g.runTime).toFixed(2) }}</td>
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
import { config, gravityStore, global } from "@/modules/pinia"
import { router } from '@/modules/router'
import { gravityToPlato, tempToF, getGravityDataAnalytics } from "@/modules/utils"
import { logDebug, logError, logInfo } from '@/modules/logger'

const gravityList = ref(null)
const gravityStats = ref(null)
const forceRender = ref(0)

const infoFirstDay = ref(null)
const infoLastDay = ref(null)
const infoOG = ref(null)
const infoFG = ref(null)

async function updateGravity(id) {
  logDebug("BatchGravityListView.updateGravity()", id)

  gravityList.value.forEach(g => {
    if (g.id == id) {
      logDebug("BatchGravityListView.updateGravity()", "Found Record", g)

      g.active = !g.active
      gravityStore.updateGravity(g, (success) => {
        if (success) {
          logDebug("BatchGravityListView.updateGravity()", "Success")
          gravityStats.value = getGravityDataAnalytics(gravityList.value)
        } else {
          global.messageError = "Failed to load gravity " + id
        }
      })
    }
  })
}

function apply() {
  var last = Date.parse(infoLastDay.value)
  var first = Date.parse(infoFirstDay.value)
  
  logDebug("BatchGravityListView.apply()", first, last, infoOG.value, infoFG.value)

  global.disabled = true
  gravityList.value.forEach(async (g) => {
    var date = Date.parse(g.created)
    var active = false

    if((date <= last && date >= first) && (g.gravity <= infoOG.value && g.gravity >= infoFG.value ))
      active = true

    //logDebug("BatchGravityListView.apply()", date, last, first, (date <= last && date >= first))
    //logDebug("BatchGravityListView.apply()", g.gravity, infoOG.value, infoFG.value, (g.gravity <= infoOG.value && g.gravity >= infoFG.value ))

    if(g.active != active) {
      // logDebug("BatchGravityListView.apply()", g.active, active, date, g.gravity)
      g.active = active

      await gravityStore.updateGravity(g, (success) => {
        if (success) {
          logDebug("BatchGravityListView.apply()", "Success")
        } else {
          logError("BatchGravityListView.apply()", "Failed to update gravity", g)
        }
      })
    }
  })

  logDebug("BatchGravityListView.apply()", "Completed")
  forceRender.value++
  global.disabled = false
  gravityStats.value = getGravityDataAnalytics(gravityList.value)
}

function activateAll() {
  logDebug("BatchGravityListView.activateAll()")

  global.disabled = true
  gravityList.value.forEach(async (g) => {
    if( !g.active ) {
      g.active = true
      await gravityStore.updateGravity(g, (success) => {
        if (success) {
          logDebug("BatchGravityListView.activateAll()", "Success")
        } else {
          logError("BatchGravityListView.activateAll()", "Failed to update gravity", g)
        }
      })
    }
  })

  logDebug("BatchGravityListView.activateAll()", "Completed")
  forceRender.value++
  global.disabled = false
  gravityStats.value = getGravityDataAnalytics(gravityList.value)
}

onMounted(() => {
  logDebug("BatchGravityListView.onMounted()")

  gravityList.value = null

  gravityStore.getGravityListForBatch(router.currentRoute.value.params.id, (success, gl) => {
    if (success) {
      gravityList.value = gl
      logDebug(gravityList.value)

      gravityStats.value = getGravityDataAnalytics(gravityList.value)

      infoFirstDay.value = gravityStats.value.date.firstDate
      infoLastDay.value = gravityStats.value.date.lastDate
      infoOG.value = Number.parseFloat(new Number(gravityStats.value.gravity.max).toFixed(config.isGravitySG ? 3 : 2))
      infoFG.value = Number.parseFloat(new Number(gravityStats.value.gravity.min).toFixed(config.isGravitySG ? 3 : 2))

    } else {
      logError("BatchGravityListView.onMounted()", "Failed to load gravity", id)
    }
  })
})
</script>