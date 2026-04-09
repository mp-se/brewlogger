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
  <BsInputBase :width="width" :label="label" :help="help" :badge="badge">
    <div class="btn-group" role="group">
      <template v-for="o in options" :key="o.value">
        <input
          type="radio"
          class="btn-check"
          v-model="model"
          :value="o.value"
          v-bind="$attrs"
          :name="'radio' + $.uid"
          :id="'radio' + $.uid + o.value"
          :disabled="disabled"
        />
        <label class="btn btn-outline-primary" :for="'radio' + $.uid + o.value">{{
          o.label
        }}</label>
      </template>
    </div>
  </BsInputBase>
</template>

<script setup>
import BsInputBase from './BsInputBase.vue'
/**
 * 2024-05-28 Bootstrap VueJS wrapper, Magnus Persson
 */

/**
 * Purpose: Show a selector with a number of options.
 */
defineOptions({
  inheritAttrs: false
})
/**
 * This is the v-model field that will be used to bind the component to (required).
 */
const model = defineModel()
/**
 * Options for the dropdown in the format [ { label: "label", value: "value" } ]
 * Label is displayed in the list and value is stored in the bound ref (required).
 */
const options = defineModel('options')
/**
 * This text is shown above the form component (optional).
 */
const label = defineModel('label')
/**
 * Help text is shown below the field to provide user help with input (optional).
 */
const help = defineModel('help')
/**
 * Specify the width to force a specific size (optional).
 */
const width = defineModel('width')
/**
 * Ref that steers if this component is enabled or not (required).
 */
const disabled = defineModel('disabled')
/**
 * Specify if an badge should be shown to guide the user (optional).
 */
const badge = defineModel('badge')
</script>
