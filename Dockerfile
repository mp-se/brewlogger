FROM nginx:latest
COPY service-web/nginx.conf etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html