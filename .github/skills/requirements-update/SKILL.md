---
name: requirements-update
description: 'Update, regenerate, or pin Python package requirements for brewlogger services. Use when: updating dependencies, upgrading packages to latest versions, regenerating requirements.txt from requirements.in, adding new packages, or running pip-compile. Covers service-api, service-ble, service-log, service-mdns.'
argument-hint: 'Optional: specify a service name (service-api, service-ble, service-log, service-mdns) or leave blank to update all'
---

# Requirements Update

Manages Python package dependencies across all brewlogger services using `pip-compile`.

## Environment

- **Python venv**: `/Users/dev/brewlogger/.env/`
- **pip-compile binary**: `/Users/dev/brewlogger/.env/bin/pip-compile`
- **pip binary**: `/Users/dev/brewlogger/.env/bin/pip`

## Repository Structure

Each service has a `requirements.in` source file that is compiled to `requirements.txt`:

| Service | Source `.in` | Compiled `.txt` | Notes |
|---------|-------------|-----------------|-------|
| `service-api` | `requirements/requirements.in` | `requirements/requirements.txt` | Main API deps |
| `service-api` | `requirements/test-requirements.in` | `requirements/test-requirements.txt` | Test deps (includes `-r requirements.txt`) |
| `service-ble` | `requirements.in` | `requirements.txt` | Uses `--generate-hashes` |
| `service-log` | `requirements.in` | `requirements.txt` | Plain pip-compile |
| `service-mdns` | `requirements.in` | `requirements.txt` | Plain pip-compile |

**Never edit `requirements.txt` directly** — always edit the `.in` source file and recompile.

## Procedure

### Upgrade all services to latest versions

```bash
PIP_COMPILE=/Users/dev/brewlogger/.env/bin/pip-compile

# service-api
cd /Users/dev/brewlogger/service-api
$PIP_COMPILE --upgrade --output-file=requirements/requirements.txt requirements/requirements.in
$PIP_COMPILE --upgrade --output-file=requirements/test-requirements.txt requirements/test-requirements.in

# service-ble (hashes required)
cd /Users/dev/brewlogger/service-ble
$PIP_COMPILE --upgrade --generate-hashes --strip-extras --output-file=requirements.txt requirements.in

# service-log
cd /Users/dev/brewlogger/service-log
$PIP_COMPILE --upgrade --output-file=requirements.txt requirements.in

# service-mdns
cd /Users/dev/brewlogger/service-mdns
$PIP_COMPILE --upgrade --output-file=requirements.txt requirements.in
```

### Add a new package

1. Add the package name to the appropriate `requirements.in` file
2. Run pip-compile for that service (without `--upgrade` to only resolve the new package):

```bash
/Users/dev/brewlogger/.env/bin/pip-compile --output-file=requirements/requirements.txt requirements/requirements.in
```

### Pin a specific version

Edit the `.in` file with a constraint, e.g. `fastapi>=0.100,<1.0`, then recompile.

### Regenerate without upgrading (resolve only)

Omit `--upgrade` — pip-compile will keep existing pins and only resolve new/changed constraints.

## After Updating

1. **Install updated deps** in the venv:
   ```bash
   /Users/dev/brewlogger/.env/bin/pip install -r service-api/requirements/requirements.txt
   /Users/dev/brewlogger/.env/bin/pip install -r service-api/requirements/test-requirements.txt
   ```

2. **Run tests** to verify nothing is broken:
   ```bash
   cd /Users/dev/brewlogger/service-api
   /Users/dev/brewlogger/.env/bin/pytest app/test/ -q
   ```

3. **Commit** the updated `.txt` files (and any `.in` changes):
   ```bash
   git add service-api/requirements/ service-ble/requirements.txt service-log/requirements.txt service-mdns/requirements.txt
   git commit -m "Update requirements to latest versions"
   ```

## Notes

- `service-ble` uses `--generate-hashes` for supply-chain security — do not remove this flag
- The `test-requirements.in` uses `-r requirements.txt` so test deps inherit all prod deps
- `pip-compile` is installed in the project venv, not system Python
