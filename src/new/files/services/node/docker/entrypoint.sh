#!/bin/sh

set -e

if [ ! -d "node_modules" ] 
then
    echo 'Missing dependency, installing'
    npm install
fi

node server.js