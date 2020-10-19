FROM node:12-alpine

# Create app directory
WORKDIR /usr/src/app

COPY ./docker/entrypoint.sh /usr/bin/entry.sh
RUN chmod +x /usr/bin/entry.sh

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./src/package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY ./src .

EXPOSE 8080
ENTRYPOINT [ "/usr/bin/entry.sh" ]