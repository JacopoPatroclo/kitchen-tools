FROM nginx:1.19.1-alpine

WORKDIR /usr/site/public

COPY ./docker/config/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/config/mime.types /etc/nginx/conf/mime.types
COPY ./docker/config/proxy.conf /etc/nginx/proxy.conf
COPY ./docker/config/fastcgi_params /etc/nginx/fastcgi_params

COPY ./src .