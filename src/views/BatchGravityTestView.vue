<template>
  <div class="container">
    <p></p>
    <p class="h3">Batch Gravity Test List - '{{ batchName }}'</p>
    <hr />

    <p>Testing page for gravity related development</p>

  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { gravityStore, batchStore } from '@/modules/pinia'
import router from '@/modules/router'
import { logDebug, logError } from '@/modules/logger'

const gravityList = ref(null)
const batchName = ref('')

onMounted(() => {
  logDebug('BatchGravityTestView.onMounted()')

  gravityList.value = null

  batchStore.getBatch(router.currentRoute.value.params.id, (success, b) => {
    if (success) batchName.value = b.name
  })

  gravityStore.getGravityListForBatch(router.currentRoute.value.params.id, (success, gl) => {
    if (success) {
      gravityList.value = gl

    } else {
      logError(
        'BatchGravityTestView.onMounted()',
        'Failed to load gravity',
        router.currentRoute.value.params.id
      )
    }
  })
})
</script>
