<template>
  <table class="table table-striped">
    <thead>
      <tr>
        <th scope="col" class="col-sm-1">Step</th>
        <th scope="col" class="col-sm-2">Date</th>
        <th scope="col" class="col-sm-1">Temperature</th>
        <th scope="col" class="col-sm-1">Days</th>
        <th scope="col" class="col-sm-2">Name</th>
        <th scope="col" class="col-sm-2">Type</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(step, index) in fermentationSteps" :key="index">
        <th scope="row">{{ step.order + 1 }}</th>
        <td>{{ step.date }}</td>
        <td>{{ step.temp }}</td>
        <td>{{ step.days }}</td>
        <td>{{ step.name }}</td>
        <td>{{ step.type }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
const fermentationSteps = defineModel('fermentationSteps')
</script>
