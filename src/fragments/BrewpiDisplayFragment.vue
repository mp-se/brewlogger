<template>
  <pre
    v-if="lcd != null"
    style="
      background-color: black;
      color: yellow;
      text-align: center;
    ">{{ lcd[0] }}<br>{{ lcd[1] }}<br>{{ lcd[2] }}<br>{{ lcd[3] }}</pre>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { deviceStore } from '@/modules/pinia'
import { logDebug } from '@/modules/logger'

const lcd = ref(null)
const ticker = ref(null)
const url = defineModel('url')
const refresh = defineModel('refresh')

onUnmounted(() => {
  logDebug('BrewpiDisplayFragment.onUnmounted()')
  if (ticker.value != null) clearInterval(ticker.value)
})

onMounted(() => {
  logDebug('BrewpiDisplayFragment.onMounted()')

  if(refresh.value === undefined)
    refresh.value = 5

  fetchDisplay()
  ticker.value = setInterval(() => {
    fetchDisplay()
  }, refresh.value * 1000)
})

function fetchDisplay() {
  logDebug('BrewpiDisplayFragment.fetchDisplay()')

  deviceStore.proxyRequest(url.value + 'api/lcd/', 'get', '', (success, res) => {
    logDebug('BrewpiDisplayFragment.fetchDisplay()', success, res)
    lcd.value = JSON.parse(res)
  })
}
</script>
