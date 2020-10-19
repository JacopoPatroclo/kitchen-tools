# Create your docker file
FROM postgres:12.3-alpine

COPY ./src/initdb /docker-entrypoint-initdb.d
COPY ./docker/postgresql/postgres.conf /etc/postgresql/postgresql.conf