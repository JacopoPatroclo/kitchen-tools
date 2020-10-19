#!/bin/sh

set -e

npm install

if [ "$PHP_ENV" = "production" ]
then
    npm run prod
else
    npm run watch
fi