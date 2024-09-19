#!/usr/bin/bash
echo "Starting container ${API_KEY}"
echo "window.VITE_APP_TOKEN='${API_KEY}'" > /usr/share/nginx/html/env-config.js
nginx -g "daemon off;"
