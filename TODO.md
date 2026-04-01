# New features

## Log collection
- ~~Add log collector as background task to save logs from devices using the websocket stream~~
- ~~Limit size of logs~~
- ~~Detect disconnect in logcollector and retry connection~~

## Pour
- Add option to clear pour data for a batch

## MDNS
- ~~Change MDNS repeater to use avahi instead, move python script for mdns scanning to separate container with priviliged access~~

## Device
- ~~Remove Brewpi as device type~~

## Chamber Controller
- ~~Add support for chamber controller in UI~~

## Fermentation Steps
- ~~Add support for chamber controller for fermentation profiles~~
- ~~Remove Brewpi integration~~

## Pressure
- Add support for pressure data including graphs for diplaying

## Gravity
- Create feature for gravity "velocity", figure out how to design this feature
- Read data from chamber controller to attach these to the gravity readings.

## System status
- Add option so that containers can register in redis so we can check if they are running or not (MDNS and BLE).

## LCM
- Upgrade to python 3.12

# Kegmon
- ~~Fetch temps from chamber controller~~

# Bugs

-
 