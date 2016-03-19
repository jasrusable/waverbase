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

COPY ./waverbase-thrift-api/package.json /home/waverbase/waverbase/waverbase-thrift-api/package.json
RUN chown -R waverbase:waverbase /home/waverbase/waverbase/waverbase-thrift-api
WORKDIR /home/waverbase/waverbase/waverbase-thrift-api
USER waverbase
RUN npm install
USER root

COPY ./ /home/waverbase/waverbase
RUN chown -R waverbase:waverbase /home/waverbase/waverbase
USER waverbase
WORKDIR /home/waverbase/waverbase/

# Development or production thrift api server.
EXPOSE 9090

WORKDIR /home/waverbase/waverbase/waverbase-thrift-api
CMD webpack && node build/backend.js
