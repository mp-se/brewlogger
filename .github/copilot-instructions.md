---
name: brewlogger-ui
description: "Project structure, coding conventions, and development workflow for BrewLogger UI - a Vue 3 + Pinia application for brewing batch management and sensor data logging."
---

# BrewLogger UI — Development Ground Rules & Workflow

This document outlines the architectural patterns, project structure, and development practices for the BrewLogger UI project.

## Project Overview

BrewLogger UI is a Vue 3 application using:
- **Framework**: Vue 3 with Composition API
- **State Management**: Pinia (Vue stores)
- **Testing**: Vitest
- **Build**: Vite
- **Styling**: CSS (Bootstrap-inspired custom components)

---

## Project Structure

### Directory Layout

```
src/
├── App.vue                 # Root component
├── main.js               # Application entry point
├── components/           # Reusable UI components (stateless)
│   ├── BsCard.vue
│   ├── BsInput*.vue      # Form input components
│   ├── BsModal*.vue      # Modal components
│   ├── Icon*.vue         # Icon components
│   └── README.md
├── modules/              # Core application logic
│   ├── classes/          # Data model classes
│   │   ├── Batch.js
│   │   ├── Device.js
│   │   ├── FermentationStep.js
│   │   ├── Gravity.js
│   │   ├── MDNS.js
│   │   ├── Pour.js
│   │   ├── Pressure.js
│   │   ├── BrewfatherBatch.js
│   │   ├── index.js      # Barrel export
│   │   └── __tests__/    # Unit tests for data classes (co-located with implementation)
│   │       ├── Batch.test.js
│   │       ├── Device.test.js
│   │       ├── FermentationStep.test.js
│   │       ├── Gravity.test.js
│   │       ├── MDNS.test.js
│   │       ├── Pour.test.js
│   │       ├── Pressure.test.js
│   │       └── BrewfatherBatch.test.js
│   ├── __tests__/        # Unit tests for store and utility files
│   │   ├── batchStore.test.js
│   │   ├── brewfatherStore.test.js
│   │   ├── configStore.test.js
│   │   ├── deviceStore.test.js
│   │   ├── globalStore.test.js
│   │   ├── gravityStore.test.js
│   │   ├── logger.test.js
│   │   ├── pourStore.test.js
│   │   ├── pressureStore.test.js
│   │   ├── utils.test.js
│   │   └── ...
│   ├── batchStore.js
│   ├── brewfatherStore.js
│   ├── deviceStore.js
│   ├── configStore.js
│   ├── globalStore.js
│   ├── gravityStore.js
│   ├── pourStore.js
│   ├── pressureStore.js
│   ├── logger.js
│   ├── pinia.js
│   └── ...
├── views/                # Full page components
├── fragments/            # Reusable page sections
└── templates/
```

---

## Data Class Organization

### Ground Rules

1. **Single File per Class**: Each data model class lives in its own file
2. **Location**: `src/modules/classes/ClassName.js`
3. **Exports**: Classes are exported via barrel export in `src/modules/classes/index.js`
4. **Imports**: Import classes using `import { ClassName } from '@/modules/classes'`

### Classes Structure

Each class file should contain:
- Class definition with constructor
- Static factory methods (`fromJson()`, `fromDashboardJson()`, etc.)
- Static comparison methods (`compare()` if applicable)
- Getters and setters for all properties
- Serialization method (`toJson()`)

### Example: Batch.js

```javascript
export class Batch {
  constructor(id, name, description, /* ... */) {
    this.id = id === undefined ? 0 : id
    // ... initialization with defaults
  }

  static fromJson(b) {
    // Factory method to create from API response
  }

  toJson() {
    // Serialization for API requests
  }

  get id() { return this._id }
  set id(id) { this._id = id }
}
```

---

## Store Files (Pinia)

### Ground Rules

