#!/bin/sh

export APP_NAME=fb2
export CREATOR_NAME=yaseen
export EXTERNAL_IP=127.0.0.1
export MONGO_CONNECTION_STRING=mongodb://127.0.0.1:27018
export KUBERNETES_SERVICE_HOST=127.0.0.1
export KUBERNETES_SERVICE_PORT=8001

export APP_SERVICE_SERVICE_HOST=127.0.0.1
export APP_SERVICE_SERVICE_PORT=9090

cd src
python3 mongo-runner.py