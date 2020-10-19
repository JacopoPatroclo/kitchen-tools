FROM node:10

COPY ./docker/node/entrypoint.sh /usr/bin/entry.sh
RUN chmod +x /usr/bin/entry.sh

WORKDIR /usr/site

COPY ./src .

RUN npm install
RUN npm run prod

ENTRYPOINT [ "/usr/bin/entry.sh" ]