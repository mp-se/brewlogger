

# References

https://www.patrick-muehlbauer.com/articles/python-docker-compose-vscode

# Compile the requirements

To create the requirements use these options to determine the correct versions.

Postgres needs to be on the to PATH for the scripts to work. On MacOS use this command.
```
export PATH="$PATH:/Applications/Postgres.app/Contents/Versions/latest/bin"
```

From repository root:
```
pip install pip-tools
pip-compile -U -o service-api/requirements/requirements.txt
pip-compile --output-file=service-api/requirements/test-requirements.txt service-api/requirements/test-requirements.in
```

# Setting up a development environment
## Install venv

These commands will create a virtual environment so it can be run locally without building a docker image.

```
python -m venv .env
.env/Scripts/Activate.ps1
python -m pip install -r service-api/requirements/test-requirements.txt
python -m pip install -e . --no-deps
```

## Running the test

This command will run all the API tests.

```
cd service-api/app
pytest
```

Use this option if only specific tests should be run.

```
cd service-api/app
pytest -k device
```

## Starting the service for http://localhost:8000

This will run the server locally listening on port 8000

```
cd service-api/app
fastapi dev api/main.py
```

or

```
uvicorn --reload --port 8000 api.main:app --env-file ../.development_env --log-config ./log_conf.yaml --lifespan on
```

## Database migration

This will run the database migration scripts for Postgres

```
python api.db_migration --env-file ../.development_env

```

## Validating code standards

Use pre-commit to validate the code

```
pre-commit run --all-files
```


## Git commands

Add a new tag
```
git tag -a [tag_name] HEAD -m "Tag message"
git push origin tag [tag_name]
```