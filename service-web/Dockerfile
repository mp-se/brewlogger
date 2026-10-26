FROM node:24-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.31.8-alpine3.24-slim

RUN mkdir -p /etc/nginx/templates /etc/nginx/ssl
COPY service-web/nginx.http.conf /etc/nginx/templates/nginx.http.conf
COPY service-web/nginx.https.conf /etc/nginx/templates/nginx.https.conf
COPY service-web/entrypoint.sh /entrypoint.sh
COPY --from=build /app/dist /usr/share/nginx/html
RUN chmod 755 /entrypoint.sh
ENTRYPOINT [ "/entrypoint.sh" ]
