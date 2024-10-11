FROM nginx:latest
COPY service-web/nginx.conf /etc/nginx/conf.d/default.conf.template
COPY service-web/entrypoint.sh entrypoint.sh
COPY dist /usr/share/nginx/html
RUN chmod 777 entrypoint.sh
ENTRYPOINT [ "/entrypoint.sh" ]