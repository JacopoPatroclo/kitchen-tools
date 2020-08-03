# Create your docker file
FROM postgres:12.3-alpine

COPY ./src /docker-entrypoint-initdb.d
COPY ./docker/postgres.conf /etc/postgresql/postgresql.conf