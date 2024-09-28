#!/bin/bash


set -e

docker login

docker build -t baijan-ide-backend .

docker tag baijan-ide-backend:latest baijan/baijan-ide-backend:latest

docker push baijan/baijan-ide-backend:latest

