![Docker Pulls](https://img.shields.io/docker/pulls/mpse2/brewlogger-api)
![release](https://img.shields.io/github/v/release/mp-se/brewlogger?label=latest%20release)
![issues](https://img.shields.io/github/issues/mp-se/brewlogger)
![pr](https://img.shields.io/github/issues-pr/mp-se/brewlogger)

# BrewLogger

This project started as a testing suite for my brewing device software, especially Gravitymon. I needed a way to collect
and analyse the data for further improving the software. It has since been extended to be used as my fermentation tracking
software as a complement to Brewfather which I use for recepie design and tracking what beer I have.

## Features

This is a short list of features that has been implemented into the Brewlogger software

- Keeping a registry of devices, currently supports: GravityMon, KegMon, GravityMon Gateway, Brewpi (ESP version by Thorrak)
- Keeping track of batches that contains Gravity data.
- Visualing data collected from GravityMon (Gravity, Angle, Battery, Temperature, RSSI) and Brewpi (Frige Temperature)
- Analysing, Visulizing and Creating gravity formulas for GravityMon
- Importing data from Brewfather and connect that to batches
- Controlling Brewpi fermentation chamber according to scheule from Brewfather
- Importing data via HTTP or Bluetooth

### Features on the wish list

- Keeping track of batches that contain pour data (KegMon)
- Keeping track of batches that contain pressure data (PressureMon)
- Taplist for showing whats serving and what is available (Might be a separate application using the common API's)

### Release history

- 0.7.0 First stable testing version

- 0.8.0 Updated with new features
  - Feature: Refactored user interface to avoid data fetching, this will also allow for multiple devices interacting with the API's
  - Feature: Added support for pour data from Kegmon as well as fetching batches from Brewlogger (a must if pour storing is used)
  - Feature: Added sorting of lists in UI to easier find what you are looking for.
  - Bug: Caching of data from brewfather was invalidated to quickly
  - Feature: Adding option to disable individual pour records
  - Bug: Fixed problem with not beeing able to create a batch without connected gravity device.
  - Feature: Refactor mDNS repeater to use AVAHI driver instead. mDNS container will now scan and store results in the Redis Cache.
  - Bug: Not able to store changes when a record has just been created. 


## Installation

Installation requires a docker runtime (or k8s) where a stack can be deployed (a stack is a set of docker containers). I personally use portainer which is an excellent management software for containers.

It consists of the following containers.

- **brewlogger-web**; Web interface and webserver as the main entry point to the stack and uses the Server API's
- **brewlogger-api**; Server with the API's for the web interface
- **brewlogger-cache**; Redis cache for temporary data storage
- **brewlogger-db**; Postgres Database for persistent storage
- **brewlogger-mdns** [Optional]; Scans for mDNS devices on the local network and stores these in the Redis Cache for consumption by the API. If not deployed discovery of brewing devices will not work.
- **brewlogger-ble** [Optional]; BLE scanner that forwards data to the Server API's. If not deployed BLE data from GravityMon will not be captured. An option is to use GravityMon-Gatway instead.
- **brewlogger-pgadmin** [Optional]; Postgres Admin application. Only needed if you want to interact directly with the postgres application

### Docker-compose.yaml

```
services:
  brew_web:
    image: mpse2/brewlogger-web
    hostname: brew_web
    restart: always
    environment:
     - API_KEY=[your API key for securing access to brew_api]
     - API_URL=brew_api
    networks:
      - brew_net
    ports:
      - 80:80
    depends_on:
      - brew_api

  brew_api:
    image: mpse2/brewlogger-api
    hostname: brew_api
    restart: always
    networks:
      - brew_net
    environment:
     - API_KEY=[your API key for securing access to brew_api]
     - DATABASE_URL=postgresql://[postgres user]:[postgres password]@brew_db:5432/app
     - REDIS_URL=brew_cache
     - BREWFATHER_API_KEY=[your brewfather API key]
     - BREWFATHER_USER_KEY=[your brewfather USER key]
    depends_on:
     - brew_db
     - brew_cache

  brew_cache:
    image: redis:7
    hostname: brew_cache
    restart: always
    networks:
      - brew_net

  brew_db:
    image: postgres:14
    hostname: brew_db
    restart: always
    networks:
      - brew_net
    volumes:
      - pg-data:/var/lib/postgresql/data/pgdata
    environment:
      - PGDATA=/var/lib/postgresql/data/pgdata
      - POSTGRES_SERVER=brew_db
      - POSTGRES_USER=[postgres user]
      - POSTGRES_PASSWORD=[postgres password]
      - POSTGRES_DB=app

  brew_pgadmin:
    image: dpage/pgadmin4
    hostname: brew_pgadmin
    restart: always
    networks:
      - brew_net
    environment:
      - PGADMIN_DEFAULT_EMAIL=[email for admin login]
      - PGADMIN_DEFAULT_PASSWORD=[password for admin login]
    ports:
      - 5050:80
    volumes:
      - pgadmin-data:/var/lib/pgadmin

  brew_mdns:
    image: mpse2/brewlogger-mdns
    hostname: brew_mdns
    container_name: mdns
    restart: always
    network_mode: host
    privileged: true
    environment:
      - USE_MDNS_REPEATER=1
      - EXTERNAL_INTERFACE=[Host server interface of your network, eg: en0]
      - DOCKER_NETWORK_NAME=brewnet
      - OPTIONS=
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock

  brew_ble:
    image: mpse2/brewlogger-ble
    hostname: brew_ble
    networks:
      - brew_net
    restart: always
    privileged: true
    environment:
      - API_URL=brew_api
      - MIN_INTERVAL=[Minimum time in seconds between sending data to API, ie. 300]
    volumes:
      - /dev:/dev
      - /var/run/dbus:/var/run/dbus

networks:
  brew_net:

volumes:
  pg-data:
  pgadmin-data:

```

## Posting data from GravityMon

When posting data from Gravitymon use the following URL's which points to the same API.

- http://[your name or ip]/ispindel
- http://[your name or ip]/gravity
