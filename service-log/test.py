# SPDX-License-Identifier: GPL-3.0-or-later
# Portions copyright (c) Magnus — https://github.com/mp-se/brewlogger

import os

files = []

# for f in os.listdir(path='log'):
#     if os.path.isfile(f):
#         files.append(f)

files = [f for f in os.listdir(path="log") if os.path.isfile("log/" + f)]
print(files)

# print(os.listdir(path='.'))
# print(os.listdir(path='log'))
