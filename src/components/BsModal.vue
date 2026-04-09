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
  <button
    v-bind="$attrs"
    type="button"
    class="btn btn-secondary"
    data-bs-toggle="modal"
    :data-bs-target="'#modal' + $.uid"
  >
    {{ button }}
  </button>

  <div class="modal fade modal-lg" :id="'modal' + $.uid" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content p-4">
        <div class="modal-header">
          <h1 class="modal-title fs-5">{{ title }}</h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <template v-if="checkCode()">
            <pre>{{ format(model) }}</pre>
          </template>
          <template v-else>
            {{ model }}
          </template>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { isValidJson, isValidFormData, isValidMqttData } from '@/modules/utils'
/**
 * Purpose: Show a button that activates a modal with close button, title and content. Support json pretty.
 */
defineOptions({
  inheritAttrs: false
})

/**
 * Ref to fetch data from (required)
 */
const model = defineModel()
/**
 * Text on button that activates the modal (required)
 */
const button = defineModel('button')
/**
 * Modal title (required).
 */
const title = defineModel('title')

const format = (s) => {
  if (isValidJson(model.value)) return JSON.stringify(JSON.parse(s), null, 2)

  if (isValidFormData(model.value)) return s.replaceAll('&', '&\n\r')

  return s
}

const checkCode = () => {
  return isValidJson(model.value) || isValidFormData(model.value) || isValidMqttData(model.value)
}
</script>
