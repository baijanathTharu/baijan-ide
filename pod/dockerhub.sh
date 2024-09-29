#!/bin/bash


set -e

docker login

docker build -t baijan-ide-pod .

docker tag baijan-ide-pod:latest baijan/baijan-ide-pod:latest

docker push baijan/baijan-ide-pod:latest

