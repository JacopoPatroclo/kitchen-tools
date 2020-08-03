#!/bin/sh

set -e

CODE_DIR="/usr/site/public"
SOURCE_CODE_DIR="/usr/site/copy_code"

if [ "$PHP_ENV" = "prod" ]
then
    rm -rf $CODE_DIR/*
    cp -R $SOURCE_CODE_DIR/* $CODE_DIR
fi

php-fpm