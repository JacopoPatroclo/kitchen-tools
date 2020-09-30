#!/bin/sh

set -e

CODE_DIR="/usr/site/public"
SOURCE_CODE_DIR="/usr/site/copy_code"

composer install

if [ "$PHP_ENV" = "production" ]
then
    rm -rf $CODE_DIR/*
    cp -a -v $SOURCE_CODE_DIR/* $CODE_DIR
fi

php-fpm