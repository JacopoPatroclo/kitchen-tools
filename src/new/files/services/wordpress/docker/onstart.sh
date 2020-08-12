#!/bin/sh

set -e

CODE_DIR="/usr/site/public"
SOURCE_CODE_DIR="/usr/site/copy_code"

if [ "$PHP_ENV" = "production" ]
then
    rm -rf $CODE_DIR/*
    cp -R $SOURCE_CODE_DIR/* $CODE_DIR
fi

if [ ! -d "$CODE_DIR/wp-admin" ]
then
    mkdir /tmp-wp
    cd /tmp-wp
    curl -O https://wordpress.org/latest.tar.gz
    tar xzvf latest.tar.gz
    cp -R /tmp-wp/wordpress/* $CODE_DIR
    cd $CODE_DIR
fi

php-fpm