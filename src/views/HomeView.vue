<template>
  <div class="container">
    <p></p>
    <p class="h3">Home - Active Batches</p>
    <hr>

    <div class="row gy-4">

      <div class="col-md-4" v-for="b in batchList" :key="b.id">
        <BsCard :header="'Batch: ' + b.name" color="info" title="">
          <p class="text-center">
            <template v-if="b.gravityCount > 0">
              <router-link :to="{ name: 'batch-gravity-graph', params: { id: b.id } }">
                <button type="button" class="btn btn-success btn-sm"><i class="bi bi-graph-down"></i></button>
              </router-link>&nbsp;
            </template>
            Age: {{ getGravityReadingAge(b) }}
          </p>
          <p class="text-center">
            Gravity: {{ getGravityOG(b) }} - {{ getLastGravity(b) }}
          </p>
          <p class="text-center">
            Temperature {{ getLastTemperature(b) }}
          </p>
        </BsCard>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { global, config, batchStore } from "@/modules/pinia"
import { gravityToPlato, tempToF } from "@/modules/utils"
import { logDebug, logError, logInfo } from '@/modules/logger'

const batchList = ref([]);

function formatTime(t) {
  if (t < 60) // less than 1 min
    return new Number(t).toFixed(0) + "s"

  if (t < (60 * 60)) // less than 1 hour
    return new Number(t / 60).toFixed(0) + "m"

  if (t < (60 * 60 * 24)) // less than 1 day
    return new Number(t / (60 * 60)).toFixed(0) + "h"

  return new Number(t / (60 * 60 * 24)).toFixed(0) + "d"
}

function getGravityReadingAge(batch) {
  logDebug("HomeView.getGravityReadingAge()")

  if (batch.gravityCount == 2) {
    var last = Date.parse(batch.gravity[1].created)
    var now = new Date()

    return formatTime(Math.floor((now - last) / 1000))
  }

  return ""
}

function getGravityOG(batch) {
  logDebug("HomeView.getGravityOG()")

  if (batch.gravityCount > 1) {
    var g = batch.gravity[0].gravity

    if (config.isGravityP)
      return new Number(gravityToPlato(g)).toFixed(2)

    return new Number(g).toFixed(4)
  }

  return 0.0
}

function getLastGravity(batch) {
  logDebug("HomeView.getLastGravity()")

  if (batch.gravityCount == 2) {
    var g = batch.gravity[1].gravity

    if (config.isGravityP)
      return new Number(gravityToPlato(g)).toFixed(2)

    return new Number(g).toFixed(4)
  }

  return "N/A"
}

function getLastTemperature(batch) {
  logDebug("HomeView.getLastTemperature()")

  if (batch.gravityCount == 2) {
    var t = batch.gravity[1].temperature

    if (config.isTempF)
      return new Number(tempToF(t)).toFixed(2) + " F"

    return new Number(t).toFixed(2) + " C"
  }

  return 'N/A'
}

onMounted(() => {
  logDebug("HomeView.onMounted()")

  batchStore.getBatchList((success, bl) => {
    if (success) {

      batchList.value = []

      bl.forEach(batch => {
        if (batch.active) {
          batchStore.getBatchDashboard(batch.id, (success, b) => {
            console.log(success, b)
            batchList.value.push(b)
          })
        }
      })
    } else {
      global.messageError = "Failed to load batch list"
    }
  })
})
</script>