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
