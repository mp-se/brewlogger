FROM nginx:latest
COPY service-web/nginx.conf etc/nginx/conf.d/default.conf
COPY service-web/entrypoint.sh .
COPY dist /usr/share/nginx/html
RUN chmod 777 ./entrypoint.sh
CMD [ "./entrypoint.sh" ]