#!/bin/sh

set -e

yarn

if [ "$PHP_ENV" = "production" ]
then
    yarn build:production
else
    yarn start
fi