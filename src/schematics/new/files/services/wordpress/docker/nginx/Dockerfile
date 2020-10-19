FROM nginx:1.19.1-alpine

WORKDIR /usr/site/public

COPY ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf

COPY ./src .