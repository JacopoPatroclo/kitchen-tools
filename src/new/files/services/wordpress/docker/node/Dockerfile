FROM node:10

# Create app directory
WORKDIR /usr/src/app

COPY ./docker/node/entrypoint.sh /usr/bin/entry.sh
RUN chmod +x /usr/bin/entry.sh

WORKDIR /usr/site/public

COPY ./src .

WORKDIR /usr/site/public/wp-content/themes/mytheme

RUN yarn
RUN yarn build:production

ENV DEVURL=http://<%= name %>_entrypoint

EXPOSE 80
EXPOSE 3001
ENTRYPOINT [ "/usr/bin/entry.sh" ]