1. **Store per Domain**: One store file per data domain (batch, device, gravity, etc.)
2. **Location**: `src/modules/*Store.js`
3. **Imports**: Import data classes from `@/modules/classes`
4. **Definition**: Use `defineStore()` from Pinia
5. **Structure**: State → Getters → Actions

### Store Template

```javascript
import { defineStore } from 'pinia'
import { DataClass } from '@/modules/classes'

export const useXxxStore = defineStore('xxx', {
  state: () => ({ /* ... */ }),
  getters: { /* ... */ },
  actions: {
    async load() { /* ... */ },
    async save() { /* ... */ }
  }
})
```

---

## Test File Organization

### Ground Rules

1. **Class Tests Co-located**: Test files for classes go in `src/modules/classes/__tests__/` subdirectory within the same folder as the class implementation
2. **Store Tests Separate**: Test files for stores go in `src/modules/__tests__/` subdirectory (legacy location for non-class tests)
3. **Naming Convention**:
   - Class tests: Match the class name exactly - `ClassName.test.js` (e.g., `Batch.test.js`, `Device.test.js`, `BrewfatherBatch.test.js`)
   - Store tests: `storeNameStore.test.js` (e.g., `batchStore.test.js`, `configStore.test.js`)
   - Utility tests: `utilName.test.js` (e.g., `logger.test.js`, `utils.test.js`)
4. **File Imports**: Tests import classes from `@/modules/classes` (barrel export)
5. **Location**:
   - Class tests: `src/modules/classes/__tests__/ClassName.test.js`
   - Store/utility tests: `src/modules/__tests__/storeName.test.js`

### Example Test Structure

```javascript
import { describe, it, expect } from 'vitest'
import { Batch } from '@/modules/classes'

describe('Batch - Data Class', () => {
  describe('Constructor', () => {
    it('should create with default values', () => {
      const batch = new Batch()
      expect(batch.id).toBe(0)
    })
  })
})
```

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|-----------|---------|
| Vue Component | PascalCase | `BsCard.vue`, `BsInputText.vue` |
| Data Class | PascalCase | `Batch.js`, `Device.js` |
| Store | camelCase + Store | `batchStore.js`, `configStore.js` |
| Test (Class) | camelCaseClass.test.js | `batchClass.test.js` |
| Test (Store) | camelStoreStore.test.js | `batchStore.test.js` |
| Utility | camelCase | `logger.js`, `detect.js` |

### Classes & Functions

| Type | Convention |
|------|-----------|
| Class Name | PascalCase | `Batch`, `Device`, `FermentationStep` |
| Constructor Method | constructor() |
| Static Method | PascalCase | `fromJson()`, `compare()` |
| Instance Method | camelCase | `toJson()`, `getId()` |
| Property | camelCase | `id`, `batchId`, `createdAt` |
| Getter | camelCase | `get id()` |
| Setter | camelCase | `set id()` |
| Private Property | _camelCase | `this._id` |

---

## Import/Export Patterns

### Importing Classes

```javascript
// ✅ CORRECT - Import from barrel export
import { Batch, Device, Gravity } from '@/modules/classes'

// ❌ AVOID - Direct file imports
import { Batch } from '@/modules/classes/Batch'
```

### Exporting from Classes

```javascript
// In src/modules/classes/Batch.js
export class Batch {
  // class definition
}

// In src/modules/classes/index.js
export { Batch } from './Batch'
```

### Importing in Store Files

```javascript
// In src/modules/batchStore.js
import { defineStore } from 'pinia'
import { Batch } from '@/modules/classes'

export const useBatchStore = defineStore('batchStore', {
  // store definition
})
```

### Importing in Test Files

```javascript
// In src/modules/__tests__/batchClass.test.js
import { describe, it, expect } from 'vitest'
import { Batch } from '@/modules/classes'

describe('Batch', () => {
  // tests
})
```

---

## Class Design Patterns

### Data Model Classes

Each data class should follow this pattern:

