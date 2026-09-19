FROM python:3.13-slim

WORKDIR /app

# Install system dependencies for BLE and build tools
RUN apt-get update && apt-get install -y --no-install-recommends     bluez     libcap2-bin     gcc     python3-dev     && rm -rf /var/lib/apt/cache/*

COPY requirements.in .
RUN pip install --no-cache-dir -r requirements.in

COPY . .

# Set capabilities to allow bluetooth scanning without root
RUN setcap 'cap_net_raw,cap_net_admin+eip' $(readlink -f $(which python3))

CMD ["python", "scan.py"]
