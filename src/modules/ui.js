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