1. **Constructor with Defaults**: All parameters optional with sensible defaults
2. **Type Coercion**: Handle `undefined` and `null` gracefully
3. **Static Factory Methods**: `fromJson()` for API deserialization
4. **Instance Serialization**: `toJson()` for API serialization
5. **Getters/Setters**: Use `_propertyName` convention for private backing fields
6. **Immutable Design**: Consider properties as immutable where appropriate

### Example: Device.js

```javascript
export class Device {
  constructor(id, chipId, url, description, /* ... */) {
    this.id = id === undefined ? 0 : id
    this.chipId = chipId === undefined ? '' : chipId
    // Clean up invalid URLs
    if (this.url === 'http://' || this.url === 'https://') this.url = ''
  }

  static fromJson(d) {
    return new Device(d.id, d.chipId, d.url, /* ... */)
  }

  toJson() {
    return {
      chipId: this.chipId,
      url: this.url,
      // Only include defined properties
    }
  }

  static compare(d1, d2) {
    return d1.chipId === d2.chipId && d1.url === d2.url
  }
}
```

---

## Development Workflow

### 1. Adding a New Data Class

When adding a new data model:

```bash
# 1. Create file
touch src/modules/classes/NewClass.js

# 2. Implement class (see pattern above)
# 3. Export in barrel file
echo "export { NewClass } from './NewClass'" >> src/modules/classes/index.js

# 4. Create test file
touch src/modules/__tests__/newClass.test.js

# 5. Implement tests
# 6. Run tests
npm run test:unit
```

### 2. Adding a New Store

When adding a new Pinia store:

```bash
# 1. Create store file
touch src/modules/newStore.js

# 2. Import data classes from @/modules/classes
# 3. Implement store with defineStore()
# 4. Create test file
touch src/modules/__tests__/newStore.test.js

# 5. Implement store tests
# 6. Run tests
npm run test:unit
```

### 3. Creating Tests

All tests must be in `__tests__/` subdirectories:

```bash
# ✅ CORRECT
src/modules/__tests__/batchClass.test.js
src/modules/__tests__/batchStore.test.js

# ❌ WRONG
src/modules/batch.test.js
src/modules/batch/test.js
```

### 4. Refactoring/Moving Code

When moving or refactoring:

1. Keep imports consistent with barrel export pattern
2. Update all import paths in affected files
3. Run `npm run test:unit` to ensure no breaking changes
4. Run `npm run lint` to check code style

### 5. Code Review Checklist

Before committing:

- [ ] Classes in separate files under `src/modules/classes/`
- [ ] Single responsibility per file
- [ ] Tests in `__tests__/` subdirectory
- [ ] Imports use barrel export (`@/modules/classes`)
- [ ] All tests pass: `npm run test:unit`
- [ ] Lint passes with no errors or warnings: `npm run lint`
  - Deviations must be documented and approved
  - Use `// eslint-disable-next-line` only with justification comments
- [ ] Test coverage ≥ 85%: `npm run test:coverage`
  - Rejected if coverage drops below 85%
  - Document coverage gaps if they exist
- [ ] Static methods for deserialization (`fromJson()`)
- [ ] Instance methods for serialization (`toJson()`)

---

## Code Quality Standards

### Linting Requirements

1. **Zero Errors**: All code must pass linting without errors
2. **Zero Warnings**: All code must pass linting without warnings
3. **Deviation Approval**: Any lint deviations require:
   - Explicit justification comment
   - Use `// eslint-disable-next-line <rule>` with explanation
   - Review and approval before commit
4. **Configuration**: Lint rules are defined in `eslint.config.js`

### Test Coverage Requirements

1. **Minimum Coverage**: 85% across all modules
2. **Coverage Report**: Run `npm run test:coverage` before committing
3. **Coverage by Category**:
   - Statements: ≥85%
   - Branches: ≥85%
   - Functions: ≥85%
   - Lines: ≥85%
