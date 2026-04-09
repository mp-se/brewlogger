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
import { ref, computed } from 'vue'
import { logDebug } from '@/modules/logger'

/**
 * Composable for managing sortable lists in the UI.
 * Provides sorting logic, current sorting state, and UI helper classes.
 * 
 * @param {string} initialColumn - Default column to sort by
 * @param {string} initialType - Default sort type ('str', 'num', 'date')
 * @param {boolean} initialOrder - Default sort order (true for ascending, false for descending)
 */
export function useSortableList(initialColumn = 'name', initialType = 'str', initialOrder = true) {
  const sorting = ref({ 
    column: initialColumn, 
    type: initialType, 
    order: initialOrder 
  })

  /**
   * Computed property for the current sort icon class (Bootstrap Icons)
   */
  const sortedIconClass = computed(() => {
    // Use alpha icons for strings, numeric icons for others
    if (sorting.value.type === 'str') {
      return 'bi ' + (sorting.value.order ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up-alt')
    }
    return 'bi ' + (sorting.value.order ? 'bi-sort-numeric-down' : 'bi-sort-numeric-up-alt')
  })

  /**
   * Returns a CSS class for the currently sorted header
   * @param {string} column - Column name to check 
   */
  function getSortedClass(column) {
    if (column === sorting.value.column) return 'text-primary fw-bold'
    return ''
  }

  /**
   * Sets the default sorting configuration
   */
  function setSortingDefault(column, type, order) {
    logDebug('useSortableList: setSortingDefault()', column, type, order)
    sorting.value = { column, type, order }
  }

  /**
   * Triggers sorting on a list based on a column and type
   * @param {Array} list - The list to sort 
   * @param {string} column - Property name to sort by
   * @param {string} type - Sort type ('str', 'num', 'date')
   */
  function sortList(list, column, type) {
    logDebug('useSortableList: sortList()', column, type)

    if (sorting.value.column === column) {
      // Toggle order if same column
      sorting.value.order = !sorting.value.order
    } else {
      // New column, reset to ascending/descending based on type or preference
      sorting.value.column = column
      sorting.value.type = type
      sorting.value.order = true // Default to ascending for new column
    }
    
    applySortList(list)
  }

  /**
   * Applies the current sorting state to a list
   * @param {Array} list - The list to sort in-place
   */
  function applySortList(list) {
    if (!list || !Array.isArray(list) || list.length === 0) return

    logDebug('useSortableList: applySortList()', sorting.value.column, sorting.value.type, sorting.value.order)

    const { column, type, order } = sorting.value

    list.sort((a, b) => {
      let valA = a[column]
      let valB = b[column]

      // Handle null/undefined
      if (valA === undefined || valA === null) return order ? 1 : -1
      if (valB === undefined || valB === null) return order ? -1 : 1

      if (type === 'str') {
        const strA = String(valA)
        const strB = String(valB)
        return order 
          ? strA.localeCompare(strB) 
          : strB.localeCompare(strA)
      } 
      
      if (type === 'date') {
        const dateA = new Date(valA).getTime()
        const dateB = new Date(valB).getTime()
        return order ? dateA - dateB : dateB - dateA
      }

      // Default to numeric/primitive comparison
      return order ? valA - valB : valB - valA
    })
  }

  return {
    sorting,
    sortedIconClass,
    getSortedClass,
    setSortingDefault,
    sortList,
    applySortList
  }
}
