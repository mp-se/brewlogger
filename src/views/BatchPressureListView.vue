<template>
  <div class="container">
    <p></p>
    <p class="h3">Batch Pressure List - '{{ batchName }}'</p>
    <hr />

    <div class="row gy-2">
      <!-- 
      <GravityStats v-model="gravityStats"></GravityStats>

      <LifeEstimates v-model="gravityStats"></LifeEstimates>
      -->

      <div class="row gy-2">
        <div class="col-md-2">
          <BsInputDate
            v-model="infoFirstDay"
            label="Filter first"
            :disabled="global.disabled"
          ></BsInputDate>
        </div>
        <div class="col-md-2">
          <BsInputDate
            v-model="infoLastDay"
            label="Filter last"
            :disabled="global.disabled"
          ></BsInputDate>
        </div>
        <div class="col-md-2">
          <BsInputBase label="&nbsp;"
            ><button
              @click="apply()"
              type="button"
              class="btn btn-secondary btn-sm"
              :disabled="global.disabled"
            >
              Apply Filter
            </button></BsInputBase
          >&nbsp;
        </div>
        <div class="col-md-2">
          <BsInputBase label="&nbsp;"
            ><button
              @click="activateAll()"
              type="button"
              class="btn btn-secondary btn-sm"
              :disabled="global.disabled"
            >
              All active
            </button></BsInputBase
          >
        </div>
      </div>

      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col" class="col-sm-2">
              <div :class="sortedClass('created')">
                Date&nbsp;
                <a
                  class="icon-link icon-link-hover"
                  @click="sortList(pressureList, 'created', 'date')"
                >
                  <i :class="sortedIconClass"></i>
                </a>
              </div>
            </th>
            <th scope="col" class="col-sm-1">Active</th>
            <th scope="col" class="col-sm-2">
              <div :class="sortedClass('pressure')">
                Pressure ({{
                  config.isPressurePSI ? 'PSI' : config.isPressureBAR ? 'Bar' : 'kPa'
                }})&nbsp;
                <a
                  class="icon-link icon-link-hover"
                  @click="sortList(pressureList, 'pressure', 'num')"
                >
                  <i :class="sortedIconClass"></i>
                </a>
              </div>
            </th>
            <th scope="col" class="col-sm-1">Temp ({{ config.isTempC ? 'C' : 'F' }})</th>
            <th scope="col" class="col-sm-1">
              <div :class="sortedClass('battery')">
                Battery&nbsp;
                <a
                  class="icon-link icon-link-hover"
                  @click="sortList(gravityList, 'battery', 'num')"
                >
                  <i :class="sortedIconClass"></i>
                </a>
              </div>
            </th>
            <th scope="col" class="col-sm-1">RSSI</th>
            <th scope="col" class="col-sm-1">Run time (s)</th>
          </tr>
        </thead>

        <tbody :key="forceRender">
          <tr v-for="p in pressureList" :key="p.id">
            <td class="fs-5">{{ p.created.substring(0, 10) }} {{ p.created.substring(11, 19) }}</td>
            <td>
              <div class="form-check">
                <input
                  class="form-check-input"
                  v-model="p.active"
                  type="checkbox"
                  @click="updatePressure(p.id)"
                />
              </div>
            </td>
            <td class="fs-5">
              {{
                new Number(
                  config.isPressurePSI
                    ? p.pressure
                    : config.isPressureBAR
                      ? pressureToBAR(p.pressure)
                      : pressureToKPA(p.pressure)
                ).toFixed(2)
              }}
            </td>
            <td class="fs-5">
              {{
                p.temperature > -270
                  ? config.isTempC
                    ? new Number(p.temperature).toFixed(2)
                    : new Number(tempToF(p.temperature)).toFixed(2)
                  : '-'
              }}
            </td>
            <td class="fs-5">{{ new Number(p.battery).toFixed(2) }}</td>
            <td class="fs-5">{{ p.rssi }}</td>
            <td class="fs-5">{{ new Number(p.runTime).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="col-md-12"></div>

      <router-link :to="{ name: 'batch-list' }">
        <button type="button" class="btn btn-secondary w-2">
          <i class="bi bi-list"></i>
          Batch list
        </button> </router-link
      >&nbsp;
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { config, pressureStore, batchStore, global } from '@/modules/pinia'
import router from '@/modules/router'
import { tempToF, getPressureDataAnalytics, pressureToKPA, pressureToBAR } from '@/modules/utils'
import { logDebug, logError } from '@/modules/logger'
import {
  sortedIconClass,
  setSortingDefault,
  sortedClass,
  sortList,
  applySortList
} from '@/modules/ui'

const pressureList = ref(null)
const pressureStats = ref(null)
const forceRender = ref(0)

const infoFirstDay = ref(null)
const infoLastDay = ref(null)

const batchName = ref('')

async function updatePressure(id) {
  logDebug('BatchPressureListView.updatePressure()', id)

  pressureList.value.forEach((p) => {
    if (p.id == id) {
      logDebug('BatchPressureListView.updatePressure()', 'Found Record', p)

      p.active = !p.active
      pressureStore.updatePressure(p, (success) => {
        if (success) {
          logDebug('BatchPressureListView.updatePressure()', 'Success')
          pressureStats.value = getPressureDataAnalytics(pressureList.value)
        } else {
          global.messageError = 'Failed to load pressure ' + id
        }
      })
    }
  })
}

function apply() {
  var last = Date.parse(infoLastDay.value)
  var first = Date.parse(infoFirstDay.value)

  // logDebug('BatchPressureListView.apply()', first, last, infoOG.value, infoFG.value)
  logDebug('BatchPressureListView.apply()', first, last)

  global.disabled = true
  pressureList.value.forEach(async (p) => {
    var date = Date.parse(p.created)
    var active = false

    // if (date <= last && date >= first && g.gravity <= infoOG.value && g.gravity >= infoFG.value)
    if (date <= last && date >= first) active = true

    if (p.active != active) {
      p.active = active

      await pressureStore.updatePressure(p, (success) => {
        if (success) {
          logDebug('BatchPressureListView.apply()', 'Success')
        } else {
          logError('BatchPressureListView.apply()', 'Failed to update pressure', p)
        }
      })
    }
  })

  logDebug('BatchPressureListView.apply()', 'Completed')
  forceRender.value++
  global.disabled = false
  pressureStats.value = getPressureDataAnalytics(pressureList.value)
}

function activateAll() {
  logDebug('BatchPressureListView.activateAll()')

  global.disabled = true
  pressureList.value.forEach(async (p) => {
    if (!p.active) {
      p.active = true
      await pressureStore.updatePressure(p, (success) => {
        if (success) {
          logDebug('BatchPressureListView.activateAll()', 'Success')
        } else {
          logError('BatchPressureListView.activateAll()', 'Failed to update pressure', p)
        }
      })
    }
  })

  logDebug('BatchPressureListView.activateAll()', 'Completed')
  forceRender.value++
  global.disabled = false
  pressureStats.value = getPressureDataAnalytics(pressureList.value)
}

onMounted(() => {
  logDebug('BatchPressureListView.onMounted()')
  setSortingDefault('created', 'date', false)

  pressureList.value = null

  batchStore.getBatch(router.currentRoute.value.params.id, (success, b) => {
    if (success) batchName.value = b.name
  })

  pressureStore.getPressureListForBatch(router.currentRoute.value.params.id, (success, pl) => {
    if (success) {
      pressureList.value = pl
      applySortList(pressureList.value)
      logDebug('BatchPressureListView.onMounted()', pressureList.value)

      pressureStats.value = getPressureDataAnalytics(pressureList.value)

      infoFirstDay.value = pressureStats.value.date.firstDate
      infoLastDay.value = pressureStats.value.date.lastDate
    } else {
      logError(
        'BatchPressureListView.onMounted()',
        'Failed to load pressure',
        router.currentRoute.value.params.id
      )
    }
  })
})
</script>