4. **Rejected if**: Coverage drops below 85%
5. **Gap Documentation**: Document any intentional coverage gaps

### Current Test Suite Status (Latest)

**Test Execution Summary** ✅
- **Total Tests**: 866 passing
- **Test Files**: 32 files
- **Overall Duration**: ~2.7s
- **All tests pass**: Yes ✅ (0 failures)

**Component Coverage** (35 components in /src/components/)
- **All components tested**: 100% (35/35)
- **Branch coverage**: 80.95%
- **Statement coverage**: 87.6%
- **Function coverage**: 68.62%
- **Key components**:
  - BsCard.vue: 100% statements, 85.71% branches
  - BsInputTextAreaFormat.vue: 47.61% statements, 50% branches
  - BsMenuBar.vue: 73.33% statements, 71.05% branches
  - All other components: ≥80% branch coverage

**Data Class Coverage** (8 classes in /src/modules/classes/)
- **All classes tested**: 100% (8/8)
- **Branch coverage**: 98.9%
- **Statement coverage**: 100%
- **Function coverage**: 100%
- **Line coverage**: 100%
- **Classes**: Batch, BrewfatherBatch, Device, FermentationStep, Gravity, MDNS, Pour, Pressure

**Fragment Coverage** (3 fragments in /src/fragments/)
- **All fragments tested**: 100% (3/3)
- **Branch coverage**: 100%
- **Statement coverage**: 62.22%
- **Fragments**: FermentationStepFragment, GravityStatsFragment, PressureStatsFragment

**Module/Store Coverage** (stores and utilities in /src/modules/)
- **Statement coverage**: 44.84%
- **Branch coverage**: 40.17%
- **Stores tested**: batchStore, brewfatherStore, configStore, deviceStore, globalStore, gravityStore, pourStore, pressureStore
- **Utilities tested**: detect.js, logger.js, ui.js, useUnitConversion.js, utils.js

**View Coverage** (page components in /src/views/)
- **Statement coverage**: 9.11% (views not yet extensively tested)
- **Note**: Views require integration testing; components are tested independently

---

### Quality Gates

```bash
# Pre-commit validation
npm run test:unit         # All tests must pass
npm run test:coverage     # Coverage must be ≥85%
npm run lint              # No errors or warnings
```

---

## Common Patterns & Anti-Patterns

### ✅ DO

- Put each class in its own file
- Use barrel exports for clean imports
- Keep tests in `__tests__/` subdirectories
- Use getters/setters for property access
- Handle `undefined` and `null` in constructors
- Create factory methods for deserialization
- Test both class factories and store actions independently

### ❌ DON'T

- Define multiple classes in one file
- Import directly from single class files (bypass barrel export)
- Store test files at root level of modules
- Mix store logic with class definitions
- Assume parameters are well-formed (always validate)
- Forget to update barrel exports when adding new classes
- Create circular dependencies between classes

---

## Tools & Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build             # Build for production

# Testing
npm run test:unit         # Run all unit tests
npm run test:coverage     # Generate coverage report (required: ≥85%)

# Code Quality
npm run lint              # Check code style (required: 0 errors, 0 warnings)
npm run format            # Format code

# Docker
docker-compose up         # Run with Docker
docker build -t brewlogger-ui .  # Build image
```

---

## Quick Reference: File Locations

| What | Where |
|------|-------|
| Vue component | `src/components/` |
| Data class | `src/modules/classes/ClassName.js` |
| Class test | `src/modules/classes/__tests__/ClassName.test.js` |
| Store | `src/modules/xxxStore.js` |
| Store test | `src/modules/__tests__/xxxStore.test.js` |
| Util test | `src/modules/__tests__/utilName.test.js` |
| Global config | `src/modules/globalStore.js` |
| Logger | `src/modules/logger.js` |

---

## Questions?

When uncertain:
1. Check existing similar implementations in the codebase
2. Refer to this document for the ground rules
3. Run tests to validate changes: `npm run test:unit`
