# Create your docker file
FROM node:12-alpine AS development

# Create app directory
WORKDIR /usr/src/app

COPY ./docker/entrypoint.sh /usr/bin/entry.sh
RUN chmod +x /usr/bin/entry.sh

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./src/package*.json ./

RUN yarn

# Bundle app source
COPY ./src .
RUN yarn build

ENV PORT=80

EXPOSE 80
ENTRYPOINT [ "/usr/bin/entry.sh" ]


FROM nginx:1.19.2-alpine AS production

COPY /docker/default.conf /etc/nginx/conf.d/default.conf
COPY --from=development /usr/src/app/build /www/data/cra-app
