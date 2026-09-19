# BrewLogger UI - Project Improvement Recommendations

This document outlines prioritized recommendations for improving the BrewLogger UI codebase, focusing on consistency, testability, maintainability, and documentation.

## 1. Codebase Consistency
**Priority: High**

*   **Enforce Data Class Pattern**: While most data models follow the `src/modules/classes/` pattern, ensure all future models are strictly co-located with their unit tests in the `__tests__/` subdirectory of the class folder.
*   **Barrel Export Check**: Verify that all new components and classes are properly registered in their respective barrel files (e.g., `src/modules/classes/index.js`).
*   **ID Uniqueness in Components**: `BsInputTextAreaFormat.vue` uses hardcoded IDs (`textArea`, `contextMenu`), which prevents multiple instances on the same page. 
    *   *Action*: Refactor to use unique generated IDs or `ref` for DOM manipulation.
*   **Vue Options API vs. Composition API**: Some views might still use patterns that feel like Options API or mixed styles. Ensure a consistent "Script Setup" approach across all new components.

## 2. Test Coverage Gaps
**Priority: High**
*Current Statement Coverage: 85.21% (Target: >85%)*

*   **View Testing Strategy**: Several views have low coverage (e.g., `DeviceView.vue` at 47.68%, `HomeView.vue` at 67.98%). 
    *   *Action*: Implement standard Pinia mocking patterns in `src/views/__tests__/` to test view lifecycle and state interactions without side effects.
*   **Fragment Coverage**: `GravityStatsFragment.vue` and `PressureStatsFragment.vue` are at ~57%. These are critical for dashboard accuracy.
*   **Complex Component Logic**: `BsInputTextAreaFormat.vue` is only at 47.61% statement coverage. Given its complexity (context menus, template tags), this is a high-risk area.
*   **Pinia Store Actions**: `pinia.js` utilities for handling config state and changes have uncovered lines (99-100, 108-119). These are core to the application's configuration persistence.

## 3. UI/UX Improvements
**Priority: Medium**

*   **Accessibility (a11y)**: Many form components use `BsInputBase` but lack explicit `for/id` associations for labels, which is a significant accessibility issue.
*   **Bootstrap Integration**: The custom components are inspired by Bootstrap but sometimes bypass its utility classes. Ensure consistent use of standard Bootstrap layout classes (`row`, `col-md-*`) in fragments.
*   **Loading & Error States**: Improve the uniformity of `BsMessage` usage across views, especially when API calls fail or data is loading.

## 4. Performance & Maintainability
**Priority: Medium**

*   **Circular Dependencies**: Check for potential circular dependencies between stores and the `pinia.js` singleton module. 
*   **Large View Components**: Views like `DeviceView.vue` and `HomeView.vue` are becoming quite large.
    *   *Action*: Extract logical sections into new "Fragments" in `src/fragments/`.
*   **Asset Compression**: Utilize the `vite-plugin-compression` more aggressively for production builds to minimize the JS bundle size.

## 5. Documentation
**Priority: Low**

*   **JSDoc**: Many stores (`batchStore.js`, `deviceStore.js`) and classes lack structured JSDoc comments for methods and properties.
*   **README Expansion**: The root `README.md` is very brief.
    *   *Action*: Add a "Getting Started" section, "Dev Workflow" (referencing the ground rules), and "Troubleshooting" common test environment issues.
*   **API Documentation**: Maintain a simple markdown file or collection of Swagger/OpenAPI snippets for the expected backend responses to help with mocking in tests.

## 6. Development Workflow
**Priority: Medium**

*   **Linting Strictness**: Current ESLint config is relatively permissive (`flat/essential`).
    *   *Action*: Move towards `flat/recommended` or `flat/strongly-recommended` for better Vue template checking.
*   **Pre-commit Hooks**: Implement `husky` and `lint-staged` to ensure `npm run lint` and `npm run test:unit` pass before any code is committed.
