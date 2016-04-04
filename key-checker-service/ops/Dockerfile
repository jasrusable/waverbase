FROM ubuntu:14.04

MAINTAINER avoid3d@gmail.com

RUN apt-get update -y

RUN apt-get upgrade -y

RUN apt-get install -y nodejs npm

COPY ./src /waverbase/key-checker

WORKDIR /waverbase/key-checker

ENTRYPOINT ["nodejs", "--harmony", "main.js"]
