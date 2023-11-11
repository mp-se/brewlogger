#!/bin/bash

python3 gravitymon_scan.py &
python3 tilt_scan.py &

sleep infinity
