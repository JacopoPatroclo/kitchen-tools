# Create your docker file
FROM php:7.4-fpm

WORKDIR /usr/site/public

COPY ./src /usr/site/copy_code
COPY ./docker/onstart.sh /usr/bin/
RUN chmod 755 /usr/bin/onstart.sh

CMD ["onstart.sh"]

EXPOSE 9000