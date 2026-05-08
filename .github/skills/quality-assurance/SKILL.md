---
name: quality-assurance
description: 'Run quality assurance checks for brewlogger: pylint 10/10 lint score, test coverage, passing tests. Use when: running QA, fixing lint errors, checking code quality, ensuring pylint score is 10.00/10, adding test coverage, running pytest, approving lint deviations/suppressions, fixing pylint warnings, achieving clean code.'
argument-hint: 'Optional: "lint", "tests", "coverage", or leave blank to run full QA suite'
---

# Quality Assurance

Full QA pipeline for the `service-api`: pylint must score **10.00/10**, all tests must pass, and deviations from lint rules require explicit user approval before suppression.

## Environment

- **Python venv**: `/Users/dev/brewlogger/.env/`
- **Working directory**: `/Users/dev/brewlogger/service-api/`
- **Pytest binary**: `/Users/dev/brewlogger/.env/bin/pytest`
- **Pylint binary**: `/Users/dev/brewlogger/.env/bin/pylint`
- **Pylint target**: `app/` directory

## Procedure

### 1. Run Tests

```bash
cd /Users/dev/brewlogger/service-api
/Users/dev/brewlogger/.env/bin/pytest app/test/ -q
```

All tests must pass. If tests fail, fix them before proceeding to lint.

To check coverage:

```bash
/Users/dev/brewlogger/.env/bin/pytest app/test/ --cov=app --cov-report=term-missing -q
```

### 2. Run Pylint

```bash
cd /Users/dev/brewlogger/service-api
/Users/dev/brewlogger/.env/bin/pylint app/
```

Target score: **10.00/10**. The final line of output shows the score:
```
Your code has been rated at 10.00/10
```

### 3. Triage Lint Issues

For each category of issues found, apply this decision tree:

| Issue Type | Action |
|-----------|--------|
| Real bug / bad code | **Fix the code** |
| Style / formatting | **Fix the code** |
| Line too long (C0301) | **Fix the code** — break the line |
| Missing docstring (C0114/C0115/C0116) | **Fix the code** — add docstring |
| Duplicate code (R0801) | **Ask user to approve** file-level disable |
| ML/DB naming convention (e.g. `X_scaled`, `Session`) | **Ask user to approve** inline disable |
| Too many statements/locals in complex logic | **Ask user to approve** file-level disable |
| False positive structural issue | **Ask user to approve** disable |

### 4. Handling Deviations (Suppressions)

**Never add a `# pylint: disable` without user approval.** For each proposed suppression:

1. Show the user the exact issue:
   ```
   app/api/services/batch.py:45:0: R0801: Similar lines in 2 files (duplicate-code)
   ```
2. Explain why it cannot be fixed in code
3. Show the proposed suppression comment
4. **Ask the user**: "Should I accept this deviation?"
5. Only add the disable after explicit approval

#### Suppression placement guidelines

- **File-level** (top of file, after module docstring): for issues affecting the whole file
  ```python
  # pylint: disable=duplicate-code
  ```
- **Inline** (end of the offending line): for single-line issues
  ```python
  Session = sessionmaker(...)  # pylint: disable=invalid-name
  ```
- **Block** (around specific code): for localized issues
  ```python
  # pylint: disable=too-many-locals
  ... complex function ...
  # pylint: enable=too-many-locals
  ```

### 5. Common Accepted Deviations in This Codebase

These have already been approved and are present in the codebase:

| Code | Reason | Scope |
|------|--------|-------|
| `R0801` (duplicate-code) | FastAPI router boilerplate is structurally identical | File-level in routers/tests |
| `C0415` (import-outside-toplevel) | Conditional imports in test fixtures | Test files only — **not** production code |
| `R0903` (too-few-public-methods) | SQLAlchemy ORM models only need column definitions | ORM model classes |
| `invalid-name` for `Session` | SQLAlchemy convention — scoped_session factory is capitalized | `session.py`, `dump.py`, `migrate.py` |
| `invalid-name` for `X_scaled` | scikit-learn convention — uppercase X for feature matrices | `predict_python.py` |
| `R0915` (too-many-statements) | Complex migration/router functions | `migrate.py`, `pressure.py`, `brewfather.py` |
| `R0914` (too-many-locals) | ML prediction and batch processing logic | `predict_python.py`, `batch.py` |
| `C0302` (too-many-lines) | Comprehensive test files | `test_gravity.py`, `test_pressure.py` |

### 6. Final Verification

After all fixes and approved suppressions:

```bash
cd /Users/dev/brewlogger/service-api

# Tests must pass
/Users/dev/brewlogger/.env/bin/pytest app/test/ -q

# Lint must be 10.00/10
/Users/dev/brewlogger/.env/bin/pylint app/
```

Both must succeed before committing.

## Lint Issue Priority

Fix in this order:
1. **E** (Errors) — must fix, likely broken code
2. **W** (Warnings) — must fix, bad practices
3. **C** (Convention) — fix the code first, suppress only with approval
4. **R** (Refactor) — fix if feasible, suppress with approval if structural
5. **I** (Info) — usually acceptable as-is

## Tips

- Run `pylint app/ 2>&1 | grep -E "^[A-Z]" | sort | uniq -c | sort -rn` for a summary of issue counts by code
- Use `pylint app/ --output-format=text 2>&1 | grep "C0116"` to filter a specific code
- The `--score=y` flag (default) always shows the final score line
