// BrewLogger
// Copyright (c) 2021-2026 Magnus
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Alternatively, this software may be used under the terms of a
// commercial license. See LICENSE_COMMERCIAL for details.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//
import { computed, ref } from 'vue'
import { logDebug } from '@/modules/logger'

const sorting = ref({ column: 'name', type: 'str', order: false })

export const sortedIconClass = computed(() => {
  return 'bi ' + (sorting.value.order ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up')
})

export function setSortingDefault(column, type, order) {
  logDebug('ui.setSortingDefault()', column, type, order)
  sorting.value = { column: column, type: type, order: order }
}

export function sortedClass(column) {
  // logDebug('ui.sortedClass()', column)
  if (column == sorting.value.column) return 'text-primary'
  return ''
}

export function sortList(list, column, type) {
  // Type: str, num, date
  logDebug('ui.sortList()', column, type)

  sorting.value.column = column
  sorting.value.type = type
  sorting.value.order = !sorting.value.order
  applySortList(list)
}

export function applySortList(list) {
  logDebug('ui.applySortList()', sorting.value.column, sorting.value.type, sorting.value.order)

  if (sorting.value.order) {
    if (sorting.value.type == 'str')
      list.sort((a, b) => a[sorting.value.column].localeCompare(b[sorting.value.column]))
    else if (sorting.value.type == 'date')
      list.sort((a, b) => Date.parse(a[sorting.value.column]) - Date.parse(b[sorting.value.column]))
    else list.sort((a, b) => a[sorting.value.column] - b[sorting.value.column])
  } else {
    if (sorting.value.type == 'str')
      list.sort((a, b) => b[sorting.value.column].localeCompare(a[sorting.value.column]))
    else if (sorting.value.type == 'date')
      list.sort((a, b) => Date.parse(b[sorting.value.column]) - Date.parse(a[sorting.value.column]))
    else list.sort((a, b) => b[sorting.value.column] - a[sorting.value.column])
  }
}
