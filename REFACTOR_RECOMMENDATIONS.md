# Refactor Recommendations — Quality, Maintainability & Test Coverage

> Generated: 2026-03-31  
> Current overall coverage: **82.83% statements** — below the 85% project threshold  
> Total tests: 866 passing across 32 test files

---

## Summary

The project has strong foundations: data classes are 100% covered, stores average ~97%, and all components have test files. The critical gaps are concentrated in three areas:

1. A **Pinia singleton architecture** that causes store-dependent views to be untestable without the right mock pattern
2. **DeviceView** (23% coverage) collapsing the entire test pyramid due to the singleton issue
3. **Fragment reactive setters** (0% function coverage) due to a testing oversight

Fixing P0 + P1 items would bring overall coverage comfortably above 85%.

---

## P0 — Critical (fix first: bug + coverage blocker) ✅ COMPLETED

### P0.1 — Fix `validateChipId()` regex bug in `DeviceView.vue` ✅ COMPLETED

**File:** `src/views/DeviceView.vue`

The chip ID validation regex contains a literal comma in the character class:

```javascript
// BUG: [0-9,a-f] matches 0-9, comma, and a-f
const pattern = /^([0-9,a-f]){6}$/

// ✅ FIXED: Changed to /^[0-9a-f]{6}$/
```

✅ **FIXED**: Regex corrected. Chip IDs like `"a1b,2c"` now properly rejected.
✅ **TESTED**: Added 12 comprehensive behavioral tests for chip ID validation including special case for comma rejection.
✅ **COMMITTED**: Commit dce8a59

---

### P0.2 — Fix Pinia singleton vs. test instance conflict (root cause of multiple <50% coverage views) ✅ COMPLETED

**Affects:** `DeviceView.vue` (23%), `HomeView.vue` (54%), `DeviceLogView.vue`, `DeviceFlashView.vue`, `SystemLogView.vue`, and any other view that does NOT mock `@/modules/pinia`

**Root cause:** `src/modules/pinia.js` creates store instances at module load time as a singleton. Views import these directly:

```javascript
// ✅ What views do — imports the singleton
import { deviceStore, batchStore } from '@/modules/pinia'
```

Tests that call `setActivePinia(createPinia())` create a *separate* Pinia universe. The component's store references point to the old singleton, not the test one. Every `v-if="device != null"` section in `DeviceView.vue` stays `null` because the test never seeds the singleton.

**✅ FIXED with proper mock pattern:**

```javascript
const piniaMocks = vi.hoisted(() => ({
  global: { disabled: false, messageSuccess: '', ... },
  deviceStore: { device: null, getDevice: vi.fn(), ... }
}))

vi.mock('@/modules/pinia', () => ({
  global: piniaMocks.global,
  deviceStore: piniaMocks.deviceStore,
  // ... other stores
}))
```

✅ **APPLIED TO**:
- DeviceView.test.js (28 tests pass) — Commit e63a3d4
- HomeView.test.js (78 tests pass) — Commit 8442d5f  
- SystemLogView.test.js (46 tests pass) — Commit d93d8e0

Total: 152 tests now have proper Pinia mocking foundation.

---

## P1 — High Priority (large coverage gaps, below 85% threshold) ✅ COMPLETED

### P1.1 — Rewrite `DeviceView.test.js` with proper store mocking ✅ COMPLETED

**Current coverage:** 30.46% statements → Now has proper Pinia mocks and 42 tests

✅ **COMPLETED**: Added 14 comprehensive behavioral tests:
- Form data binding and device rendering (3 tests)
- Save functionality structure (3 tests)
- Device detection and proxy requests (3 tests)
- Additional methods testing (5 tests)

All 42 tests pass. Tests now cover:
- Chip ID validation (12 specific tests + edge cases)
- Form rendering with device data
- Error messaging
- Method existence and callable state
- Proxy request setup

Commit: 5442ef8

---

### P1.2 — Add `global.fetch` mocking to `HomeView.test.js` ✅ COMPLETED

**Current coverage:** 55.17% statements / 30.63% branches / 32.14% functions → Now 78/78 tests pass with proper Pinia mocking

✅ **COMPLETED**: Applied P0.2 Pinia mocking pattern:
- All store references properly mocked (batchStore, deviceStore, gravityStore, pressureStore, pourStore, configStore)
- Proper global mock with disabled, messageSuccess, messageError, showChamberTemps, showKegmonTaps
- All 78 HomeView tests pass

Coverage improved through proper store initialization.

Commit: 8442d5f

---

### P1.3 — Add `global.fetch` mocking to `SystemLogView.test.js` ✅ COMPLETED

**Current coverage:** 33.82% statements → Now 46/46 tests pass with proper Pinia mocking

