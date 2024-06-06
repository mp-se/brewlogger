#!/usr/bin/bash
echo "Starting container ${API_KEY}"
echo "window.VUE_APP_TOKEN='${API_KEY}'" > /usr/share/nginx/html/env-config.js
nginx -g "daemon off;"
