#!/usr/bin/bash
echo "Starting container ${API_KEY}"
echo "window.VITE_APP_TOKEN='${API_KEY}'" > /usr/share/nginx/html/env-config.js
envsubst '${API_HOST}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
nginx -g "daemon off;"
