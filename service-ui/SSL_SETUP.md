# SSL/TLS Configuration

The brewlogger-ui now supports optional SSL/TLS encryption for secure HTTPS connections.

## Overview

- **HTTP** (port 80): Always available, used for public IoT device endpoints
- **HTTPS** (port 443): Available when SSL certificates are present, used for all endpoints including private API
- **SSL is optional** — if certificates don't exist, the application runs HTTP-only on port 80
- **Public endpoints** remain on HTTP for IoT device compatibility (devices that don't support HTTPS)

## Public vs Private Endpoints

### Public Endpoints (HTTP only when HTTPS is enabled)
These endpoints are accessible via port 80 and can be used by IoT devices without HTTPS support:
- `/health` — Health check
- `/logs` — System logs
- `/gravity` — Gravity sensor data (ispindel/public)
- `/pressure` — Pressure sensor data (public)
- `/pour` — Pour volume data (public)
- `/ispindel` — Gravity Mon (ispindel format)
- `/post` — Data dispatch endpoint

### Private Endpoints (HTTPS only when certificates exist)
These endpoints require HTTPS and authentication:
- `/api/*` — All API endpoints (device, batch, gravity, pressure, pour management)
- `/api/system/notify` — WebSocket notifications
- `/docs` — OpenAPI documentation

## Setup Instructions

### 1. Without SSL (Default)

Simply start the container with `docker-compose up`. All endpoints will be available on HTTP port 80.

### 2. With SSL Certificates

#### Generate Self-Signed Certificates (Testing)

```bash
mkdir -p certs
openssl req -x509 -newkey rsa:4096 -keyout certs/server.key -out certs/server.crt -days 365 -nodes
```

#### Using Existing Certificates

Place your certificate files at:
- `./certs/server.crt` — SSL certificate
- `./certs/server.key` — Private key

#### Enable in docker-compose.yaml

Uncomment the volumes section in your `docker-compose.yaml`:

```yaml
brew_web:
  build: .
  ports:
    - 80:80
    - 443:443
  volumes:
    - ./certs/server.crt:/etc/nginx/ssl/server.crt:ro
    - ./certs/server.key:/etc/nginx/ssl/server.key:ro
  # ... rest of config
```

Then start the container:

```bash
docker-compose up
```

The entrypoint script will automatically detect the certificates and enable HTTPS.

## How It Works

1. **Certificate Detection** — On container startup, the `entrypoint.sh` script checks for `/etc/nginx/ssl/server.crt` and `/etc/nginx/ssl/server.key`

2. **Configuration Selection**:
   - If certificates exist: Uses `nginx.conf.https` (dual-port setup)
   - If certificates don't exist: Uses `nginx.conf` (HTTP-only setup)

3. **Protocol Conversion** — Environment variables are substituted (`${API_HOST}`) to configure the backend API host

4. **Auto-Detection** — The frontend JavaScript automatically detects the protocol:
   - HTTP requests use `ws://` WebSocket
   - HTTPS requests use `wss://` WebSocket

## WebSocket Connections

The WebSocket connection to `/api/system/notify` automatically adapts to the protocol:
- When accessing via `http://` → connects via `ws://`
- When accessing via `https://` → connects via `wss://`

## Certificate Best Practices

1. **Self-Signed Certs** — Fine for testing/internal use
2. **Production** — Use certificates from a trusted CA (Let's Encrypt, etc.)
3. **Certificate Format** — Must be PEM format (.crt and .key files)
4. **Read-Only Mounts** — Use `:ro` flag in docker-compose to prevent accidental modification

## Troubleshooting

### SSL Certificate Errors in Browser

- Browser will show security warnings for self-signed certificates (expected)
- Add exception or use a trusted CA certificate in production

### WebSocket Connection Failed

- Check that port 443 is exposed if using HTTPS
- Verify browser is accessing via HTTPS (not HTTP)
- Check nginx logs: `docker logs <container-id>`

### Certificates Not Detected

- Verify certificate paths: `/etc/nginx/ssl/server.crt` and `/etc/nginx/ssl/server.key`
- Check container mounts: `docker inspect <container-id>`
- Check entrypoint logs for certificate detection message

## Migration from HTTP to HTTPS

1. Generate or obtain SSL certificates
2. Update `docker-compose.yaml` volumes section with certificate paths
3. Restart container with `docker-compose restart brew_web`
4. No code changes needed — frontend auto-detects HTTPS
5. Update IoT device configuration to use HTTP endpoints (they remain on port 80)
