#!/bin/bash

# This searches the list of docker networks for the network name in order to get the ID, then (below) uses that ID
# to infer the docker interface name.
DOCKER_INTERFACE=$(docker network list | grep "${DOCKER_NETWORK_NAME}" | awk '{print $1}')

echo "Docker:   ${DOCKER_INTERFACE}"
echo "Repeater: ${USE_MDNS_REPEATER}"
echo "External: ${EXTERNAL_INTERFACE}"
echo "Options:  ${OPTIONS}"

# Below is for future use in case I want to try to auto-detect the external interface
#NON_VIRTUAL_INTERFACES=($(ip addr | grep "state UP" -A2 | awk '/inet/{print $(NF)}' | grep -P '^(?:(?!veth).)*$' | tr '\n' ' '))

if [[ ${USE_MDNS_REPEATER} -eq 1 ]]; then
  echo "Starting MDNS repeater"
  exec mdns-repeater -f ${OPTIONS} "${EXTERNAL_INTERFACE}" "br-${DOCKER_INTERFACE}"
else
  # If the local user has disabled the app, then just sleep forever
  sleep infinity
fi
