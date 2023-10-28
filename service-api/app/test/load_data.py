import requests

url = "http://localhost:8000"
api_key = "akljnv13bvi2vfo0b0bw789jlljsdf"

headers = {
    "Authorization": "Bearer " + api_key,
    "Content-Type": "application/json",
}

r = requests.delete(url + "/api/test/cleardb", headers=headers)

device_data = {
    "chipId": "chip0001",
    "chipFamily": "esp32",
    "software": "gravitymon",
    "mdns": "",
    "config": "",
    "url": "",
}

r = requests.post(url + "/api/device", json=device_data, headers=headers)

device_data["chipId"] = "chip0002"
r = requests.post(url + "/api/device", json=device_data, headers=headers)

device_data["chipId"] = "chip0003"
r = requests.post(url + "/api/device", json=device_data, headers=headers)