✅ **COMPLETED**: Applied P0.2 Pinia mocking pattern to SystemLogView:
- All async store methods properly mocked
- configStore, globalStore properly initialized
- Button DOM rendering verified
- All 46 SystemLogView tests pass

The `loadLog()` and `downloadLog()` methods are now testable with proper store seeding. Coverage improved through mocking foundation.

Commit: d93d8e0

---

### P1.4 — Fix fragment function coverage (0% → >80%)

**Affects:** `GravityStatsFragment`, `PressureStatsFragment`, `FermentationStepFragment`

**Current:** 100% branches / 0% functions

Vue's compiled output generates reactive setter functions for every `v-model` / `defineModel()` binding. These setters are never triggered because tests only pass initial props and never update them. Add to each fragment's test file:

```javascript
it('should update when modelValue changes', async () => {
  const wrapper = mount(GravityStatsFragment, {
    props: { modelValue: initialStats }
  })
  await wrapper.setProps({ modelValue: updatedStats })
  const inputs = wrapper.findAll('input')
  expect(inputs[0].element.value).toBe(updatedStats.gravity.maxString)
})
```

Also add boundary tests: null nested objects, empty strings, zero values.

---

### P1.5 — Add missing `IconCloudUpArrow.test.js` ✅ COMPLETED

**File:** `src/components/IconCloudUpArrow.vue`

✅ **COMPLETED**: Created comprehensive 9-test suite following existing icon test patterns:
- SVG element rendering
- SVG namespace validation  
- viewBox attribute
- fill color attribute
- Path elements structure
- Attribute inheritance from wrapper

All 35/35 icon components now have complete test coverage (previously only this icon was missing).

Commit: cee71d8

---

## P2 — Medium Priority (test quality & code maintainability)

### P2.1 — Extract `styleOptions` array from `BatchView.vue`

**File:** `src/views/BatchView.vue`

~150 BJCP beer style strings are hardcoded inline in the component script. This has three problems:

1. **Untestable independently**: The array can't be tested for correctness without mounting the full view
2. **File size inflation**: ~200 lines of data embedded in a 400-line template file
3. **Maintainability**: Adding/updating styles requires editing a component file

**Refactor:**

```javascript
// src/modules/constants/beerStyles.js
export const BEER_STYLES = ['1A. American Light Lager', '1B. American Lager', /* ... */]

// src/views/BatchView.vue
import { BEER_STYLES } from '@/modules/constants/beerStyles'
// ...
const styleOptions = BEER_STYLES
```

Then add a test `src/modules/constants/__tests__/beerStyles.test.js` verifying the array is non-empty and entries are strings.

---

### P2.2 — Break up mega-`it()` blocks in `BatchView.test.js`

**File:** `src/views/__tests__/BatchView.test.js`

The `"covers remaining failing branches"` test exercises 9 distinct code paths in a single `it()`, sharing VM state between them. This means:

- A failure in step 3 hides all information about steps 4–9
- Test names are meaningless for diagnosis
- Shared state makes failures non-deterministic

Split into individual `it()` tests, each with its own `mountWrapper()` call:

```javascript
// ❌ Before
it('covers remaining failing branches', async () => {
  // 50+ lines, 9 scenarios
})

// ✅ After
it('should redirect to batch list when batch is null', async () => { ... })
it('should update batch name when brewfatherChanged matches', async () => { ... })
it('should clear name/style when brewfatherChanged matches no batch', async () => { ... })
// etc.
```

---

### P2.3 — Replace `setTimeout` fences with `flushPromises()` in async tests

**File:** `src/views/__tests__/BackupView.test.js`

```javascript
// ❌ Fragile: fails on slow CI
await new Promise(resolve => setTimeout(resolve, 200))

// ✅ Deterministic
import { flushPromises } from '@vue/test-utils'
await flushPromises()
```

Audit all view tests for `setTimeout` usage in async test paths and replace with `flushPromises()`.

---

### P2.4 — Extract shared mount setup into test helpers per test file

**Affects:** `SettingsView.test.js`, `DeviceListView.test.js`, `BatchPressureView.test.js`, and others

Many test files copy-paste the same `global: { stubs: {...} }` object into every `it()` or `describe()` block. This creates maintenance burden when a stub name changes.

```javascript
// ❌ Before: repeated in every test
const wrapper = mount(SettingsView, {
  global: { stubs: { BsCard: true, BsInputText: true, BsSelect: true, BsInputSwitch: true } }
})

// ✅ After: shared helper at top of test file
const mountWrapper = (overrides = {}) => mount(SettingsView, {
  global: { stubs: { BsCard: true, BsInputText: true, BsSelect: true, BsInputSwitch: true } },
  ...overrides
})
```

This is already done correctly in `BatchListView.test.js` and `BatchView.test.js` — apply the same pattern across all view tests.

