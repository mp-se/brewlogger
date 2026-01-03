FROM nginx:latest
RUN mkdir -p /etc/nginx/templates /etc/nginx/ssl
COPY service-web/nginx.http.conf /etc/nginx/templates/nginx.http.conf
COPY service-web/nginx.https.conf /etc/nginx/templates/nginx.https.conf
COPY service-web/entrypoint.sh entrypoint.sh
COPY dist /usr/share/nginx/html
RUN chmod 777 entrypoint.sh
ENTRYPOINT [ "/entrypoint.sh" ]
