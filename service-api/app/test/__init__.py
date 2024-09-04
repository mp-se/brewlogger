import os

file = "brewlogger.sqlite"
if os.path.exists(file):
    os.remove(file)
