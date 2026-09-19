#!/usr/bin/bash
echo "Starting container ${API_KEY}"
echo "window.VITE_APP_TOKEN='${API_KEY}'" > /usr/share/nginx/html/env-config.js

# Check if SSL certificates exist
if [ -f /etc/nginx/ssl/server.crt ] && [ -f /etc/nginx/ssl/server.key ]; then
  echo "SSL certificates found - using HTTP+HTTPS configuration"
  envsubst '${API_HOST}' < /etc/nginx/templates/nginx.https.conf > /etc/nginx/conf.d/default.conf
else
  echo "SSL certificates not found - using HTTP-only configuration"
  envsubst '${API_HOST}' < /etc/nginx/templates/nginx.http.conf > /etc/nginx/conf.d/default.conf
fi

# Verify nginx config is valid before starting
nginx -t
if [ $? -ne 0 ]; then
  echo "ERROR: nginx configuration is invalid"
  exit 1
fi

nginx -g "daemon off;"
