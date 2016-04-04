FROM debian:latest
MAINTAINER "Pierre Hugo" <avoid3d@gmail.com>

RUN apt-get update
RUN apt-get upgrade

RUN apt-get install ssh --yes
RUN service ssh start
EXPOSE 22

RUN useradd -ms /bin/bash waverbase

RUN apt-get install --yes \
  build-essential \
  automake \
  python-dev \
  curl \
  ssh \
  flex \
  bison \
  pkg-config \
  libboost-all-dev \
  libssl-dev

RUN curl -sL https://deb.nodesource.com/setup_5.x | bash -
RUN apt-get install nodejs --yes

RUN npm install -g webpack webpack-dev-server

COPY ./thrift /home/waverbase/waverbase/thrift
RUN chown -R waverbase:waverbase /home/waverbase/waverbase/thrift

WORKDIR /home/waverbase/waverbase/thrift
RUN ./bootstrap.sh
RUN ./configure --with-cpp --with-nodejs
RUN make -j `nproc` install

COPY ./thrift-loader/package.json /home/waverbase/waverbase/thrift-loader/package.json
RUN chown -R waverbase:waverbase /home/waverbase/waverbase/thrift-loader
WORKDIR /home/waverbase/waverbase/thrift-loader
USER waverbase
RUN npm install
USER root

COPY ./public-api-service/package.json /home/waverbase/waverbase/public-api-service/package.json
RUN chown -R waverbase:waverbase /home/waverbase/waverbase/public-api-service
WORKDIR /home/waverbase/waverbase/public-api-service
USER waverbase
RUN npm install
USER root

RUN npm install -g pm2

COPY ./email-sender-service/email-sender.thrift /home/waverbase/waverbase/email-sender-service/email-sender.thrift
RUN chown -R waverbase:waverbase /home/waverbase/waverbase/email-sender-service

# Development or production thrift api server.
EXPOSE 9099

WORKDIR /home/waverbase/waverbase/public-api-service
CMD pm2 start ops/processes.json && \
    pm2 logs
