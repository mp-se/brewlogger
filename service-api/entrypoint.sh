#!/bin/bash

python3 migrate/migrate.py
uvicorn api.main:app --host 0.0.0.0 --port 80 --log-config log_conf.yaml
