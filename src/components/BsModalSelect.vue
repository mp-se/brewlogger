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
    :id="id"
    type="button"
    class="btn btn-secondary"
    hidden
    data-bs-toggle="modal"
    :data-bs-target="'#modal' + $.uid"
  >
    Testing
  </button>
  <div class="modal fade modal-lg" :id="'modal' + $.uid" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content p-4">
        <div class="modal-header">
          <h1 class="modal-title fs-5">{{ disabled ? 'Processing...' : title }}</h1>
        </div>
        <div class="modal-body">
          <BsSelect :disabled="disabled" v-model="result" :options="options"> </BsSelect>
        </div>
        <div class="modal-footer">
          <button
            :disabled="disabled"
            @click="callback(true, result)"
            type="button"
            class="btn btn-primary"
            data-bs-dismiss="modal"
          >
            Confirm
          </button>
          <button
            @click="callback(false, '')"
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Purpose: Show a yes/no dialog to confirm an action
 */
defineOptions({
  inheritAttrs: false
})
/**
 * This is the v-model field that will be used to bind the component to (required).
 */
const result = defineModel()
/**
 * Ref to callback where true/false will be a parameter (required)
 */
const callback = defineModel('callback')
/**
 * Ref to dialog id (required)
 */
const id = defineModel('id')
/**
 * Ref that steers if this component is enabled or not (optional).
 */
const disabled = defineModel('disabled')
/**
 * Modal title (required).
 */
const title = defineModel('title')
/**
 * Modal options (required).
 */
const options = defineModel('options')
</script>
