#!/bin/sh

set -e

if [ ! -d "node_modules" ] 
then
    echo 'Missing dependency, installing'
    npm install
fi

if [ "$NODE_ENV" = "production" ] 
then
    npm run build
    npm run start
else
    npm run dev
fi