# Refactoring Opportunities — BrewLogger UI

This document identifies specific refactoring opportunities in the BrewLogger UI project, focusing on reusability, consistency, and separation of concerns.

## 1. Duplicate UI Patterns & New Component Opportunities

### Page Headers with Actions
**Observation**: Most views (`HomeView.vue`, `BatchListView.vue`, `DeviceListView.vue`, `BatchView.vue`) manually implement a row with a title `h3`, horizontal rule `hr`, and sometimes top-level filters or switches.
**Opportunity**: Create a `BsPageHeader.vue` component.
- **Props**: `title`, `loading` (for spinner).
- **Slots**: `actions` (for buttons/switches), `filters`.

### Data Tables (List Views)
**Observation**: `BatchListView.vue` and `DeviceListView.vue` share almost identical table structures, including sorting logic (`sortList`, `sortedClass`, `sortedIconClass`).
**Opportunity**: Create a `BsDataTable.vue` component or enhance sorting via a composable.
- **Composable**: `useSortableList(list)` to manage `sortList`, `sortKey`, `sortOrder` logic.
- **Component**: A wrapper that handles the `<thead>` with sort icons.

### Action Button Groups
**Observation**: Component action buttons (Edit, Delete, Graph links) are repeated in table rows with standard Bootstrap classes and tooltips.
**Opportunity**: Create `BsActionButton.vue` or `BsActionGroup.vue`.
- Standardize styles for `pencil-square` (edit), `file-x` (delete), `graph-down` (chart).

## 2. Form Logic Consolidation

### Input Group Consistency
**Observation**: `BsInputText.vue` and other inputs manually wrap their internal `<input>` in `input-group` and handle `BsInputBase`.
**Opportunity**: Move common `input-group` logic and standard attributes (like `disabled`, `readonly`, `placeholder`) directly into `BsInputBase.vue` or create a more robust shared mixin-like pattern using `v-bind="$attrs"`.

### Validation Styles
**Observation**: `DeviceView.vue` has manual `:class="chipIdValid ? '' : 'is-invalid'"` logic.
**Opportunity**: Standardize validation prop in `BsInputBase` (e.g., `error-message` or `is-invalid`) so all children get consistent error styling automatically.

## 3. Fragment Refactoring

### Large Views to Fragments
- **`HomeView.vue`**: The "Latest Readings" tables for Gravity and Pressure should be extracted into `GravityLatestReadingsFragment.vue` and `PressureLatestReadingsFragment.vue`.
- **`BatchView.vue`**: The main batch form is quite large. It could be split into `BatchGeneralInfoFragment.vue` and `BatchGravityInfoFragment.vue`.
- **`DeviceView.vue`**: The device configuration section and action buttons could be extracted.

## 4. Composition Functions (Composables)

### `useSortableList`
Extract the sorting logic from `BatchListView.vue` and `DeviceListView.vue`.
```javascript
// Proposed src/composables/useSortableList.js
export function useSortableList(initialList) {
  // logic for sortList, sortedKey, sortedOrder, sortedClass
}
```

### `useDeviceActions` / `useBatchActions`
Logic for `deleteBatch`, `toggleBatchActive`, `openUrl`, etc., is currently in the View components. Moving these to a composable or a central utility makes them reusable in both "Home" cards and "List" tables.

### `useFormatting`
Many components use `Number(value).toFixed(2)` or `getFormattedTemperature`. These should be centralized in a `useFormatting` composable for consistent display across the app.

## 5. Component API Consistency

### Prop Naming
- Most `Bs*` components use `label`, `help`, `width`, `badge`. This is good.
- **Inconsistency**: Some components might use `modelValue` (v-model) while others use specific names if not updated to Vue 3.4+ `defineModel`. All should move to `defineModel()` for consistency.

### Event Handling
- Standardize on `update:modelValue` (implicit in `defineModel`) and consistent names for custom events like `change` or `confirm`.

## Summary of Impactful Targets

| Target | Benefit | Priority |
|:---|:---|:---|
| `useSortableList` Composable | Removes redundant code from all list views. | High |
| `BsPageHeader` Component | Consistent layout and reduced boilerplate in 15+ views. | Medium |
| `LatestReadings` Fragments | Cleans up `HomeView.vue` and allows reuse in other dashboards. | Medium |
| Standardized Form Validation | Reduces manual class toggling in Views. | High |
| `useFormatting` Composable | Ensures unit display consistency (toFixed, units). | Medium |