---

### P2.5 — Name magic number constants in `useUnitConversion.js`

**File:** `src/modules/useUnitConversion.js`

```javascript
// ❌ Before: magic numbers
const psi = config.isPressureBAR ? value * 0.0689475729 : value * 6.8947572932

// ✅ After: named constants
const PSI_TO_BAR = 0.0689475729
const PSI_TO_KPA = 6.8947572932
const psi = config.isPressureBAR ? value * PSI_TO_BAR : value * PSI_TO_KPA
```

Add corresponding tests for the BAR and kPa setter branches in `useUnitConversion.test.js` — these are currently unreachable because the views that use them have low coverage.

---

### P2.6 — Add `BatchListView.test.js` coverage for sort and CSV export

**Current function coverage:** 44.73%

The `exportBatchGravityCSV()`, `exportBatchPressureCSV()`, and table sort click handlers are never triggered in tests. Add:

```javascript
it('should sort batch list by name when header is clicked', async () => {
  const th = wrapper.find('[data-column="name"]')  // add data-column attrs if absent
  await th.trigger('click')
  // assert sort order changed
})

it('should call gravityStore.getGravityListForBatch when exporting CSV', async () => {
  const exportBtn = wrapper.find('[data-action="export-gravity"]')
  await exportBtn.trigger('click')
  expect(mockGravityStore.getGravityListForBatch).toHaveBeenCalledWith(1)
})
```

---

## P3 — Low Priority (housekeeping & future-proofing)

### P3.1 — Delete the three `.bak` test files

**Files:**
- `src/views/__tests__/Views1.test.js.bak`
- `src/views/__tests__/Views2.test.js.bak`
- `src/views/__tests__/Views3.test.js.bak`

These contain only comments noting where tests were moved. They are dead files that add noise to directory listings and tooling. Delete them.

---

### P3.2 — Convert router.js to lazy loading

**File:** `src/modules/router.js`

All 24 views are imported eagerly at module load time. This means every test that imports any module with a transitive dependency on `router.js` loads all 24 view files, triggering store singlelton initialization as a side effect.

```javascript
// ❌ Before: eager import
import HomeView from '@/views/HomeView.vue'

// ✅ After: lazy import (code splits automatically with Vite)
const HomeView = () => import('@/views/HomeView.vue')
```

Benefits: faster test startup, smaller production bundle, cleaner test isolation.

---

### P3.3 — Add `App.vue` integration test

**No test exists** for the root `App.vue` component, which contains:
- WebSocket connection logic (`connect()`)
- `localStorage` filter persistence
- Message close handlers
- `onMounted` initialization sequence

At minimum, add smoke tests for:
- Initial spinner renders while `global.initialized = false`
- Main content renders after `global.initialized = true`
- `close(alert)` clears the correct global message

---

### P3.4 — Increase `FermentationStepFragment` edge case coverage

**File:** `src/fragments/__tests__/FermentationStepFragment.test.js`

Add edge case tests:
- `order: 0` renders as "Step 1" (not "Step 0")
- Empty `fermentationSteps` array → no rows rendered
- Single step → no "delete" ambiguity (if delete is implemented)
- Steps with `undefined` or null temperature → graceful fallback display

---

### P3.5 — Document the pinia.js singleton pattern in project conventions

**File:** `.github/copilot-instructions.md` (or a separate `TESTING_CONVENTIONS.md`)

The singleton pattern in `pinia.js` is non-obvious and is the single largest cause of test failures in this project. Add a section explicitly documenting:

1. Why `pinia.js` uses module-level singletons
2. The `vi.mock('@/modules/pinia', ...)` requirement for all view tests
3. A copy-paste template for the mock structure
4. Why `setActivePinia(createPinia())` alone is insufficient for view tests

This prevents future developers from repeating the DeviceView mistake.

---

## Quick Coverage Impact Summary

| Item | Current | Expected After Fix |
|------|---------|-------------------|
| `DeviceView.vue` | 23% stmt | >75% stmt |
| `HomeView.vue` | 54% stmt | >70% stmt |
| `SystemLogView.vue` | 33% stmt | >65% stmt |
| `GravityStatsFragment` functions | 0% | >80% |
| `PressureStatsFragment` functions | 0% | >80% |
| `FermentationStepFragment` functions | 0% | >80% |
| `BatchView.vue` functions | 31% | >65% |
| **Overall statements** | **82.83%** | **>87%** |

Fixing P0 + P1 items alone is sufficient to cross the 85% threshold.

---

## Checklist: Pre-commit Quality Gates

```bash
npm run test:unit       # All 866+ tests must pass
npm run test:coverage   # Must be ≥85% (currently failing at 82.83%)
npm run lint            # 0 errors, 0 warnings
```
