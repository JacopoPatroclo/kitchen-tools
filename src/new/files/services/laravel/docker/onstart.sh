#!/bin/sh

set -e

CODE_DIR="/usr/site"
SOURCE_CODE_DIR="/usr/site/copy_code"

if [ "$PHP_ENV" = "production" ]
then
    rm -rf $CODE_DIR/*
    cp -R $SOURCE_CODE_DIR/* $CODE_DIR
else
    composer install
    npm install
    npm run dev
fi

php-fpm