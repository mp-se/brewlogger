FROM python:3.13-slim

WORKDIR /app

# Install system dependencies for BLE and build tools
RUN apt-get update && apt-get install -y --no-install-recommends     bluez     libcap2-bin     gcc     python3-dev     && rm -rf /var/lib/apt/cache/*

COPY requirements.in .

# Install dependencies using requirements.in to avoid macOS-specific wheel resolution
RUN pip install --no-cache-dir --upgrade pip &&     pip install --no-cache-dir bleak requests construct redis

COPY . .

# Set capabilities to allow bluetooth scanning without root
RUN setcap 'cap_net_raw,cap_net_admin+eip' $(readlink -f $(which python3))

CMD ["python", "scan.py"]
